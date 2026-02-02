import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders, parseBody, sanitizeString, getUserTier } from "@/lib/api-utils";
import { saveReadingAsync } from "@/lib/save-reading";
import { proxyToAI } from "@/lib/ai-proxy";

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
    const sanitized = sanitizeString(dreamText, 3000);

    const { data, error: aiError, status } = await proxyToAI("dream", {
      dreamText: sanitized, locale, tier,
    }, authHeader);

    if (aiError) return withRateLimitHeaders(errorResponse(aiError, status || 503));

    const interpretation = data.result;
    const usage = data.usage;
    const responseData = { interpretation, dreamText: sanitized, aiTier: tier };
    saveReadingAsync(authHeader, "dream", { dreamText: sanitized }, responseData, locale);
    return withRateLimitHeaders(NextResponse.json({ ...responseData, usage }));
  } catch (error: unknown) {
    console.error("Dream analyze error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze dream", 500));
  }
}
