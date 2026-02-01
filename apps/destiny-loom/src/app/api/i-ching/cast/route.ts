import { NextRequest, NextResponse } from "next/server";
import { castHexagram } from "@/lib/i-ching";
import { errorResponse, withRateLimitHeaders, parseBody, sanitizeString } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 5_000);
    if (error) return withRateLimitHeaders(error);

    const { question } = (body || {}) as { question?: string };

    if (question !== undefined && question !== null) {
      if (typeof question !== "string" || question.length > 500) {
        return withRateLimitHeaders(
          errorResponse("Invalid question", 400, "Question must be a string of 500 characters or less")
        );
      }
    }

    const result = castHexagram();

    return withRateLimitHeaders(NextResponse.json({
      ...result,
      question: question ? sanitizeString(question, 500) : null,
      castAt: new Date().toISOString(),
    }));
  } catch (error: unknown) {
    console.error("I Ching cast error:", error);
    return withRateLimitHeaders(errorResponse("Failed to cast hexagram", 500));
  }
}
