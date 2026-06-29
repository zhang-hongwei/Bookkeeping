import { db } from "@/database/client";
import { chatConversations, chatMessages } from "@/database/schema/chat";
import { eq, and, desc } from "drizzle-orm";

export async function listConversations(visitorId: string) {
  return db
    .select({
      id: chatConversations.id,
      title: chatConversations.title,
      createdAt: chatConversations.createdAt,
      updatedAt: chatConversations.updatedAt,
    })
    .from(chatConversations)
    .where(eq(chatConversations.visitorId, visitorId))
    .orderBy(desc(chatConversations.updatedAt));
}

export async function getConversation(id: string, visitorId: string) {
  const rows = await db
    .select({
      id: chatConversations.id,
      visitorId: chatConversations.visitorId,
      title: chatConversations.title,
      createdAt: chatConversations.createdAt,
      updatedAt: chatConversations.updatedAt,
    })
    .from(chatConversations)
    .where(and(eq(chatConversations.id, id), eq(chatConversations.visitorId, visitorId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createConversation(visitorId: string, title: string | null) {
  const [row] = await db
    .insert(chatConversations)
    .values({ visitorId, title })
    .returning({
      id: chatConversations.id,
      title: chatConversations.title,
      createdAt: chatConversations.createdAt,
      updatedAt: chatConversations.updatedAt,
    });
  return row;
}

export async function updateConversationTitle(id: string, visitorId: string, title: string) {
  const [row] = await db
    .update(chatConversations)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(chatConversations.id, id), eq(chatConversations.visitorId, visitorId)))
    .returning({
      id: chatConversations.id,
      title: chatConversations.title,
      updatedAt: chatConversations.updatedAt,
    });
  return row;
}

export async function deleteConversation(id: string, visitorId: string) {
  const [row] = await db
    .delete(chatConversations)
    .where(and(eq(chatConversations.id, id), eq(chatConversations.visitorId, visitorId)))
    .returning({ id: chatConversations.id });
  return row ?? null;
}

export async function getConversationMessages(id: string, visitorId: string) {
  const conv = await getConversation(id, visitorId);
  if (!conv) return null;

  return db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, id))
    .orderBy(chatMessages.createdAt);
}

export async function updateConversationTimestamp(id: string) {
  await db
    .update(chatConversations)
    .set({ updatedAt: new Date() })
    .where(eq(chatConversations.id, id));
}
