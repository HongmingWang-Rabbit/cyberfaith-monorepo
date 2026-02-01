import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-utils";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = request.headers.get("authorization");
  if (!auth) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  const res = await fetch(`${CORE_API_URL}/admin/readings/${id}`, {
    method: "DELETE",
    headers: { Authorization: auth },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
