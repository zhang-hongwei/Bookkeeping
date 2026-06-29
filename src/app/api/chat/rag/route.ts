/**
 * RAG Chat API Route
 * Proxies RAG requests to Python backend, converts SSE to Vercel AI SDK stream
 */

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, knowledgeBaseIds, ragUrl, conversationId, files: _files } = body;

    if (!ragUrl) {
      return new Response(JSON.stringify({ error: "ragUrl is required" }), { status: 400 });
    }

    // Build FormData for the RAG backend
    const formData = new FormData();

    // Extract the last user message text
    const lastMessage = messages?.[messages.length - 1];
    const textPart = lastMessage?.parts?.find((p: { type: string }) => p.type === "text");
    if (textPart?.text) {
      formData.append("message", textPart.text);
    }

    if (conversationId) {
      formData.append("conversation_id", conversationId);
    }
    formData.append("knowledge_base_ids", JSON.stringify(knowledgeBaseIds || []));
    formData.append("stream", "true");

    // Forward to RAG backend
    const backendUrl = `${ragUrl}/chat`;
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

    // Parse SSE from backend and re-emit as Vercel AI SDK stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = backendRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(":")) continue;

              if (trimmed.startsWith("data: ") || trimmed.startsWith("data:")) {
                const data = trimmed.startsWith("data: ")
                  ? trimmed.slice(6)
                  : trimmed.slice(5).trim();

                if (data === "[DONE]") {
                  // Emit finish reason only (content already sent incrementally)
                  controller.enqueue(
                    encoder.encode(
                      `d:${JSON.stringify({ finishReason: "stop" })}\n`
                    )
                  );
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === "chunk" && parsed.content) {
                    fullContent += parsed.content;
                    // Emit text delta
                    controller.enqueue(
                      encoder.encode(`0:${JSON.stringify(parsed.content)}\n`)
                    );
                  } else if (parsed.type === "sources") {
                    // Append sources as metadata (will be captured by client)
                    controller.enqueue(
                      encoder.encode(
                        `e:${JSON.stringify({ sources: parsed.data || [] })}\n`
                      )
                    );
                  } else if (parsed.type === "error") {
                    controller.enqueue(
                      encoder.encode(
                        `e:${JSON.stringify({ error: parsed.message })}\n`
                      )
                    );
                  }
                } catch {
                  // Skip non-JSON data
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  } catch (err) {
    console.error("[RAG route] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500 }
    );
  }
}
