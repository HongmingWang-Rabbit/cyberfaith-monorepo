import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return withRateLimitHeaders(errorResponse("Unauthorized", 401));

    const { searchParams } = new URL(request.url);
    const url = new URL(`${CORE_API_URL}/journal`);
    for (const [key, val] of searchParams.entries()) {
      url.searchParams.set(key, val);
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: auth },
    });

    if (!res.ok) {
      const body = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail: body }, { status: res.status })
      );
    }

    return withRateLimitHeaders(NextResponse.json(await res.json()));
  } catch (error: unknown) {
    console.error("Journal list error:", error);
    return withRateLimitHeaders(errorResponse("Failed to fetch journal entries", 500));
  }
}
