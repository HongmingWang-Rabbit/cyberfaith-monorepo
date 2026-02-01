import { Inject, Injectable } from "@nestjs/common";
import { eq, sql, desc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../../db/db.module";
import { muyuSessions } from "../../db/schema";
import { PointsService } from "../../points/points.service";

@Injectable()
export class MuyuService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase,
    private pointsService: PointsService,
  ) {}

  /**
   * Record a batch of taps. Awards 1 point per 100 cumulative taps.
   * We track a running remainder to carry over between batches.
   */
  async recordTaps(userId: string, tapCount: number, duration?: number) {
    // Get current total taps to calculate points threshold crossings
    const totalResult = await this.db
      .select({ total: sql<number>`coalesce(sum(${muyuSessions.tapCount}), 0)` })
      .from(muyuSessions)
      .where(eq(muyuSessions.userId, userId));

    const previousTotal = Number(totalResult[0]?.total ?? 0);
    const newTotal = previousTotal + tapCount;

    // Points earned: how many new 100-tap thresholds crossed
    const pointsBefore = Math.floor(previousTotal / 100);
    const pointsAfter = Math.floor(newTotal / 100);
    const pointsEarned = pointsAfter - pointsBefore;

    // Record session
    const [session] = await this.db
      .insert(muyuSessions)
      .values({
        userId,
        tapCount,
        duration: duration ?? null,
        pointsEarned,
      })
      .returning();

    // Award points if any
    if (pointsEarned > 0) {
      await this.pointsService.awardPoints(userId, pointsEarned, "muyu_merit", {
        tapCount,
        totalTaps: newTotal,
      });
    }

    return {
      session,
      totalTaps: newTotal,
      totalMerit: newTotal, // merit = total taps (功德)
      pointsEarned,
      nextPointAt: (pointsAfter + 1) * 100, // taps needed for next point
    };
  }

  /** Get user's muyu stats */
  async getStats(userId: string) {
    // Total taps (all-time merit)
    const totalResult = await this.db
      .select({ total: sql<number>`coalesce(sum(${muyuSessions.tapCount}), 0)` })
      .from(muyuSessions)
      .where(eq(muyuSessions.userId, userId));
    const totalTaps = Number(totalResult[0]?.total ?? 0);

    // Total points earned from muyu
    const pointsResult = await this.db
      .select({ total: sql<number>`coalesce(sum(${muyuSessions.pointsEarned}), 0)` })
      .from(muyuSessions)
      .where(eq(muyuSessions.userId, userId));
    const totalPoints = Number(pointsResult[0]?.total ?? 0);

    // Streak: count distinct days with sessions (simplified — consecutive days from today)
    const daysResult = await this.db
      .select({ day: sql<string>`date(${muyuSessions.createdAt})` })
      .from(muyuSessions)
      .where(eq(muyuSessions.userId, userId))
      .groupBy(sql`date(${muyuSessions.createdAt})`)
      .orderBy(desc(sql`date(${muyuSessions.createdAt})`));

    let streakDays = 0;
    const today = new Date();
    for (let i = 0; i < daysResult.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (daysResult[i]?.day === expectedStr) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      totalTaps,
      totalMerit: totalTaps,
      totalPoints,
      streakDays,
      nextPointAt: (Math.floor(totalTaps / 100) + 1) * 100,
    };
  }
}
