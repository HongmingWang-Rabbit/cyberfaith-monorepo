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

@Controller("admin")
@UseGuards(AuthGuard("jwt"), AdminGuard)
export class AdminController {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private notificationsService: NotificationsService,
  ) {}

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
  async updateUser(@Param("id") id: string, @Body() body: UpdateUserDto) {
    const [existing] = await this.db.select().from(users).where(eq(users.id, id));
    if (!existing) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found", HttpStatus.NOT_FOUND);
    }

    const updates: Record<string, any> = {};
    if (body.role) updates.role = body.role;
    if (body.subscriptionTier) updates.subscriptionTier = body.subscriptionTier;

    if (Object.keys(updates).length === 0) {
      return { success: true, data: existing };
    }

    const [updated] = await this.db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();

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

  @Delete("readings/:id")
  async deleteReading(@Param("id") id: string) {
    const [existing] = await this.db.select().from(readings).where(eq(readings.id, id));
    if (!existing) {
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Reading not found", HttpStatus.NOT_FOUND);
    }

    await this.db.delete(readings).where(eq(readings.id, id));
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

  @Post("send-push")
  async sendPush(@Body() body: { title: string; body: string; url?: string }) {
    const result = await this.notificationsService.sendToAll(
      body.title || "CyberFaith",
      body.body || "You have a new notification!",
      body.url,
    );
    return { success: true, data: result };
  }
}
