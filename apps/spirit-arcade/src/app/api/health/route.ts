import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", app: "sanctuary", timestamp: new Date().toISOString() });
}
