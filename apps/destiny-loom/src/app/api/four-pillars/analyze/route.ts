import { NextRequest, NextResponse } from "next/server";
import type { FourPillarsResult } from "@/lib/four-pillars";
import { errorResponse, withRateLimitHeaders, parseBody, getUserTier } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";
import { proxyToAI } from "@/lib/ai-proxy";

const VALID_LOCALES = new Set(["en", "zh", "zh-CN", "zh-TW"]);
const VALID_GENDERS = new Set(["male", "female", "other"]);

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 10_000);
    if (error) return withRateLimitHeaders(error);

    const { pillars, gender, locale } = body as {
      pillars: FourPillarsResult;
      gender?: string;
      locale?: string;
    };

    if (!pillars || !pillars.year || !pillars.month || !pillars.day || !pillars.hour) {
      return withRateLimitHeaders(
        errorResponse("Invalid pillars", 400, "Valid pillars object with year, month, day, hour is required")
      );
    }
    if (gender && !VALID_GENDERS.has(gender)) {
      return withRateLimitHeaders(errorResponse("Invalid gender", 400, "Must be male, female, or other"));
    }
    if (locale && !VALID_LOCALES.has(locale)) {
      return withRateLimitHeaders(errorResponse("Invalid locale", 400, "Must be one of: en, zh, zh-CN, zh-TW"));
    }

    const authHeader = request.headers.get("authorization");
    const tier = await getUserTier(authHeader);

    const { data, error: aiError, status } = await proxyToAI("four-pillars", {
      pillars, gender: gender || "other", locale, tier,
    }, authHeader);

    if (aiError) return withRateLimitHeaders(errorResponse(aiError, status || 503));

    const interpretation = data.result;
    const usage = data.usage;
    const responseData = { interpretation, pillars, aiTier: tier };
    saveReadingAsync(authHeader, "four-pillars", { pillars, gender }, responseData, locale);
    return withRateLimitHeaders(NextResponse.json({ ...responseData, usage }));
  } catch (error: unknown) {
    console.error("Four Pillars analyze error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze Four Pillars", 500));
  }
}
