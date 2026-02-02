import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return withRateLimitHeaders(errorResponse("Unauthorized", 401));
    }

    const res = await fetch(`${CORE_API_URL}/v1/users/insights`, {
      headers: { Authorization: auth },
    });

    if (!res.ok) {
      const body = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail: body }, { status: res.status })
      );
    }

    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data));
  } catch (error: unknown) {
    console.error("Insights proxy error:", error);
    return withRateLimitHeaders(errorResponse("Failed to fetch insights", 500));
  }
}
