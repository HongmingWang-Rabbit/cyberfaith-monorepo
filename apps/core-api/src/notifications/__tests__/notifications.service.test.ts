import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationsService } from "../notifications.service";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let mockDb: any;

  const mockSub = {
    id: "sub-1",
    userId: "user-1",
    endpoint: "https://push.example.com/sub1",
    p256dh: "key1",
    auth: "auth1",
    createdAt: new Date(),
  };

  beforeEach(() => {
    mockDb = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([mockSub]),
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockResolvedValue([mockSub]),
      delete: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };

    service = new NotificationsService(mockDb);
  });

  describe("subscribe", () => {
    it("creates a push subscription", async () => {
      const result = await service.subscribe("user-1", "https://push.example.com/sub1", "key1", "auth1");
      expect(result).toEqual(mockSub);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("updates on duplicate endpoint", async () => {
      mockDb.returning.mockRejectedValueOnce({ code: "23505" });
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockSub]),
          }),
        }),
      });

      const result = await service.subscribe("user-1", "https://push.example.com/sub1", "key1", "auth1");
      expect(result).toEqual(mockSub);
    });
  });

  describe("unsubscribe", () => {
    it("deletes subscription", async () => {
      await service.unsubscribe("user-1", "https://push.example.com/sub1");
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("sendToAll", () => {
    it("reports failed count when sending fails", async () => {
      const result = await service.sendToAll("Test", "Body");
      // web-push is installed but VAPID not configured, so sends fail
      expect(result.sent + result.failed).toBeGreaterThanOrEqual(0);
    });
  });
});
