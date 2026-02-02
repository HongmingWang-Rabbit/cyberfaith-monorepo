import { NextRequest, NextResponse } from "next/server";
import { calculateNumerology } from "@/lib/numerology";
import { errorResponse, withRateLimitHeaders, parseBody, getUserTier } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";
import { proxyToAI } from "@/lib/ai-proxy";

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

    const { data, error: aiError, status } = await proxyToAI("numerology", {
      fullName: fullName.trim(),
      lifePathNumber: numbers.lifePathNumber,
      expressionNumber: numbers.expressionNumber,
      soulUrgeNumber: numbers.soulUrgeNumber,
      locale, tier,
    }, authHeader);

    if (aiError) return withRateLimitHeaders(errorResponse(aiError, status || 503));

    const interpretation = data.result;
    const responseData = {
      numbers, interpretation, fullName: fullName.trim(), birthdate, aiTier: tier,
    };

    saveReadingAsync(authHeader, "numerology" as any, { fullName, birthdate }, responseData, locale);

    return withRateLimitHeaders(
      NextResponse.json({ ...responseData, usage: data.usage }),
    );
  } catch (error: unknown) {
    console.error("Numerology reading error:", error);
    return withRateLimitHeaders(errorResponse("Failed to generate numerology reading", 500));
  }
}
