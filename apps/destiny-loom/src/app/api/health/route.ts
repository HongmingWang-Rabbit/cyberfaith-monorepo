import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", app: "destiny-loom", timestamp: new Date().toISOString() });
}
