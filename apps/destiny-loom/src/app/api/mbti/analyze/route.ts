import { NextRequest, NextResponse } from "next/server";
import { getMbtiAnalysisPrompt } from "@/lib/prompts";
import { errorResponse, withRateLimitHeaders, parseBody, getAIProvider, getUserTier } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";

interface MBTIAnswer {
  questionId: number;
  dimension: "EI" | "SN" | "TF" | "JP";
  value: string;
}

const VALID_VALUES = new Set(["E", "I", "S", "N", "T", "F", "J", "P"]);
const VALID_DIMENSIONS = new Set(["EI", "SN", "TF", "JP"]);
const VALID_LOCALES = new Set(["en", "zh", "zh-CN", "zh-TW"]);

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

    const { answers, locale } = body as { answers: MBTIAnswer[]; locale?: string };

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

    if (locale && !VALID_LOCALES.has(locale)) {
      return withRateLimitHeaders(errorResponse("Invalid locale", 400, "Must be one of: en, zh, zh-CN, zh-TW"));
    }

    const mbtiType = computeMBTIType(answers);

    const authHeader = request.headers.get("authorization");
    const tier = await getUserTier(authHeader);
    const { provider: ai, unavailableResponse, tierConfig } = getAIProvider(tier);
    if (!ai) return withRateLimitHeaders(unavailableResponse!);

    const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    for (const answer of answers) {
      scores[answer.value] = (scores[answer.value] || 0) + 1;
    }

    const prompt = getMbtiAnalysisPrompt(mbtiType, scores, locale);

    const systemPrompt = `You are CyberFaith's Destiny Loom — a mystical AI oracle that reveals personality insights with a playful cyberpunk aesthetic. ${tierConfig.systemPromptSuffix}`;

    const aiResult = await ai.generateWithUsage(prompt, {
      temperature: 0.8,
      maxTokens: tierConfig.maxTokens,
      systemPrompt,
    });

    let analysis;
    try {
      analysis = JSON.parse(aiResult.text);
    } catch {
      analysis = { raw: aiResult.text };
    }

    const usage = aiResult.usage;
    const responseData = { type: mbtiType, analysis, aiTier: tier };
    saveReadingAsync(authHeader, "mbti", { answers }, responseData, locale);
    return withRateLimitHeaders(NextResponse.json({ ...responseData, usage }));
  } catch (error: unknown) {
    console.error("MBTI analyze error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze personality", 500));
  }
}
