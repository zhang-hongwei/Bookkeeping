import { db } from '@/database/client';
import { chatSettings } from '@/database/schema/chat';
import { sql } from 'drizzle-orm';
import type { ServiceResponse } from '@/types/palette';

const DEFAULT_SETTINGS = {
  host: "http://183.222.230.10",
  port: "40073",
  path: "/v1",
  authToken: "any",
  model: "qwen3.5-27b",
  temperature: 0.7,
  topP: 0.9,
  topK: 50,
  maxTokens: 4096,
  frequencyPenalty: 0,
  presencePenalty: 0,
  enableThinking: false,
  models: ["qwen3.5-27b", "qwen3-32b"],
};

type SettingsRow = typeof chatSettings.$inferSelect;

class ChatSettingsService {
  private async ensureTable() {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "chat_settings" (
        "id" text PRIMARY KEY DEFAULT 'global',
        "host" text NOT NULL DEFAULT 'http://183.222.230.10',
        "port" text NOT NULL DEFAULT '40073',
        "path" text NOT NULL DEFAULT '/v1',
        "auth_token" text NOT NULL DEFAULT 'any',
        "model" text NOT NULL DEFAULT 'qwen3.5-27b',
        "temperature" real NOT NULL DEFAULT 0.7,
        "top_p" real NOT NULL DEFAULT 0.9,
        "top_k" integer NOT NULL DEFAULT 50,
        "max_tokens" integer NOT NULL DEFAULT 4096,
        "frequency_penalty" real NOT NULL DEFAULT 0,
        "presence_penalty" real NOT NULL DEFAULT 0,
        "enable_thinking" boolean NOT NULL DEFAULT false,
        "models" jsonb NOT NULL DEFAULT '["qwen3.5-27b","qwen3-32b"]',
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);
  }

  async getSettings(): Promise<ServiceResponse<SettingsRow>> {
    try {
      await this.ensureTable();

      const rows = await db.select().from(chatSettings).limit(1);

      if (rows[0]) {
        return { success: true, data: rows[0] };
      }

      const defaults: SettingsRow = {
        id: "global",
        ...DEFAULT_SETTINGS,
        updatedAt: new Date(),
      };
      return { success: true, data: defaults };
    } catch (error) {
      console.error('[chat-settings] getSettings error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : '';
      return { success: false, error: `${msg}${cause ? ' | cause: ' + cause : ''}`, code: 500 };
    }
  }

  async upsertSettings(
    data: Partial<Omit<SettingsRow, 'id' | 'updatedAt'>>,
  ): Promise<ServiceResponse<SettingsRow>> {
    try {
      await this.ensureTable();

      const merged = { ...DEFAULT_SETTINGS, ...data, updatedAt: new Date() };

      const [row] = await db
        .insert(chatSettings)
        .values({ id: "global", ...merged })
        .onConflictDoUpdate({
          target: chatSettings.id,
          set: merged,
        })
        .returning();

      return { success: true, data: row };
    } catch (error) {
      console.error('[chat-settings] upsertSettings error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : '';
      return { success: false, error: `${msg}${cause ? ' | cause: ' + cause : ''}`, code: 500 };
    }
  }
}

export const chatSettingsService = new ChatSettingsService();
