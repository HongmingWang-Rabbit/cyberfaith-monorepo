import { NextRequest, NextResponse } from "next/server";
import { withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    const headers: Record<string, string> = {};
    if (auth) headers.Authorization = auth;

    const res = await fetch(`${CORE_API_URL}/challenges/today`, { headers });

    if (!res.ok) {
      const body = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail: body }, { status: res.status }),
      );
    }

    return withRateLimitHeaders(NextResponse.json(await res.json()));
  } catch (error: unknown) {
    console.error("Challenges today error:", error);
    return withRateLimitHeaders(
      NextResponse.json({ error: "Failed to fetch today's challenge" }, { status: 500 }),
    );
  }
}
