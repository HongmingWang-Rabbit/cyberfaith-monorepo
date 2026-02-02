import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const type = searchParams.get("type");

    const url = new URL(`${CORE_API_URL}/v1/readings/feed`);
    url.searchParams.set("page", page);
    url.searchParams.set("limit", limit);
    if (type) url.searchParams.set("type", type);

    const res = await fetch(url.toString());

    if (!res.ok) {
      const body = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail: body }, { status: res.status })
      );
    }

    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data));
  } catch (error: unknown) {
    console.error("Feed proxy GET error:", error);
    return withRateLimitHeaders(errorResponse("Failed to fetch feed", 500));
  }
}
