import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@cyberfaith/ai-provider";
import { getCompatibilityPrompt } from "@/lib/prompts";
import { errorResponse, withRateLimitHeaders, parseBody } from "@/lib/api-utils";

const VALID_SIGNS = new Set([
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]);

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 5_000);
    if (error) return withRateLimitHeaders(error);

    const { sign1, sign2, locale } = body as { sign1: string; sign2: string; locale?: string };

    if (!sign1 || !VALID_SIGNS.has(sign1.toLowerCase())) {
      return withRateLimitHeaders(
        errorResponse("Invalid sign1", 400, `Must be one of: ${[...VALID_SIGNS].join(", ")}`)
      );
    }
    if (!sign2 || !VALID_SIGNS.has(sign2.toLowerCase())) {
      return withRateLimitHeaders(
        errorResponse("Invalid sign2", 400, `Must be one of: ${[...VALID_SIGNS].join(", ")}`)
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return withRateLimitHeaders(NextResponse.json({
        compatibility: null,
        message: "AI analysis unavailable — set OPENAI_API_KEY for compatibility readings",
        sign1: sign1.toLowerCase(),
        sign2: sign2.toLowerCase(),
      }));
    }

    const ai = createAIProvider({ provider: "openai", apiKey });
    const prompt = getCompatibilityPrompt(sign1.toLowerCase(), sign2.toLowerCase(), locale);

    const result = await ai.generateCompletion(prompt, {
      temperature: 0.85,
      maxTokens: 1536,
      systemPrompt: "You are CyberFaith's Celestial Navigator — analyzing cosmic bonds between souls.",
    });

    let compatibility;
    try {
      compatibility = JSON.parse(result);
    } catch {
      compatibility = { analysis: result };
    }

    return withRateLimitHeaders(NextResponse.json({ compatibility, sign1: sign1.toLowerCase(), sign2: sign2.toLowerCase() }));
  } catch (error: unknown) {
    console.error("Zodiac compatibility error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze compatibility", 500));
  }
}
