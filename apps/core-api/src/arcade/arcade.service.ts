import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { eq, desc, sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../db/db.module";
import { arcadePlays, pointsTransactions } from "../db/schema";
import { PointsService } from "../points/points.service";

const SYMBOLS = ["🔮", "✨", "🌟", "☯️", "🧿", "💫", "🪬", "🌙"] as const;
const SPIN_COST = 10;

export interface SpinResult {
  reels: string[];
  matches: number;
  pointsWon: number;
}

@Injectable()
export class ArcadeService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase,
    private pointsService: PointsService,
  ) {}

  spin(): SpinResult {
    const reels = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];

    // Count matches
    const unique = new Set(reels);
    let matches = 0;
    let pointsWon = 0;

    if (unique.size === 1) {
      matches = 3;
      pointsWon = 50;
    } else if (unique.size === 2) {
      matches = 2;
      pointsWon = 20;
    }

    return { reels, matches, pointsWon };
  }

  async play(userId: string, gameId: string) {
    if (gameId !== "karma-slots") {
      throw new BadRequestException("Unknown game: " + gameId);
    }

    // Check user has enough points
    const { total } = await this.pointsService.getUserPoints(userId);
    if (total < SPIN_COST) {
      throw new BadRequestException("Not enough points. Need " + SPIN_COST + ", have " + total);
    }

    // Deduct points
    await this.pointsService.awardPoints(userId, -SPIN_COST, "arcade_play", { gameId });

    // Spin
    const result = this.spin();

    // Award winnings if any
    if (result.pointsWon > 0) {
      await this.pointsService.awardPoints(userId, result.pointsWon, "arcade_win", {
        gameId,
        matches: result.matches,
      });
    }

    // Record play
    const [play] = await this.db
      .insert(arcadePlays)
      .values({
        userId,
        gameId,
        pointsSpent: SPIN_COST,
        pointsWon: result.pointsWon,
        result,
      })
      .returning();

    return { play, result, netPoints: result.pointsWon - SPIN_COST };
  }

  async getHistory(userId: string, limit = 20, page = 1) {
    const offset = (page - 1) * limit;
    const rows = await this.db
      .select()
      .from(arcadePlays)
      .where(eq(arcadePlays.userId, userId))
      .orderBy(desc(arcadePlays.createdAt))
      .limit(limit)
      .offset(offset);

    return rows;
  }
}
