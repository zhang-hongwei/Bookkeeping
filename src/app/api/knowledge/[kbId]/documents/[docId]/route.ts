/**
 * Knowledge Document Detail API Route
 * DELETE: Delete a document
 */

import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string; docId: string }> }
) {
  try {
    const { kbId, docId } = await params;
    const ragUrl = request.nextUrl.searchParams.get("ragUrl");
    if (!ragUrl) {
      return NextResponse.json({ error: "ragUrl is required" }, { status: 400 });
    }

    const res = await fetch(
      `${ragUrl}/knowledge/${kbId}/documents/${docId}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[Document DELETE] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
