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
  key: keyof Omit<HealthScore['dimensions'], 'investmentRate'>;
  weight: number;
  score: number;
}

/** 纯函数：由 findings 加权得健康分；缺失维度（投资率/无数据维度）降权重分配，不编造。 */
export function computeHealthScore(findings: FindingData[]): HealthScore {
  const byMetric = new Map(findings.map((f) => [f.metric, f]));
  const dims = {
    savingsRate: { value: null as string | null, score: null as number | null } as DimensionScore,
    debtRatio: { value: null as string | null, score: null as number | null } as DimensionScore,
    emergency: { value: null as string | null, score: null as number | null } as DimensionScore,
    investmentRate: { value: null, score: null, reason: 'await_phase3' } as DimensionScore,
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

  // 现金流：基于结余正负（surplus finding）
  const surplus = byMetric.get('surplus');
  const surplusCents = toCents(surplus?.value ?? '0');
  const cashflowScore = surplusCents >= 0 ? 100 : 30;
  dims.cashflow = { value: surplus?.value ?? '0', score: cashflowScore };
  present.push({ key: 'cashflow', weight: 15, score: cashflowScore });

  // 投资率 Phase 1 无持仓 → 降权，权重重分配到 present 维度（按各自权重归一化）
  const weightSum = present.reduce((s, d) => s + d.weight, 0);
  const weightedScore = present.reduce((s, d) => s + d.score * d.weight, 0);
  const total = weightSum > 0 ? weightedScore / weightSum : 0;

  return { total: total.toFixed(2), dimensions: dims };
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
