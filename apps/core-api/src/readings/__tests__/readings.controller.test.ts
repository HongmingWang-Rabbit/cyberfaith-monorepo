import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
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
});
