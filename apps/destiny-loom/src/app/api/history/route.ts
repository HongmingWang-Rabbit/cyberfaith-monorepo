import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders, parseBody, sanitizeString } from "@/lib/api-utils";

interface ReadingHistoryItem {
  id: string;
  type: "mbti" | "tarot" | "zodiac" | "i-ching" | "four-pillars";
  result: Record<string, unknown>;
  createdAt: string;
  userId: string;
}

const MOCK_HISTORY: ReadingHistoryItem[] = [
  {
    id: "mock-1",
    type: "mbti",
    result: { type: "INFJ", analysis: { title: "The Digital Mystic" } },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    userId: "demo-user",
  },
  {
    id: "mock-2",
    type: "tarot",
    result: { spreadType: "three", cards: [{ name: "The Star", position: "Present", reversed: false }] },
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    userId: "demo-user",
  },
  {
    id: "mock-3",
    type: "zodiac",
    result: { sign: "scorpio", period: "daily", reading: "The stars align in your favor..." },
    createdAt: new Date().toISOString(),
    userId: "demo-user",
  },
];

const VALID_TYPES = new Set(["mbti", "tarot", "zodiac", "i-ching", "four-pillars"]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";

    const history = MOCK_HISTORY.filter((item) => item.userId === userId);

    return withRateLimitHeaders(NextResponse.json({ history, userId }));
  } catch (error: unknown) {
    console.error("History GET error:", error);
    return withRateLimitHeaders(errorResponse("Failed to fetch history", 500));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 50_000);
    if (error) return withRateLimitHeaders(error);

    const { type, result, userId } = body as {
      type: string;
      result: Record<string, unknown>;
      userId?: string;
    };

    if (!type || !VALID_TYPES.has(type)) {
      return withRateLimitHeaders(
        errorResponse("Invalid type", 400, "Must be one of: mbti, tarot, zodiac, i-ching, four-pillars")
      );
    }

    if (!result || typeof result !== "object") {
      return withRateLimitHeaders(errorResponse("Result object is required", 400));
    }

    const savedItem: ReadingHistoryItem = {
      id: `mock-${Date.now()}`,
      type: type as ReadingHistoryItem["type"],
      result,
      createdAt: new Date().toISOString(),
      userId: userId ? sanitizeString(userId, 100) : "anonymous",
    };

    return withRateLimitHeaders(
      NextResponse.json({ saved: savedItem, message: "Mock save — DB integration pending" }, { status: 201 })
    );
  } catch (error: unknown) {
    console.error("History POST error:", error);
    return withRateLimitHeaders(errorResponse("Failed to save reading", 500));
  }
}
