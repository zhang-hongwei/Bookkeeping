import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const githubSettings = pgTable('github_settings', {
  id: text('id').primaryKey().default('global'),
  githubToken: text('github_token').notNull(),
  validatedAt: timestamp('validated_at'),
  validatedUsername: text('validated_username'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertGithubSettingsSchema = createInsertSchema(githubSettings);
export type NewGithubSettings = typeof githubSettings.$inferInsert;
export type GithubSettingsItem = typeof githubSettings.$inferSelect;
