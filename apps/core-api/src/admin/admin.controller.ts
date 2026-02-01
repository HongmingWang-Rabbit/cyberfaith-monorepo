import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  NotFoundException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "./admin.guard";
import { DRIZZLE } from "../db/drizzle.provider";
import { users, readings, arcadePlays, pointsTransactions } from "../db/schema";
import { eq, and, gte, desc, sql, ilike, or, count } from "drizzle-orm";

@Controller("admin")
@UseGuards(AuthGuard("jwt"), AdminGuard)
export class AdminController {
  constructor(@Inject(DRIZZLE) private db: any) {}

  @Get("stats")
  async getStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [[totalUsers], [totalReadings], [readingsToday], [activeSubs], [revenueStats]] =
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
        this.db
          .select({
            totalRevenue: sql<number>`coalesce(count(*)::int * 9.99, 0)`,
          })
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
  async getUsers(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || "20", 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (search) {
      conditions.push(
        or(
          ilike(users.email, `%${search}%`),
          ilike(users.name, `%${search}%`),
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
  async updateUser(
    @Param("id") id: string,
    @Body() body: { role?: "user" | "admin"; subscriptionTier?: string },
  ) {
    const [existing] = await this.db.select().from(users).where(eq(users.id, id));
    if (!existing) {
      throw new NotFoundException("User not found");
    }

    const updates: Record<string, any> = {};
    if (body.role && ["user", "admin"].includes(body.role)) {
      updates.role = body.role;
    }
    if (body.subscriptionTier && ["free", "pro"].includes(body.subscriptionTier)) {
      updates.subscriptionTier = body.subscriptionTier;
    }

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
  async getReadings(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("type") type?: string,
    @Query("isPublic") isPublic?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || "20", 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (type) conditions.push(eq(readings.type, type));
    if (isPublic === "true") conditions.push(eq(readings.isPublic, true));
    if (isPublic === "false") conditions.push(eq(readings.isPublic, false));

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
      throw new NotFoundException("Reading not found");
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
}
