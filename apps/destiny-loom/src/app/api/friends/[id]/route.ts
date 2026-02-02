import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return withRateLimitHeaders(errorResponse("Unauthorized", 401));

    const { id } = await params;
    const res = await fetch(`${CORE_API_URL}/v1/friends/${id}`, {
      method: "DELETE",
      headers: { Authorization: auth },
    });

    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data, { status: res.status }));
  } catch (error) {
    console.error("Friends delete proxy error:", error);
    return withRateLimitHeaders(errorResponse("Failed to remove friend", 500));
  }
}
