import { NextRequest, NextResponse } from "next/server";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function DELETE(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${CORE_API_URL}/users/account`, {
    method: "DELETE",
    headers: { authorization: auth },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
