import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return withRateLimitHeaders(errorResponse("Unauthorized", 401));

    const res = await fetch(`${CORE_API_URL}/friends`, {
      headers: { Authorization: auth },
    });

    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data, { status: res.status }));
  } catch (error) {
    console.error("Friends proxy error:", error);
    return withRateLimitHeaders(errorResponse("Failed to fetch friends", 500));
  }
}
