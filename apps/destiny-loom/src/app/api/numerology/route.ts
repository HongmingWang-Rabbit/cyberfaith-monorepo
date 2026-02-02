import { NextRequest, NextResponse } from "next/server";
import { getNumerologyPrompt } from "@/lib/prompts";
import { calculateNumerology } from "@/lib/numerology";
import { errorResponse, withRateLimitHeaders, parseBody, getAIProvider, getUserTier } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 5_000);
    if (error) return withRateLimitHeaders(error);

    const { fullName, birthdate, locale } = body as {
      fullName: string;
      birthdate: string;
      locale?: string;
    };

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return withRateLimitHeaders(errorResponse("Full name is required (min 2 characters)", 400));
    }

    if (!birthdate || !/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      return withRateLimitHeaders(errorResponse("Birthdate is required (YYYY-MM-DD)", 400));
    }

    const numbers = calculateNumerology(fullName.trim(), birthdate);
    const authHeader = request.headers.get("authorization");
    const tier = await getUserTier(authHeader);
    const { provider: ai, unavailableResponse, tierConfig } = getAIProvider(tier);
    if (!ai) return withRateLimitHeaders(unavailableResponse!);

    const prompt = getNumerologyPrompt(
      fullName.trim(),
      numbers.lifePathNumber,
      numbers.expressionNumber,
      numbers.soulUrgeNumber,
      locale,
    );

    const systemPrompt = `You are CyberFaith's Numerology Oracle — decoding destiny through digital numerical frequencies. ${tierConfig.systemPromptSuffix}`;

    const aiResult = await ai.generateWithUsage(prompt, {
      temperature: 0.8,
      maxTokens: tierConfig.maxTokens,
      systemPrompt,
    });

    let interpretation;
    try {
      interpretation = JSON.parse(aiResult.text);
    } catch {
      interpretation = { overview: aiResult.text };
    }

    const responseData = {
      numbers,
      interpretation,
      fullName: fullName.trim(),
      birthdate,
      aiTier: tier,
    };

    saveReadingAsync(authHeader, "numerology" as any, { fullName, birthdate }, responseData, locale);

    return withRateLimitHeaders(
      NextResponse.json({ ...responseData, usage: aiResult.usage }),
    );
  } catch (error: unknown) {
    console.error("Numerology reading error:", error);
    return withRateLimitHeaders(errorResponse("Failed to generate numerology reading", 500));
  }
}
