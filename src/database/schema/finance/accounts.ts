/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  decimal,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * 账户类型
 * - cash / savings / investment / real_asset：资产类（借方增加，借方正常余额）
 * - credit / mortgage / car_loan / consumer_loan / borrowing：负债类（贷方增加，贷方正常余额，余额表示欠款）
 * - equity：系统权益账户（__income/__expense/__revaluation，仅作复式平衡对腿，user_id='__system__'，不计入净资产）
 */
export const ACCOUNT_TYPES = [
  'cash',
  'savings',
  'credit',
  'investment',
  'real_asset',
  // Phase 2：完整负债类型（贷方正常余额，balance 正值 = 欠款）
  'mortgage',
  'car_loan',
  'consumer_loan',
  'borrowing',
  'equity',
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

/** 资产类账户（借方正常余额） */
export const ASSET_ACCOUNT_TYPES: ReadonlyArray<AccountType> = [
  'cash',
  'savings',
  'investment',
  'real_asset',
];

/** 负债类账户（贷方正常余额，余额 = 欠款）。Phase 2 新增贷款类型。 */
export const LIABILITY_ACCOUNT_TYPES: ReadonlyArray<AccountType> = [
  'credit',
  'mortgage',
  'car_loan',
  'consumer_loan',
  'borrowing',
];

/** 资产类账户（含估值类实物/投资资产，需挂 asset_details）。 */
export const VALUATION_ACCOUNT_TYPES: ReadonlyArray<AccountType> = [
  'real_asset',
  'investment',
];

/**
 * 账户可见性（Phase 4，家庭共享范围，research.md 决策3）。
 * - shared：并入家庭合并视图与家庭净资产。
 * - private：仅个人可见，家庭视图不可见、不并入家庭净资产（私房钱，SC-002）。
 */
export const ACCOUNT_VISIBILITIES = ['shared', 'private'] as const;
export type AccountVisibility = (typeof ACCOUNT_VISIBILITIES)[number];

/** 系统权益账户类型（user_id 为空，全局共享，用户不可见） */
export const EQUITY_ACCOUNT_NAMES = {
  income: '__income',
  expense: '__expense',
  /** Phase 2：未实现损益桶（资产估值变动的对腿，区别于已实现 __income/__expense）。 */
  revaluation: '__revaluation',
} as const;

/**
 * 资金账户 —— 钱存放的位置。
 *
 * 注：表名加 `finance_` 前缀，避免与 NextAuth 的 `accounts` 表冲突。
 * `user_id` 为 Supabase userId 字符串（沿用 mealRecords 约定，不加 FK）。
 * `balance` 为物化余额，由 entries 在同一事务内原子维护。
 */
export const financeAccounts = pgTable('finance_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  type: varchar('type', { length: 20 }).$type<AccountType>().notNull(),
  currency: varchar('currency', { length: 8 }).default('CNY').notNull(),
  openingBalance: decimal('opening_balance', { precision: 18, scale: 2 })
    .default('0')
    .notNull(),
  balance: decimal('balance', { precision: 18, scale: 2 })
    .default('0')
    .notNull(),
  creditLimit: decimal('credit_limit', { precision: 18, scale: 2 }),
  includeInNetWorth: boolean('include_in_net_worth').default(true).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  // 系统权益账户标记（__income/__expense），普通账户为 null
  systemKey: varchar('system_key', { length: 32 }),
  // Phase 4：家庭共享范围（默认 shared，使合并视图开箱可用；隐私由加入同意 + 私有开关兑现）
  visibility: varchar('visibility', { length: 12 })
    .$type<AccountVisibility>()
    .default('shared')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AccountItem = typeof financeAccounts.$inferSelect;
export type NewAccount = typeof financeAccounts.$inferInsert;
