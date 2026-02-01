import { describe, it, expect } from "vitest";
import {
  calculateFourPillars,
  yearPillar,
  monthPillar,
  dayPillar,
  hourPillar,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
} from "@/lib/four-pillars";

describe("Four Pillars calculation", () => {
  describe("yearPillar", () => {
    it("should return correct stem/branch for known years", () => {
      // 2000 is 庚辰 (Gēng Chén) year — stem=6(庚), branch=4(辰)
      const p = yearPillar(2000, 6);
      expect(p.stem.chinese).toBe("庚");
      expect(p.branch.chinese).toBe("辰");
      expect(p.branch.animal).toBe("Dragon");
    });

    it("should use previous year for January", () => {
      // Jan 2001 still counts as year 2000 in Chinese calendar
      const jan = yearPillar(2001, 1);
      const dec = yearPillar(2000, 12);
      expect(jan.stem.index).toBe(dec.stem.index);
      expect(jan.branch.index).toBe(dec.branch.index);
    });

    it("should cycle through 60 years", () => {
      const p1 = yearPillar(1984, 3);
      const p2 = yearPillar(2044, 3);
      expect(p1.stem.index).toBe(p2.stem.index);
      expect(p1.branch.index).toBe(p2.branch.index);
    });
  });

  describe("dayPillar", () => {
    it("should return 甲午 for Jan 1, 2000", () => {
      const p = dayPillar(2000, 1, 1);
      expect(p.stem.chinese).toBe("甲");
      expect(p.branch.chinese).toBe("午");
    });

    it("should advance by 1 each day", () => {
      const d1 = dayPillar(2000, 1, 1);
      const d2 = dayPillar(2000, 1, 2);
      expect((d2.stem.index - d1.stem.index + 10) % 10).toBe(1);
      expect((d2.branch.index - d1.branch.index + 12) % 12).toBe(1);
    });
  });

  describe("monthPillar", () => {
    it("should return valid stem and branch", () => {
      const p = monthPillar(2000, 6);
      expect(HEAVENLY_STEMS).toContain(p.stem.chinese);
      expect(EARTHLY_BRANCHES).toContain(p.branch.chinese);
    });
  });

  describe("hourPillar", () => {
    it("should map hour 0 (midnight) to 子 branch", () => {
      const p = hourPillar(2000, 1, 1, 0);
      // ((0+1)%24) = 1, floor(1/2) = 0 → index 0 = 子
      expect(p.branch.chinese).toBe("子");
    });

    it("should map hour 23 to 子 branch", () => {
      const p = hourPillar(2000, 1, 1, 23);
      // ((23+1)%24)/2 = 0 → 子
      expect(p.branch.chinese).toBe("子");
    });

    it("should have valid stem element", () => {
      const p = hourPillar(2000, 6, 15, 14);
      expect(["Wood", "Fire", "Earth", "Metal", "Water"]).toContain(p.stem.element);
    });
  });

  describe("calculateFourPillars", () => {
    it("should return all 4 pillars with elements", () => {
      const result = calculateFourPillars(1990, 8, 15, 10);
      expect(result.year).toBeDefined();
      expect(result.month).toBeDefined();
      expect(result.day).toBeDefined();
      expect(result.hour).toBeDefined();
      expect(result.dominantElements).toBeDefined();

      // Check element counts sum to 8 (4 pillars × 2 elements each)
      const total = Object.values(result.dominantElements).reduce((a, b) => a + b, 0);
      expect(total).toBe(8);
    });

    it("should have correct structure for each pillar", () => {
      const result = calculateFourPillars(2000, 3, 20, 8);
      for (const key of ["year", "month", "day", "hour"] as const) {
        const p = result[key];
        expect(p.stem).toHaveProperty("index");
        expect(p.stem).toHaveProperty("chinese");
        expect(p.stem).toHaveProperty("pinyin");
        expect(p.stem).toHaveProperty("element");
        expect(p.branch).toHaveProperty("index");
        expect(p.branch).toHaveProperty("chinese");
        expect(p.branch).toHaveProperty("animal");
      }
    });
  });
});
