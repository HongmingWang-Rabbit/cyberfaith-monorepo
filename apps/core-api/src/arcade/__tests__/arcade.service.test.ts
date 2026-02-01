import { describe, it, expect, vi, beforeEach } from "vitest";
import { ArcadeService } from "../arcade.service";

describe("ArcadeService", () => {
  let service: ArcadeService;
  let mockDb: any;
  let mockPointsService: any;

  const karmaSlotGame = {
    id: "game-1",
    slug: "karma-slots",
    name: "Karma Slots",
    status: "active",
    config: {
      minBet: 10,
      maxWin: 50,
      symbols: ["🔮", "✨", "🌟", "☯️", "🧿", "💫", "🪬", "🌙"],
      reelCount: 3,
      payoutRules: { threeMatch: 50, twoMatch: 20 },
    },
  };

  beforeEach(() => {
    const createChain = () => {
      const chain: any = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.from = vi.fn().mockReturnValue(chain);
      chain.where = vi.fn().mockReturnValue(chain);
      chain.limit = vi.fn().mockReturnValue(chain);
      chain.offset = vi.fn().mockResolvedValue([]);
      chain.orderBy = vi.fn().mockReturnValue(chain);
      chain.insert = vi.fn().mockReturnValue(chain);
      chain.values = vi.fn().mockReturnValue(chain);
      chain.returning = vi.fn().mockResolvedValue([{ id: "play-1" }]);
      return chain;
    };
    mockDb = createChain();

    mockPointsService = {
      getUserPoints: vi.fn().mockResolvedValue({ total: 100, recent: [] }),
      awardPoints: vi.fn().mockResolvedValue({ id: "tx-1" }),
    };

    service = new ArcadeService(mockDb, mockPointsService as any);
  });

  describe("listGames", () => {
    it("returns games from DB", async () => {
      mockDb.orderBy.mockResolvedValueOnce([karmaSlotGame]);
      const result = await service.listGames();
      expect(result).toEqual([karmaSlotGame]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe("getGameBySlug", () => {
    it("returns game when found", async () => {
      mockDb.where.mockResolvedValueOnce([karmaSlotGame]);
      const result = await service.getGameBySlug("karma-slots");
      expect(result).toEqual(karmaSlotGame);
    });

    it("returns null when not found", async () => {
      mockDb.where.mockResolvedValueOnce([]);
      const result = await service.getGameBySlug("nope");
      expect(result).toBeNull();
    });
  });

  describe("play", () => {
    it("rejects unknown game", async () => {
      mockDb.where.mockResolvedValueOnce([]);
      await expect(service.play("u1", "unknown-game")).rejects.toThrow("Game not found");
    });

    it("rejects inactive game", async () => {
      mockDb.where.mockResolvedValueOnce([{ ...karmaSlotGame, status: "draft" }]);
      await expect(service.play("u1", "karma-slots")).rejects.toThrow("not active");
    });

    it("rejects when not enough points", async () => {
      mockDb.where.mockResolvedValueOnce([karmaSlotGame]);
      mockPointsService.getUserPoints.mockResolvedValue({ total: 5, recent: [] });
      await expect(service.play("u1", "karma-slots")).rejects.toThrow("Not enough points");
    });

    it("deducts points, runs engine, and records play", async () => {
      mockDb.where.mockResolvedValueOnce([karmaSlotGame]);
      const result = await service.play("u1", "karma-slots");

      // Should deduct 10 points
      expect(mockPointsService.awardPoints).toHaveBeenCalledWith(
        "u1", -10, "arcade_play", { gameSlug: "karma-slots" },
      );

      // Should record play in db
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toHaveProperty("play");
      expect(result).toHaveProperty("result");
      expect(result).toHaveProperty("netPoints");
      expect(result).toHaveProperty("pointsSpent", 10);
    });

    it("awards winnings on triple match", async () => {
      mockDb.where.mockResolvedValueOnce([karmaSlotGame]);
      const orig = Math.random;
      Math.random = () => 0.1;

      const result = await service.play("u1", "karma-slots");
      Math.random = orig;

      // Should award 50 points for triple match
      expect(mockPointsService.awardPoints).toHaveBeenCalledWith(
        "u1", 50, "arcade_win", expect.objectContaining({ gameSlug: "karma-slots" }),
      );
      expect(result.netPoints).toBe(40); // 50 - 10
    });
  });

  describe("getHistory", () => {
    it("returns play history", async () => {
      const plays = [{ id: "p1" }, { id: "p2" }];
      mockDb.offset.mockResolvedValueOnce(plays);

      const result = await service.getHistory("u1", 20, 1);
      expect(result).toEqual(plays);
      expect(mockDb.where).toHaveBeenCalled();
    });
  });
});
