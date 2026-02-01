import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@cyberfaith/ai-provider";
import { getFourPillarsPrompt } from "@/lib/prompts";
import type { FourPillarsResult } from "@/lib/four-pillars";

const VALID_LOCALES = new Set(["en", "zh", "zh-CN", "zh-TW"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pillars, gender, locale } = body as {
      pillars: FourPillarsResult;
      gender?: string;
      locale?: string;
    };

    if (!pillars || !pillars.year || !pillars.month || !pillars.day || !pillars.hour) {
      return NextResponse.json(
        { error: "Valid pillars object with year, month, day, hour is required" },
        { status: 400 }
      );
    }

    if (locale && !VALID_LOCALES.has(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        interpretation: null,
        message: "AI analysis unavailable — set OPENAI_API_KEY for BaZi interpretations",
        pillars,
      });
    }

    const ai = createAIProvider({ provider: "openai", apiKey });
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

    return NextResponse.json({ interpretation, pillars });
  } catch (error: unknown) {
    console.error("Four Pillars analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze Four Pillars" }, { status: 500 });
  }
}
