import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const res = await fetch(`${CORE_API_URL}/readings/public/${id}`, {
      next: { revalidate: 60 }, // cache for 1 minute
    });

    if (!res.ok) {
      const body = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Not found", detail: body }, { status: res.status })
      );
    }

    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data));
  } catch (error: unknown) {
    console.error("Public reading proxy GET error:", error);
    return withRateLimitHeaders(errorResponse("Failed to fetch reading", 500));
  }
}
