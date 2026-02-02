import { NextResponse } from "next/server";

const API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET() {
  const res = await fetch(`${API_URL}/arcade/destiny-wheel/segments`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
