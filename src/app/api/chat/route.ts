import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type UIMessage } from "ai";
import debug from "debug";
import { eq } from "drizzle-orm";
import { db, isDatabaseEnabled } from "@/database/client";
import { chatConversations, chatMessages } from "@/database/schema/chat";
import {
  trimMessagesToBudget,
  getTokenBudget,
  estimateTokens,
} from "@/services/chat-context-trimmer";

const log = debug("design-tool-chat:context");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages,
      baseUrl,
      authToken,
      model,
      temperature,
      topP,
      topK,
      maxTokens,
      frequencyPenalty,
      presencePenalty,
      enableThinking,
      visitorId,
      conversationId,
    }: {
      messages: UIMessage[];
      baseUrl?: string;
      authToken?: string;
      model?: string;
      temperature?: number;
      topP?: number;
      topK?: number;
      maxTokens?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
      enableThinking?: boolean;
      visitorId?: string;
      conversationId?: string;
    } = body;

    const openai = createOpenAI({
      baseURL: baseUrl || process.env.OPENAI_BASE_URL,
      apiKey: authToken || process.env.OPENAI_AUTH_TOKEN,
    });

    const modelName = model || process.env.OPENAI_MODEL!;

    log("model: %s baseURL: %s", modelName, baseUrl || process.env.OPENAI_BASE_URL);

    const systemPrompt = {
      role: "system" as const,
      content: `
你是"混沌大模型"，由混沌物联公司研发的智能助手。

你的核心目标是：
- 准确、高效地解决用户问题
- 提供清晰、实用、有逻辑的回答
- 在不同场景下保持合适的表达风格（技术问题偏专业，日常问题偏简洁）

行为准则：
1. 以用户任务为优先，避免无关背景介绍
2. 回答要具体、有可执行性，避免空泛描述
3. 不确定的信息要明确说明，不编造
4. 尽量结构化表达，提升可读性

关于身份与来源：
- 仅在用户明确询问或存在明显误解时进行说明
- 使用简短、客观的方式澄清（1-2句以内）
- 不主动强调或反复提及
- 不与用户争辩或展开技术细节
- 澄清后将对话自然引导回用户的实际问题
- 优先通过回答质量体现能力，而非自我声明

风格要求：
- 自然、专业、直接
- 避免官话和过度营销表达
- 根据用户语气调整回答深度

始终以"帮助用户完成目标"为第一优先级。
      `.trim(),
    };

    const modelMessages = messages.map((msg) => {
      const parts = msg.parts as any[];
      const imageParts = parts.filter((p) => p.type === "image");
      const textParts = parts.filter((p) => p.type === "text");

      if (imageParts.length > 0 && msg.role === "user") {
        const content: Array<
          { type: "text"; text: string } | { type: "image"; image: string }
        > = [];
        for (const part of imageParts) {
          const url = part.image instanceof URL ? part.image.href : String(part.image);
          content.push({ type: "image", image: url });
        }
        for (const part of textParts) {
          if (part.text) content.push({ type: "text", text: part.text });
        }
        return { role: "user" as const, content };
      }

      const text = textParts.map((p: any) => p.text as string).join("");
      return { role: msg.role as "user" | "assistant", content: text };
    });

    log(
      "messages count: %d has images: %s",
      modelMessages.length,
      modelMessages.some(
        (m) =>
          Array.isArray(m.content) &&
          m.content.some((c: any) => c.type === "image")
      )
    );

    // Trim messages to fit within token budget
    const budget = getTokenBudget();
    const systemPromptTokens = estimateTokens(systemPrompt.content as string);
    const messageBudget = Math.max(0, budget - systemPromptTokens);
    const { trimmedMessages, removedCount, budgetUsed } = trimMessagesToBudget(
      modelMessages,
      messageBudget
    );

    if (removedCount > 0) {
      log(
        "context trimmed: %d/%d messages removed, budget used: %d/%d",
        modelMessages.length - removedCount,
        modelMessages.length,
        budgetUsed,
        budget
      );
    }

    // Extract the last user message parts for persistence
    const lastUserMessage = messages[messages.length - 1]?.role === "user"
      ? messages[messages.length - 1]
      : undefined;

    const dbEnabled = isDatabaseEnabled() && visitorId;

    const result = streamText({
      model: openai.chat(modelName),
      messages: [systemPrompt, ...trimmedMessages],
      temperature,
      topP,
      topK,
      maxOutputTokens: maxTokens,
      frequencyPenalty,
      presencePenalty,
      providerOptions: {
        openai: {
          chat_template_kwargs: { enable_thinking: enableThinking ?? false },
        },
      },
      onFinish: async ({ text: assistantText }) => {
        if (!dbEnabled || !visitorId) return;

        try {
          let convId: string;

          if (conversationId) {
            convId = conversationId;
            await db
              .update(chatConversations)
              .set({ updatedAt: new Date() })
              .where(eq(chatConversations.id, convId));
          } else {
            let conversation = await db
              .select({ id: chatConversations.id })
              .from(chatConversations)
              .where(eq(chatConversations.visitorId, visitorId))
              .limit(1);

            if (conversation.length === 0) {
              const title = lastUserMessage?.parts
                ?.filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join("")
                .slice(0, 100) || "New Chat";

              const inserted = await db
                .insert(chatConversations)
                .values({ visitorId, title })
                .returning({ id: chatConversations.id });

              conversation = inserted;
            } else {
              await db
                .update(chatConversations)
                .set({ updatedAt: new Date() })
                .where(eq(chatConversations.id, conversation[0].id));
            }

            convId = conversation[0].id;
          }

          // Auto-generate title on first message if title is null
          if (lastUserMessage && conversationId) {
            const existing = await db
              .select({ title: chatConversations.title })
              .from(chatConversations)
              .where(eq(chatConversations.id, convId))
              .limit(1);

            if (existing.length > 0 && !existing[0].title) {
              const title = lastUserMessage.parts
                ?.filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join("")
                .slice(0, 30) || "New Chat";

              await db
                .update(chatConversations)
                .set({ title })
                .where(eq(chatConversations.id, convId));
            }
          }

          if (lastUserMessage) {
            await db.insert(chatMessages).values({
              conversationId: convId,
              role: "user",
              content: lastUserMessage.parts,
            });
          }

          await db.insert(chatMessages).values({
            conversationId: convId,
            role: "assistant",
            content: [{ type: "text", text: assistantText }],
          });
        } catch (err) {
          log("db save error: %O", err);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    log("error: %O", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
