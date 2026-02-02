import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) return errorResponse("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const url = status
    ? `${CORE_API_URL}/admin/reports?status=${status}`
    : `${CORE_API_URL}/admin/reports`;

  const res = await fetch(url, {
    headers: { Authorization: auth },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
