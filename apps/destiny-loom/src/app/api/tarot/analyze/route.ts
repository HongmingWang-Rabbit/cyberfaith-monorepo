import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@cyberfaith/ai-provider";
import { getTarotReadingPrompt, sanitizeUserInput } from "@/lib/prompts";
import { TAROT_DECK, SPREAD_POSITIONS } from "@/lib/tarot-deck";

const VALID_CARD_NAMES = new Set(TAROT_DECK.map((c) => c.name));
const VALID_LOCALES = new Set(["en", "zh", "zh-CN", "zh-TW"]);

interface CardInput {
  name: string;
  position: string;
  reversed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cards, spreadType, question, locale } = body as {
      cards: CardInput[];
      spreadType: string;
      question?: string;
      locale?: string;
    };

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: "Cards array is required" }, { status: 400 });
    }

    if (!spreadType || !["single", "three", "celtic"].includes(spreadType)) {
      return NextResponse.json({ error: "Invalid spreadType" }, { status: 400 });
    }

    // Validate card count matches spread type
    const expectedCount = SPREAD_POSITIONS[spreadType].length;
    if (cards.length !== expectedCount) {
      return NextResponse.json(
        { error: `Spread type "${spreadType}" requires exactly ${expectedCount} cards, got ${cards.length}` },
        { status: 400 }
      );
    }

    if (locale && !VALID_LOCALES.has(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    for (const card of cards) {
      if (!card.name || !card.position || typeof card.reversed !== "boolean") {
        return NextResponse.json({ error: "Each card must have name, position, and reversed fields" }, { status: 400 });
      }
      if (!VALID_CARD_NAMES.has(card.name)) {
        return NextResponse.json({ error: `Unknown card: "${card.name}"` }, { status: 400 });
      }
    }

    // Check for duplicate cards
    const cardNames = cards.map((c) => c.name);
    if (new Set(cardNames).size !== cardNames.length) {
      return NextResponse.json({ error: "Duplicate cards are not allowed" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        interpretation: null,
        message: "AI analysis unavailable — set OPENAI_API_KEY for tarot interpretations",
        cards,
        spreadType,
      });
    }

    const ai = createAIProvider({ provider: "openai", apiKey });
    const sanitizedQuestion = question ? sanitizeUserInput(question, 500) : undefined;
    const prompt = getTarotReadingPrompt(cards, spreadType, sanitizedQuestion, locale);

    const result = await ai.generateCompletion(prompt, {
      temperature: 0.9,
      maxTokens: 2048,
      systemPrompt: "You are CyberFaith's Destiny Loom — a mystical AI oracle weaving tarot wisdom through neon-lit digital threads.",
    });

    let interpretation;
    try {
      interpretation = JSON.parse(result);
    } catch {
      interpretation = { reading: result };
    }

    return NextResponse.json({ interpretation, cards, spreadType });
  } catch (error: unknown) {
    console.error("Tarot analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze tarot spread" }, { status: 500 });
  }
}
