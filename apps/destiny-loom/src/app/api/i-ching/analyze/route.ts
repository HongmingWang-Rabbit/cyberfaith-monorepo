import { NextRequest, NextResponse } from "next/server";
import type { HexagramData } from "@/lib/i-ching";
import { errorResponse, withRateLimitHeaders, parseBody, sanitizeString, getUserTier } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";
import { proxyToAI } from "@/lib/ai-proxy";

const VALID_LOCALES = new Set(["en", "zh", "zh-CN", "zh-TW"]);

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 10_000);
    if (error) return withRateLimitHeaders(error);

    const { hexagram, changingLines, question, locale } = body as {
      hexagram: HexagramData;
      changingLines: number[];
      question?: string;
      locale?: string;
    };

    if (!hexagram || !hexagram.number || !hexagram.name) {
      return withRateLimitHeaders(
        errorResponse("Invalid hexagram", 400, "Valid hexagram object with number and name is required")
      );
    }
    if (hexagram.number < 1 || hexagram.number > 64) {
      return withRateLimitHeaders(errorResponse("Invalid hexagram number", 400, "Must be 1-64"));
    }
    if (!Array.isArray(changingLines)) {
      return withRateLimitHeaders(errorResponse("changingLines must be an array", 400));
    }
    for (const line of changingLines) {
      if (!Number.isInteger(line) || line < 1 || line > 6) {
        return withRateLimitHeaders(errorResponse("Invalid changing line", 400, "Each changing line must be 1-6"));
      }
    }
    if (locale && !VALID_LOCALES.has(locale)) {
      return withRateLimitHeaders(errorResponse("Invalid locale", 400, "Must be one of: en, zh, zh-CN, zh-TW"));
    }

    const authHeader = request.headers.get("authorization");
    const tier = await getUserTier(authHeader);
    const sanitizedQuestion = question ? sanitizeString(question, 500) : undefined;

    const { data, error: aiError, status } = await proxyToAI("i-ching", {
      hexagram, changingLines, question: sanitizedQuestion, locale, tier,
    }, authHeader);

    if (aiError) return withRateLimitHeaders(errorResponse(aiError, status || 503));

    const interpretation = data.result;
    const usage = data.usage;
    const responseData = { interpretation, hexagram, changingLines, aiTier: tier };
    saveReadingAsync(authHeader, "i-ching", { hexagram, changingLines, question }, responseData, locale);
    return withRateLimitHeaders(NextResponse.json({ ...responseData, usage }));
  } catch (error: unknown) {
    console.error("I Ching analyze error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze hexagram", 500));
  }
}
