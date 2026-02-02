import { Inject, Injectable } from "@nestjs/common";
import { eq, sql, desc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../../db/db.module";
import { meditationSessions } from "../../db/schema";
import { PointsService } from "../../points/points.service";

const KARMA_PER_SESSION = 3;
const STREAK_BONUS = 5; // Extra karma for 7+ day streaks

@Injectable()
export class MeditationService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase,
    private pointsService: PointsService,
  ) {}

  async complete(userId: string, durationMinutes: number, soundUsed?: string) {
    const streakDays = await this.calculateStreak(userId);
    const isStreakBonus = streakDays >= 6; // About to become 7+ after this session
    const pointsEarned = KARMA_PER_SESSION + (isStreakBonus ? STREAK_BONUS : 0);

    const [session] = await this.db
      .insert(meditationSessions)
      .values({
        userId,
        durationMinutes,
        soundUsed: soundUsed ?? null,
        completed: true,
        pointsEarned,
      })
      .returning();

    await this.pointsService.awardPoints(userId, pointsEarned, "meditation", {
      durationMinutes,
      soundUsed,
      streakDays: streakDays + 1,
    });

    return {
      session,
      pointsEarned,
      streakDays: streakDays + 1,
      streakBonus: isStreakBonus,
    };
  }

  async getStats(userId: string) {
    const totalSessions = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(meditationSessions)
      .where(eq(meditationSessions.userId, userId));

    const totalMinutes = await this.db
      .select({ total: sql<number>`coalesce(sum(${meditationSessions.durationMinutes}), 0)` })
      .from(meditationSessions)
      .where(eq(meditationSessions.userId, userId));

    const totalPoints = await this.db
      .select({ total: sql<number>`coalesce(sum(${meditationSessions.pointsEarned}), 0)` })
      .from(meditationSessions)
      .where(eq(meditationSessions.userId, userId));

    const streakDays = await this.calculateStreak(userId);

    // Today's sessions
    const today = new Date().toISOString().split("T")[0];
    const todaySessions = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(meditationSessions)
      .where(
        sql`${meditationSessions.userId} = ${userId} AND date(${meditationSessions.createdAt}) = ${today}`,
      );

    return {
      totalSessions: Number(totalSessions[0]?.count ?? 0),
      totalMinutes: Number(totalMinutes[0]?.total ?? 0),
      totalPoints: Number(totalPoints[0]?.total ?? 0),
      streakDays,
      todaySessions: Number(todaySessions[0]?.count ?? 0),
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    const daysResult = await this.db
      .select({ day: sql<string>`date(${meditationSessions.createdAt})` })
      .from(meditationSessions)
      .where(eq(meditationSessions.userId, userId))
      .groupBy(sql`date(${meditationSessions.createdAt})`)
      .orderBy(desc(sql`date(${meditationSessions.createdAt})`));

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
    return streakDays;
  }
}
