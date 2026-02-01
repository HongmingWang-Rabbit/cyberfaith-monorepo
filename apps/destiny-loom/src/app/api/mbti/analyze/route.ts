import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@cyberfaith/ai-provider";

interface MBTIAnswer {
  questionId: number;
  dimension: "EI" | "SN" | "TF" | "JP";
  value: string; // E/I, S/N, T/F, J/P
}

function computeMBTIType(answers: MBTIAnswer[]): string {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const answer of answers) {
    scores[answer.value] = (scores[answer.value] || 0) + 1;
  }

  const ei = scores.E >= scores.I ? "E" : "I";
  const sn = scores.S >= scores.N ? "S" : "N";
  const tf = scores.T >= scores.F ? "T" : "F";
  const jp = scores.J >= scores.P ? "J" : "P";

  return `${ei}${sn}${tf}${jp}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body as { answers: MBTIAnswer[] };

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    const mbtiType = computeMBTIType(answers);

    // If no API key, return type without AI analysis
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        type: mbtiType,
        analysis: null,
        message: "AI analysis unavailable — set OPENAI_API_KEY for personality insights",
      });
    }

    const ai = createAIProvider({ provider: "openai", apiKey });

    const prompt = `You are a fun, insightful personality analyst with a cyberpunk vibe. The user got MBTI type: ${mbtiType}.

Give a personality analysis in this JSON format:
{
  "title": "A cool cyberpunk-themed title for this type",
  "summary": "2-3 sentence overview of this personality type",
  "strengths": ["strength1", "strength2", "strength3"],
  "challenges": ["challenge1", "challenge2", "challenge3"],
  "spiritAnimal": "A mythical/cyber creature that represents this type",
  "compatibility": ["XXXX", "XXXX"],
  "advice": "One sentence of cosmic advice"
}

Respond ONLY with valid JSON, no markdown.`;

    const result = await ai.generateCompletion(prompt, {
      temperature: 0.8,
      maxTokens: 1024,
      systemPrompt: "You are CyberFaith's Destiny Loom — a mystical AI oracle that reveals personality insights with a playful cyberpunk aesthetic.",
    });

    let analysis;
    try {
      analysis = JSON.parse(result);
    } catch {
      analysis = { raw: result };
    }

    return NextResponse.json({ type: mbtiType, analysis });
  } catch (error: any) {
    console.error("MBTI analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze personality" }, { status: 500 });
  }
}
