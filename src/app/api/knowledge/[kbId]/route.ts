/**
 * Knowledge Base Detail API Route
 * DELETE: Delete a knowledge base
 */

import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ kbId: string }> }
) {
  try {
    const { kbId } = await params;
    const ragUrl = _request.nextUrl.searchParams.get("ragUrl");
    if (!ragUrl) {
      return NextResponse.json({ error: "ragUrl is required" }, { status: 400 });
    }

    const res = await fetch(`${ragUrl}/knowledge/${kbId}`, { method: "DELETE" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[Knowledge DELETE] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
