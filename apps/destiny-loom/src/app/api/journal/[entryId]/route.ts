import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const auth = request.headers.get("authorization");
    if (!auth) return withRateLimitHeaders(errorResponse("Unauthorized", 401));

    const body = await request.json();

    const res = await fetch(`${CORE_API_URL}/journal/${entryId}`, {
      method: "PATCH",
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
    console.error("Journal PATCH error:", error);
    return withRateLimitHeaders(errorResponse("Failed to update journal entry", 500));
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const auth = request.headers.get("authorization");
    if (!auth) return withRateLimitHeaders(errorResponse("Unauthorized", 401));

    const res = await fetch(`${CORE_API_URL}/journal/${entryId}`, {
      method: "DELETE",
      headers: { Authorization: auth },
    });

    if (!res.ok) {
      const respBody = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail: respBody }, { status: res.status })
      );
    }

    return withRateLimitHeaders(NextResponse.json(await res.json()));
  } catch (error: unknown) {
    console.error("Journal DELETE error:", error);
    return withRateLimitHeaders(errorResponse("Failed to delete journal entry", 500));
  }
}
