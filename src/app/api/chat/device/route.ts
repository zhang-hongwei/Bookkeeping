/**
 * Device Control API Route
 * Proxies IoT device control requests to Java backend (non-streaming)
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, historyMessages, javaUrl } = body;

    if (!javaUrl) {
      return NextResponse.json({ error: "javaUrl is required" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // Build the Java backend URL
    let url = javaUrl.trim().replace(/\/+$/, "");
    if (!url.endsWith("/aiot/ai/chat")) {
      url += "/aiot/ai/chat";
    }

    const backendRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        historyMessages: historyMessages || [],
      }),
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json(
        { error: `Backend error (${backendRes.status}): ${text}` },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    // Adapt different response formats
    if (data.result) {
      return NextResponse.json({
        reply: data.result.reply || data.result.content || JSON.stringify(data.result),
        conversationHistory: data.result.conversationHistory || [],
      });
    }

    return NextResponse.json({
      reply: data.reply || data.content || data.message || JSON.stringify(data),
      conversationHistory: data.conversationHistory || [],
    });
  } catch (err) {
    console.error("[Device route] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
