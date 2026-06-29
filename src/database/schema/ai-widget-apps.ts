import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

// ==================== AI Widget Apps ====================

export const aiWidgetApps = pgTable(
  "ai_widget_apps",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `app_${crypto.randomUUID().slice(0, 8)}`),
    tenantId: text("tenant_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 50 }),
    personaConfig: jsonb("persona_config").$type<{
      systemPrompt?: string;
      temperature?: number;
      model?: string;
    }>(),
    themeDefaults: jsonb("theme_defaults").$type<{
      primaryColor?: string;
      mode?: "light" | "dark";
      position?: string;
    }>(),
    features: jsonb("features").$type<{
      fileUpload?: boolean;
      multiConversation?: boolean;
      agentMode?: boolean;
    }>(),
    apiBaseUrl: varchar("api_base_url", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("ai_widget_apps_tenant_id_idx").on(t.tenantId),
    uniqueIndex("ai_widget_apps_slug_unique").on(t.slug),
  ]
);

export type AiWidgetApp = typeof aiWidgetApps.$inferSelect;
export type NewAiWidgetApp = typeof aiWidgetApps.$inferInsert;
