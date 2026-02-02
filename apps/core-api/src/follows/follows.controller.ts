import {
  Controller, Get, Post, Delete, Param, Query, Req, UseGuards, Inject, HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DRIZZLE } from "../db/drizzle.provider";
import { userFollows, users, readings, userAchievements, achievements } from "../db/schema";
import { eq, and, desc, count, sql, or } from "drizzle-orm";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { Request } from "express";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("users")
export class FollowsController {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  @UseGuards(AuthGuard("jwt"))
  @Post(":id/follow")
  async follow(@Req() req: AuthRequest, @Param("id") targetId: string) {
    if (req.user.id === targetId) {
      throw new AppException(ErrorCode.CANNOT_FOLLOW_SELF, "Cannot follow yourself", HttpStatus.BAD_REQUEST);
    }

    // Check target exists
    const [target] = await this.db.select({ id: users.id }).from(users).where(eq(users.id, targetId));
    if (!target) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found", HttpStatus.NOT_FOUND);
    }

    try {
      await this.db.insert(userFollows).values({
        followerId: req.user.id,
        followingId: targetId,
      });
    } catch (err: any) {
      if (err?.code === "23505") {
        throw new AppException(ErrorCode.ALREADY_FOLLOWING, "Already following this user", HttpStatus.CONFLICT);
      }
      throw err;
    }

    return { success: true };
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete(":id/follow")
  async unfollow(@Req() req: AuthRequest, @Param("id") targetId: string) {
    const result = await this.db
      .delete(userFollows)
      .where(and(eq(userFollows.followerId, req.user.id), eq(userFollows.followingId, targetId)))
      .returning({ id: userFollows.id });

    if (result.length === 0) {
      throw new AppException(ErrorCode.NOT_FOLLOWING, "Not following this user", HttpStatus.NOT_FOUND);
    }

    return { success: true };
  }

  @Get(":id/followers")
  async followers(
    @Param("id") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = parseInt(page || "1", 10) || 1;
    const limitNum = Math.min(50, parseInt(limit || "20", 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const rows = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        followedAt: userFollows.createdAt,
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followerId, users.id))
      .where(eq(userFollows.followingId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limitNum)
      .offset(offset);

    const [total] = await this.db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followingId, userId));

    return { success: true, data: rows, total: Number(total?.count ?? 0), page: pageNum, limit: limitNum };
  }

  @Get(":id/following")
  async following(
    @Param("id") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = parseInt(page || "1", 10) || 1;
    const limitNum = Math.min(50, parseInt(limit || "20", 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const rows = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        followedAt: userFollows.createdAt,
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followingId, users.id))
      .where(eq(userFollows.followerId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limitNum)
      .offset(offset);

    const [total] = await this.db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followerId, userId));

    return { success: true, data: rows, total: Number(total?.count ?? 0), page: pageNum, limit: limitNum };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id/is-following")
  async isFollowing(@Req() req: AuthRequest, @Param("id") targetId: string) {
    const [row] = await this.db
      .select({ id: userFollows.id })
      .from(userFollows)
      .where(and(eq(userFollows.followerId, req.user.id), eq(userFollows.followingId, targetId)));

    return { success: true, data: { isFollowing: !!row } };
  }
}

@Controller("feed")
export class FeedController {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  @UseGuards(AuthGuard("jwt"))
  @Get()
  async feed(
    @Req() req: AuthRequest,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = parseInt(page || "1", 10) || 1;
    const limitNum = Math.min(50, parseInt(limit || "20", 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    // Get IDs of followed users
    const followedUsers = this.db
      .select({ id: userFollows.followingId })
      .from(userFollows)
      .where(eq(userFollows.followerId, req.user.id));

    // Get public readings from followed users
    const readingRows = await this.db
      .select({
        id: readings.id,
        type: sql<string>`'reading'`.as("item_type"),
        readingType: readings.type,
        result: readings.result,
        createdAt: readings.createdAt,
        authorId: users.id,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatar: users.avatarUrl,
      })
      .from(readings)
      .innerJoin(users, eq(readings.userId, users.id))
      .where(and(
        eq(readings.isPublic, true),
        sql`${readings.userId} IN (${followedUsers})`,
      ))
      .orderBy(desc(readings.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Get achievements from followed users
    const achievementRows = await this.db
      .select({
        id: userAchievements.id,
        type: sql<string>`'achievement'`.as("item_type"),
        achievementName: achievements.name,
        achievementIcon: achievements.icon,
        achievementDescription: achievements.description,
        createdAt: userAchievements.unlockedAt,
        authorId: users.id,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatar: users.avatarUrl,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .innerJoin(users, eq(userAchievements.userId, users.id))
      .where(sql`${userAchievements.userId} IN (${followedUsers})`)
      .orderBy(desc(userAchievements.unlockedAt))
      .limit(limitNum)
      .offset(offset);

    // Merge and sort by date
    const items = [
      ...readingRows.map((r: any) => ({ ...r, itemType: "reading" })),
      ...achievementRows.map((a: any) => ({ ...a, itemType: "achievement" })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limitNum);

    return { success: true, data: items, page: pageNum, limit: limitNum };
  }
}
