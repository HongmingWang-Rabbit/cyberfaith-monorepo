import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException, ForbiddenException, BadRequestException, ConflictException } from "@nestjs/common";
import { ReadingsController } from "../readings.controller";

describe("ReadingsController", () => {
  let controller: ReadingsController;
  let mockDb: any;

  const mockReading = {
    id: "uuid-1",
    userId: "user-1",
    type: "tarot",
    input: { cards: [] },
    result: { interpretation: "good" },
    locale: "en",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Build a chainable mock for drizzle queries
    mockDb = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([mockReading]),
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([mockReading]),
      delete: vi.fn().mockReturnThis(),
    };

    controller = new ReadingsController(mockDb);
  });

  const req = { user: { id: "user-1" } } as any;

  describe("create", () => {
    it("creates a reading successfully", async () => {
      const body = { type: "tarot", input: { cards: [] }, result: { interpretation: "good" }, locale: "en" };
      const result = await controller.create(req, body);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReading);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("rejects invalid type", async () => {
      const body = { type: "invalid", input: {}, result: {} };
      await expect(controller.create(req, body)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("findAll", () => {
    it("returns paginated readings", async () => {
      const result = await controller.findAll(req, undefined, "1", "10");
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockReading]);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("filters by type", async () => {
      const result = await controller.findAll(req, "tarot");
      expect(result.success).toBe(true);
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("returns a reading", async () => {
      // where returns array with one item
      mockDb.where.mockResolvedValue([mockReading]);
      const result = await controller.findOne(req, "uuid-1");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReading);
    });

    it("throws NotFoundException when not found", async () => {
      mockDb.where.mockResolvedValue([]);
      await expect(controller.findOne(req, "nonexistent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("deletes a reading", async () => {
      // First where call (select) returns reading, second (delete) is chained
      mockDb.where.mockResolvedValueOnce([mockReading]).mockReturnThis();
      const result = await controller.remove(req, "uuid-1");
      expect(result.success).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it("throws NotFoundException when not found", async () => {
      mockDb.where.mockResolvedValueOnce([]);
      await expect(controller.remove(req, "nonexistent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("feed", () => {
    it("returns paginated public feed", async () => {
      const feedItem = { id: "uuid-1", type: "tarot", result: {}, locale: "en", createdAt: new Date(), authorName: "Test", authorAvatar: null };
      mockDb.offset.mockResolvedValue([feedItem]);
      // innerJoin is chained
      mockDb.innerJoin = vi.fn().mockReturnValue(mockDb);
      const result = await controller.feed("1", "10");
      expect(result.success).toBe(true);
      expect(result.page).toBe(1);
    });
  });

  describe("getReactions", () => {
    it("returns reaction counts", async () => {
      mockDb.groupBy = vi.fn().mockResolvedValue([{ emoji: "👍", count: 3 }]);
      const result = await controller.getReactions("uuid-1");
      expect(result.success).toBe(true);
      expect(result.data["👍"]).toBe(3);
    });
  });

  describe("react", () => {
    it("rejects invalid emoji", async () => {
      await expect(controller.react(req, "uuid-1", { emoji: "💩" })).rejects.toThrow(BadRequestException);
    });

    it("rejects non-public reading", async () => {
      mockDb.where.mockResolvedValue([]);
      await expect(controller.react(req, "uuid-1", { emoji: "👍" })).rejects.toThrow(NotFoundException);
    });

    it("adds reaction successfully", async () => {
      const reaction = { id: "r1", readingId: "uuid-1", userId: "user-1", emoji: "👍", createdAt: new Date() };
      mockDb.where.mockResolvedValueOnce([{ id: "uuid-1" }]);
      mockDb.returning.mockResolvedValueOnce([reaction]);
      const result = await controller.react(req, "uuid-1", { emoji: "👍" });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(reaction);
    });

    it("throws ConflictException on duplicate", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: "uuid-1" }]);
      mockDb.returning.mockRejectedValueOnce(Object.assign(new Error("unique"), { code: "23505" }));
      await expect(controller.react(req, "uuid-1", { emoji: "👍" })).rejects.toThrow(ConflictException);
    });
  });
});
