import { describe, it, expect, vi } from "vitest";

vi.mock("@cyberfaith/ai-provider", () => ({
  createAIProvider: vi.fn(() => ({
    generateCompletion: vi.fn().mockResolvedValue(
      JSON.stringify({ horoscope: "Test horoscope", luckyNumber: 7 })
    ),
  })),
}));

describe("Zodiac Prompts", () => {
  it("generates zodiac reading prompt with sign context", async () => {
    const { getZodiacReadingPrompt } = await import("@/lib/prompts");
    const prompt = getZodiacReadingPrompt("scorpio", "daily");
    expect(prompt).toContain("Scorpio");
    expect(prompt).toContain("Water");
    expect(prompt).toContain("Pluto/Mars");
    expect(prompt).toContain("daily");
  });

  it("generates compatibility prompt", async () => {
    const { getCompatibilityPrompt } = await import("@/lib/prompts");
    const prompt = getCompatibilityPrompt("aries", "libra");
    expect(prompt).toContain("Aries");
    expect(prompt).toContain("Libra");
    expect(prompt).toContain("Fire");
    expect(prompt).toContain("Air");
  });

  it("handles unknown sign gracefully in prompt", async () => {
    const { getZodiacReadingPrompt } = await import("@/lib/prompts");
    const prompt = getZodiacReadingPrompt("unknown", "daily");
    expect(prompt).toContain("Unknown");
  });

  it("supports Chinese locale for zodiac", async () => {
    const { getZodiacReadingPrompt } = await import("@/lib/prompts");
    const prompt = getZodiacReadingPrompt("leo", "weekly", "zh-CN");
    expect(prompt).toContain("简体中文");
  });

  it("supports Chinese locale for compatibility", async () => {
    const { getCompatibilityPrompt } = await import("@/lib/prompts");
    const prompt = getCompatibilityPrompt("cancer", "pisces", "zh");
    expect(prompt).toContain("简体中文");
  });
});

describe("MBTI Prompts", () => {
  it("generates MBTI analysis prompt", async () => {
    const { getMbtiAnalysisPrompt } = await import("@/lib/prompts");
    const prompt = getMbtiAnalysisPrompt("INFJ", { E: 2, I: 8, S: 3, N: 7, T: 4, F: 6, J: 7, P: 3 });
    expect(prompt).toContain("INFJ");
    expect(prompt).toContain("I: 8");
  });
});
