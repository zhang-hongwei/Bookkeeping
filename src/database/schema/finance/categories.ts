/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

/** 分类种类 */
export const CATEGORY_KINDS = ['income', 'expense', 'transfer'] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

/**
 * 收支分类。支持父子层级与关键字自动归类（导入/自然语言命中即归类）。
 */
export const categories = pgTable('finance_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  kind: varchar('kind', { length: 16 }).$type<CategoryKind>().notNull(),
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id, {
    onDelete: 'set null',
  }),
  keywords: jsonb('keywords').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type CategoryItem = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
