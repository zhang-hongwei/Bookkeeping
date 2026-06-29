import { db, isDatabaseEnabled } from "@/database/client";
import { chatConversations, chatMessages } from "@/database/schema/chat";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const visitorId = searchParams.get("visitorId");
  const conversationId = searchParams.get("conversationId");

  if (!visitorId) {
    return Response.json({ error: "visitorId is required" }, { status: 400 });
  }

  if (!isDatabaseEnabled()) {
    return Response.json({ messages: [] });
  }

  try {
    let targetConversationId = conversationId;

    // If no conversationId specified, load the most recent conversation
    if (!targetConversationId) {
      const recent = await db
        .select({ id: chatConversations.id })
        .from(chatConversations)
        .where(eq(chatConversations.visitorId, visitorId))
        .orderBy(desc(chatConversations.updatedAt))
        .limit(1);

      if (recent.length === 0) {
        return Response.json({ messages: [] });
      }
      targetConversationId = recent[0].id;
    }

    const messages = await db
      .select({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, targetConversationId))
      .orderBy(chatMessages.createdAt);

    const uiMessages = messages.map((m) => ({
      id: m.id,
      role: m.role,
      parts: m.content,
      createdAt: m.createdAt,
    }));

    return Response.json({ messages: uiMessages, conversationId: targetConversationId });
  } catch (err) {
    console.error("[chat/messages] error:", err);
    return Response.json({ messages: [] });
  }
}
