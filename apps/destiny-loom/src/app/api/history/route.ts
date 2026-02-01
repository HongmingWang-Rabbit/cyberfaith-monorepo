import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database integration (Drizzle + PostgreSQL)
// For now, return mock data structures so the frontend can integrate

interface ReadingHistoryItem {
  id: string;
  type: "mbti" | "tarot" | "zodiac";
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";

    // TODO: Query database by userId
    const history = MOCK_HISTORY.filter((item) => item.userId === userId);

    return NextResponse.json({ history, userId });
  } catch (error: unknown) {
    console.error("History GET error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, result, userId } = body as {
      type: string;
      result: Record<string, unknown>;
      userId?: string;
    };

    if (!type || !["mbti", "tarot", "zodiac"].includes(type)) {
      return NextResponse.json({ error: "Invalid type. Must be: mbti, tarot, or zodiac" }, { status: 400 });
    }

    if (!result || typeof result !== "object") {
      return NextResponse.json({ error: "Result object is required" }, { status: 400 });
    }

    // TODO: Save to database
    const savedItem: ReadingHistoryItem = {
      id: `mock-${Date.now()}`,
      type: type as "mbti" | "tarot" | "zodiac",
      result,
      createdAt: new Date().toISOString(),
      userId: userId || "anonymous",
    };

    return NextResponse.json({ saved: savedItem, message: "Mock save — DB integration pending" }, { status: 201 });
  } catch (error: unknown) {
    console.error("History POST error:", error);
    return NextResponse.json({ error: "Failed to save reading" }, { status: 500 });
  }
}
