import { describe, it, expect, vi, beforeEach } from "vitest";
import { MuyuService } from "../muyu.service";
import { PointsService } from "../../../points/points.service";

describe("MuyuService", () => {
  let service: MuyuService;
  let mockDb: any;
  let mockPointsService: any;

  beforeEach(() => {
    const createChain = (resolveValue: any = []) => {
      const chain: any = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.from = vi.fn().mockReturnValue(chain);
      chain.where = vi.fn().mockReturnValue(chain);
      chain.groupBy = vi.fn().mockReturnValue(chain);
      chain.orderBy = vi.fn().mockReturnValue(chain);
      chain.limit = vi.fn().mockResolvedValue(resolveValue);
      chain.insert = vi.fn().mockReturnValue(chain);
      chain.values = vi.fn().mockReturnValue(chain);
      chain.returning = vi.fn().mockResolvedValue([{ id: "session-1", tapCount: 10, pointsEarned: 0 }]);
      // Make chain thenable for select queries
      chain.then = (resolve: any) => resolve(resolveValue);
      return chain;
    };

    // We need a db mock that returns different values for different queries
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
    };

    mockPointsService = {
      getUserPoints: vi.fn().mockResolvedValue({ total: 100, recent: [] }),
      awardPoints: vi.fn().mockResolvedValue({ id: "tx-1" }),
    };

    service = new MuyuService(mockDb, mockPointsService as any);
  });

  describe("recordTaps", () => {
    it("records taps without awarding points when under threshold", async () => {
      // Mock: previous total = 50 taps
      const selectChain: any = {};
      selectChain.from = vi.fn().mockReturnValue(selectChain);
      selectChain.where = vi.fn().mockResolvedValue([{ total: 50 }]);
      mockDb.select.mockReturnValue(selectChain);

      const insertChain: any = {};
      insertChain.values = vi.fn().mockReturnValue(insertChain);
      insertChain.returning = vi.fn().mockResolvedValue([{ id: "s1", tapCount: 10, pointsEarned: 0 }]);
      mockDb.insert.mockReturnValue(insertChain);

      const result = await service.recordTaps("user-1", 10);

      expect(result.totalTaps).toBe(60);
      expect(result.pointsEarned).toBe(0);
      expect(mockPointsService.awardPoints).not.toHaveBeenCalled();
    });

    it("awards 1 point when crossing 100-tap threshold", async () => {
      // Mock: previous total = 95 taps, adding 10 → 105
      const selectChain: any = {};
      selectChain.from = vi.fn().mockReturnValue(selectChain);
      selectChain.where = vi.fn().mockResolvedValue([{ total: 95 }]);
      mockDb.select.mockReturnValue(selectChain);

      const insertChain: any = {};
      insertChain.values = vi.fn().mockReturnValue(insertChain);
      insertChain.returning = vi.fn().mockResolvedValue([{ id: "s1", tapCount: 10, pointsEarned: 1 }]);
      mockDb.insert.mockReturnValue(insertChain);

      const result = await service.recordTaps("user-1", 10);

      expect(result.totalTaps).toBe(105);
      expect(result.pointsEarned).toBe(1);
      expect(mockPointsService.awardPoints).toHaveBeenCalledWith("user-1", 1, "muyu_merit", {
        tapCount: 10,
        totalTaps: 105,
      });
    });

    it("awards multiple points for large batches", async () => {
      // Mock: previous total = 50, adding 100 → 150 (crosses 100 once)
      const selectChain: any = {};
      selectChain.from = vi.fn().mockReturnValue(selectChain);
      selectChain.where = vi.fn().mockResolvedValue([{ total: 50 }]);
      mockDb.select.mockReturnValue(selectChain);

      const insertChain: any = {};
      insertChain.values = vi.fn().mockReturnValue(insertChain);
      insertChain.returning = vi.fn().mockResolvedValue([{ id: "s1", tapCount: 100, pointsEarned: 1 }]);
      mockDb.insert.mockReturnValue(insertChain);

      const result = await service.recordTaps("user-1", 100);

      expect(result.totalTaps).toBe(150);
      expect(result.pointsEarned).toBe(1); // floor(150/100) - floor(50/100) = 1 - 0 = 1
      expect(mockPointsService.awardPoints).toHaveBeenCalledOnce();
    });
  });

  describe("getStats", () => {
    it("returns stats for user with no sessions", async () => {
      const selectChain: any = {};
      selectChain.from = vi.fn().mockReturnValue(selectChain);
      selectChain.where = vi.fn().mockReturnValue(selectChain);
      selectChain.groupBy = vi.fn().mockReturnValue(selectChain);
      selectChain.orderBy = vi.fn().mockResolvedValue([]);
      // For the first two queries (total taps, total points), resolve with [{ total: 0 }]
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        const chain: any = {};
        chain.from = vi.fn().mockReturnValue(chain);
        chain.where = vi.fn().mockReturnValue(chain);
        chain.groupBy = vi.fn().mockReturnValue(chain);
        chain.orderBy = vi.fn().mockReturnValue(chain);
        // First two calls return totals, third returns days
        if (callCount <= 2) {
          chain.where = vi.fn().mockResolvedValue([{ total: 0 }]);
        } else {
          chain.orderBy = vi.fn().mockResolvedValue([]);
          chain.where = vi.fn().mockReturnValue(chain);
          chain.groupBy = vi.fn().mockReturnValue(chain);
        }
        return chain;
      });

      const result = await service.getStats("user-1");

      expect(result.totalTaps).toBe(0);
      expect(result.totalMerit).toBe(0);
      expect(result.streakDays).toBe(0);
    });
  });
});
