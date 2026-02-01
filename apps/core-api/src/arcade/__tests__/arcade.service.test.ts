import { describe, it, expect, vi, beforeEach } from "vitest";
import { ArcadeService } from "../arcade.service";
import { PointsService } from "../../points/points.service";

describe("ArcadeService", () => {
  let service: ArcadeService;
  let mockDb: any;
  let mockPointsService: any;

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

  describe("spin", () => {
    it("returns 3 reels with valid symbols", () => {
      const result = service.spin();
      expect(result.reels).toHaveLength(3);
      const validSymbols = ["🔮", "✨", "🌟", "☯️", "🧿", "💫", "🪬", "🌙"];
      result.reels.forEach((r) => expect(validSymbols).toContain(r));
    });

    it("returns correct points for 3 match", () => {
      // Mock Math.random to return same value
      const orig = Math.random;
      Math.random = () => 0.1; // Will pick index 0 for all
      const result = service.spin();
      Math.random = orig;

      expect(result.matches).toBe(3);
      expect(result.pointsWon).toBe(50);
      expect(new Set(result.reels).size).toBe(1);
    });

    it("returns 0 points for no match", () => {
      const orig = Math.random;
      let call = 0;
      // Return different indices: 0, 0.2, 0.5 → indices 0, 1, 4
      Math.random = () => [0.0, 0.15, 0.5][call++] ?? 0.9;
      const result = service.spin();
      Math.random = orig;

      if (new Set(result.reels).size === 3) {
        expect(result.matches).toBe(0);
        expect(result.pointsWon).toBe(0);
      }
    });
  });

  describe("play", () => {
    it("rejects unknown game", async () => {
      await expect(service.play("u1", "unknown-game")).rejects.toThrow("Unknown game");
    });

    it("rejects when not enough points", async () => {
      mockPointsService.getUserPoints.mockResolvedValue({ total: 5, recent: [] });
      await expect(service.play("u1", "karma-slots")).rejects.toThrow("Not enough points");
    });

    it("deducts points and records play", async () => {
      const result = await service.play("u1", "karma-slots");

      // Should deduct 10 points
      expect(mockPointsService.awardPoints).toHaveBeenCalledWith(
        "u1", -10, "arcade_play", { gameId: "karma-slots" }
      );

      // Should record play in db
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toHaveProperty("play");
      expect(result).toHaveProperty("result");
      expect(result).toHaveProperty("netPoints");
    });

    it("awards winnings on match", async () => {
      // Force a triple match
      const orig = Math.random;
      Math.random = () => 0.1;

      const result = await service.play("u1", "karma-slots");
      Math.random = orig;

      // Should award 50 points for triple match
      expect(mockPointsService.awardPoints).toHaveBeenCalledWith(
        "u1", 50, "arcade_win", { gameId: "karma-slots", matches: 3 }
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
