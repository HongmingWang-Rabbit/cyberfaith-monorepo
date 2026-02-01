import { NextRequest, NextResponse } from "next/server";
import { castHexagram } from "@/lib/i-ching";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { question } = body as { question?: string };

    if (question && (typeof question !== "string" || question.length > 500)) {
      return NextResponse.json(
        { error: "Question must be a string of 500 characters or less" },
        { status: 400 }
      );
    }

    const result = castHexagram();

    return NextResponse.json({
      ...result,
      question: question ? question.slice(0, 500) : null,
      castAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("I Ching cast error:", error);
    return NextResponse.json({ error: "Failed to cast hexagram" }, { status: 500 });
  }
}
