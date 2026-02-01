import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", app: "sanctum", timestamp: new Date().toISOString() });
}
