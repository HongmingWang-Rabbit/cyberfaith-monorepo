import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders, parseBody } from "@/lib/api-utils";
import { proxyToAI } from "@/lib/ai-proxy";

const VALID_SIGNS = new Set([
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]);
const VALID_LOCALES = new Set(["en", "zh", "zh-CN", "zh-TW"]);
const VALID_MBTI = new Set([
  "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
]);

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 5_000);
    if (error) return withRateLimitHeaders(error);

    const { sign1, sign2, mbtiType1, mbtiType2, locale } = body as {
      sign1: string;
      sign2: string;
      mbtiType1?: string;
      mbtiType2?: string;
      locale?: string;
    };

    if (!sign1 || !VALID_SIGNS.has(sign1.toLowerCase())) {
      return withRateLimitHeaders(errorResponse("Invalid sign1", 400));
    }
    if (!sign2 || !VALID_SIGNS.has(sign2.toLowerCase())) {
      return withRateLimitHeaders(errorResponse("Invalid sign2", 400));
    }
    if (mbtiType1 && !VALID_MBTI.has(mbtiType1.toUpperCase())) {
      return withRateLimitHeaders(errorResponse("Invalid mbtiType1", 400));
    }
    if (mbtiType2 && !VALID_MBTI.has(mbtiType2.toUpperCase())) {
      return withRateLimitHeaders(errorResponse("Invalid mbtiType2", 400));
    }
    if (locale && !VALID_LOCALES.has(locale)) {
      return withRateLimitHeaders(errorResponse("Invalid locale", 400));
    }

    // Check core-api cache
    try {
      const cacheRes = await fetch(`${CORE_API_URL}/readings/compatibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sign1: sign1.toLowerCase(),
          sign2: sign2.toLowerCase(),
          mbtiType1: mbtiType1?.toUpperCase(),
          mbtiType2: mbtiType2?.toUpperCase(),
        }),
      });
      if (cacheRes.ok) {
        const cacheData = await cacheRes.json();
        if (cacheData.data) {
          return withRateLimitHeaders(
            NextResponse.json({
              compatibility: cacheData.data,
              sign1: sign1.toLowerCase(),
              sign2: sign2.toLowerCase(),
              cached: true,
            }),
          );
        }
      }
    } catch {
      // Cache miss or core-api unavailable — proceed with AI
    }

    const authHeader = request.headers.get("authorization");

    const { data, error: aiError, status } = await proxyToAI("zodiac-compatibility", {
      sign1: sign1.toLowerCase(),
      sign2: sign2.toLowerCase(),
      mbtiType1: mbtiType1?.toUpperCase(),
      mbtiType2: mbtiType2?.toUpperCase(),
      locale,
    }, authHeader);

    if (aiError) return withRateLimitHeaders(errorResponse(aiError, status || 503));

    const compatibility = data.result;

    // Save to cache asynchronously
    fetch(`${CORE_API_URL}/readings/compatibility/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sign1: sign1.toLowerCase(),
        sign2: sign2.toLowerCase(),
        mbtiType1: mbtiType1?.toUpperCase(),
        mbtiType2: mbtiType2?.toUpperCase(),
        content: compatibility,
      }),
    }).catch(() => {});

    return withRateLimitHeaders(
      NextResponse.json({
        compatibility,
        sign1: sign1.toLowerCase(),
        sign2: sign2.toLowerCase(),
        usage: data.usage,
        cached: false,
      }),
    );
  } catch (error: unknown) {
    console.error("Zodiac compatibility error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze compatibility", 500));
  }
}
