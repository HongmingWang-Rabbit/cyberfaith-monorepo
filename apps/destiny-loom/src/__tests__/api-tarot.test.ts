import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock ai-provider
vi.mock("@cyberfaith/ai-provider", () => ({
  createAIProvider: vi.fn(() => ({
    generateCompletion: vi.fn().mockResolvedValue(
      JSON.stringify({
        overview: "Test overview",
        cardReadings: [],
        synthesis: "Test synthesis",
        advice: "Test advice",
        energy: "transformative",
      })
    ),
  })),
}));

// We test the tarot deck logic directly and the route handlers via imports
import { drawCards, TAROT_DECK, SPREAD_POSITIONS } from "@/lib/tarot-deck";

describe("Tarot Deck", () => {
  it("should have 78 cards", () => {
    expect(TAROT_DECK).toHaveLength(78);
  });

  it("should have 22 major arcana", () => {
    expect(TAROT_DECK.filter((c) => c.arcana === "major")).toHaveLength(22);
  });

  it("should have 56 minor arcana", () => {
    expect(TAROT_DECK.filter((c) => c.arcana === "minor")).toHaveLength(56);
  });

  it("draws correct number of cards for single spread", () => {
    const cards = drawCards("single");
    expect(cards).toHaveLength(1);
    expect(cards[0].position).toBe("Present Energy");
  });

  it("draws correct number of cards for three spread", () => {
    const cards = drawCards("three");
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => c.position)).toEqual(["Past", "Present", "Future"]);
  });

  it("draws correct number of cards for celtic spread", () => {
    const cards = drawCards("celtic");
    expect(cards).toHaveLength(10);
  });

  it("does not draw duplicate cards", () => {
    const cards = drawCards("celtic");
    const names = cards.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("assigns reversed status as boolean", () => {
    const cards = drawCards("three");
    for (const card of cards) {
      expect(typeof card.reversed).toBe("boolean");
    }
  });
});

describe("Tarot Draw API", () => {
  // Test via direct function call since Next.js route handlers need request objects
  it("has spread positions for all types", () => {
    expect(SPREAD_POSITIONS).toHaveProperty("single");
    expect(SPREAD_POSITIONS).toHaveProperty("three");
    expect(SPREAD_POSITIONS).toHaveProperty("celtic");
  });
});

describe("Tarot Prompts", () => {
  it("generates tarot reading prompt", async () => {
    const { getTarotReadingPrompt } = await import("@/lib/prompts");
    const prompt = getTarotReadingPrompt(
      [{ name: "The Fool", position: "Present", reversed: false }],
      "single",
      "Will I find love?"
    );
    expect(prompt).toContain("The Fool");
    expect(prompt).toContain("Will I find love?");
    expect(prompt).toContain("single");
  });

  it("generates Chinese prompt with locale", async () => {
    const { getTarotReadingPrompt } = await import("@/lib/prompts");
    const prompt = getTarotReadingPrompt(
      [{ name: "The Star", position: "Future", reversed: true }],
      "single",
      undefined,
      "zh"
    );
    expect(prompt).toContain("简体中文");
  });
});
