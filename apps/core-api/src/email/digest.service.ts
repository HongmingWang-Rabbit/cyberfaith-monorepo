import { Inject, Injectable } from "@nestjs/common";
import { eq, and, gte, desc, sql, ne } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../db/db.module";
import {
  users,
  readings,
  pointsTransactions,
  friendships,
  dailyHoroscopes,
  userSettings,
} from "../db/schema";
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
      .where(
        and(eq(pointsTransactions.userId, userId), gte(pointsTransactions.createdAt, sevenDaysAgo)),
      );

    const pointsEarned = Number(pointsResult[0]?.total ?? 0);

    // Total points
    const totalResult = await this.db
      .select({ total: sql<number>`coalesce(sum(${pointsTransactions.amount}), 0)` })
      .from(pointsTransactions)
      .where(eq(pointsTransactions.userId, userId));

    const totalPoints = Number(totalResult[0]?.total ?? 0);

    // Streak
    const currentStreak = await this.calculateStreak(userId);

    // Community highlights: recent public readings from others
    const communityHighlights = await this.db
      .select({
        authorName: users.name,
        type: readings.type,
      })
      .from(readings)
      .innerJoin(users, eq(readings.userId, users.id))
      .where(and(eq(readings.isPublic, true), gte(readings.createdAt, sevenDaysAgo)))
      .orderBy(desc(readings.createdAt))
      .limit(5);

    // Friend activity: new friends this week + their interesting readings
    const friendActivity = await this.getFriendActivity(userId, sevenDaysAgo);

    // Featured community reading (most reacted public reading this week)
    const featuredReading = await this.getFeaturedReading(sevenDaysAgo);

    // Horoscope teaser for next week
    const horoscopeTeaser = await this.getHoroscopeTeaser(user.zodiacSign);

    return {
      userName: user.name,
      readingsThisWeek: weekReadings.length,
      readingTypes,
      pointsEarned,
      totalPoints,
      currentStreak,
      communityHighlights,
      friendActivity,
      featuredReading,
      horoscopeTeaser,
    };
  }

  private async getFriendActivity(
    userId: string,
    since: Date,
  ): Promise<DigestData["friendActivity"]> {
    // New friends accepted this week
    const newFriends = await this.db
      .select({ name: users.name })
      .from(friendships)
      .innerJoin(
        users,
        sql`CASE
          WHEN ${friendships.requesterId} = ${userId} THEN ${friendships.addresseeId} = ${users.id}
          ELSE ${friendships.requesterId} = ${users.id}
        END`,
      )
      .where(
        and(
          eq(friendships.status, "accepted"),
          gte(friendships.updatedAt, since),
          sql`(${friendships.requesterId} = ${userId} OR ${friendships.addresseeId} = ${userId})`,
        ),
      )
      .limit(5);

    // Get friend IDs for activity lookup
    const friendRows = await this.db
      .select({
        friendId: sql<string>`CASE
          WHEN ${friendships.requesterId} = ${userId} THEN ${friendships.addresseeId}
          ELSE ${friendships.requesterId}
        END`,
      })
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          sql`(${friendships.requesterId} = ${userId} OR ${friendships.addresseeId} = ${userId})`,
        ),
      );

    const friendIds = (Array.isArray(friendRows) ? friendRows : []).map((r: any) => r.friendId).filter(Boolean);

    let friendReadings: { friendName: string; type: string }[] = [];
    if (friendIds.length > 0) {
      friendReadings = await this.db
        .select({ friendName: users.name, type: readings.type })
        .from(readings)
        .innerJoin(users, eq(readings.userId, users.id))
        .where(
          and(
            sql`${readings.userId} IN (${sql.join(
              friendIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
            eq(readings.isPublic, true),
            gte(readings.createdAt, since),
          ),
        )
        .orderBy(desc(readings.createdAt))
        .limit(5);
    }

    return {
      newFriends: newFriends.map((f) => f.name),
      friendReadings,
    };
  }

  private async getFeaturedReading(
    since: Date,
  ): Promise<DigestData["featuredReading"]> {
    // Pick a popular public reading this week
    const featured = await this.db
      .select({
        authorName: users.name,
        type: readings.type,
        createdAt: readings.createdAt,
      })
      .from(readings)
      .innerJoin(users, eq(readings.userId, users.id))
      .where(and(eq(readings.isPublic, true), gte(readings.createdAt, since)))
      .orderBy(desc(readings.createdAt))
      .limit(1);

    if (featured.length === 0) return null;
    return {
      authorName: featured[0].authorName,
      type: featured[0].type,
    };
  }

  private async getHoroscopeTeaser(
    zodiacSign: string | null,
  ): Promise<string | null> {
    if (!zodiacSign) return null;

    // Get tomorrow's or next available horoscope
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const [horoscope] = await this.db
      .select()
      .from(dailyHoroscopes)
      .where(
        and(
          eq(dailyHoroscopes.sign, zodiacSign),
          gte(dailyHoroscopes.date, dateStr),
        ),
      )
      .orderBy(dailyHoroscopes.date)
      .limit(1);

    if (!horoscope) return `Your ${zodiacSign} forecast is coming soon ✨`;

    const content = horoscope.content as any;
    return content?.reading
      ? String(content.reading).slice(0, 120) + "..."
      : `Your ${zodiacSign} forecast is ready ✨`;
  }

  private async calculateStreak(userId: string): Promise<number> {
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
    // Join with userSettings to check notificationEmailDigest
    const result = await this.db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .leftJoin(userSettings, eq(users.id, userSettings.userId))
      .where(
        and(
          eq(users.isActive, true),
          eq(users.emailNotifications, true),
          // If user_settings row exists, respect notificationEmailDigest; otherwise default true
          sql`COALESCE(${userSettings.notificationEmailDigest}, true) = true`,
        ),
      );

    return result;
  }

  /** Get users with active streaks who haven't done a reading today */
  async getUsersWithStreakAtRisk(): Promise<
    { id: string; email: string; name: string; streak: number }[]
  > {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active users
    const activeUsers = await this.db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.isActive, true));

    const atRisk: { id: string; email: string; name: string; streak: number }[] = [];

    for (const user of activeUsers) {
      // Check if they have a reading today
      const todayReadings = await this.db
        .select({ id: readings.id })
        .from(readings)
        .where(and(eq(readings.userId, user.id), gte(readings.createdAt, today)))
        .limit(1);

      if (todayReadings.length > 0) continue; // Already read today

      const streak = await this.calculateStreak(user.id);
      if (streak > 0) {
        atRisk.push({ ...user, streak });
      }
    }

    return atRisk;
  }

  /** Get all active users with push enabled */
  async getUsersForPush(): Promise<{ id: string; zodiacSign: string | null }[]> {
    const result = await this.db
      .select({ id: users.id, zodiacSign: users.zodiacSign })
      .from(users)
      .leftJoin(userSettings, eq(users.id, userSettings.userId))
      .where(
        and(
          eq(users.isActive, true),
          sql`COALESCE(${userSettings.notificationPush}, true) = true`,
        ),
      );

    return result;
  }

  /** Get users who want streak reminders */
  async getUsersForStreakReminder(): Promise<{ id: string }[]> {
    const result = await this.db
      .select({ id: users.id })
      .from(users)
      .leftJoin(userSettings, eq(users.id, userSettings.userId))
      .where(
        and(
          eq(users.isActive, true),
          sql`COALESCE(${userSettings.notificationStreakReminders}, true) = true`,
        ),
      );

    return result;
  }
}
