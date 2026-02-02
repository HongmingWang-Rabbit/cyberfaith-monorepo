import { Inject, Injectable, HttpStatus } from "@nestjs/common";
import { eq, sql, desc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../../db/db.module";
import { destinyWheelSpins } from "../../db/schema";
import { PointsService } from "../../points/points.service";
import { AppException } from "../../common/app.exception";
import { ErrorCode } from "../../common/error-codes";

interface WheelSegment {
  label: string;
  color: string;
  reward: { type: string; amount?: number; description: string };
  weight: number; // Higher = more likely
}

const SEGMENTS: WheelSegment[] = [
  { label: "5 Karma", color: "#8B5CF6", reward: { type: "karma", amount: 5, description: "+5 Karma Points" }, weight: 30 },
  { label: "10 Karma", color: "#06B6D4", reward: { type: "karma", amount: 10, description: "+10 Karma Points" }, weight: 20 },
  { label: "25 Karma", color: "#F59E0B", reward: { type: "karma", amount: 25, description: "+25 Karma Points" }, weight: 10 },
  { label: "50 Karma", color: "#EF4444", reward: { type: "karma", amount: 50, description: "+50 Karma Points" }, weight: 3 },
  { label: "Cosmic Blessing", color: "#EC4899", reward: { type: "badge", description: "Cosmic Blessing achievement badge" }, weight: 5 },
  { label: "Wisdom Boost", color: "#10B981", reward: { type: "karma", amount: 15, description: "+15 Karma + Wisdom Boost" }, weight: 15 },
  { label: "Lucky Star", color: "#3B82F6", reward: { type: "karma", amount: 8, description: "+8 Karma — Lucky Star!" }, weight: 25 },
  { label: "Zen Master", color: "#6366F1", reward: { type: "karma", amount: 100, description: "+100 Karma — JACKPOT!" }, weight: 1 },
];

@Injectable()
export class DestinyWheelService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase,
    private pointsService: PointsService,
  ) {}

  getSegments() {
    return SEGMENTS.map(({ label, color, reward }) => ({ label, color, reward }));
  }

  async spin(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const todaySpins = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(destinyWheelSpins)
      .where(
        sql`${destinyWheelSpins.userId} = ${userId} AND date(${destinyWheelSpins.createdAt}) = ${today}`,
      );

    if (Number(todaySpins[0]?.count ?? 0) >= 1) {
      throw new AppException(
        ErrorCode.DAILY_LIMIT_REACHED,
        "You already spun the Destiny Wheel today! Come back tomorrow.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Weighted random selection
    const totalWeight = SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
    let roll = Math.random() * totalWeight;
    let selected = SEGMENTS[0]!;
    for (const seg of SEGMENTS) {
      roll -= seg.weight;
      if (roll <= 0) {
        selected = seg;
        break;
      }
    }

    const pointsEarned = selected.reward.amount ?? 0;

    const [record] = await this.db
      .insert(destinyWheelSpins)
      .values({
        userId,
        segment: selected.label,
        reward: selected.reward,
        pointsEarned,
      })
      .returning();

    if (pointsEarned > 0) {
      await this.pointsService.awardPoints(userId, pointsEarned, "destiny_wheel", {
        segment: selected.label,
      });
    }

    // Return the index so frontend knows where to land
    const segmentIndex = SEGMENTS.indexOf(selected);

    return {
      segmentIndex,
      segment: selected.label,
      color: selected.color,
      reward: selected.reward,
      pointsEarned,
      spunAt: record!.createdAt,
    };
  }

  async getStatus(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const todaySpins = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(destinyWheelSpins)
      .where(
        sql`${destinyWheelSpins.userId} = ${userId} AND date(${destinyWheelSpins.createdAt}) = ${today}`,
      );

    const totalSpins = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(destinyWheelSpins)
      .where(eq(destinyWheelSpins.userId, userId));

    const lastSpin = await this.db
      .select()
      .from(destinyWheelSpins)
      .where(eq(destinyWheelSpins.userId, userId))
      .orderBy(desc(destinyWheelSpins.createdAt))
      .limit(1);

    return {
      spunToday: Number(todaySpins[0]?.count ?? 0) >= 1,
      totalSpins: Number(totalSpins[0]?.count ?? 0),
      lastReward: lastSpin[0]?.reward ?? null,
    };
  }
}
