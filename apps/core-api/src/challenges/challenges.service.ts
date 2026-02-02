import { Inject, Injectable } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../db/drizzle.provider";
import { dailyChallenges, challengeCompletions, users } from "../db/schema";
import { sql } from "drizzle-orm";

const CHALLENGE_POOL = [
  { type: "tarot_stranger" as const, title: "Draw a Tarot Card for a Stranger", description: "Pull a single tarot card and share its wisdom with someone you don't know — online or in person.", karmaReward: 15 },
  { type: "meditation" as const, title: "5-Minute Cosmic Meditation", description: "Close your eyes and meditate for 5 minutes, focusing on your zodiac element (fire, earth, air, or water).", karmaReward: 10 },
  { type: "journaling" as const, title: "Reflect on Your Last Reading", description: "Open your reading journal and write down how your most recent reading has manifested in your life.", karmaReward: 10 },
  { type: "share_reading" as const, title: "Share a Reading Publicly", description: "Make one of your readings public so others can learn and react to your spiritual journey.", karmaReward: 20 },
  { type: "kindness" as const, title: "Random Act of Cosmic Kindness", description: "Do something kind for someone today and dedicate it to the universe. Leave a reaction on someone's public reading.", karmaReward: 15 },
  { type: "divination" as const, title: "Try a New Divination Method", description: "Step outside your comfort zone and try a reading type you haven't used before — I Ching, Four Pillars, or Numerology.", karmaReward: 20 },
  { type: "reflection" as const, title: "Moon Phase Check-In", description: "Look up today's moon phase and write a brief reflection on how it might be influencing your energy.", karmaReward: 10 },
  { type: "community" as const, title: "Engage with the Community", description: "Visit the community feed, react to 3 public readings, and leave a thoughtful comment on one.", karmaReward: 15 },
];

@Injectable()
export class ChallengesService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  private getToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async getTodayChallenge(userId?: string) {
    const today = this.getToday();

    // Check if today's challenge exists
    let [challenge] = await this.db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.date, today));

    if (!challenge) {
      // Seed today's challenge from pool
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
      );
      const pick = CHALLENGE_POOL[dayOfYear % CHALLENGE_POOL.length]!;

      [challenge] = await this.db
        .insert(dailyChallenges)
        .values({
          type: pick.type,
          title: pick.title,
          description: pick.description,
          karmaReward: pick.karmaReward,
          date: today,
        })
        .onConflictDoNothing()
        .returning();

      // If race condition, re-fetch
      if (!challenge) {
        [challenge] = await this.db
          .select()
          .from(dailyChallenges)
          .where(eq(dailyChallenges.date, today));
      }
    }

    // Check if user completed it
    let completed = false;
    if (userId && challenge) {
      const [completion] = await this.db
        .select({ id: challengeCompletions.id })
        .from(challengeCompletions)
        .where(
          and(
            eq(challengeCompletions.userId, userId),
            eq(challengeCompletions.challengeId, challenge.id),
          ),
        );
      completed = !!completion;
    }

    return { challenge, completed };
  }

  async completeChallenge(userId: string, challengeId: string) {
    // Verify challenge exists
    const [challenge] = await this.db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.id, challengeId));

    if (!challenge) {
      return { error: "Challenge not found" };
    }

    // Check not already completed
    const [existing] = await this.db
      .select({ id: challengeCompletions.id })
      .from(challengeCompletions)
      .where(
        and(
          eq(challengeCompletions.userId, userId),
          eq(challengeCompletions.challengeId, challengeId),
        ),
      );

    if (existing) {
      return { error: "Already completed" };
    }

    // Insert completion
    const [completion] = await this.db
      .insert(challengeCompletions)
      .values({ userId, challengeId })
      .returning();

    // Award karma
    await this.db
      .update(users)
      .set({ karma: sql`${users.karma} + ${challenge.karmaReward}` })
      .where(eq(users.id, userId));

    return { completion, karmaAwarded: challenge.karmaReward };
  }
}
