import { NextRequest, NextResponse } from "next/server";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const auth = request.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type } = await params;
  const res = await fetch(`${CORE_API_URL}/v1/admin/notification-jobs/${type}/trigger`, {
    method: "POST",
    headers: { Authorization: auth },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
