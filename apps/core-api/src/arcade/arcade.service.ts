import { Inject, Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { eq, desc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../db/db.module";
import { arcadePlays, games } from "../db/schema";
import { PointsService } from "../points/points.service";
import { getGameEngine } from "./engines";
import type { GameConfig } from "./engines";

@Injectable()
export class ArcadeService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase,
    private pointsService: PointsService,
  ) {}

  /** List all active games */
  async listGames() {
    const rows = await this.db
      .select()
      .from(games)
      .where(eq(games.status, "active"))
      .orderBy(games.sortOrder, games.name);

    return rows;
  }

  /** Get a single game by slug */
  async getGameBySlug(slug: string) {
    const [game] = await this.db
      .select()
      .from(games)
      .where(eq(games.slug, slug));

    return game ?? null;
  }

  /**
   * Generic play: look up game from DB, validate config,
   * check balance, run engine, record result.
   */
  async play(userId: string, gameSlug: string, input?: Record<string, any>) {
    // 1. Look up game in DB
    const game = await this.getGameBySlug(gameSlug);
    if (!game) {
      throw new NotFoundException("Game not found: " + gameSlug);
    }
    if (game.status !== "active") {
      throw new BadRequestException("Game is not active: " + gameSlug);
    }

    // 2. Get engine
    const engine = getGameEngine(gameSlug);
    if (!engine) {
      throw new BadRequestException("No engine registered for game: " + gameSlug);
    }

    // 3. Read config
    const config = game.config as GameConfig;
    const cost = config.minBet;
    if (!cost || cost <= 0) {
      throw new BadRequestException("Invalid game config: minBet must be > 0");
    }

    // 4. Check balance
    const { total } = await this.pointsService.getUserPoints(userId);
    if (total < cost) {
      throw new BadRequestException(
        `Not enough points. Need ${cost}, have ${total}`,
      );
    }

    // 5. Deduct cost
    await this.pointsService.awardPoints(userId, -cost, "arcade_play", {
      gameSlug,
    });

    // 6. Run engine
    const result = engine(config, input);

    // 7. Award winnings
    if (result.pointsWon > 0) {
      await this.pointsService.awardPoints(userId, result.pointsWon, "arcade_win", {
        gameSlug,
        outcome: result.outcome,
      });
    }

    // 8. Record play
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

  /** Play history for a user */
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
