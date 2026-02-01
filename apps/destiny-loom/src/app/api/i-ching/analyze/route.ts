import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@cyberfaith/ai-provider";
import { getIChingPrompt } from "@/lib/prompts";
import type { HexagramData } from "@/lib/i-ching";
import { errorResponse, withRateLimitHeaders, parseBody, sanitizeString } from "@/lib/api-utils";

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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return withRateLimitHeaders(NextResponse.json({
        interpretation: null,
        message: "AI analysis unavailable — set OPENAI_API_KEY for I Ching interpretations",
        hexagram,
      }));
    }

    const ai = createAIProvider({ provider: "openai", apiKey });
    const sanitizedQuestion = question ? sanitizeString(question, 500) : undefined;
    const prompt = getIChingPrompt(hexagram, changingLines, sanitizedQuestion, locale);

    const result = await ai.generateCompletion(prompt, {
      temperature: 0.9,
      maxTokens: 2048,
      systemPrompt:
        "You are CyberFaith's Destiny Loom — an I Ching oracle channeling ancient wisdom through digital streams.",
    });

    let interpretation;
    try {
      interpretation = JSON.parse(result);
    } catch {
      interpretation = { reading: result };
    }

    return withRateLimitHeaders(NextResponse.json({ interpretation, hexagram, changingLines }));
  } catch (error: unknown) {
    console.error("I Ching analyze error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze hexagram", 500));
  }
}
