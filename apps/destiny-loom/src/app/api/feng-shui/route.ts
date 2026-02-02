import { NextRequest, NextResponse } from "next/server";
import { getFengShuiPrompt } from "@/lib/prompts";
import { getChineseElement, ROOM_TYPES, COMPASS_DIRECTIONS } from "@/lib/feng-shui";
import { errorResponse, withRateLimitHeaders, parseBody, getAIProvider, getUserTier } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 5_000);
    if (error) return withRateLimitHeaders(error);

    const { birthYear, roomType, compassDirection, locale } = body as {
      birthYear: number;
      roomType: string;
      compassDirection: string;
      locale?: string;
    };

    if (!birthYear || birthYear < 1900 || birthYear > new Date().getFullYear()) {
      return withRateLimitHeaders(errorResponse("Valid birth year is required (1900-present)", 400));
    }

    if (!roomType || !ROOM_TYPES.includes(roomType as any)) {
      return withRateLimitHeaders(errorResponse(`Room type must be one of: ${ROOM_TYPES.join(", ")}`, 400));
    }

    if (!compassDirection || !COMPASS_DIRECTIONS.includes(compassDirection as any)) {
      return withRateLimitHeaders(errorResponse(`Direction must be one of: ${COMPASS_DIRECTIONS.join(", ")}`, 400));
    }

    const chineseElement = getChineseElement(birthYear);
    const authHeader = request.headers.get("authorization");
    const tier = await getUserTier(authHeader);
    const { provider: ai, unavailableResponse, tierConfig } = getAIProvider(tier);
    if (!ai) return withRateLimitHeaders(unavailableResponse!);

    const prompt = getFengShuiPrompt(birthYear, chineseElement, roomType, compassDirection, locale);
    const systemPrompt = `You are CyberFaith's Feng Shui Architect — harmonizing ancient elemental wisdom with digital energy flows. ${tierConfig.systemPromptSuffix}`;

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
      chineseElement,
      birthYear,
      roomType,
      compassDirection,
      interpretation,
      aiTier: tier,
    };

    saveReadingAsync(authHeader, "feng-shui" as any, { birthYear, roomType, compassDirection }, responseData, locale);

    return withRateLimitHeaders(
      NextResponse.json({ ...responseData, usage: aiResult.usage }),
    );
  } catch (error: unknown) {
    console.error("Feng Shui reading error:", error);
    return withRateLimitHeaders(errorResponse("Failed to generate feng shui reading", 500));
  }
}
