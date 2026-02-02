import { NextRequest, NextResponse } from "next/server";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${CORE_API_URL}/readings/gifts/sent`, {
    headers: { authorization: auth },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
