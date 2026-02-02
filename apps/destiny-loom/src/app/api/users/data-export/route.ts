import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/users/data-export`, {
    headers: { authorization: token },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to export data" }, { status: res.status });
  }

  const data = await res.json();
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cyberfaith-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
