import { NextResponse } from "next/server";
import { db } from "@/database";
import { aiWidgetMessages } from "@/database/schema/ai-widget-messages";
import { aiWidgetConversations } from "@/database/schema/ai-widget-conversations";
import { eq, and } from "drizzle-orm";
import { jwtVerify } from "jose";
import type { ChatRequest, PageContext } from "@/types/ai-widget";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AI_WIDGET_JWT_SECRET ?? "dev-secret-change-in-production"
);

const LLM_API_URL =
  process.env.AI_WIDGET_LLM_URL ?? "http://localhost:40073/v1/chat/completions";
const LLM_API_KEY = process.env.AI_WIDGET_LLM_KEY ?? "any";
const LLM_MODEL = process.env.AI_WIDGET_LLM_MODEL ?? "qwen3.5-27b";

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(authHeader!.slice(7), JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.sub as string,
      tenantId: payload.tid as string,
      appId: payload.appId as string,
    };
  } catch {
    return null;
  }
}

function formatSSE(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// T037: Auto-create conversation if none exists for this user+app
async function getOrCreateConversation(
  conversationId: string | null | undefined,
  auth: { userId: string; tenantId: string; appId: string }
) {
  // If conversationId provided, verify it exists and belongs to user
  if (conversationId) {
    const [existing] = await db
      .select()
      .from(aiWidgetConversations)
      .where(
        and(
          eq(aiWidgetConversations.id, conversationId),
          eq(aiWidgetConversations.tenantId, auth.tenantId),
          eq(aiWidgetConversations.userId, auth.userId)
        )
      )
      .limit(1);
    if (existing) return existing;
  }

  // Auto-create: find existing active or create new
  const [active] = await db
    .select()
    .from(aiWidgetConversations)
    .where(
      and(
        eq(aiWidgetConversations.tenantId, auth.tenantId),
        eq(aiWidgetConversations.userId, auth.userId),
        eq(aiWidgetConversations.appId, auth.appId),
        eq(aiWidgetConversations.isActive, true)
      )
    )
    .limit(1);

  if (active) return active;

  // Create new conversation
  const [created] = await db
    .insert(aiWidgetConversations)
    .values({
      appId: auth.appId,
      tenantId: auth.tenantId,
      userId: auth.userId,
      isActive: true,
      messageCount: 0,
    })
    .returning();

  return created;
}

// POST /api/ai/chat — SSE streaming chat
export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { content, context } = body;
  if (!content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  // T037: Auto-create or get existing conversation
  const conversation = await getOrCreateConversation(
    body.conversationId,
    auth
  );

  if (!conversation) {
    return NextResponse.json({ error: "conversation_error" }, { status: 500 });
  }

  const conversationId = conversation.id;

  // Save user message
  const userMsgId = `msg_${crypto.randomUUID().slice(0, 8)}`;
  await db.insert(aiWidgetMessages).values({
    id: userMsgId,
    conversationId,
    role: "user",
    content,
  });

  // Build messages for LLM
  const systemPrompt = buildSystemPrompt(conversation.systemContext as Record<string, unknown> | null, context);
  const recentMessages = await db
    .select({ role: aiWidgetMessages.role, content: aiWidgetMessages.content })
    .from(aiWidgetMessages)
    .where(eq(aiWidgetMessages.conversationId, conversationId))
    .orderBy(aiWidgetMessages.createdAt)
    .limit(50);

  const llmMessages = [
    { role: "system" as const, content: systemPrompt },
    ...recentMessages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ];

  const assistantMsgId = `msg_${crypto.randomUUID().slice(0, 8)}`;
  let fullContent = "";

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        // Send stream_start
        controller.enqueue(
          encoder.encode(
            formatSSE("stream_start", {
              messageId: assistantMsgId,
              conversationId,
            })
          )
        );

        // Call LLM API with streaming
        const llmResponse = await fetch(LLM_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LLM_API_KEY}`,
          },
          body: JSON.stringify({
            model: LLM_MODEL,
            messages: llmMessages,
            stream: true,
          }),
        });

        if (!llmResponse.ok) {
          controller.enqueue(
            encoder.encode(
              formatSSE("stream_error", {
                code: "LLM_ERROR",
                message: `LLM API returned ${llmResponse.status}`,
              })
            )
          );
          controller.close();
          return;
        }

        const reader = llmResponse.body?.getReader();
        if (!reader) {
          controller.enqueue(
            encoder.encode(
              formatSSE("stream_error", {
                code: "NO_BODY",
                message: "Empty response from LLM",
              })
            )
          );
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let tokenIndex = 0;
        let buffer = "";
        let inputTokens = 0;
        let outputTokens = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const token =
                parsed.choices?.[0]?.delta?.content ?? "";
              // T038: Track token usage from LLM response
              if (parsed.usage) {
                inputTokens = parsed.usage.prompt_tokens ?? 0;
                outputTokens = parsed.usage.completion_tokens ?? 0;
              }
              if (token) {
                fullContent += token;
                controller.enqueue(
                  encoder.encode(
                    formatSSE("stream_token", {
                      content: token,
                      index: tokenIndex++,
                    })
                  )
                );
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }

        // Send stream_done with token usage
        const totalTokens = inputTokens + outputTokens || fullContent.length;
        controller.enqueue(
          encoder.encode(
            formatSSE("stream_done", {
              messageId: assistantMsgId,
              tokenUsage: { input: inputTokens, output: outputTokens || fullContent.length, total: totalTokens },
            })
          )
        );

        // T038: Save assistant message with token tracking
        await db.insert(aiWidgetMessages).values({
          id: assistantMsgId,
          conversationId,
          role: "assistant",
          content: fullContent,
          tokenCount: totalTokens,
          modelUsed: LLM_MODEL,
        });

        // Update conversation metadata
        await db
          .update(aiWidgetConversations)
          .set({
            lastMessageAt: new Date(),
            messageCount: conversation.messageCount + 2,
            updatedAt: new Date(),
          })
          .where(eq(aiWidgetConversations.id, conversationId));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            formatSSE("stream_error", {
              code: "INTERNAL_ERROR",
              message,
            })
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function buildSystemPrompt(
  systemContext: Record<string, unknown> | null,
  pageContext?: PageContext
): string {
  let prompt = "You are a helpful AI assistant.";

  if (systemContext?.systemPrompt) {
    prompt = systemContext.systemPrompt as string;
  }

  if (pageContext && Object.keys(pageContext).length > 0) {
    const parts: string[] = [];
    if (pageContext.currentPage) parts.push(`Current page: ${pageContext.currentPage}`);
    if (pageContext.activeModule) parts.push(`Active module: ${pageContext.activeModule}`);
    if (pageContext.selectedItems?.length) parts.push(`Selected items: ${pageContext.selectedItems.join(", ")}`);
    if (parts.length > 0) {
      prompt += `\n\nContext: ${parts.join(". ")}`;
    }
  }

  return prompt;
}
