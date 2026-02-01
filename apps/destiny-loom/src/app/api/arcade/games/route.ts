import { NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET() {
  try {
    const res = await fetch(`${CORE_API_URL}/arcade/games`);
    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data, { status: res.status }));
  } catch (error: unknown) {
    console.error("Arcade games proxy error:", error);
    return withRateLimitHeaders(errorResponse("Failed to fetch games", 500));
  }
}
