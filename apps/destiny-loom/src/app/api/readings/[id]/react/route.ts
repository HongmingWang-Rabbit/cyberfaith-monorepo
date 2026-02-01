import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function POST(
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

    const res = await fetch(`${CORE_API_URL}/readings/${id}/react`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const respBody = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail: respBody }, { status: res.status })
      );
    }

    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data));
  } catch (error: unknown) {
    console.error("React proxy POST error:", error);
    return withRateLimitHeaders(errorResponse("Failed to add reaction", 500));
  }
}
