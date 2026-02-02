import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withRateLimitHeaders } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ friendId: string }> },
) {
  try {
    const { friendId } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return withRateLimitHeaders(errorResponse("Unauthorized", 401));
    }

    // Call core-api to get friend profile + check friendship
    const res = await fetch(`${CORE_API_URL}/readings/compatibility/friend/${friendId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Failed" }));
      return withRateLimitHeaders(
        errorResponse(err.message || "Failed to get friend compatibility", res.status),
      );
    }

    const data = await res.json();

    // If we have cached data, return it
    if (data.data) {
      return withRateLimitHeaders(NextResponse.json({
        compatibility: data.data,
        sign1: data.mySign,
        sign2: data.friendSign,
        friendName: data.friendName,
        friendAvatar: data.friendAvatar,
        cached: true,
      }));
    }

    // No cache — generate via the main compatibility endpoint
    const body = await request.json().catch(() => ({}));
    const genRes = await fetch(new URL("/api/zodiac/compatibility", request.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sign1: data.mySign,
        sign2: data.friendSign,
        locale: body.locale,
      }),
    });

    const genData = await genRes.json();
    return withRateLimitHeaders(NextResponse.json({
      ...genData,
      friendName: data.friendName,
      friendAvatar: data.friendAvatar,
    }));
  } catch (error: unknown) {
    console.error("Friend compatibility error:", error);
    return withRateLimitHeaders(errorResponse("Failed to analyze friend compatibility", 500));
  }
}
