import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "./admin.guard";
import { DRIZZLE } from "../db/drizzle.provider";
import { users, readings, arcadePlays } from "../db/schema";
import { eq, and, gte, desc, sql, ilike, or, count } from "drizzle-orm";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { AdminUsersQueryDto, AdminReadingsQueryDto, UpdateUserDto } from "./dto";
import { NotificationsService } from "../notifications/notifications.service";
import { MetricsService } from "../metrics/metrics.service";
import { CacheService } from "../cache/cache.service";
import { randomBytes } from "crypto";
import { TokenBlacklistService } from "../auth/token-blacklist.service";
import { AdminAnalyticsService } from "./admin-analytics.service";
import { AdminAuditService } from "./admin-audit.service";

interface AuthRequest {
  user: { id: string; email: string };
}

function getAdminId(req: AuthRequest): string {
  return req.user?.id ?? "unknown";
}

@ApiTags("Admin")
@Controller("admin")
@UseGuards(AuthGuard("jwt"), AdminGuard)
export class AdminController {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private notificationsService: NotificationsService,
    private metricsService: MetricsService,
    private cacheService: CacheService,
    private tokenBlacklistService: TokenBlacklistService,
    private analyticsService: AdminAnalyticsService,
    private auditService: AdminAuditService,
  ) {}

  @Get("metrics")
  async getMetrics() {
    const metrics = await this.metricsService.getMetrics();
    return {
      success: true,
      data: {
        ...metrics,
        cacheHitRate: (this.cacheService.hitRate * 100).toFixed(2) + "%",
        cacheHits: this.cacheService.totalHits,
        cacheMisses: this.cacheService.totalMisses,
      },
    };
  }

  @Get("stats")
  async getStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [[totalUsers], [totalReadings], [readingsToday], [activeSubs]] =
      await Promise.all([
        this.db.select({ count: sql<number>`count(*)::int` }).from(users),
        this.db.select({ count: sql<number>`count(*)::int` }).from(readings),
        this.db
          .select({ count: sql<number>`count(*)::int` })
          .from(readings)
          .where(gte(readings.createdAt, startOfDay)),
        this.db
          .select({ count: sql<number>`count(*)::int` })
          .from(users)
          .where(eq(users.subscriptionTier, "pro")),
      ]);

    return {
      success: true,
      data: {
        totalUsers: totalUsers.count,
        totalReadings: totalReadings.count,
        readingsToday: readingsToday.count,
        activeSubscriptions: activeSubs.count,
        estimatedMonthlyRevenue: activeSubs.count * 9.99,
      },
    };
  }

  @Get("analytics")
  async getAnalytics(@Query("from") from?: string, @Query("to") to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const data = await this.analyticsService.getAnalytics(fromDate, toDate);
    return { success: true, data };
  }

  @Get("audit-log")
  async getAuditLog(@Query("page") page?: string, @Query("limit") limit?: string) {
    const result = await this.auditService.getAuditLog(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
    return { success: true, ...result };
  }

  @Get("users")
  async getUsers(@Query() query: AdminUsersQueryDto) {
    const pageNum = query.page ?? 1;
    const limitNum = query.limit ?? 20;
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (query.search) {
      conditions.push(
        or(
          ilike(users.email, `%${query.search}%`),
          ilike(users.name, `%${query.search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [total]] = await Promise.all([
      this.db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          subscriptionTier: users.subscriptionTier,
          isActive: users.isActive,
          createdAt: users.createdAt,
          readingCount: sql<number>`(SELECT count(*)::int FROM readings WHERE readings.user_id = users.id)`,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limitNum)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(whereClause),
    ]);

    return {
      success: true,
      data: rows,
      total: total.count,
      page: pageNum,
      limit: limitNum,
    };
  }

  @Patch("users/:id")
  async updateUser(@Param("id") id: string, @Body() body: UpdateUserDto, @Req() req: any) {
    const [existing] = await this.db.select().from(users).where(eq(users.id, id));
    if (!existing) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found", HttpStatus.NOT_FOUND);
    }

    const updates: Record<string, any> = {};
    if (body.role) updates.role = body.role;
    if (body.subscriptionTier) updates.subscriptionTier = body.subscriptionTier;
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;

    if (Object.keys(updates).length === 0) {
      return { success: true, data: existing };
    }

    const [updated] = await this.db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();

    await this.auditService.log(getAdminId(req), "update_user", "user", id, updates);

    return { success: true, data: updated };
  }

  @Patch("users/:id/ban")
  async banUser(@Param("id") id: string, @Req() req: any) {
    const [existing] = await this.db.select().from(users).where(eq(users.id, id));
    if (!existing) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found", HttpStatus.NOT_FOUND);
    }

    const [updated] = await this.db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, id))
      .returning();

    await this.auditService.log(getAdminId(req), "ban_user", "user", id);
    return { success: true, data: updated };
  }

  @Patch("users/:id/unban")
  async unbanUser(@Param("id") id: string, @Req() req: any) {
    const [existing] = await this.db.select().from(users).where(eq(users.id, id));
    if (!existing) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found", HttpStatus.NOT_FOUND);
    }

    const [updated] = await this.db
      .update(users)
      .set({ isActive: true })
      .where(eq(users.id, id))
      .returning();

    await this.auditService.log(getAdminId(req), "unban_user", "user", id);
    return { success: true, data: updated };
  }

  @Get("readings")
  async getReadings(@Query() query: AdminReadingsQueryDto) {
    const pageNum = query.page ?? 1;
    const limitNum = query.limit ?? 20;
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (query.type) conditions.push(eq(readings.type, query.type));
    if (query.isPublic === "true") conditions.push(eq(readings.isPublic, true));
    if (query.isPublic === "false") conditions.push(eq(readings.isPublic, false));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [total]] = await Promise.all([
      this.db
        .select({
          id: readings.id,
          type: readings.type,
          userId: readings.userId,
          isPublic: readings.isPublic,
          locale: readings.locale,
          createdAt: readings.createdAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(readings)
        .leftJoin(users, eq(readings.userId, users.id))
        .where(whereClause)
        .orderBy(desc(readings.createdAt))
        .limit(limitNum)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(readings)
        .where(whereClause),
    ]);

    return {
      success: true,
      data: rows,
      total: total.count,
      page: pageNum,
      limit: limitNum,
    };
  }

  @Patch("readings/:id/visibility")
  async toggleReadingVisibility(@Param("id") id: string, @Body() body: { isPublic: boolean }, @Req() req: any) {
    const [existing] = await this.db.select().from(readings).where(eq(readings.id, id));
    if (!existing) {
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Reading not found", HttpStatus.NOT_FOUND);
    }

    const [updated] = await this.db
      .update(readings)
      .set({ isPublic: body.isPublic })
      .where(eq(readings.id, id))
      .returning();

    await this.auditService.log(getAdminId(req), body.isPublic ? "unhide_reading" : "hide_reading", "reading", id);
    return { success: true, data: updated };
  }

  @Delete("readings/:id")
  async deleteReading(@Param("id") id: string, @Req() req: any) {
    const [existing] = await this.db.select().from(readings).where(eq(readings.id, id));
    if (!existing) {
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Reading not found", HttpStatus.NOT_FOUND);
    }

    await this.db.delete(readings).where(eq(readings.id, id));
    await this.auditService.log(getAdminId(req), "delete_reading", "reading", id);
    return { success: true };
  }

  @Get("games")
  async getGameStats() {
    const stats = await this.db
      .select({
        gameId: arcadePlays.gameId,
        totalPlays: sql<number>`count(*)::int`,
        totalPointsSpent: sql<number>`coalesce(sum(arcade_plays.points_spent)::int, 0)`,
        totalPointsWon: sql<number>`coalesce(sum(arcade_plays.points_won)::int, 0)`,
      })
      .from(arcadePlays)
      .groupBy(arcadePlays.gameId);

    return { success: true, data: stats };
  }

  @Post("rotate-jwt-secret")
  async rotateJwtSecret(@Req() req: any) {
    const newSecret = randomBytes(64).toString("hex");
    await this.tokenBlacklistService.invalidateAllTokens();
    await this.auditService.log(getAdminId(req), "rotate_jwt_secret");

    return {
      success: true,
      data: {
        message: "All existing tokens have been invalidated. Update JWT_SECRET env var with the new secret and restart the service.",
        newSecret,
        invalidatedAt: new Date().toISOString(),
      },
    };
  }

  @Post("send-push")
  async sendPush(@Body() body: { title: string; body: string; url?: string }, @Req() req: any) {
    const result = await this.notificationsService.sendToAll(
      body.title || "CyberFaith",
      body.body || "You have a new notification!",
      body.url,
    );
    await this.auditService.log(getAdminId(req), "send_push", undefined, undefined, { title: body.title });
    return { success: true, data: result };
  }
}
