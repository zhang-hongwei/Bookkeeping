import { isDatabaseEnabled } from "@/database/client";
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversationTitle,
  deleteConversation,
  getConversationMessages,
} from "@/database/queries/chat-conversations";
import { eq } from "drizzle-orm";
import { db } from "@/database/client";
import { chatConversations } from "@/database/schema/chat";

export const ChatConversationService = {
  async list(visitorId: string) {
    if (!isDatabaseEnabled()) return [];
    return listConversations(visitorId);
  },

  async getById(id: string, visitorId: string) {
    if (!isDatabaseEnabled()) return null;
    return getConversation(id, visitorId);
  },

  async create(visitorId: string, title?: string | null) {
    if (!isDatabaseEnabled()) throw new Error("Database not available");
    return createConversation(visitorId, title ?? null);
  },

  async rename(id: string, visitorId: string, title: string) {
    if (!isDatabaseEnabled()) throw new Error("Database not available");
    return updateConversationTitle(id, visitorId, title);
  },

  async remove(id: string, visitorId: string) {
    if (!isDatabaseEnabled()) throw new Error("Database not available");
    return deleteConversation(id, visitorId);
  },

  async getMessages(id: string, visitorId: string) {
    if (!isDatabaseEnabled()) return null;
    return getConversationMessages(id, visitorId);
  },

  async findByVisitorAndId(conversationId: string, visitorId: string) {
    if (!isDatabaseEnabled()) return null;
    const rows = await db
      .select({ id: chatConversations.id })
      .from(chatConversations)
      .where(eq(chatConversations.id, conversationId))
      .limit(1);
    if (rows.length === 0) return null;

    const conv = await getConversation(conversationId, visitorId);
    return conv;
  },
};
