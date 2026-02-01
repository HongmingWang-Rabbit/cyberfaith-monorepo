import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return withRateLimitHeaders(errorResponse("Unauthorized", 401));
    }

    const { id } = await params;
    const body = await request.json();

    const res = await fetch(`${CORE_API_URL}/readings/${id}/public`, {
      method: "PATCH",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail }, { status: res.status })
      );
    }

    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data));
  } catch (error: unknown) {
    console.error("Reading public toggle error:", error);
    return withRateLimitHeaders(errorResponse("Failed to update reading", 500));
  }
}
