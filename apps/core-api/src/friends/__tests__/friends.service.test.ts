import { describe, it, expect, vi, beforeEach } from "vitest";
import { FriendsService } from "../friends.service";
import { AppException } from "../../common/app.exception";
import { ErrorCode } from "../../common/error-codes";

describe("FriendsService", () => {
  let service: FriendsService;
  let mockDb: any;

  const createChain = (resolvedValue: any = []) => {
    const chain: any = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.from = vi.fn().mockReturnValue(chain);
    chain.where = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockResolvedValue(resolvedValue);
    chain.orderBy = vi.fn().mockResolvedValue(resolvedValue);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.values = vi.fn().mockReturnValue(chain);
    chain.returning = vi.fn().mockResolvedValue(resolvedValue);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.set = vi.fn().mockReturnValue(chain);
    chain.delete = vi.fn().mockReturnValue(chain);
    chain.then = (resolve: any) => resolve(resolvedValue);
    return chain;
  };

  beforeEach(() => {
    mockDb = createChain();
  });

  describe("sendRequest", () => {
    it("throws if sending to self", async () => {
      service = new FriendsService(mockDb);
      await expect(service.sendRequest("u1", "u1")).rejects.toThrow(AppException);
      try { await service.sendRequest("u1", "u1"); } catch (e: any) {
        expect(e.errorCode).toBe(ErrorCode.CANNOT_FRIEND_SELF);
      }
    });

    it("creates a new friend request", async () => {
      const friendship = { id: "f1", requesterId: "u1", addresseeId: "u2", status: "pending" };
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValueOnce([friendship]);

      service = new FriendsService(mockDb);
      const result = await service.sendRequest("u1", "u2");
      expect(result).toEqual(friendship);
    });

    it("throws if already friends", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: "f1", status: "accepted" }]);
      service = new FriendsService(mockDb);
      await expect(service.sendRequest("u1", "u2")).rejects.toThrow(AppException);
      try { await service.sendRequest("u1", "u2"); } catch (e: any) {
        expect(e.errorCode).toBe(ErrorCode.ALREADY_FRIENDS);
      }
    });

    it("throws if request already pending", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: "f1", status: "pending" }]);
      service = new FriendsService(mockDb);
      await expect(service.sendRequest("u1", "u2")).rejects.toThrow(AppException);
      try { await service.sendRequest("u1", "u2"); } catch (e: any) {
        expect(e.errorCode).toBe(ErrorCode.FRIEND_REQUEST_EXISTS);
      }
    });
  });

  describe("acceptRequest", () => {
    it("accepts a pending request", async () => {
      const pending = { id: "f1", addresseeId: "u2", status: "pending" };
      const accepted = { ...pending, status: "accepted" };
      mockDb.where.mockResolvedValueOnce([pending]);
      mockDb.returning.mockResolvedValueOnce([accepted]);

      service = new FriendsService(mockDb);
      const result = await service.acceptRequest("f1", "u2");
      expect(result).toEqual(accepted);
    });

    it("throws if request not found", async () => {
      mockDb.where.mockResolvedValueOnce([]);
      service = new FriendsService(mockDb);
      await expect(service.acceptRequest("f1", "u2")).rejects.toThrow(AppException);
      try { await service.acceptRequest("f1", "u2"); } catch (e: any) {
        expect(e.errorCode).toBe(ErrorCode.FRIEND_REQUEST_NOT_FOUND);
      }
    });

    it("throws if request is not pending", async () => {
      mockDb.where.mockResolvedValue([{ id: "f1", addresseeId: "u2", status: "accepted" }]);
      service = new FriendsService(mockDb);
      try {
        await service.acceptRequest("f1", "u2");
        expect.unreachable("should have thrown");
      } catch (e: any) {
        expect(e).toBeInstanceOf(AppException);
        expect(e.errorCode).toBe(ErrorCode.REQUEST_NOT_PENDING);
      }
    });
  });

  describe("rejectRequest", () => {
    it("rejects a pending request", async () => {
      const pending = { id: "f1", addresseeId: "u2", status: "pending" };
      const rejected = { ...pending, status: "rejected" };
      mockDb.where.mockResolvedValueOnce([pending]);
      mockDb.returning.mockResolvedValueOnce([rejected]);

      service = new FriendsService(mockDb);
      const result = await service.rejectRequest("f1", "u2");
      expect(result).toEqual(rejected);
    });

    it("throws if not found", async () => {
      mockDb.where.mockResolvedValueOnce([]);
      service = new FriendsService(mockDb);
      await expect(service.rejectRequest("f1", "u2")).rejects.toThrow(AppException);
    });
  });

  describe("removeFriend", () => {
    it("removes a friendship", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: "f1", requesterId: "u1", addresseeId: "u2" }]);
      service = new FriendsService(mockDb);
      const result = await service.removeFriend("f1", "u1");
      expect(result).toEqual({ deleted: true });
    });

    it("throws if not found", async () => {
      mockDb.where.mockResolvedValueOnce([]);
      service = new FriendsService(mockDb);
      await expect(service.removeFriend("f1", "u1")).rejects.toThrow(AppException);
    });
  });

  describe("listFriends", () => {
    it("returns empty array when no friends", async () => {
      mockDb.where.mockResolvedValueOnce([]);
      service = new FriendsService(mockDb);
      const result = await service.listFriends("u1");
      expect(result).toEqual([]);
    });
  });

  describe("getFriendReadings", () => {
    it("throws if friendship not found", async () => {
      mockDb.where.mockResolvedValueOnce([]);
      service = new FriendsService(mockDb);
      await expect(service.getFriendReadings("f1", "u1")).rejects.toThrow(AppException);
    });
  });
});
