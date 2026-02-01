import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return withRateLimitHeaders(errorResponse("Unauthorized", 401));
    }

    const body = await request.json();

    const res = await fetch(`${CORE_API_URL}/arcade/muyu/tap`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data, { status: res.status }));
  } catch (error: unknown) {
    console.error("Muyu tap proxy error:", error);
    return withRateLimitHeaders(errorResponse("Failed to record taps", 500));
  }
}
