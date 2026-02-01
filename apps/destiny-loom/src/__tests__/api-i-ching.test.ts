import { describe, it, expect } from "vitest";
import { castHexagram } from "@/lib/i-ching";

describe("I Ching hexagram casting", () => {
  it("should return 6 lines", () => {
    const result = castHexagram();
    expect(result.lines).toHaveLength(6);
  });

  it("should have lines with positions 1-6", () => {
    const result = castHexagram();
    const positions = result.lines.map((l) => l.position).sort();
    expect(positions).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("should have valid line values (6, 7, 8, or 9)", () => {
    // Run multiple times to get variety
    for (let i = 0; i < 20; i++) {
      const result = castHexagram();
      for (const line of result.lines) {
        expect([6, 7, 8, 9]).toContain(line.value);
      }
    }
  });

  it("should have correct line types for values", () => {
    for (let i = 0; i < 20; i++) {
      const result = castHexagram();
      for (const line of result.lines) {
        if (line.value === 6) {
          expect(line.type).toBe("old-yin");
          expect(line.changing).toBe(true);
        } else if (line.value === 7) {
          expect(line.type).toBe("yang");
          expect(line.changing).toBe(false);
        } else if (line.value === 8) {
          expect(line.type).toBe("yin");
          expect(line.changing).toBe(false);
        } else if (line.value === 9) {
          expect(line.type).toBe("old-yang");
          expect(line.changing).toBe(true);
        }
      }
    }
  });

  it("should return a valid hexagram number (1-64)", () => {
    for (let i = 0; i < 30; i++) {
      const result = castHexagram();
      expect(result.hexagram.number).toBeGreaterThanOrEqual(1);
      expect(result.hexagram.number).toBeLessThanOrEqual(64);
    }
  });

  it("should have hexagram name and chinese fields", () => {
    const result = castHexagram();
    expect(result.hexagram.name).toBeTruthy();
    expect(result.hexagram.chinese).toBeTruthy();
    expect(result.hexagram.trigrams.upper).toBeTruthy();
    expect(result.hexagram.trigrams.lower).toBeTruthy();
  });

  it("should correctly identify changing lines", () => {
    for (let i = 0; i < 20; i++) {
      const result = castHexagram();
      const changingFromLines = result.lines
        .filter((l) => l.changing)
        .map((l) => l.position);
      expect(result.changingLines).toEqual(changingFromLines);
    }
  });

  it("should have resultHexagram only when there are changing lines", () => {
    // Run enough times to likely hit both cases
    let sawChanging = false;
    let sawNoChanging = false;
    for (let i = 0; i < 100; i++) {
      const result = castHexagram();
      if (result.changingLines.length > 0) {
        expect(result.resultHexagram).not.toBeNull();
        expect(result.resultHexagram!.number).toBeGreaterThanOrEqual(1);
        expect(result.resultHexagram!.number).toBeLessThanOrEqual(64);
        sawChanging = true;
      } else {
        expect(result.resultHexagram).toBeNull();
        sawNoChanging = true;
      }
      if (sawChanging && sawNoChanging) break;
    }
  });
});
