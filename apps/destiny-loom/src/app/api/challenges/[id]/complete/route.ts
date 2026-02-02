import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = request.headers.get("authorization");
    if (!auth) return withRateLimitHeaders(errorResponse("Unauthorized", 401));

    const body = await request.json().catch(() => ({}));

    const res = await fetch(`${CORE_API_URL}/challenges/${id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail: data }, { status: res.status }),
      );
    }

    return withRateLimitHeaders(NextResponse.json(await res.json()));
  } catch (error: unknown) {
    console.error("Challenge complete error:", error);
    return withRateLimitHeaders(errorResponse("Failed to complete challenge", 500));
  }
}
