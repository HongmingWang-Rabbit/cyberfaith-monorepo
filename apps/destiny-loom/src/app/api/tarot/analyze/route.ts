import { NextRequest, NextResponse } from "next/server";
import { getTarotReadingPrompt } from "@/lib/prompts";
import { TAROT_DECK, SPREAD_POSITIONS } from "@/lib/tarot-deck";
import { errorResponse, withRateLimitHeaders, parseBody, sanitizeString, getAIProvider } from "@/lib/api-utils";

const VALID_CARD_NAMES = new Set(TAROT_DECK.map((c) => c.name));
const VALID_LOCALES = new Set(["en", "zh", "zh-CN", "zh-TW"]);
const VALID_SPREAD_TYPES = new Set(["single", "three", "celtic"]);

interface CardInput {
  name: string;
  position: string;
  reversed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 20_000);
    if (error) return withRateLimitHeaders(error);

    const { cards, spreadType, question, locale } = body as {
      cards: CardInput[];
      spreadType: string;
      question?: string;
      locale?: string;
    };

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return withRateLimitHeaders(errorResponse("Cards array is required", 400));
    }

    if (!spreadType || !VALID_SPREAD_TYPES.has(spreadType)) {
      return withRateLimitHeaders(
        errorResponse("Invalid spreadType", 400, "Must be one of: single, three, celtic")
      );
    }

    const expectedCount = SPREAD_POSITIONS[spreadType].length;
    if (cards.length !== expectedCount) {
      return withRateLimitHeaders(
        errorResponse("Card count mismatch", 400, `Spread type "${spreadType}" requires exactly ${expectedCount} cards, got ${cards.length}`)
      );
    }

    if (locale && !VALID_LOCALES.has(locale)) {
      return withRateLimitHeaders(errorResponse("Invalid locale", 400, "Must be one of: en, zh, zh-CN, zh-TW"));
    }

    for (const card of cards) {
      if (!card.name || !card.position || typeof card.reversed !== "boolean") {
        return withRateLimitHeaders(errorResponse("Invalid card format", 400, "Each card must have name, position, and reversed fields"));
      }
      if (!VALID_CARD_NAMES.has(card.name)) {
        return withRateLimitHeaders(errorResponse(`Unknown card: "${card.name}"`, 400));
      }
    }

    const cardNames = cards.map((c) => c.name);
    if (new Set(cardNames).size !== cardNames.length) {
      return withRateLimitHeaders(errorResponse("Duplicate cards are not allowed", 400));
    }

    const { provider: ai, unavailableResponse } = getAIProvider();
    if (!ai) return withRateLimitHeaders(unavailableResponse!);
    const sanitizedQuestion = question ? sanitizeString(question, 500) : undefined;
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

    return withRateLimitHeaders(NextResponse.json({ interpretation, cards, spreadType }));
  } catch (error: unknown) {
    console.error("Tarot analyze error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze tarot spread", 500));
  }
}
