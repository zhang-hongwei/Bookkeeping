import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  index,
  real,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== Conversations Table ====================

export const chatConversations = pgTable(
  "chat_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitorId: text("visitor_id").notNull(),
    title: text("title"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("chat_conversations_visitor_id_idx").on(t.visitorId)]
);

// ==================== Messages Table ====================

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => chatConversations.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").notNull(), // 'user' | 'assistant'
    content: jsonb("content").notNull(), // [{type: 'text', text: '...'} | {type: 'image', image: '...'}]
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("chat_messages_conversation_id_idx").on(t.conversationId),
  ]
);

// ==================== Relations ====================

export const chatConversationsRelations = relations(
  chatConversations,
  ({ many }) => ({
    messages: many(chatMessages),
  })
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

// ==================== Settings Table ====================
// Global shared config — single row, no per-user isolation

export const chatSettings = pgTable(
  "chat_settings",
  {
    id: text("id").primaryKey().default("global"),
    host: text("host").default("http://183.222.230.10").notNull(),
    port: text("port").default("40073").notNull(),
    path: text("path").default("/v1").notNull(),
    authToken: text("auth_token").default("any").notNull(),
    model: text("model").default("qwen3.5-27b").notNull(),
    temperature: real("temperature").default(0.7).notNull(),
    topP: real("top_p").default(0.9).notNull(),
    topK: integer("top_k").default(50).notNull(),
    maxTokens: integer("max_tokens").default(4096).notNull(),
    frequencyPenalty: real("frequency_penalty").default(0).notNull(),
    presencePenalty: real("presence_penalty").default(0).notNull(),
    enableThinking: boolean("enable_thinking").default(false).notNull(),
    models: jsonb("models").$type<string[]>().default(["qwen3.5-27b", "qwen3-32b"]).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);
