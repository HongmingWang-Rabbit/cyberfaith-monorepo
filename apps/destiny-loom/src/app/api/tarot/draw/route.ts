import { NextRequest, NextResponse } from "next/server";
import { drawCards, SPREAD_POSITIONS } from "@/lib/tarot-deck";

const VALID_SPREADS = new Set(Object.keys(SPREAD_POSITIONS));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spreadType, question } = body as { spreadType: string; question?: string };

    if (!spreadType || !VALID_SPREADS.has(spreadType)) {
      return NextResponse.json(
        { error: "Invalid spreadType. Must be one of: single, three, celtic" },
        { status: 400 }
      );
    }

    const cards = drawCards(spreadType as "single" | "three" | "celtic");

    return NextResponse.json({
      spreadType,
      question: question || null,
      cards,
      drawnAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Tarot draw error:", error);
    return NextResponse.json({ error: "Failed to draw cards" }, { status: 500 });
  }
}
