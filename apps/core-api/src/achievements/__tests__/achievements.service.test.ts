import { describe, it, expect, vi, beforeEach } from "vitest";
import { AchievementsService, SEED_ACHIEVEMENTS } from "../achievements.service";

describe("AchievementsService", () => {
  let service: AchievementsService;
  let mockDb: any;
  let mockPointsService: any;

  beforeEach(() => {
    const createChain = () => {
      const chain: any = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.from = vi.fn().mockReturnValue(chain);
      chain.where = vi.fn().mockReturnValue(chain);
      chain.limit = vi.fn().mockResolvedValue([]);
      chain.innerJoin = vi.fn().mockReturnValue(chain);
      chain.insert = vi.fn().mockReturnValue(chain);
      chain.values = vi.fn().mockReturnValue(chain);
      chain.onConflictDoNothing = vi.fn().mockReturnValue(chain);
      chain.returning = vi.fn().mockResolvedValue([]);
      return chain;
    };
    mockDb = createChain();
    mockPointsService = {
      awardPoints: vi.fn().mockResolvedValue({ id: "tx-1" }),
    };
    service = new AchievementsService(mockDb, mockPointsService);
  });

  describe("getAllAchievements", () => {
    it("returns all achievements from db", async () => {
      const achs = [{ id: "a1", name: "First Steps" }];
      mockDb.from.mockResolvedValueOnce(achs);

      const result = await service.getAllAchievements();
      expect(result).toEqual(achs);
    });
  });

  describe("getUserAchievements", () => {
    it("returns user unlocked achievements with join", async () => {
      const unlocked = [{ id: "ua1", name: "First Steps", unlockedAt: new Date() }];
      mockDb.where.mockResolvedValueOnce(unlocked);

      const result = await service.getUserAchievements("u1");
      expect(result).toEqual(unlocked);
      expect(mockDb.innerJoin).toHaveBeenCalled();
    });

    it("returns empty array when no achievements", async () => {
      mockDb.where.mockResolvedValueOnce([]);
      const result = await service.getUserAchievements("u1");
      expect(result).toEqual([]);
    });
  });

  describe("checkAndAward", () => {
    const mockAchievement = {
      id: "ach-1",
      name: "First Steps",
      requirement: { type: "total_readings", count: 1 },
      pointsReward: 10,
    };

    it("awards achievement when requirement met", async () => {
      // First where: all achievements
      mockDb.from.mockResolvedValueOnce([mockAchievement]);
      // Second where: existing unlocks (empty)
      mockDb.where.mockResolvedValueOnce([]);
      // Third where: user readings (1 reading)
      mockDb.where.mockResolvedValueOnce([{ id: "r1", type: "tarot" }]);
      // Insert returning
      mockDb.returning.mockResolvedValueOnce([{ unlockedAt: new Date() }]);

      const result = await service.checkAndAward("u1", { type: "reading_completed", readingType: "tarot" });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("First Steps");
      expect(mockPointsService.awardPoints).toHaveBeenCalledWith("u1", 10, "achievement_unlocked", expect.any(Object));
    });

    it("skips already unlocked achievements", async () => {
      mockDb.from.mockResolvedValueOnce([mockAchievement]);
      // Already unlocked
      mockDb.where.mockResolvedValueOnce([{ achievementId: "ach-1" }]);
      // User readings
      mockDb.where.mockResolvedValueOnce([{ id: "r1", type: "tarot" }]);

      const result = await service.checkAndAward("u1", { type: "reading_completed", readingType: "tarot" });
      expect(result).toHaveLength(0);
    });

    it("does not award when requirement not met", async () => {
      const hardAchievement = {
        id: "ach-2",
        name: "Dedicated Seeker",
        requirement: { type: "total_readings", count: 10 },
        pointsReward: 30,
      };
      mockDb.from.mockResolvedValueOnce([hardAchievement]);
      mockDb.where.mockResolvedValueOnce([]);
      // Only 1 reading, need 10
      mockDb.where.mockResolvedValueOnce([{ id: "r1", type: "tarot" }]);

      const result = await service.checkAndAward("u1", { type: "reading_completed", readingType: "tarot" });
      expect(result).toHaveLength(0);
    });
  });

  describe("SEED_ACHIEVEMENTS", () => {
    it("has 9 seed achievements", () => {
      expect(SEED_ACHIEVEMENTS).toHaveLength(9);
    });

    it("all have required fields", () => {
      for (const seed of SEED_ACHIEVEMENTS) {
        expect(seed.name).toBeTruthy();
        expect(seed.description).toBeTruthy();
        expect(seed.pointsReward).toBeGreaterThan(0);
        expect(seed.requirement).toBeTruthy();
      }
    });
  });
});
