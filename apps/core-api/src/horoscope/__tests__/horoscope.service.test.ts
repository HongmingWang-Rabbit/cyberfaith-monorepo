import { describe, it, expect, vi, beforeEach } from "vitest";
import { HoroscopeService, isValidZodiacSign } from "../horoscope.service";

describe("HoroscopeService", () => {
  let service: HoroscopeService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
    };

    service = new HoroscopeService(mockDb);
  });

  describe("isValidZodiacSign", () => {
    it("returns true for valid signs", () => {
      expect(isValidZodiacSign("aries")).toBe(true);
      expect(isValidZodiacSign("pisces")).toBe(true);
      expect(isValidZodiacSign("leo")).toBe(true);
    });

    it("returns false for invalid signs", () => {
      expect(isValidZodiacSign("invalid")).toBe(false);
      expect(isValidZodiacSign("")).toBe(false);
    });
  });

  describe("getDailyHoroscope", () => {
    it("returns cached horoscope if exists", async () => {
      const cached = {
        sign: "aries",
        date: new Date().toISOString().slice(0, 10),
        content: { mood: "Energetic", luckyNumber: 7, compatibility: "leo", reading: "Great day!" },
      };
      mockDb.where.mockResolvedValueOnce([cached]);

      const result = await service.getDailyHoroscope("aries");
      expect(result).toEqual(cached.content);
    });

    it("generates fallback horoscope when no cache and no AI", async () => {
      mockDb.where.mockResolvedValueOnce([]); // no cache

      const result = await service.getDailyHoroscope("aries");
      expect(result).toHaveProperty("mood");
      expect(result).toHaveProperty("luckyNumber");
      expect(result).toHaveProperty("compatibility");
      expect(result).toHaveProperty("reading");
      expect(typeof result.luckyNumber).toBe("number");
    });

    it("handles insert conflict gracefully", async () => {
      mockDb.where.mockResolvedValueOnce([]); // no cache
      mockDb.values.mockRejectedValueOnce({ code: "23505" }); // conflict

      const result = await service.getDailyHoroscope("taurus");
      expect(result).toHaveProperty("mood");
    });
  });
});
