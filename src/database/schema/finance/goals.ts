/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  date,
  decimal,
  varchar,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

/**
 * 目标进度口径（Phase 5，D4，消除歧义）。
 * - manual：目标上的 manualAmount（用户手维护）
 * - linked：Σ linkedAccountIds 账号 balance
 * - net_worth：总净资产（computeNetWorthLive）
 */
export const GOAL_PROGRESS_BASES = ['manual', 'linked', 'net_worth'] as const;
export type GoalProgressBasis = (typeof GOAL_PROGRESS_BASES)[number];

/** 目标状态（用户操作；completed 为派生：progressRate≥1，不入此枚举）。 */
export const GOAL_STATUSES = ['active', 'archived'] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

/**
 * 储蓄目标（Phase 5）。
 * - currentAmount / progressRate / eta 均为**派生**（D4/D5，单一事实源），不落库。
 * - targetDate 可空：NULL = 开放式目标（应急金），只显进度不估 ETA（D5 edge）。
 * - completedAt：首次达到 100% 时记录（事件标记，C4）；completed 始终为派生标志。
 */
export const goals = pgTable(
  'finance_goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    targetAmount: decimal('target_amount', { precision: 18, scale: 2 }).notNull(),
    /** 可空：NULL = 开放式目标，不估 ETA。 */
    targetDate: date('target_date'),
    progressBasis: varchar('progress_basis', { length: 12 })
      .$type<GoalProgressBasis>()
      .default('manual')
      .notNull(),
    /** basis='linked' 时生效；账号 id 数组（手动按 id 查 accounts，不做关系展开）。 */
    linkedAccountIds: jsonb('linked_account_ids')
      .$type<string[]>()
      .default([])
      .notNull(),
    manualAmount: decimal('manual_amount', { precision: 18, scale: 2 })
      .default('0')
      .notNull(),
    notes: text('notes'),
    status: varchar('status', { length: 12 })
      .$type<GoalStatus>()
      .default('active')
      .notNull(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('finance_goals_user_status_idx').on(t.userId, t.status)],
);

export type GoalItem = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
