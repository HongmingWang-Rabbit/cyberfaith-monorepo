import { NextRequest, NextResponse } from "next/server";
import { TAROT_DECK, SPREAD_POSITIONS } from "@/lib/tarot-deck";
import { errorResponse, withRateLimitHeaders, parseBody, sanitizeString, getUserTier } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";
import { proxyToAI } from "@/lib/ai-proxy";

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

    const authHeader = request.headers.get("authorization");
    const tier = await getUserTier(authHeader);
    const sanitizedQuestion = question ? sanitizeString(question, 500) : undefined;

    const { data, error: aiError, status } = await proxyToAI("tarot", {
      cards, spreadType, question: sanitizedQuestion, locale, tier,
    }, authHeader);

    if (aiError) {
      return withRateLimitHeaders(errorResponse(aiError, status || 503));
    }

    const interpretation = data.result;
    const usage = data.usage;
    const responseData = { interpretation, cards, spreadType, aiTier: tier };
    saveReadingAsync(authHeader, "tarot", { cards, spreadType, question }, responseData, locale);
    return withRateLimitHeaders(NextResponse.json({ ...responseData, usage }));
  } catch (error: unknown) {
    console.error("Tarot analyze error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze tarot spread", 500));
  }
}
