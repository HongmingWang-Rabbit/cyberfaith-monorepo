import { describe, it, expect, vi, beforeEach } from "vitest";
import { FriendsService } from "../friends.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

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
    // Make chain itself thenable for cases where it's awaited directly
    chain.then = (resolve: any) => resolve(resolvedValue);
    return chain;
  };

  beforeEach(() => {
    mockDb = createChain();
  });

  describe("sendRequest", () => {
    it("throws if sending to self", async () => {
      service = new FriendsService(mockDb);
      await expect(service.sendRequest("u1", "u1")).rejects.toThrow(BadRequestException);
    });

    it("creates a new friend request", async () => {
      const friendship = { id: "f1", requesterId: "u1", addresseeId: "u2", status: "pending" };
      // First call: check existing - returns empty
      mockDb.where.mockResolvedValueOnce([]);
      // Second call: insert returning
      mockDb.returning.mockResolvedValueOnce([friendship]);

      service = new FriendsService(mockDb);
      const result = await service.sendRequest("u1", "u2");
      expect(result).toEqual(friendship);
    });

    it("throws if already friends", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: "f1", status: "accepted" }]);
      service = new FriendsService(mockDb);
      await expect(service.sendRequest("u1", "u2")).rejects.toThrow(BadRequestException);
    });

    it("throws if request already pending", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: "f1", status: "pending" }]);
      service = new FriendsService(mockDb);
      await expect(service.sendRequest("u1", "u2")).rejects.toThrow(BadRequestException);
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
      await expect(service.acceptRequest("f1", "u2")).rejects.toThrow(NotFoundException);
    });

    it("throws if request is not pending", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: "f1", addresseeId: "u2", status: "accepted" }]);
      service = new FriendsService(mockDb);
      await expect(service.acceptRequest("f1", "u2")).rejects.toThrow(BadRequestException);
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
      await expect(service.rejectRequest("f1", "u2")).rejects.toThrow(NotFoundException);
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
      await expect(service.removeFriend("f1", "u1")).rejects.toThrow(NotFoundException);
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
      await expect(service.getFriendReadings("f1", "u1")).rejects.toThrow(NotFoundException);
    });
  });
});
