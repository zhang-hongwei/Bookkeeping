/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * 预测点（纯函数产出，缓存于 series.points；金额 decimal 2 位字符串，禁浮点，I3/I4）。
 */
export interface ForecastPoint {
  /** YYYY-MM。 */
  month: string;
  /** 预测结余（decimal 字符串）。 */
  surplus: string;
  /** 预测期末现金资产（decimal 字符串）。 */
  cashBalance: string;
  /** 不确定性区间下界（decimal 字符串，决策 2/3）。 */
  lower: string;
  /** 不确定性区间上界（decimal 字符串）。 */
  upper: string;
}

/** 历史结余输入（预测的可追溯来源锚点，SC-002）。 */
export interface ForecastHistoryPoint {
  month: string;
  surplus: string;
}

/**
 * 预测序列（jsonb 快照）。`insufficientHistory=true` 时 points 为空（I3）。
 */
export interface ForecastSeries {
  points: ForecastPoint[];
  /** 首个应急金不足月（YYYY-MM）；无则 null（User Story 1）。 */
  emergencyShortfallMonth: string | null;
  /** 预测模型版本（可追溯，SC-002）。 */
  modelVersion: string;
  /** 历史结余输入（预测来源锚点；insufficientHistory 时为空）。 */
  history: ForecastHistoryPoint[];
}

/**
 * 现金流预测缓存（Phase 6，FR-001）。
 *
 * 预测本身是纯函数（决策 2）；此表缓存最近一次结果 + 降级标记，
 * 支持「最近一次预测」展示与 `(userId,targetMonth)` 幂等覆盖。
 */
export const cashFlowForecasts = pgTable(
  'finance_cash_flow_forecasts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    /** 预测基准月 YYYY-MM。 */
    targetMonth: varchar('target_month', { length: 7 }).notNull(),
    series: jsonb('series').$type<ForecastSeries>().notNull(),
    /** 历史不足降级标记（决策 3）。 */
    insufficientHistory: boolean('insufficient_history')
      .default(false)
      .notNull(),
    generatedAt: timestamp('generated_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('finance_cash_flow_forecasts_user_target_unique').on(
      t.userId,
      t.targetMonth,
    ),
  ],
);

export type CashFlowForecastItem = typeof cashFlowForecasts.$inferSelect;
export type NewCashFlowForecast = typeof cashFlowForecasts.$inferInsert;
