import { NextResponse } from "next/server";
import { withRateLimitHeaders } from "@/lib/api-utils";

export function GET() {
  return withRateLimitHeaders(
    NextResponse.json({ status: "ok", app: "destiny-loom", timestamp: new Date().toISOString() })
  );
}
