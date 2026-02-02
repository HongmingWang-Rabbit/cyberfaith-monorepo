import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization") || "";
  const body = await req.json();
  const res = await fetch(`${API_URL}/arcade/meditation/complete`, {
    method: "POST",
    headers: { authorization: token, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
