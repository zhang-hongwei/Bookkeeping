/**
 * 规则引擎（US3/US4）：确定性纯函数，可审计、零幻觉。
 *
 * - computeFindingsFromData：周期收支/储蓄率/负债率/应急金（转账不计收支，research R3）。
 * - computeHealthScore：findings 加权 0–100 + 雷达图维度（缺失维度降权，research R8）。
 *
 * 纯函数导出供单测；service 层 computeFindings/computeHealthScoreForUser 负责取数后调用。
 */
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/database/client';
import { transactions } from '@/database/schema/finance';
import {
  type FindingMetric,
  type RiskLevel,
} from '@/database/schema/finance';
import { toCents, fromCents, addCents } from './money';
import { computeNetWorthAtDate } from './net-worth.service';

// ============ Phase 6 标定常量（research.md 决策 2/3/10/12）============
//
// 阈值/口径不预先固化；以具名常量集中，临近实施按真实数据标定。

/** 现金流预测：可靠预测所需的最少历史月数（决策 3）。 */
export const MIN_HISTORY_MONTHS = 3;
/** 现金流预测：向前预测的月数（决策 2）。 */
export const FORECAST_HORIZON_MONTHS = 3;
/** 现金流预测：回归/季节拟合的历史回看月数（决策 2）。 */
export const LOOKBACK_MONTHS = 6;
/** 健康分现金流稳定性：回看窗口月数（决策 12）。 */
export const STABILITY_WINDOW = 6;
/** 趋势预警：连续下降期数阈值（决策 10）。 */
export const TREND_DECLINE_PERIODS = 3;

export interface PeriodRange {
  start: string; // YYYY-MM-DD
  end: string;
}

export interface PeriodMetrics {
  incomeTotal: string;
  expenseTotal: string;
  totalAssets: string;
  totalLiabilities: string;
  cashAssets: string; // 应急金口径：cash + savings
}

export interface FindingData {
  metric: FindingMetric;
  value: string | null;
  verdict: string;
  riskLevel: RiskLevel;
}

/** 储蓄率（0–1，可负）→ 判定。 */
function savingsVerdict(rate: number): { verdict: string; riskLevel: RiskLevel } {
  if (rate < 0) return { verdict: '入不敷出', riskLevel: 'high' };
  if (rate >= 0.3) return { verdict: '储蓄良好', riskLevel: 'none' };
  if (rate >= 0.1) return { verdict: '储蓄尚可', riskLevel: 'low' };
  return { verdict: '储蓄偏低', riskLevel: 'medium' };
}

function debtVerdict(ratio: number): { verdict: string; riskLevel: RiskLevel } {
  if (ratio <= 0.3) return { verdict: '负债健康', riskLevel: 'none' };
  if (ratio <= 0.6) return { verdict: '负债偏高', riskLevel: 'medium' };
  return { verdict: '负债过高', riskLevel: 'high' };
}

function emergencyVerdict(months: number): { verdict: string; riskLevel: RiskLevel } {
  if (months >= 6) return { verdict: '应急金充足', riskLevel: 'none' };
  if (months >= 3) return { verdict: '应急金尚可', riskLevel: 'low' };
  return { verdict: '应急金不足', riskLevel: 'high' };
}

/**
 * 纯函数：由周期指标计算全部 findings。
 * - savings_rate = surplus / income（income=0 → null + 标注）。
 * - debt_ratio = liabilities / assets（周期末）。
 * - emergency_months = cashAssets / expenseTotal（单月口径）。
 */
export function computeFindingsFromData(m: PeriodMetrics): FindingData[] {
  const income = toCents(m.incomeTotal);
  const expense = toCents(m.expenseTotal);
  const surplus = income - expense;
  const assets = toCents(m.totalAssets);
  const liab = toCents(m.totalLiabilities);
  const cash = toCents(m.cashAssets);
  const out: FindingData[] = [];

  out.push({
    metric: 'income_total',
    value: fromCents(income),
    verdict: income > 0 ? '本期有收入' : '本期无收入',
    riskLevel: 'none',
  });
  out.push({
    metric: 'expense_total',
    value: fromCents(expense),
    verdict: expense > 0 ? '本期有支出' : '本期无支出',
    riskLevel: 'none',
  });
  out.push({
    metric: 'surplus',
    value: fromCents(surplus),
    verdict: surplus >= 0 ? '本期结余' : '本期透支',
    riskLevel: surplus < 0 ? 'high' : 'none',
  });

  if (income > 0) {
    const rate = surplus / income;
    const v = savingsVerdict(rate);
    out.push({ metric: 'savings_rate', value: rate.toFixed(4), verdict: v.verdict, riskLevel: v.riskLevel });
  } else {
    out.push({
      metric: 'savings_rate',
      value: null,
      verdict: '无收入，无法计算储蓄率',
      riskLevel: 'medium',
    });
  }

  if (assets > 0) {
    const ratio = liab / assets;
    const v = debtVerdict(ratio);
    out.push({ metric: 'debt_ratio', value: ratio.toFixed(4), verdict: v.verdict, riskLevel: v.riskLevel });
  } else {
    out.push({
      metric: 'debt_ratio',
      value: liab > 0 ? '1.0000' : '0.0000',
      verdict: liab > 0 ? '资不抵债' : '无负债',
      riskLevel: liab > 0 ? 'high' : 'none',
    });
  }

  if (expense > 0) {
    const months = cash / expense;
    const v = emergencyVerdict(months);
    out.push({ metric: 'emergency_months', value: months.toFixed(2), verdict: v.verdict, riskLevel: v.riskLevel });
  } else {
    out.push({
      metric: 'emergency_months',
      value: null,
      verdict: '无支出数据，无法估算应急金',
      riskLevel: 'none',
    });
  }

  return out;
}

/** 查询周期内某类型的交易金额合计（转账 type=transfer 不计入收支）。 */
async function sumAmountByType(
  userId: string,
  type: 'income' | 'expense',
  period: PeriodRange,
): Promise<string> {
  const [row] = await db
    .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, type),
        gte(transactions.occurredAt, new Date(period.start + 'T00:00:00Z')),
        lte(transactions.occurredAt, new Date(period.end + 'T23:59:59Z')),
      ),
    );
  return row?.total ?? '0';
}

/** 取周期指标（income/expense 聚合 + 周期末快照）。转账不计收支。 */
export async function getPeriodMetrics(
  userId: string,
  period: PeriodRange,
): Promise<PeriodMetrics> {
  const [incomeTotal, expenseTotal] = await Promise.all([
    sumAmountByType(userId, 'income', period),
    sumAmountByType(userId, 'expense', period),
  ]);
  const nw = await computeNetWorthAtDate(userId, period.end);
  const cashAssets = fromCents(addCents(nw.breakdown.cash ?? '0', nw.breakdown.savings ?? '0'));
  return {
    incomeTotal,
    expenseTotal,
    totalAssets: nw.totalAssets,
    totalLiabilities: nw.totalLiabilities,
    cashAssets,
  };
}

/** 取周期指标并计算 findings（即时、确定性、可复现）。 */
export async function computeFindings(
  userId: string,
  period: PeriodRange,
): Promise<FindingData[]> {
  return computeFindingsFromData(await getPeriodMetrics(userId, period));
}

// ============ 月度迭代（Phase 6：预测回看 / 现金流稳定性 / 趋势）============

/** (year, monthIdx 0-based) ± delta → 规范化（处理跨年）。 */
function addMonths(
  year: number,
  monthIdx: number,
  delta: number,
): { year: number; monthIdx: number } {
  const total = year * 12 + monthIdx + delta;
  return {
    year: Math.floor(total / 12),
    monthIdx: ((total % 12) + 12) % 12,
  };
}

/** 某月的完整周期 [首日 00:00Z, 末日 23:59:59Z]（YYYY-MM-DD）。 */
function monthRange(year: number, monthIdx: number): PeriodRange {
  const start = new Date(Date.UTC(year, monthIdx, 1));
  const end = new Date(Date.UTC(year, monthIdx + 1, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

/** 由 YYYY-MM-DD 解析 (year, monthIdx 0-based)。 */
function parseYearMonth(date: string): { year: number; monthIdx: number } {
  const [y, m] = date.split('-');
  return { year: Number(y), monthIdx: Number(m) - 1 };
}

/**
 * 取截止 `period.end` 所在月的最近 `months` 个月的月度结余序列（已过滤转账）。
 * - 用于现金流稳定性评分（决策 12）与预测历史输入（决策 2）。
 * - 返回按时间升序的金额字符串数组（decimal 2 位）。
 */
export async function getSurplusSeries(
  userId: string,
  period: PeriodRange,
  months: number,
): Promise<string[]> {
  const { year, monthIdx } = parseYearMonth(period.end);
  const ranges: PeriodRange[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const m = addMonths(year, monthIdx, -i);
    ranges.push(monthRange(m.year, m.monthIdx));
  }
  const pairs = await Promise.all(
    ranges.map((r) =>
      Promise.all([
        sumAmountByType(userId, 'income', r),
        sumAmountByType(userId, 'expense', r),
      ]),
    ),
  );
  return pairs.map(([inc, exp]) => fromCents(toCents(inc) - toCents(exp)));
}

/**
 * 取截止 `period.end` 所在月的最近 `months` 个月的月均支出（已过滤转账）。
 * - 用于预测应急金阈值（决策 2）。
 * - 返回 decimal 字符串；无支出数据返回 '0'。
 */
export async function getMonthlyExpenseAverage(
  userId: string,
  period: PeriodRange,
  months: number,
): Promise<string> {
  const { year, monthIdx } = parseYearMonth(period.end);
  const ranges: PeriodRange[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const m = addMonths(year, monthIdx, -i);
    ranges.push(monthRange(m.year, m.monthIdx));
  }
  const expenses = await Promise.all(
    ranges.map((r) => sumAmountByType(userId, 'expense', r)),
  );
  const totalCents = expenses.reduce((s, e) => s + toCents(e), 0);
  return fromCents(Math.round(totalCents / months));
}

/** 由 YYYY-MM-DD 取其所属月份的 `YYYY-MM` 标识。 */
export function monthKey(date: string): string {
  return date.slice(0, 7);
}

/** 由 YYYY-MM 构造该月完整周期 PeriodRange（首日..末日，YYYY-MM-DD）。 */
export function monthPeriod(month: string): PeriodRange {
  const [y, m] = month.split('-').map(Number);
  return monthRange(y, m - 1);
}

/** 由 YYYY-MM 平移 delta 月，返回目标月的 YYYY-MM。 */
export function shiftMonthKey(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const r = addMonths(y, m - 1, delta);
  return `${r.year}-${String(r.monthIdx + 1).padStart(2, '0')}`;
}

// ============ 健康分（US4）============

export interface DimensionScore {
  value: string | null;
  score?: number | null;
  reason?: string;
}

export interface HealthScore {
  total: string; // 0–100
  dimensions: {
    savingsRate: DimensionScore;
    debtRatio: DimensionScore;
    emergency: DimensionScore;
    investmentRate: DimensionScore;
    cashflow: DimensionScore;
  };
}

interface WeightedDim {
  key: keyof HealthScore['dimensions'];
  weight: number;
  score: number;
}

/**
 * 现金流稳定性评分（0–100，纯函数；决策 12）。
 * - 输入按时间升序的月度结余序列（cents）。
 * - 综合：非负月占比（不透支可靠性）+ 低变异系数（稳定度）− 下降趋势惩罚。
 * - 单点序列退化为正负二元（向后兼容 Phase 1）。
 */
export function cashflowStabilityScore(seriesCents: number[]): {
  score: number;
  value: string;
} {
  const n = seriesCents.length;
  if (n === 0) return { score: 50, value: '0' };
  const latest = seriesCents[n - 1];
  if (n === 1) {
    return { score: latest >= 0 ? 100 : 30, value: fromCents(latest) };
  }
  const mean = seriesCents.reduce((s, x) => s + x, 0) / n;
  const nonNegRatio = seriesCents.filter((x) => x >= 0).length / n;
  const variance =
    seriesCents.reduce((s, x) => s + (x - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  // 变异系数：mean<=0 视为高波动（cv=1）
  const cv = mean > 0 ? std / mean : 1;
  const stability = Math.max(0, 1 - Math.min(cv, 1));
  // 趋势：后半均值 vs 前半均值，下降幅度归一到 [0,1]
  const half = Math.floor(n / 2);
  const firstHalf =
    seriesCents.slice(0, half).reduce((s, x) => s + x, 0) / Math.max(half, 1);
  const secondHalf =
    seriesCents.slice(half).reduce((s, x) => s + x, 0) / Math.max(n - half, 1);
  const declining =
    secondHalf < firstHalf
      ? Math.min(
          (firstHalf - secondHalf) / (Math.abs(firstHalf) + 1),
          1,
        )
      : 0;
  // base = 非负占比×70 + 稳定度×20 − 下降惩罚×20，钳制 [20,100]
  let score = nonNegRatio * 70 + stability * 20 - declining * 20;
  score = Math.max(20, Math.min(100, Math.round(score)));
  return { score, value: fromCents(latest) };
}

/** computeHealthScore 的可选增强输入（Phase 6，决策 12）。 */
export interface HealthScoreOptions {
  /** 投资资产（Phase 3 持仓市值合计；与 totalAssets 同口径，decimal 字符串）。 */
  investmentAssets?: string;
  /** 总资产（findings 同期 totalAssets）。 */
  totalAssets?: string;
  /** 近 STABILITY_WINDOW 期月度结余序列（decimal 字符串，升序）；缺省退化为 surplus 单点。 */
  surplusSeries?: string[];
}

/**
 * 纯函数：由 findings 加权得健康分；缺失维度（无数据维度）降权重分配，不编造。
 * - investmentRate：接 Phase 3 持仓（investmentAssets / totalAssets，决策 12）；缺数据降权。
 * - cashflow：近 STABILITY_WINDOW 月结余的方差稳定性评分（决策 12）。
 */
export function computeHealthScore(
  findings: FindingData[],
  options?: HealthScoreOptions,
): HealthScore {
  const byMetric = new Map(findings.map((f) => [f.metric, f]));
  const dims = {
    savingsRate: { value: null as string | null, score: null as number | null } as DimensionScore,
    debtRatio: { value: null as string | null, score: null as number | null } as DimensionScore,
    emergency: { value: null as string | null, score: null as number | null } as DimensionScore,
    investmentRate: { value: null as string | null, score: null as number | null } as DimensionScore,
    cashflow: { value: null as string | null, score: null as number | null } as DimensionScore,
  };

  const present: WeightedDim[] = [];

  const savings = byMetric.get('savings_rate');
  if (savings?.value != null) {
    const rate = Number(savings.value);
    const score = rate >= 0.3 ? 100 : rate >= 0.1 ? 70 : rate >= 0 ? 40 : 10;
    dims.savingsRate = { value: savings.value, score };
    present.push({ key: 'savingsRate', weight: 25, score });
  } else {
    dims.savingsRate = { value: null, score: null, reason: savings?.verdict ?? 'no_data' };
  }

  const debt = byMetric.get('debt_ratio');
  if (debt?.value != null) {
    const r = Number(debt.value);
    const score = r <= 0.3 ? 100 : r <= 0.6 ? 60 : 20;
    dims.debtRatio = { value: debt.value, score };
    present.push({ key: 'debtRatio', weight: 25, score });
  } else {
    dims.debtRatio = { value: null, score: null, reason: 'no_data' };
  }

  const emergency = byMetric.get('emergency_months');
  if (emergency?.value != null) {
    const em = Number(emergency.value);
    const score = em >= 6 ? 100 : em >= 3 ? 60 : 20;
    dims.emergency = { value: emergency.value, score };
    present.push({ key: 'emergency', weight: 20, score });
  } else {
    dims.emergency = { value: null, score: null, reason: emergency?.verdict ?? 'no_data' };
  }

  // 投资率：接 Phase 3 持仓（决策 12）。investmentAssets/totalAssets 缺省 → 降权。
  const totalAssetsCents = toCents(options?.totalAssets ?? '0');
  if (
    options?.investmentAssets != null &&
    options.totalAssets != null &&
    totalAssetsCents > 0
  ) {
    const rate = toCents(options.investmentAssets) / totalAssetsCents;
    const score = rate >= 0.3 ? 100 : rate >= 0.1 ? 70 : rate > 0 ? 45 : 35;
    dims.investmentRate = { value: rate.toFixed(4), score };
    present.push({ key: 'investmentRate', weight: 15, score });
  } else {
    dims.investmentRate = {
      value: null,
      score: null,
      reason: options?.totalAssets != null && totalAssetsCents === 0
        ? 'no_assets'
        : 'no_position_data',
    };
  }

  // 现金流：近窗口结余的方差稳定性（决策 12）；无序列退化为 surplus 单点。
  const surplus = byMetric.get('surplus');
  const seriesCents = (options?.surplusSeries ?? [surplus?.value ?? '0']).map((s) =>
    toCents(s),
  );
  const cf = cashflowStabilityScore(seriesCents);
  dims.cashflow = { value: cf.value, score: cf.score };
  present.push({ key: 'cashflow', weight: 15, score: cf.score });

  // 缺失维度降权：权重重分配到 present 维度（按各自权重归一化）
  const weightSum = present.reduce((s, d) => s + d.weight, 0);
  const weightedScore = present.reduce((s, d) => s + d.score * d.weight, 0);
  const total = weightSum > 0 ? weightedScore / weightSum : 0;

  return { total: total.toFixed(2), dimensions: dims };
}

/**
 * 取数 + 计算完善后健康分（Phase 6，FR-006）。
 * - investmentRate：接 Phase 3 持仓（breakdown.investment / totalAssets）。
 * - cashflow：近 STABILITY_WINDOW 月结余方差稳定性。
 */
export async function computeHealthScoreForUser(
  userId: string,
  period: PeriodRange,
): Promise<HealthScore> {
  const metrics = await getPeriodMetrics(userId, period);
  const findings = computeFindingsFromData(metrics);
  const nw = await computeNetWorthAtDate(userId, period.end);
  const surplusSeries = await getSurplusSeries(userId, period, STABILITY_WINDOW);
  return computeHealthScore(findings, {
    investmentAssets: nw.breakdown.investment ?? '0',
    totalAssets: metrics.totalAssets,
    surplusSeries,
  });
}

// ============ 集中度预警（Phase 3，US4，FR-007/SC-005）============

export interface ConcentrationAlert {
  code: 'CONCENTRATION';
  severity: 'warn';
  message: string;
  threshold: string;
  ratio: string;
}

/**
 * 纯函数：单一持仓集中度预警。
 * - 取所有持仓中最大单一市值占比；超过阈值（默认 60%，可配）→ 返回 warn 提示。
 * - **仅提示，不代为操作**（设计 §9）；阈值可配（research.md R9）。
 * - 总市值为 0 或持仓不足 → 无预警。
 */
export function computeConcentrationAlert(
  positions: ReadonlyArray<{ marketValue: string }>,
  threshold = 0.6,
): ConcentrationAlert | null {
  const total = positions.reduce((s, p) => s + toCents(p.marketValue), 0);
  if (total <= 0 || positions.length === 0) return null;
  const max = positions.reduce((m, p) => Math.max(m, toCents(p.marketValue)), 0);
  const ratio = max / total;
  if (ratio <= threshold) return null;
  return {
    code: 'CONCENTRATION',
    severity: 'warn',
    message: `单一持仓占比 ${(ratio * 100).toFixed(1)}% 超过阈值 ${(
      threshold * 100
    ).toFixed(0)}%，集中度偏高（仅提示，不代为操作）`,
    threshold: threshold.toFixed(6),
    ratio: ratio.toFixed(6),
  };
}

// ============ 趋势规则（Phase 6，决策 10 / 决策 13）============
//
// 纯函数：在多期 FindingData / 报告分之上产出趋势结论（metric=trend_*），沿用
// FindingData 形状，无缝并入预警（alert.service）与趋势对比（trend.service）。
// 不落单期 findings 表——趋势跨多期；调用方按需即时计算（决策 13：纯函数聚合）。

/** 趋势方向（↑/↓/平稳）。 */
export type TrendDirection = 'up' | 'down' | 'flat';

/** 时序点：期次（YYYY-MM）+ 数值（升序）。 */
export interface TrendPoint {
  period: string;
  value: number;
}

/**
 * 趋势结论：沿用 FindingData 形状（metric=trend_*）+ 关联期次锚点（I1 可追溯）。
 * - periods：触发下降的连续期次，作为 ruleFindingRefs 的可追溯来源。
 */
export interface TrendFinding extends FindingData {
  /** 触发该趋势结论的期次（YYYY-MM[]），用于可追溯锚点。 */
  periods: string[];
}

/**
 * 纯函数：判定数值序列末尾是否连续 `periods` 期沿 `dir` 方向单调变动（决策 10）。
 * - dir='down'：严格递减（每期 < 上期）；dir='up'：严格递增。
 * - 序列长度不足 → false（不编造趋势）。
 */
export function isConsecutiveTrend(
  series: number[],
  dir: 'down' | 'up',
  periods: number = TREND_DECLINE_PERIODS,
): boolean {
  if (series.length < periods || periods < 2) return false;
  const tail = series.slice(-periods);
  for (let i = 1; i < tail.length; i++) {
    if (dir === 'down' && !(tail[i] < tail[i - 1])) return false;
    if (dir === 'up' && !(tail[i] > tail[i - 1])) return false;
  }
  return true;
}

/**
 * 纯函数：由数值序列推断方向（↑/↓/平稳，决策 13）。
 * - 比较首末两点；不足两点 → 平稳。
 */
export function trendDirection(series: number[]): TrendDirection {
  if (series.length < 2) return 'flat';
  const first = series[0];
  const last = series[series.length - 1];
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'flat';
}

/**
 * 纯函数：多期储蓄率 / 健康分序列 → 趋势结论（决策 10）。
 * - 储蓄率连续 TREND_DECLINE_PERIODS 期下降 → trend_savings_decline（high）。
 * - 健康分连续下降 → trend_health_decline（high）。
 * - 无显著恶化 → 空数组（不编造）。
 */
export function computeTrendFindings(input: {
  savingsRate: TrendPoint[];
  healthScore: TrendPoint[];
}): TrendFinding[] {
  const out: TrendFinding[] = [];

  const savingsVals = input.savingsRate.map((p) => p.value);
  if (isConsecutiveTrend(savingsVals, 'down')) {
    const pts = input.savingsRate.slice(-TREND_DECLINE_PERIODS);
    out.push({
      metric: 'trend_savings_decline',
      value: null,
      verdict: `储蓄率连续 ${TREND_DECLINE_PERIODS} 期下降`,
      riskLevel: 'high',
      periods: pts.map((p) => p.period),
    });
  }

  const healthVals = input.healthScore.map((p) => p.value);
  if (isConsecutiveTrend(healthVals, 'down')) {
    const pts = input.healthScore.slice(-TREND_DECLINE_PERIODS);
    out.push({
      metric: 'trend_health_decline',
      value: null,
      verdict: `健康分连续 ${TREND_DECLINE_PERIODS} 期下降`,
      riskLevel: 'high',
      periods: pts.map((p) => p.period),
    });
  }

  return out;
}
