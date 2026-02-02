import { NextRequest, NextResponse } from "next/server";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${CORE_API_URL}/users/settings`, {
    headers: { authorization: auth },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${CORE_API_URL}/users/settings`, {
    method: "PATCH",
    headers: { authorization: auth, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
