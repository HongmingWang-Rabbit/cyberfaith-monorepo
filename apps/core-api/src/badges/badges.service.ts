import { Inject, Injectable } from "@nestjs/common";
import { eq, count, and, isNull } from "drizzle-orm";
import { DRIZZLE } from "../db/drizzle.provider";
import { userBadges, users, readings, userAchievements, userFollows, comments } from "../db/schema";
import { BADGE_DEFINITIONS, UserStats } from "./badge-definitions";

@Injectable()
export class BadgesService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async getUserBadges(userId: string) {
    return this.db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
  }

  async getProfileBadges(userId: string) {
    return this.db
      .select({
        badgeKey: userBadges.badgeKey,
        title: userBadges.title,
        icon: userBadges.icon,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.displayOnProfile, true)));
  }

  async checkAndAwardBadges(userId: string): Promise<string[]> {
    const stats = await this.getUserStats(userId);
    const existing = await this.getUserBadges(userId);
    const existingKeys = new Set(existing.map((b: any) => b.badgeKey));
    const newBadges: string[] = [];

    for (const def of BADGE_DEFINITIONS) {
      if (existingKeys.has(def.key)) continue;
      if (def.check(stats)) {
        await this.db
          .insert(userBadges)
          .values({
            userId,
            badgeKey: def.key,
            title: def.title,
            icon: def.icon,
          })
          .onConflictDoNothing();
        newBadges.push(def.key);
      }
    }

    return newBadges;
  }

  private async getUserStats(userId: string): Promise<UserStats> {
    const [readingCount] = await this.db
      .select({ count: count() })
      .from(readings)
      .where(eq(readings.userId, userId));

    const [user] = await this.db
      .select({ karma: users.karma, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId));

    const [achievementCount] = await this.db
      .select({ count: count() })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const [followerCount] = await this.db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followingId, userId));

    const [commentCount] = await this.db
      .select({ count: count() })
      .from(comments)
      .where(and(eq(comments.userId, userId), isNull(comments.deletedAt)));

    const accountAgeDays = user?.createdAt
      ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000)
      : 0;

    return {
      totalReadings: Number(readingCount?.count ?? 0),
      karma: user?.karma ?? 0,
      totalAchievements: Number(achievementCount?.count ?? 0),
      followerCount: Number(followerCount?.count ?? 0),
      commentCount: Number(commentCount?.count ?? 0),
      accountAgeDays,
    };
  }
}
