import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { aiWidgetApps } from "./ai-widget-apps";

// ==================== AI Widget Conversations ====================

export const aiWidgetConversations = pgTable(
  "ai_widget_conversations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `conv_${crypto.randomUUID().slice(0, 8)}`),
    appId: text("app_id")
      .references(() => aiWidgetApps.id, { onDelete: "cascade" })
      .notNull(),
    tenantId: text("tenant_id").notNull(),
    userId: text("user_id").notNull(),
    title: varchar("title", { length: 200 }),
    systemContext: jsonb("system_context").$type<Record<string, unknown>>(),
    lastMessageAt: timestamp("last_message_at"),
    messageCount: integer("message_count").default(0).notNull(),
    tokenUsage: jsonb("token_usage").$type<{
      input: number;
      output: number;
      total: number;
    }>(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("ai_widget_convs_tenant_user_app_idx").on(
      t.tenantId,
      t.userId,
      t.appId
    ),
    index("ai_widget_convs_last_message_idx").on(t.lastMessageAt),
  ]
);

export type AiWidgetConversation =
  typeof aiWidgetConversations.$inferSelect;
export type NewAiWidgetConversation =
  typeof aiWidgetConversations.$inferInsert;
