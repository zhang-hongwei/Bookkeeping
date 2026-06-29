import { index, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { aiWidgetConversations } from "./ai-widget-conversations";

// ==================== AI Widget Messages ====================

export const aiWidgetMessages = pgTable(
  "ai_widget_messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `msg_${crypto.randomUUID().slice(0, 8)}`),
    conversationId: text("conversation_id")
      .references(() => aiWidgetConversations.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant' | 'system'
    content: text("content").notNull(),
    tokenCount: integer("token_count"),
    modelUsed: varchar("model_used", { length: 50 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("ai_widget_msgs_conv_created_idx").on(t.conversationId, t.createdAt),
    index("ai_widget_msgs_conv_id_idx").on(t.conversationId),
  ]
);

export type AiWidgetMessage = typeof aiWidgetMessages.$inferSelect;
export type NewAiWidgetMessage = typeof aiWidgetMessages.$inferInsert;
