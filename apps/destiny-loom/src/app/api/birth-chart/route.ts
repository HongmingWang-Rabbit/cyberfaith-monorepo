import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const location = searchParams.get("location") || "";

    if (!date || !time) {
      return withRateLimitHeaders(errorResponse("date and time are required", 400));
    }

    const url = new URL(`${CORE_API_URL}/v1/readings/birth-chart`);
    url.searchParams.set("date", date);
    url.searchParams.set("time", time);
    url.searchParams.set("location", location);

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
    console.error("Birth chart proxy error:", error);
    return withRateLimitHeaders(errorResponse("Failed to calculate birth chart", 500));
  }
}
