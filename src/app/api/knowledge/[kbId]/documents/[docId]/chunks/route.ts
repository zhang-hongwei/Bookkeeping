/**
 * Document Chunks API Route
 * GET: Get chunks for a document (content viewer)
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
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
      `${ragUrl}/knowledge/${kbId}/documents/${docId}/chunks`
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[Chunks GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
