import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization") || "";
  const res = await fetch(`${API_URL}/arcade/fortune-cookie/status`, {
    headers: { authorization: token },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
