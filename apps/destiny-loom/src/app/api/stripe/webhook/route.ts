import { NextRequest, NextResponse } from "next/server";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    const res = await fetch(`${CORE_API_URL}/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": signature,
      },
      body,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
