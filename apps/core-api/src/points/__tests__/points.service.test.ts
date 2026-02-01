import { describe, it, expect, vi, beforeEach } from "vitest";
import { PointsService } from "../points.service";

describe("PointsService", () => {
  let service: PointsService;
  let mockDb: any;

  beforeEach(() => {
    const createChain = () => {
      const chain: any = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.from = vi.fn().mockReturnValue(chain);
      chain.where = vi.fn().mockReturnValue(chain);
      chain.limit = vi.fn().mockResolvedValue([]);
      chain.offset = vi.fn().mockReturnValue(chain);
      chain.orderBy = vi.fn().mockReturnValue(chain);
      chain.groupBy = vi.fn().mockReturnValue(chain);
      chain.leftJoin = vi.fn().mockReturnValue(chain);
      chain.insert = vi.fn().mockReturnValue(chain);
      chain.values = vi.fn().mockReturnValue(chain);
      chain.returning = vi.fn().mockResolvedValue([]);
      return chain;
    };
    mockDb = createChain();
    service = new PointsService(mockDb);
  });

  describe("awardPoints", () => {
    it("inserts a points transaction and returns it", async () => {
      const tx = { id: "tx-1", userId: "u1", amount: 10, reason: "reading_completed", metadata: null };
      mockDb.returning.mockResolvedValueOnce([tx]);

      const result = await service.awardPoints("u1", 10, "reading_completed");
      expect(result).toEqual(tx);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("passes metadata when provided", async () => {
      const meta = { readingType: "tarot" };
      const tx = { id: "tx-2", userId: "u1", amount: 15, reason: "reading_completed", metadata: meta };
      mockDb.returning.mockResolvedValueOnce([tx]);

      const result = await service.awardPoints("u1", 15, "reading_completed", meta);
      expect(result.metadata).toEqual(meta);
    });
  });

  describe("getUserPoints", () => {
    it("returns total and recent transactions", async () => {
      // First call: select sum → returns total
      // Second call: select recent → returns via limit
      const recentTxs = [{ id: "tx-1", amount: 10 }];
      // select().from().where() for sum
      mockDb.where.mockResolvedValueOnce([{ total: 42 }]);
      // select().from().where().orderBy().limit() for recent
      mockDb.limit.mockResolvedValueOnce(recentTxs);

      const result = await service.getUserPoints("u1");
      expect(result.total).toBe(42);
      expect(result.recent).toEqual(recentTxs);
    });

    it("returns 0 total when no transactions", async () => {
      mockDb.where.mockResolvedValueOnce([{ total: 0 }]);
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await service.getUserPoints("u1");
      expect(result.total).toBe(0);
      expect(result.recent).toEqual([]);
    });
  });

  describe("getLeaderboard", () => {
    it("returns sorted users by total points", async () => {
      const rows = [
        { userId: "u1", name: "Alice", total: 100 },
        { userId: "u2", name: null, total: 50 },
      ];
      mockDb.limit.mockResolvedValueOnce(rows);

      const result = await service.getLeaderboard(10);
      expect(result).toEqual([
        { rank: 1, displayName: "Alice", total: 100 },
        { rank: 2, displayName: "User #U2", total: 50 },
      ]);
    });

    it("defaults to limit 10", async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      await service.getLeaderboard();
      expect(mockDb.limit).toHaveBeenCalledWith(10);
    });
  });
});
