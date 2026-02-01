import { Inject, Injectable } from "@nestjs/common";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../db/db.module";
import { users, readings, pointsTransactions } from "../db/schema";
import { DigestData } from "./email.service";

@Injectable()
export class DigestService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  async generateDigest(userId: string): Promise<DigestData | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return null;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Readings this week
    const weekReadings = await this.db
      .select()
      .from(readings)
      .where(and(eq(readings.userId, userId), gte(readings.createdAt, sevenDaysAgo)));

    const readingTypes: Record<string, number> = {};
    for (const r of weekReadings) {
      readingTypes[r.type] = (readingTypes[r.type] || 0) + 1;
    }

    // Points earned this week
    const pointsResult = await this.db
      .select({ total: sql<number>`coalesce(sum(${pointsTransactions.amount}), 0)` })
      .from(pointsTransactions)
      .where(and(eq(pointsTransactions.userId, userId), gte(pointsTransactions.createdAt, sevenDaysAgo)));

    const pointsEarned = Number(pointsResult[0]?.total ?? 0);

    // Total points
    const totalResult = await this.db
      .select({ total: sql<number>`coalesce(sum(${pointsTransactions.amount}), 0)` })
      .from(pointsTransactions)
      .where(eq(pointsTransactions.userId, userId));

    const totalPoints = Number(totalResult[0]?.total ?? 0);

    // Streak: count consecutive days with readings going backwards from today
    const currentStreak = await this.calculateStreak(userId);

    // Community highlights: recent public readings from others
    const highlights = await this.db
      .select({
        authorName: users.name,
        type: readings.type,
      })
      .from(readings)
      .innerJoin(users, eq(readings.userId, users.id))
      .where(and(eq(readings.isPublic, true), gte(readings.createdAt, sevenDaysAgo)))
      .orderBy(desc(readings.createdAt))
      .limit(5);

    return {
      userName: user.name,
      readingsThisWeek: weekReadings.length,
      readingTypes,
      pointsEarned,
      totalPoints,
      currentStreak,
      communityHighlights: highlights,
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    // Get distinct days with readings, ordered descending
    const days = await this.db
      .select({ day: sql<string>`date(${readings.createdAt})` })
      .from(readings)
      .where(eq(readings.userId, userId))
      .groupBy(sql`date(${readings.createdAt})`)
      .orderBy(desc(sql`date(${readings.createdAt})`));

    if (days.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];

      if (days[i].day === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async getUsersForDigest(): Promise<{ id: string; email: string; name: string }[]> {
    return this.db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(and(eq(users.isActive, true), eq(users.emailNotifications, true)));
  }
}
