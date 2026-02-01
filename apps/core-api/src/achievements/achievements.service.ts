import { Inject, Injectable } from "@nestjs/common";
import { eq, and, sql } from "drizzle-orm";
import { DRIZZLE } from "../db/db.module";
import { achievements, userAchievements, readings, pointsTransactions } from "../db/schema";
import { PointsService } from "../points/points.service";

export interface AchievementEvent {
  type: "reading_completed";
  readingType: string; // mbti|tarot|i-ching|four-pillars|zodiac
}

export const SEED_ACHIEVEMENTS = [
  { name: "First Steps", description: "Complete your first reading", icon: "🐣", category: "milestone", requirement: { type: "total_readings", count: 1 }, pointsReward: 10 },
  { name: "MBTI Explorer", description: "Complete an MBTI test", icon: "🧠", category: "reading", requirement: { type: "reading_type", readingType: "mbti" }, pointsReward: 15 },
  { name: "Card Reader", description: "Complete a tarot reading", icon: "🃏", category: "reading", requirement: { type: "reading_type", readingType: "tarot" }, pointsReward: 15 },
  { name: "Oracle", description: "Complete an I Ching reading", icon: "☯️", category: "reading", requirement: { type: "reading_type", readingType: "i-ching" }, pointsReward: 15 },
  { name: "Destiny Mapped", description: "Complete a Four Pillars reading", icon: "🏛️", category: "reading", requirement: { type: "reading_type", readingType: "four-pillars" }, pointsReward: 15 },
  { name: "Star Gazer", description: "Check a zodiac reading", icon: "⭐", category: "reading", requirement: { type: "reading_type", readingType: "zodiac" }, pointsReward: 10 },
  { name: "Well Rounded", description: "Complete all 5 reading types", icon: "🌀", category: "milestone", requirement: { type: "all_types", types: ["mbti", "tarot", "i-ching", "four-pillars", "zodiac"] }, pointsReward: 50 },
  { name: "Dedicated Seeker", description: "Complete 10 readings", icon: "📚", category: "milestone", requirement: { type: "total_readings", count: 10 }, pointsReward: 30 },
  { name: "Enlightened", description: "Complete 50 readings", icon: "🌟", category: "milestone", requirement: { type: "total_readings", count: 50 }, pointsReward: 100 },
];

@Injectable()
export class AchievementsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private pointsService: PointsService,
  ) {}

  async getAllAchievements() {
    return this.db.select().from(achievements);
  }

  async getUserAchievements(userId: string) {
    const rows = await this.db
      .select({
        id: userAchievements.id,
        achievementId: userAchievements.achievementId,
        unlockedAt: userAchievements.unlockedAt,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        category: achievements.category,
        pointsReward: achievements.pointsReward,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));

    return rows;
  }

  async checkAndAward(userId: string, event: AchievementEvent) {
    // Get all achievements and user's existing unlocks
    const allAchievements = await this.db.select().from(achievements);
    const existingUnlocks = await this.db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const unlockedIds = new Set(existingUnlocks.map((u: any) => u.achievementId));
    const newlyUnlocked: any[] = [];

    // Get user's reading stats
    const userReadings = await this.db
      .select()
      .from(readings)
      .where(eq(readings.userId, userId));

    const totalReadings = userReadings.length;
    const readingTypes = new Set(userReadings.map((r: any) => r.type));

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const req = achievement.requirement as any;
      if (!req) continue;

      let earned = false;

      if (req.type === "total_readings") {
        earned = totalReadings >= req.count;
      } else if (req.type === "reading_type") {
        earned = readingTypes.has(req.readingType);
      } else if (req.type === "all_types") {
        earned = (req.types as string[]).every((t: string) => readingTypes.has(t));
      }

      if (earned) {
        const [unlock] = await this.db
          .insert(userAchievements)
          .values({ userId, achievementId: achievement.id })
          .onConflictDoNothing()
          .returning();

        // If conflict (already awarded), skip points and notification
        if (!unlock) continue;

        // Award points for achievement
        await this.pointsService.awardPoints(
          userId,
          achievement.pointsReward,
          "achievement_unlocked",
          { achievementId: achievement.id, achievementName: achievement.name },
        );

        newlyUnlocked.push({ ...achievement, unlockedAt: unlock.unlockedAt });
      }
    }

    return newlyUnlocked;
  }

  async seedAchievements() {
    for (const seed of SEED_ACHIEVEMENTS) {
      const existing = await this.db
        .select()
        .from(achievements)
        .where(eq(achievements.name, seed.name))
        .limit(1);

      if (existing.length === 0) {
        await this.db.insert(achievements).values(seed);
      }
    }
  }
}
