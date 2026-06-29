/**
 * Knowledge Bases API Route
 * GET: List all knowledge bases
 * POST: Create a new knowledge base
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const ragUrl = request.nextUrl.searchParams.get("ragUrl");
    if (!ragUrl) {
      return NextResponse.json({ error: "ragUrl is required" }, { status: 400 });
    }

    const res = await fetch(`${ragUrl}/knowledge`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[Knowledge GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ragUrl, name, description } = await request.json();
    if (!ragUrl || !name) {
      return NextResponse.json({ error: "ragUrl and name are required" }, { status: 400 });
    }

    const res = await fetch(`${ragUrl}/knowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || "" }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[Knowledge POST] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
