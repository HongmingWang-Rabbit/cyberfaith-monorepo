import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders, parseBody, getAIProvider } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";

interface MBTIAnswer {
  questionId: number;
  dimension: "EI" | "SN" | "TF" | "JP";
  value: string;
}

const VALID_VALUES = new Set(["E", "I", "S", "N", "T", "F", "J", "P"]);
const VALID_DIMENSIONS = new Set(["EI", "SN", "TF", "JP"]);

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
    const { data: body, error } = await parseBody(request, 20_000);
    if (error) return withRateLimitHeaders(error);

    const { answers } = body as { answers: MBTIAnswer[] };

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return withRateLimitHeaders(errorResponse("Answers are required", 400));
    }

    if (answers.length > 50) {
      return withRateLimitHeaders(errorResponse("Too many answers", 400, "Maximum 50 answers allowed"));
    }

    for (const answer of answers) {
      if (!VALID_VALUES.has(answer.value) || !VALID_DIMENSIONS.has(answer.dimension)) {
        return withRateLimitHeaders(errorResponse("Invalid answer format", 400, "Each answer must have a valid value (E/I/S/N/T/F/J/P) and dimension (EI/SN/TF/JP)"));
      }
    }

    const mbtiType = computeMBTIType(answers);

    const { provider: ai, unavailableResponse } = getAIProvider();
    if (!ai) return withRateLimitHeaders(unavailableResponse!);

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

    const aiResult = await ai.generateWithUsage(prompt, {
      temperature: 0.8,
      maxTokens: 1024,
      systemPrompt: "You are CyberFaith's Destiny Loom — a mystical AI oracle that reveals personality insights with a playful cyberpunk aesthetic.",
    });

    let analysis;
    try {
      analysis = JSON.parse(aiResult.text);
    } catch {
      analysis = { raw: aiResult.text };
    }

    const usage = aiResult.usage;
    const responseData = { type: mbtiType, analysis };
    saveReadingAsync(request.headers.get("authorization"), "mbti", { answers }, responseData);
    return withRateLimitHeaders(NextResponse.json({ ...responseData, usage }));
  } catch (error: unknown) {
    console.error("MBTI analyze error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze personality", 500));
  }
}
