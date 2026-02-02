import { NextRequest, NextResponse } from "next/server";
import { getDreamInterpretationPrompt } from "@/lib/prompts";
import { errorResponse, withRateLimitHeaders, parseBody, sanitizeString, getAIProvider, getUserTier } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 20_000);
    if (error) return withRateLimitHeaders(error);

    const { dreamText, locale } = body as { dreamText?: string; locale?: string };

    if (!dreamText || typeof dreamText !== "string" || dreamText.trim().length < 10) {
      return withRateLimitHeaders(
        errorResponse("Dream description is required (minimum 10 characters)", 400)
      );
    }

    if (dreamText.length > 3000) {
      return withRateLimitHeaders(
        errorResponse("Dream description too long (maximum 3000 characters)", 400)
      );
    }

    const authHeader = request.headers.get("authorization");
    const tier = await getUserTier(authHeader);
    const { provider: ai, unavailableResponse, tierConfig } = getAIProvider(tier);
    if (!ai) return withRateLimitHeaders(unavailableResponse!);

    const sanitized = sanitizeString(dreamText, 3000);
    const prompt = getDreamInterpretationPrompt(sanitized, locale);

    const systemPrompt = `You are CyberFaith's Dream Oracle — a mystical AI that interprets dreams through the lens of psychology and digital mysticism. ${tierConfig.systemPromptSuffix}`;

    const aiResult = await ai.generateWithUsage(prompt, {
      temperature: 0.9,
      maxTokens: tierConfig.maxTokens,
      systemPrompt,
    });

    let interpretation;
    try {
      interpretation = JSON.parse(aiResult.text);
    } catch {
      interpretation = { reading: aiResult.text };
    }

    const usage = aiResult.usage;
    const responseData = { interpretation, dreamText: sanitized, aiTier: tier };
    saveReadingAsync(authHeader, "dream", { dreamText: sanitized }, responseData, locale);
    return withRateLimitHeaders(NextResponse.json({ ...responseData, usage }));
  } catch (error: unknown) {
    console.error("Dream analyze error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze dream", 500));
  }
}
