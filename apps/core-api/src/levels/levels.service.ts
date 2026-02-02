import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../db/drizzle.provider";
import { users } from "../db/schema";
import { InAppNotificationsService } from "../notifications/in-app-notifications.service";

export interface LevelTier {
  name: string;
  minKarma: number;
  emoji: string;
  color: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  { name: "Novice", minKarma: 0, emoji: "🌱", color: "#6b7280" },
  { name: "Seeker", minKarma: 100, emoji: "🔍", color: "#3b82f6" },
  { name: "Adept", minKarma: 500, emoji: "⚡", color: "#8b5cf6" },
  { name: "Mystic", minKarma: 1500, emoji: "🔮", color: "#a855f7" },
  { name: "Oracle", minKarma: 5000, emoji: "👁️", color: "#f59e0b" },
  { name: "Sage", minKarma: 15000, emoji: "🧙", color: "#ef4444" },
  { name: "Enlightened", minKarma: 50000, emoji: "✨", color: "#fbbf24" },
];

export function getLevelForKarma(karma: number): { tier: LevelTier; tierIndex: number; nextTier: LevelTier | null; progress: number } {
  let tierIndex = 0;
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (karma >= LEVEL_TIERS[i].minKarma) {
      tierIndex = i;
      break;
    }
  }

  const tier = LEVEL_TIERS[tierIndex];
  const nextTier = tierIndex < LEVEL_TIERS.length - 1 ? LEVEL_TIERS[tierIndex + 1] : null;

  let progress = 100;
  if (nextTier) {
    const range = nextTier.minKarma - tier.minKarma;
    const current = karma - tier.minKarma;
    progress = Math.min(100, Math.floor((current / range) * 100));
  }

  return { tier, tierIndex, nextTier, progress };
}

@Injectable()
export class LevelsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private notifications: InAppNotificationsService,
  ) {}

  async getUserLevel(userId: string) {
    const [user] = await this.db.select({ karma: users.karma }).from(users).where(eq(users.id, userId));
    const karma = Number(user?.karma ?? 0);
    const { tier, tierIndex, nextTier, progress } = getLevelForKarma(karma);

    return {
      level: tier.name,
      tierIndex,
      emoji: tier.emoji,
      color: tier.color,
      karma,
      nextLevelThreshold: nextTier?.minKarma ?? null,
      nextLevelName: nextTier?.name ?? null,
      progress,
    };
  }

  /** Call after karma changes to check for level-up */
  async checkLevelUp(userId: string, previousKarma: number, newKarma: number) {
    const oldLevel = getLevelForKarma(previousKarma);
    const newLevel = getLevelForKarma(newKarma);

    if (newLevel.tierIndex > oldLevel.tierIndex) {
      await this.notifications.create(
        userId,
        "achievement",
        `${newLevel.tier.emoji} Level Up: ${newLevel.tier.name}!`,
        `You've reached the ${newLevel.tier.name} level with ${newKarma} karma!`,
        "/profile",
      );
      return newLevel.tier;
    }
    return null;
  }
}
