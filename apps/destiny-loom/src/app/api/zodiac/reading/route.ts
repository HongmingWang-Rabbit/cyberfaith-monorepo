import { NextRequest, NextResponse } from "next/server";
import { getZodiacReadingPrompt } from "@/lib/prompts";
import { errorResponse, withRateLimitHeaders, parseBody, getAIProvider } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";

const VALID_SIGNS = new Set([
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]);
const VALID_PERIODS = new Set(["daily", "weekly", "monthly"]);
const VALID_LOCALES = new Set(["en", "zh", "zh-CN", "zh-TW"]);

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 5_000);
    if (error) return withRateLimitHeaders(error);

    const { sign, period, locale } = body as { sign: string; period: string; locale?: string };

    if (!sign || !VALID_SIGNS.has(sign.toLowerCase())) {
      return withRateLimitHeaders(
        errorResponse("Invalid zodiac sign", 400, `Must be one of: ${[...VALID_SIGNS].join(", ")}`)
      );
    }

    if (!period || !VALID_PERIODS.has(period)) {
      return withRateLimitHeaders(
        errorResponse("Invalid period", 400, "Must be one of: daily, weekly, monthly")
      );
    }

    if (locale && !VALID_LOCALES.has(locale)) {
      return withRateLimitHeaders(errorResponse("Invalid locale", 400, "Must be one of: en, zh, zh-CN, zh-TW"));
    }

    const { provider: ai, unavailableResponse } = getAIProvider();
    if (!ai) return withRateLimitHeaders(unavailableResponse!);
    const prompt = getZodiacReadingPrompt(sign.toLowerCase(), period, locale);

    const result = await ai.generateCompletion(prompt, {
      temperature: 0.85,
      maxTokens: 1536,
      systemPrompt: "You are CyberFaith's Celestial Navigator — mapping star patterns through digital constellations.",
    });

    let reading;
    try {
      reading = JSON.parse(result);
    } catch {
      reading = { horoscope: result };
    }

    const responseData = { reading, sign: sign.toLowerCase(), period };
    saveReadingAsync(request.headers.get("authorization"), "zodiac", { sign, period }, responseData, locale);
    return withRateLimitHeaders(NextResponse.json(responseData));
  } catch (error: unknown) {
    console.error("Zodiac reading error:", error);
    return withRateLimitHeaders(errorResponse("Failed to generate zodiac reading", 500));
  }
}
