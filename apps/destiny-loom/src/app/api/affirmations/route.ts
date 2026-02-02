import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders, getUserTier } from "@/lib/api-utils";
import { proxyToAI } from "@/lib/ai-proxy";

// Simple in-memory cache: userId -> { date, data }
const cache = new Map<string, { date: string; data: unknown }>();

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get("locale") || undefined;
    const authHeader = request.headers.get("authorization");
    const tier = await getUserTier(authHeader);
    const today = new Date().toISOString().slice(0, 10);

    // Try cache (keyed by auth header hash or "anon")
    const cacheKey = authHeader ? Buffer.from(authHeader).toString("base64").slice(0, 20) : "anon";
    const cached = cache.get(cacheKey);
    if (cached && cached.date === today) {
      return withRateLimitHeaders(NextResponse.json(cached.data));
    }

    // Try to get user's zodiac sign and recent mood from core-api
    let zodiacSign: string | null = null;
    let recentMood: string | null = null;

    if (authHeader) {
      const coreApiUrl = process.env.CORE_API_URL || "http://localhost:4000";
      try {
        const [userRes, journalRes] = await Promise.all([
          fetch(`${coreApiUrl}/users/me`, { headers: { Authorization: authHeader } }),
          fetch(`${coreApiUrl}/journal?limit=1`, { headers: { Authorization: authHeader } }).catch(() => null),
        ]);
        if (userRes.ok) {
          const userData = await userRes.json();
          zodiacSign = userData?.zodiacSign || userData?.data?.zodiacSign || null;
        }
        if (journalRes?.ok) {
          const journalData = await journalRes.json();
          const entries = journalData?.data || [];
          if (entries.length > 0 && entries[0].mood) {
            recentMood = entries[0].mood;
          }
        }
      } catch {
        // Continue without personalization
      }
    }

    const { data, error: aiError, status } = await proxyToAI("affirmations", {
      zodiacSign, recentMood, locale, tier,
    }, authHeader);

    if (aiError) return withRateLimitHeaders(errorResponse(aiError, status || 503));

    const affirmations = data.result;
    const responseData = {
      ...affirmations,
      date: today,
      zodiacSign,
      aiTier: tier,
      usage: data.usage,
    };

    // Cache for the day
    cache.set(cacheKey, { date: today, data: responseData });

    return withRateLimitHeaders(NextResponse.json(responseData));
  } catch (error: unknown) {
    console.error("Affirmation error:", error);
    return withRateLimitHeaders(errorResponse("Failed to generate affirmation", 500));
  }
}
