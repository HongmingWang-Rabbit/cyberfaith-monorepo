import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return withRateLimitHeaders(errorResponse("Unauthorized", 401));
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const url = new URL(`${CORE_API_URL}/readings`);
    if (type) url.searchParams.set("type", type);
    url.searchParams.set("limit", limit);
    url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: auth },
    });

    if (!res.ok) {
      const body = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail: body }, { status: res.status })
      );
    }

    const data = await res.json();
    return withRateLimitHeaders(NextResponse.json(data));
  } catch (error: unknown) {
    console.error("Readings proxy GET error:", error);
    return withRateLimitHeaders(errorResponse("Failed to fetch readings", 500));
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return withRateLimitHeaders(errorResponse("Unauthorized", 401));
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return withRateLimitHeaders(errorResponse("Missing reading id", 400));
    }

    const res = await fetch(`${CORE_API_URL}/readings/${id}`, {
      method: "DELETE",
      headers: { Authorization: auth },
    });

    if (!res.ok) {
      const body = await res.text();
      return withRateLimitHeaders(
        NextResponse.json({ error: "Upstream error", detail: body }, { status: res.status })
      );
    }

    return withRateLimitHeaders(NextResponse.json({ deleted: true }));
  } catch (error: unknown) {
    console.error("Readings proxy DELETE error:", error);
    return withRateLimitHeaders(errorResponse("Failed to delete reading", 500));
  }
}
