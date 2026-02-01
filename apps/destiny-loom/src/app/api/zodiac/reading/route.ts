import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@cyberfaith/ai-provider";
import { getZodiacReadingPrompt } from "@/lib/prompts";

const VALID_SIGNS = new Set([
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]);
const VALID_PERIODS = new Set(["daily", "weekly", "monthly"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sign, period, locale } = body as { sign: string; period: string; locale?: string };

    if (!sign || !VALID_SIGNS.has(sign.toLowerCase())) {
      return NextResponse.json({ error: "Invalid zodiac sign" }, { status: 400 });
    }

    if (!period || !VALID_PERIODS.has(period)) {
      return NextResponse.json({ error: "Invalid period. Must be: daily, weekly, or monthly" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reading: null,
        message: "AI analysis unavailable — set OPENAI_API_KEY for zodiac readings",
        sign: sign.toLowerCase(),
        period,
      });
    }

    const ai = createAIProvider({ provider: "openai", apiKey });
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

    return NextResponse.json({ reading, sign: sign.toLowerCase(), period });
  } catch (error: unknown) {
    console.error("Zodiac reading error:", error);
    return NextResponse.json({ error: "Failed to generate zodiac reading" }, { status: 500 });
  }
}
