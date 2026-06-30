/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

/** 分析状态（数据不足降级，NC6）。所有 008 结果表共享。 */
export const DEGRADED_STATUSES = ['ok', 'degraded'] as const;
export type DegradedStatus = (typeof DEGRADED_STATUSES)[number];

/** What-if 情景种类（FR-001）。 */
export const SCENARIO_KINDS = [
  'income_cut',
  'rate_hike',
  'lump_expense',
  'unemployment',
  'custom',
] as const;
export type ScenarioKind = (typeof SCENARIO_KINDS)[number];

/**
 * 情景假设（NC2）。`incomeDeltaPct`+`durationMonths` 为降薪/失业口径；
 * `rateDeltaPct` 用于加息；`lumpExpense` 用于大额一次性支出。
 */
export interface ScenarioAssumptions {
  /** 月收入变动比例（如 -0.30 = 降薪 30%）；0 表示无影响。 */
  incomeDeltaPct: number;
  /** 变动持续月数（∈ [1, horizonMonths]，I1）。 */
  durationMonths: number;
  /** 房贷利率变动（百分点，如 0.5 = +0.5%）；null = 不涉及。 */
  rateDeltaPct?: number | null;
  /** 一次性大额支出（decimal 字符串）；null = 不涉及。 */
  lumpExpense?: string | null;
  /** 大额支出发生月（monthOffset）；null = 不涉及。 */
  affectedMonth?: number | null;
}

/**
 * 基线快照（NC7，可复现锚点）。记录计算时的净资产/结余画像，
 * 保证日后按同一快照可复算「当时的结论」。
 */
export interface BaselineSnapshot {
  /** 起点净资产（decimal 字符串）。 */
  netWorth: string;
  /** 历史月度结余序列（decimal 字符串，升序；复用 getPeriodMetrics 口径）。 */
  monthlySurpluses: string[];
  /** 基线应急金月数（cash+savings / 月支出；null = 无月支出数据）。 */
  emergencyMonths: number | null;
  /** 快照基准日（ISO date）。 */
  asOfDate: string;
}

/**
 * What-if 情景定义 + 基线快照（Phase 7，FR-001/SC-001）。
 * 纯函数投影引擎产出的逐月点存于 `finance_scenario_projections`。
 * 溯源四元组（NC7）：engineVersion + assumptions + baselineSnapshot + disclaimers。
 */
export const scenarios = pgTable(
  'finance_scenarios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    kind: varchar('kind', { length: 24 }).$type<ScenarioKind>().notNull(),
    assumptions: jsonb('assumptions').$type<ScenarioAssumptions>().notNull(),
    baselineSnapshot: jsonb('baseline_snapshot')
      .$type<BaselineSnapshot>()
      .notNull(),
    horizonMonths: integer('horizon_months').notNull(),
    engineVersion: varchar('engine_version', { length: 32 }).notNull(),
    status: varchar('status', { length: 16 })
      .$type<DegradedStatus>()
      .default('ok')
      .notNull(),
    missing: jsonb('missing').$type<string[]>().default([]).notNull(),
    disclaimers: jsonb('disclaimers').$type<string[]>().default([]).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('finance_scenarios_user_idx').on(t.userId)],
);

export type ScenarioItem = typeof scenarios.$inferSelect;
export type NewScenario = typeof scenarios.$inferInsert;
