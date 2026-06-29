/**
 * Knowledge Documents API Route
 * GET: List documents in a knowledge base
 * POST: Upload documents to a knowledge base
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string }> }
) {
  try {
    const { kbId } = await params;
    const ragUrl = request.nextUrl.searchParams.get("ragUrl");
    if (!ragUrl) {
      return NextResponse.json({ error: "ragUrl is required" }, { status: 400 });
    }

    const res = await fetch(`${ragUrl}/knowledge/${kbId}/documents`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[Documents GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kbId: string }> }
) {
  try {
    const { kbId } = await params;
    const formData = await request.formData();
    const ragUrl = formData.get("ragUrl") as string;

    if (!ragUrl) {
      return NextResponse.json({ error: "ragUrl is required" }, { status: 400 });
    }

    // Build new FormData for backend (exclude ragUrl)
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      if (key !== "ragUrl") {
        backendFormData.append(key, value);
      }
    }

    const res = await fetch(`${ragUrl}/knowledge/${kbId}/documents`, {
      method: "POST",
      body: backendFormData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[Documents POST] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
