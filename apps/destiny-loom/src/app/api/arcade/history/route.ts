import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return withRateLimitHeaders(errorResponse("Unauthorized", 401));
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";
    const page = searchParams.get("page") || "1";

    const url = new URL(`${CORE_API_URL}/arcade/history`);
    url.searchParams.set("limit", limit);
    url.searchParams.set("page", page);

    const res = await fetch(url.toString(), {
      headers: { Authorization: auth },
    });

    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data, { status: res.status }));
  } catch (error: unknown) {
    console.error("Arcade history proxy error:", error);
    return withRateLimitHeaders(errorResponse("Failed to fetch history", 500));
  }
}
