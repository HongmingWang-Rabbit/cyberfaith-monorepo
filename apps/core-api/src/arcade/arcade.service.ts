import { Inject, Injectable, HttpStatus } from "@nestjs/common";
import { eq, desc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../db/db.module";
import { arcadePlays, games } from "../db/schema";
import { PointsService } from "../points/points.service";
import { getGameEngine } from "./engines";
import type { GameConfig } from "./engines";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";

@Injectable()
export class ArcadeService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase,
    private pointsService: PointsService,
  ) {}

  async listGames() {
    const rows = await this.db
      .select()
      .from(games)
      .where(eq(games.status, "active"))
      .orderBy(games.sortOrder, games.name);

    return rows;
  }

  async getGameBySlug(slug: string) {
    const [game] = await this.db
      .select()
      .from(games)
      .where(eq(games.slug, slug));

    return game ?? null;
  }

  async play(userId: string, gameSlug: string, input?: Record<string, any>) {
    const game = await this.getGameBySlug(gameSlug);
    if (!game) {
      throw new AppException(ErrorCode.GAME_NOT_FOUND, "Game not found: " + gameSlug, HttpStatus.NOT_FOUND);
    }
    if (game.status !== "active") {
      throw new AppException(ErrorCode.GAME_NOT_ACTIVE, "Game is not active: " + gameSlug);
    }

    const engine = getGameEngine(gameSlug);
    if (!engine) {
      throw new AppException(ErrorCode.GAME_NOT_FOUND, "No engine registered for game: " + gameSlug);
    }

    const config = game.config as GameConfig;
    const cost = config.minBet;
    if (!cost || cost <= 0) {
      throw new AppException(ErrorCode.INVALID_GAME_CONFIG, "Invalid game config: minBet must be > 0");
    }

    const { total } = await this.pointsService.getUserPoints(userId);
    if (total < cost) {
      throw new AppException(
        ErrorCode.INSUFFICIENT_POINTS,
        `Not enough points. Need ${cost}, have ${total}`,
      );
    }

    await this.pointsService.awardPoints(userId, -cost, "arcade_play", {
      gameSlug,
    });

    const result = engine(config, input);

    if (result.pointsWon > 0) {
      await this.pointsService.awardPoints(userId, result.pointsWon, "arcade_win", {
        gameSlug,
        outcome: result.outcome,
      });
    }

    const [play] = await this.db
      .insert(arcadePlays)
      .values({
        userId,
        gameId: game.id,
        pointsSpent: cost,
        pointsWon: result.pointsWon,
        result: result.outcome,
      })
      .returning();

    return {
      play,
      result: result.outcome,
      pointsWon: result.pointsWon,
      pointsSpent: cost,
      netPoints: result.pointsWon - cost,
    };
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
