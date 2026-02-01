import { NextRequest, NextResponse } from "next/server";
import { getFourPillarsPrompt } from "@/lib/prompts";
import type { FourPillarsResult } from "@/lib/four-pillars";
import { errorResponse, withRateLimitHeaders, parseBody, getAIProvider } from "@/lib/api-utils";

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

    const { provider: ai, unavailableResponse } = getAIProvider();
    if (!ai) return withRateLimitHeaders(unavailableResponse!);
    const prompt = getFourPillarsPrompt(pillars, gender || "other", locale);

    const result = await ai.generateCompletion(prompt, {
      temperature: 0.85,
      maxTokens: 2048,
      systemPrompt:
        "You are CyberFaith's Destiny Loom — a BaZi master weaving fate analysis through neon-lit digital threads.",
    });

    let interpretation;
    try {
      interpretation = JSON.parse(result);
    } catch {
      interpretation = { reading: result };
    }

    return withRateLimitHeaders(NextResponse.json({ interpretation, pillars }));
  } catch (error: unknown) {
    console.error("Four Pillars analyze error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze Four Pillars", 500));
  }
}
