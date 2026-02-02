import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = request.headers.get("authorization");
    if (!auth) return withRateLimitHeaders(errorResponse("Unauthorized", 401));

    const res = await fetch(`${CORE_API_URL}/readings/${id}/journal`, {
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
    console.error("Journal GET error:", error);
    return withRateLimitHeaders(errorResponse("Failed to fetch journal entries", 500));
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = request.headers.get("authorization");
    if (!auth) return withRateLimitHeaders(errorResponse("Unauthorized", 401));

    const body = await request.json();

    const res = await fetch(`${CORE_API_URL}/readings/${id}/journal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const respBody = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail: respBody }, { status: res.status })
      );
    }

    return withRateLimitHeaders(NextResponse.json(await res.json()));
  } catch (error: unknown) {
    console.error("Journal POST error:", error);
    return withRateLimitHeaders(errorResponse("Failed to create journal entry", 500));
  }
}
