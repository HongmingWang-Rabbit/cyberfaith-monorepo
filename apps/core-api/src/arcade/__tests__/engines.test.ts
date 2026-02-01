import { describe, it, expect } from "vitest";
import { karmaSlotsEngine } from "../engines/karma-slots";
import { getGameEngine, getRegisteredSlugs } from "../engines/registry";

describe("Game Engine Registry", () => {
  it("returns karma-slots engine", () => {
    expect(getGameEngine("karma-slots")).toBe(karmaSlotsEngine);
  });

  it("returns undefined for unknown slug", () => {
    expect(getGameEngine("nonexistent")).toBeUndefined();
  });

  it("lists registered slugs", () => {
    const slugs = getRegisteredSlugs();
    expect(slugs).toContain("karma-slots");
  });
});

describe("karmaSlotsEngine", () => {
  const config = {
    minBet: 10,
    maxWin: 50,
    symbols: ["🔮", "✨", "🌟", "☯️", "🧿", "💫", "🪬", "🌙"],
    reelCount: 3,
    payoutRules: { threeMatch: 50, twoMatch: 20 },
  };

  it("returns reels with valid symbols", () => {
    const result = karmaSlotsEngine(config);
    expect(result.outcome.reels).toHaveLength(3);
    result.outcome.reels.forEach((r: string) => {
      expect(config.symbols).toContain(r);
    });
  });

  it("awards 50 pts for triple match", () => {
    const orig = Math.random;
    Math.random = () => 0.1; // all same symbol
    const result = karmaSlotsEngine(config);
    Math.random = orig;

    expect(result.pointsWon).toBe(50);
    expect(result.outcome.matches).toBe(3);
    expect(new Set(result.outcome.reels).size).toBe(1);
  });

  it("awards 20 pts for double match", () => {
    const orig = Math.random;
    let call = 0;
    // 0.0 → idx 0, 0.0 → idx 0, 0.15 → idx 1 → two same, one different
    Math.random = () => [0.0, 0.0, 0.15][call++] ?? 0.5;
    const result = karmaSlotsEngine(config);
    Math.random = orig;

    expect(result.pointsWon).toBe(20);
    expect(result.outcome.matches).toBe(2);
  });

  it("awards 0 pts for no match", () => {
    const orig = Math.random;
    let call = 0;
    // 0.0 → idx 0, 0.15 → idx 1, 0.5 → idx 4 → all different
    Math.random = () => [0.0, 0.15, 0.5][call++] ?? 0.9;
    const result = karmaSlotsEngine(config);
    Math.random = orig;

    expect(result.pointsWon).toBe(0);
    expect(result.outcome.matches).toBe(0);
  });

  it("uses default symbols when not in config", () => {
    const result = karmaSlotsEngine({ minBet: 10, maxWin: 50 });
    expect(result.outcome.reels).toHaveLength(3);
  });

  it("respects custom payout rules", () => {
    const customConfig = {
      ...config,
      payoutRules: { threeMatch: 100, twoMatch: 30 },
    };
    const orig = Math.random;
    Math.random = () => 0.1;
    const result = karmaSlotsEngine(customConfig);
    Math.random = orig;

    expect(result.pointsWon).toBe(100);
  });
});
