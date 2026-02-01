import { describe, it, expect, vi, beforeEach } from "vitest";
import { DigestService } from "../digest.service";

describe("DigestService", () => {
  let service: DigestService;
  let mockDb: any;

  beforeEach(() => {
    const createChain = () => {
      const chain: any = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.from = vi.fn().mockReturnValue(chain);
      chain.where = vi.fn().mockReturnValue(chain);
      chain.limit = vi.fn().mockResolvedValue([]);
      chain.orderBy = vi.fn().mockReturnValue(chain);
      chain.groupBy = vi.fn().mockReturnValue(chain);
      chain.innerJoin = vi.fn().mockReturnValue(chain);
      chain.leftJoin = vi.fn().mockReturnValue(chain);
      return chain;
    };
    mockDb = createChain();
    service = new DigestService(mockDb);
  });

  describe("generateDigest", () => {
    it("returns null if user not found", async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      const result = await service.generateDigest("nonexistent");
      expect(result).toBeNull();
    });

    it("returns digest data for a valid user", async () => {
      const user = { id: "u1", name: "Alice", email: "a@b.com", emailNotifications: true };

      // The chain mock uses .limit() as terminal for user lookup and community highlights,
      // and .where() as terminal for readings/points queries, .orderBy() for streak
      mockDb.limit
        .mockResolvedValueOnce([user]) // user lookup
        .mockResolvedValueOnce([{ authorName: "Bob", type: "tarot" }]); // community highlights
      mockDb.where
        .mockReturnValueOnce(mockDb) // user lookup .where -> chain (then .limit)
        .mockResolvedValueOnce([ // readings this week
          { type: "tarot", createdAt: new Date() },
          { type: "tarot", createdAt: new Date() },
          { type: "mbti", createdAt: new Date() },
        ])
        .mockResolvedValueOnce([{ total: 30 }]) // points this week
        .mockResolvedValueOnce([{ total: 100 }]); // total points
      mockDb.orderBy.mockResolvedValueOnce([]); // streak days

      const result = await service.generateDigest("u1");
      expect(result).not.toBeNull();
      expect(result!.userName).toBe("Alice");
      expect(result!.readingsThisWeek).toBe(3);
      expect(result!.readingTypes).toEqual({ tarot: 2, mbti: 1 });
    });
  });

  describe("getUsersForDigest", () => {
    it("queries active users with email notifications enabled", async () => {
      const users = [{ id: "u1", email: "a@b.com", name: "Alice" }];
      mockDb.where.mockResolvedValueOnce(users);

      const result = await service.getUsersForDigest();
      expect(result).toEqual(users);
      expect(mockDb.select).toHaveBeenCalled();
    });
  });
});
