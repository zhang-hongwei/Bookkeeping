/**
 * Backend LLM Proxy API Route
 * Proxies LLM requests with file upload support to Python backend
 */

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const message = formData.get("message") as string;
    const conversationId = formData.get("conversation_id") as string;
    const baseUrl = formData.get("base_url") as string;

    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: "baseUrl is required" }),
        { status: 400 }
      );
    }

    // Re-stream the SSE response from the external Python backend
    const cleanBase = baseUrl.replace(/\/+$/, "");
    const backendUrl = `${cleanBase}/chat/simple`;

    // This route proxies to the same backend that the Vue app used
    // In the React setup, the main /api/chat route handles direct LLM,
    // so this route is used for backend-proxy LLM mode (with file analysis)
    const backendRes = await fetch(backendUrl, {
      method: "POST",
      body: formData,
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return new Response(
        JSON.stringify({ error: `Backend error (${backendRes.status}): ${text}` }),
        { status: backendRes.status }
      );
    }

    // Pass through the SSE stream directly
    const stream = backendRes.body;
    if (!stream) {
      return new Response(JSON.stringify({ error: "No response body" }), { status: 500 });
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[Simple LLM route] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500 }
    );
  }
}
