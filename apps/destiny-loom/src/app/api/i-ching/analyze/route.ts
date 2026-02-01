import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@cyberfaith/ai-provider";
import { getIChingPrompt, sanitizeUserInput } from "@/lib/prompts";
import type { HexagramData } from "@/lib/i-ching";

const VALID_LOCALES = new Set(["en", "zh", "zh-CN", "zh-TW"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hexagram, changingLines, question, locale } = body as {
      hexagram: HexagramData;
      changingLines: number[];
      question?: string;
      locale?: string;
    };

    if (!hexagram || !hexagram.number || !hexagram.name) {
      return NextResponse.json(
        { error: "Valid hexagram object with number and name is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(changingLines)) {
      return NextResponse.json({ error: "changingLines must be an array" }, { status: 400 });
    }

    if (locale && !VALID_LOCALES.has(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        interpretation: null,
        message: "AI analysis unavailable — set OPENAI_API_KEY for I Ching interpretations",
        hexagram,
      });
    }

    const ai = createAIProvider({ provider: "openai", apiKey });
    const sanitizedQuestion = question ? sanitizeUserInput(question, 500) : undefined;
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

    return NextResponse.json({ interpretation, hexagram, changingLines });
  } catch (error: unknown) {
    console.error("I Ching analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze hexagram" }, { status: 500 });
  }
}
