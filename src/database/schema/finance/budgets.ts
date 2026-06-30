/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  date,
  decimal,
  varchar,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

/**
 * 预算周期类型（Phase 5，D1）。
 * - month：当月 1 日 → 次月 1 日
 * - week：本周一 → 下周一（ISO 周）
 * - year：当年 1/1 → 次年 1/1
 */
export const BUDGET_PERIOD_TYPES = ['month', 'week', 'year'] as const;
export type BudgetPeriodType = (typeof BUDGET_PERIOD_TYPES)[number];

/** 预算状态（D3，阈值/超支）。 */
export const BUDGET_STATUSES = ['normal', 'warning', 'overrun'] as const;
export type BudgetStatus = (typeof BUDGET_STATUSES)[number];

/**
 * 预算设置（Phase 5，按分类、按周期复发）。
 * - categoryId 可空：NULL = 总支出预算；非空 = 该分类**子树**预算（D2）。
 *   逻辑指向 finance_categories.id（不加 FK 约束，与 transactions.categoryId 同策略）。
 * - 「本期已用」**读时现算**（D1，单一事实源），无物化 live 列。
 * - amount 改动仅影响当前+未来周期；历史快照锁定（D11/I3）。
 */
export const budgets = pgTable(
  'finance_budgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    /** 逻辑外键（无约束）→ finance_categories.id；NULL = 总支出预算。 */
    categoryId: uuid('category_id'),
    name: text('name'),
    /** 周期额度（>0）。 */
    amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
    periodType: varchar('period_type', { length: 8 })
      .$type<BudgetPeriodType>()
      .default('month')
      .notNull(),
    /** 预警阈值（0.00–1.00，默认 0.80，D10）。 */
    alertThreshold: decimal('alert_threshold', { precision: 3, scale: 2 })
      .default('0.80')
      .notNull(),
    /** 结转开关（D8，预留，本期不实现逻辑，恒 false）。 */
    rollover: boolean('rollover').default(false).notNull(),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('finance_budgets_user_active_idx').on(t.userId, t.active),
    // 防止同用户对同分类同周期重复建预算（NULL 视为互异，总支出预算由应用层查重）
    uniqueIndex('finance_budgets_user_category_period_unique').on(
      t.userId,
      t.categoryId,
      t.periodType,
    ),
  ],
);

/**
 * 预算周期历史快照（不可变，Phase 5 D11/I3/SC-005）。
 * - 周期关闭（自然到期/手动/AI 引用）时 upsert 一条；**写入后不可变**。
 * - amountSnapshot 锁定该周期生效额度；spentSnapshot 为关闭时算定的子树支出汇总（缓存，可复算校验）。
 * - 当前周期不写快照（D1 现算）。
 */
export const budgetPeriods = pgTable(
  'finance_budget_periods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    budgetId: uuid('budget_id')
      .references(() => budgets.id, { onDelete: 'cascade' })
      .notNull(),
    /** 冗余便于按用户直查（隔离热路径）。 */
    userId: text('user_id').notNull(),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    /** 该周期生效额度（锁定，D11）。 */
    amountSnapshot: decimal('amount_snapshot', { precision: 18, scale: 2 }).notNull(),
    spentSnapshot: decimal('spent_snapshot', { precision: 18, scale: 2 })
      .default('0')
      .notNull(),
    status: varchar('status', { length: 12 })
      .$type<BudgetStatus>()
      .notNull(),
    closedAt: timestamp('closed_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('finance_budget_periods_budget_period_unique').on(
      t.budgetId,
      t.periodStart,
    ),
    index('finance_budget_periods_user_period_idx').on(
      t.userId,
      t.periodStart,
      t.periodEnd,
    ),
  ],
);

/** 分类逻辑关联（无 FK 约束，仅用于 query API 关系展开）。 */
export type BudgetItem = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type BudgetPeriodItem = typeof budgetPeriods.$inferSelect;
export type NewBudgetPeriod = typeof budgetPeriods.$inferInsert;
