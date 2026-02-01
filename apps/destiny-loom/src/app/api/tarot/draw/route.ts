import { NextRequest, NextResponse } from "next/server";
import { drawCards, SPREAD_POSITIONS } from "@/lib/tarot-deck";
import { errorResponse, withRateLimitHeaders, parseBody, sanitizeString } from "@/lib/api-utils";

const VALID_SPREADS = new Set(Object.keys(SPREAD_POSITIONS));

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 5_000);
    if (error) return withRateLimitHeaders(error);

    const { spreadType, question } = body as { spreadType: string; question?: string };

    if (!spreadType || !VALID_SPREADS.has(spreadType)) {
      return withRateLimitHeaders(
        errorResponse("Invalid spreadType", 400, "Must be one of: single, three, celtic")
      );
    }

    if (question !== undefined && question !== null) {
      if (typeof question !== "string" || question.length > 500) {
        return withRateLimitHeaders(
          errorResponse("Invalid question", 400, "Question must be a string of 500 characters or less")
        );
      }
    }

    const cards = drawCards(spreadType as "single" | "three" | "celtic");

    return withRateLimitHeaders(NextResponse.json({
      spreadType,
      question: question ? sanitizeString(question, 500) : null,
      cards,
      drawnAt: new Date().toISOString(),
    }));
  } catch (error: unknown) {
    console.error("Tarot draw error:", error);
    return withRateLimitHeaders(errorResponse("Failed to draw cards", 500));
  }
}
