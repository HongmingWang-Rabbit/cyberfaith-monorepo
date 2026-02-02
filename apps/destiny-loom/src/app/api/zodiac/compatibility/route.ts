import { NextRequest, NextResponse } from "next/server";
import { getCompatibilityPrompt } from "@/lib/prompts";
import { errorResponse, withRateLimitHeaders, parseBody, getAIProvider } from "@/lib/api-utils";

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

    const { provider: ai, unavailableResponse } = getAIProvider();
    if (!ai) return withRateLimitHeaders(unavailableResponse!);

    const mbtiContext = mbtiType1 || mbtiType2
      ? `\n\nAlso factor in MBTI types: ${mbtiType1 ? `Person 1 is ${mbtiType1}` : ""}${mbtiType1 && mbtiType2 ? ", " : ""}${mbtiType2 ? `Person 2 is ${mbtiType2}` : ""}.
Include how their MBTI types interact with their zodiac compatibility.`
      : "";

    const prompt = getCompatibilityPrompt(sign1.toLowerCase(), sign2.toLowerCase(), locale) + mbtiContext +
      `\n\nAlso include these additional fields in the JSON:
  "loveScore": 0-100,
  "friendshipScore": 0-100,
  "workScore": 0-100`;

    const aiResult = await ai.generateWithUsage(prompt, {
      temperature: 0.85,
      maxTokens: 2048,
      systemPrompt: "You are CyberFaith's Celestial Navigator — analyzing cosmic bonds between souls.",
    });

    let compatibility;
    try {
      compatibility = JSON.parse(aiResult.text);
    } catch {
      compatibility = { analysis: aiResult.text, overallScore: 50 };
    }

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
        usage: aiResult.usage,
        cached: false,
      }),
    );
  } catch (error: unknown) {
    console.error("Zodiac compatibility error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze compatibility", 500));
  }
}
