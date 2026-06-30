/**
 * 多期趋势对比服务（Phase 6，FR-005 / SC-004）。
 *
 * 纯函数聚合既有数据（research.md 决策 13）：listReports（按期带 score）+
 * 各期 finance_rule_findings（savings_rate/debt_ratio/emergency_months）→
 * 按期排序的指标时序 + 方向（↑/↓/平稳）+ 显著恶化标记（复用决策 10 趋势规则）。
 *
 * - 不新建时序表、不另起口径：值与各期报告/finding 结论一致（SC-004）。
 * - 金额/比率一律 decimal 字符串直通（I4，禁浮点重算）。
 * - 只读复用 report/finding 仓库（不写）。
 */
import { reportRepository } from '@/repositories/finance/report.repository';
import { findingRepository } from '@/repositories/finance/finding.repository';
import { monthKey } from './rules-engine.service';
import {
  isConsecutiveTrend,
  trendDirection,
  type TrendDirection,
} from './rules-engine.service';

/** 趋势对比支持的指标（contracts/api.md §6.1）。 */
export const TREND_METRICS = [
  'savings_rate',
  'debt_ratio',
  'emergency_months',
  'score',
] as const;
export type TrendMetricParam = (typeof TREND_METRICS)[number];

/** 默认回看期数（可由 ?periods= 覆盖）。 */
export const DEFAULT_TREND_PERIODS = 12;
/** 趋势回看期数上限。 */
export const MAX_TREND_PERIODS = 24;

export interface TrendPointDTO {
  period: string; // YYYY-MM
  value: string; // decimal 字符串（直通 finding/report，禁重算）
}

export interface TrendSeries {
  metric: string;
  points: TrendPointDTO[];
  direction: TrendDirection;
  deteriorating: boolean;
}

export interface TrendView {
  series: TrendSeries[];
}

/**
 * 「越高越好」的指标：下降即恶化；「越低越好」（debt_ratio）：上升即恶化。
 * score/savings_rate/emergency_months 越高越好；debt_ratio 越低越好。
 */
function deteriorationDir(metric: TrendMetricParam): 'down' | 'up' {
  return metric === 'debt_ratio' ? 'up' : 'down';
}

/**
 * 纯函数：单指标时序 → 方向 + 显著恶化标记（决策 10/13）。
 * - points 按期升序；value 为 null 的点不计入方向/恶化判定，也不进输出（保持时序为实测值）。
 * - deteriorating 复用 isConsecutiveTrend（连续 TREND_DECLINE_PERIODS 期恶化方向）。
 * - 输出 value 原样直通（SC-004 与各期结论一致、I4 decimal）。
 */
export function computeTrendMetricSeries(
  metric: TrendMetricParam,
  points: { period: string; value: string | null }[],
): TrendSeries {
  const present = points.filter((p) => p.value != null && p.value !== '');
  const numeric = present.map((p) => Number(p.value));
  return {
    metric,
    points: present.map((p) => ({ period: p.period, value: p.value as string })),
    direction: trendDirection(numeric),
    deteriorating: isConsecutiveTrend(numeric, deteriorationDir(metric)),
  };
}

/**
 * 取近 `periods` 期报告周期（按期升序，去重保留最新生成的一份）。
 * 报告按 generatedAt desc 返回；按 periodStart 去重后取最近 N 期再升序。
 */
function recentReportPeriods(
  reports: ReadonlyArray<{
    periodStart: string;
    periodEnd: string;
    score: string | null;
    generatedAt: Date;
  }>,
  periods: number,
): { periodStart: string; periodEnd: string; score: string | null; month: string }[] {
  const latestByStart = new Map<
    string,
    { periodStart: string; periodEnd: string; score: string | null; generatedAt: Date }
  >();
  for (const r of reports) {
    const cur = latestByStart.get(r.periodStart);
    if (!cur || r.generatedAt.getTime() > cur.generatedAt.getTime()) {
      latestByStart.set(r.periodStart, {
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        score: r.score,
        generatedAt: r.generatedAt,
      });
    }
  }
  return [...latestByStart.values()]
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
    .slice(-periods)
    .map((r) => ({ ...r, month: monthKey(r.periodStart) }));
}

/**
 * 多期趋势对比（决策 13）。
 * - 聚合 listReports + 各期 findings；按指标产出时序 + 方向 + deteriorating。
 * - metrics/score 来自报告；savings_rate/debt_ratio/emergency_months 来自 findings。
 */
export async function getTrends(
  userId: string,
  opts: { metrics: TrendMetricParam[]; periods?: number },
): Promise<TrendView> {
  const periods = Math.max(
    1,
    Math.min(MAX_TREND_PERIODS, opts.periods ?? DEFAULT_TREND_PERIODS),
  );
  const metrics = opts.metrics.length > 0 ? opts.metrics : ([...TREND_METRICS] as TrendMetricParam[]);

  const reports = await reportRepository(userId).list();
  const periodRows = recentReportPeriods(reports, periods);
  if (periodRows.length === 0) {
    return { series: [] };
  }

  // 报告 score 时序（score 来自 ai_reports，非 findings）
  const scoreByMonth = new Map<string, string | null>(
    periodRows.map((r) => [r.month, r.score]),
  );

  // findings 时序：按 (month, metric) 索引
  const findings = await findingRepository(userId).listByPeriodStarts(
    periodRows.map((r) => r.periodStart),
  );
  const valueByMonthMetric = new Map<string, string | null>();
  for (const f of findings) {
    valueByMonthMetric.set(`${monthKey(f.periodStart)}|${f.metric}`, f.value);
  }

  const months = periodRows.map((r) => r.month);
  const series: TrendSeries[] = metrics.map((metric) => {
    const points = months.map((month) => ({
      period: month,
      value:
        metric === 'score'
          ? (scoreByMonth.get(month) ?? null)
          : (valueByMonthMetric.get(`${month}|${metric}`) ?? null),
    }));
    return computeTrendMetricSeries(metric, points);
  });

  return { series };
}
