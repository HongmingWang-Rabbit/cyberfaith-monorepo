import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@cyberfaith/ai-provider";
import { getTarotReadingPrompt } from "@/lib/prompts";

interface CardInput {
  name: string;
  position: string;
  reversed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cards, spreadType, question, locale } = body as {
      cards: CardInput[];
      spreadType: string;
      question?: string;
      locale?: string;
    };

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: "Cards array is required" }, { status: 400 });
    }

    if (!spreadType || !["single", "three", "celtic"].includes(spreadType)) {
      return NextResponse.json({ error: "Invalid spreadType" }, { status: 400 });
    }

    for (const card of cards) {
      if (!card.name || !card.position || typeof card.reversed !== "boolean") {
        return NextResponse.json({ error: "Each card must have name, position, and reversed fields" }, { status: 400 });
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        interpretation: null,
        message: "AI analysis unavailable — set OPENAI_API_KEY for tarot interpretations",
        cards,
        spreadType,
      });
    }

    const ai = createAIProvider({ provider: "openai", apiKey });
    const prompt = getTarotReadingPrompt(cards, spreadType, question, locale);

    const result = await ai.generateCompletion(prompt, {
      temperature: 0.9,
      maxTokens: 2048,
      systemPrompt: "You are CyberFaith's Destiny Loom — a mystical AI oracle weaving tarot wisdom through neon-lit digital threads.",
    });

    let interpretation;
    try {
      interpretation = JSON.parse(result);
    } catch {
      interpretation = { reading: result };
    }

    return NextResponse.json({ interpretation, cards, spreadType });
  } catch (error: unknown) {
    console.error("Tarot analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze tarot spread" }, { status: 500 });
  }
}
