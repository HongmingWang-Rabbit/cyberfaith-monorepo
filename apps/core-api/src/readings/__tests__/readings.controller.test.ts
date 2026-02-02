import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReadingsController } from "../readings.controller";
import { AppException } from "../../common/app.exception";
import { ErrorCode } from "../../common/error-codes";
import { ReadingType } from "../dto";

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

    controller = new ReadingsController(mockDb, {} as any);
  });

  const req = { user: { id: "user-1" } } as any;

  describe("create", () => {
    it("creates a reading successfully", async () => {
      const body = { type: ReadingType.TAROT, input: { cards: [] }, result: { interpretation: "good" }, locale: "en" };
      const result = await controller.create(req, body);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReading);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("returns paginated readings", async () => {
      const result = await controller.findAll(req, { page: 1, limit: 10 });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockReading]);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("filters by type", async () => {
      const result = await controller.findAll(req, { type: "tarot" });
      expect(result.success).toBe(true);
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("returns a reading", async () => {
      mockDb.where.mockResolvedValue([mockReading]);
      const result = await controller.findOne(req, "uuid-1");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReading);
    });

    it("throws AppException when not found", async () => {
      mockDb.where.mockResolvedValue([]);
      await expect(controller.findOne(req, "nonexistent")).rejects.toThrow(AppException);
      try {
        await controller.findOne(req, "nonexistent");
      } catch (e: any) {
        expect(e.errorCode).toBe(ErrorCode.READING_NOT_FOUND);
      }
    });
  });

  describe("remove", () => {
    it("deletes a reading", async () => {
      mockDb.where.mockResolvedValueOnce([mockReading]).mockReturnThis();
      const result = await controller.remove(req, "uuid-1");
      expect(result.success).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it("throws AppException when not found", async () => {
      mockDb.where.mockResolvedValueOnce([]);
      await expect(controller.remove(req, "nonexistent")).rejects.toThrow(AppException);
    });
  });

  describe("feed", () => {
    it("returns paginated public feed", async () => {
      const feedItem = { id: "uuid-1", type: "tarot", result: {}, locale: "en", createdAt: new Date(), authorName: "Test", authorAvatar: null };
      mockDb.offset.mockResolvedValue([feedItem]);
      mockDb.innerJoin = vi.fn().mockReturnValue(mockDb);
      const result = await controller.feed({ page: 1, limit: 10 });
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
    it("rejects non-public reading", async () => {
      mockDb.where.mockResolvedValue([]);
      await expect(controller.react(req, "uuid-1", { emoji: "👍" } as any)).rejects.toThrow(AppException);
    });

    it("adds reaction successfully", async () => {
      const reaction = { id: "r1", readingId: "uuid-1", userId: "user-1", emoji: "👍", createdAt: new Date() };
      mockDb.where.mockResolvedValueOnce([{ id: "uuid-1" }]);
      mockDb.returning.mockResolvedValueOnce([reaction]);
      const result = await controller.react(req, "uuid-1", { emoji: "👍" } as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(reaction);
    });

    it("throws AppException on duplicate reaction", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: "uuid-1" }]);
      mockDb.returning.mockRejectedValueOnce(Object.assign(new Error("unique"), { code: "23505" }));
      try {
        await controller.react(req, "uuid-1", { emoji: "👍" } as any);
      } catch (e: any) {
        expect(e).toBeInstanceOf(AppException);
        expect(e.errorCode).toBe(ErrorCode.ALREADY_REACTED);
      }
    });
  });
});
