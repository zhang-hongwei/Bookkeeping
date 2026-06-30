/**
 * 现金流预测服务（Phase 6，FR-001）。
 *
 * 透明可解释回归模型（research.md 决策 2）：线性趋势（最小二乘）+ 季节分量 +
 * 残差标准差区间，纯函数实现（确定性、可复现、可回测，SC-001/SC-002）。
 *
 * - 历史不足（< MIN_HISTORY_MONTHS）→ insufficientHistory=true、points=[]（决策 3）。
 * - 应急金耗尽点：前向推演现金资产，定位首个低于阈值（MIN_EMERGENCY_MONTHS×月支出）的月份。
 * - 金额一律 cents（I4）；缓存于 finance_cash_flow_forecasts。
 */
import type {
  ForecastPoint,
  ForecastHistoryPoint,
  ForecastSeries,
} from '@/database/schema/finance';
import {
  LOOKBACK_MONTHS,
  FORECAST_HORIZON_MONTHS,
  MIN_HISTORY_MONTHS,
  getSurplusSeries,
  getMonthlyExpenseAverage,
  type PeriodRange,
} from './rules-engine.service';
import { computeNetWorthAtDate } from './net-worth.service';
import { toCents, fromCents, addCents } from './money';
import { forecastRepository } from '@/repositories/finance/forecast.repository';

/** 预测模型版本（可追溯，SC-002）。 */
export const FORECAST_MODEL_VERSION = 'linear-trend+v1';

/** 应急金不足阈值（月数，沿用 rules-engine 口径）。 */
const EMERGENCY_THRESHOLD_MONTHS = 3;
/** 不确定性区间宽度（1σ；保守、可解释）。 */
const UNCERTAINTY_Z = 1;

export interface ForecastInput {
  /** 历史月度结余序列（decimal 字符串，升序，最近月在末）。 */
  surplusSeries: string[];
  /** 当前现金资产（decimal 字符串，应急金口径 cash+savings）。 */
  cashAssets: string;
  /** 近期月均支出（decimal 字符串，应急金阈值口径）。 */
  monthlyExpense: string;
  /** 基准月 YYYY-MM（历史最后一月；预测其后的 `horizon` 个月）。 */
  targetMonth: string;
  /** 预测期数。 */
  horizon: number;
}

export interface ForecastResult {
  targetMonth: string;
  insufficientHistory: boolean;
  points: ForecastPoint[];
  emergencyShortfallMonth: string | null;
  modelVersion: string;
  /** 历史结余输入（预测来源锚点，SC-002）。 */
  history: ForecastHistoryPoint[];
}

/** 月份平移：ym=YYYY-MM ± delta → {year, month}。 */
function shiftMonth(ym: string, delta: number): { year: number; month: number } {
  const [y, m] = ym.split('-').map(Number);
  const total = y * 12 + (m - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

function formatMonth({ year, month }: { year: number; month: number }): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

/**
 * 纯函数：透明回归预测（决策 2/3）。
 * - 趋势：最小二乘 y = a + b·t（t=0..n-1）。
 * - 季节分量：同日历月历史残差（稀疏则 0）。
 * - 不确定性：± 残差标准差（UNCERTAINTY_Z·σ）。
 * - 应急金：前向推演现金资产，首个 < MIN_EMERGENCY_MONTHS×月支出 的月份。
 */
export function computeForecast(input: ForecastInput): ForecastResult {
  const series = input.surplusSeries.map((s) => toCents(s));
  const n = series.length;
  const targetMonth = input.targetMonth;
  const horizon = input.horizon;

  // 历史不足降级（决策 3 / I3）——不产出数值预测点。
  if (n < MIN_HISTORY_MONTHS) {
    return {
      targetMonth,
      insufficientHistory: true,
      points: [],
      emergencyShortfallMonth: null,
      modelVersion: FORECAST_MODEL_VERSION,
      history: [],
    };
  }

  // 最小二乘线性趋势
  const ts = series.map((_, i) => i);
  const meanT = mean(ts);
  const meanY = mean(series);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (ts[i] - meanT) * (series[i] - meanY);
    den += (ts[i] - meanT) ** 2;
  }
  const b = den > 0 ? num / den : 0;
  const a = meanY - b * meanT;

  // 残差 + 标准差
  const fitted = series.map((_, i) => a + b * ts[i]);
  const residuals = series.map((y, i) => y - fitted[i]);
  const resStd = Math.sqrt(mean(residuals.map((r) => r ** 2)));

  // 季节分量：calendarMonth(1-12) → 残差均值（稀疏，无则 0）
  // 历史最后一月 = targetMonth；历史第 i 月的日历月 = targetMonth − (n−1−i)
  const seasonalByMonth = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const cm = shiftMonth(targetMonth, -(n - 1 - i)).month;
    const arr = seasonalByMonth.get(cm) ?? [];
    arr.push(residuals[i]);
    seasonalByMonth.set(cm, arr);
  }
  const seasonal = (calendarMonth: number): number => {
    const arr = seasonalByMonth.get(calendarMonth);
    return arr && arr.length > 0 ? mean(arr) : 0;
  };

  const trendAt = (t: number): number => a + b * t;

  // 前向推演：现金资产、应急金不足点
  const emergencyThresholdCents = Math.max(
    0,
    toCents(input.monthlyExpense) * EMERGENCY_THRESHOLD_MONTHS,
  );
  let cashCents = toCents(input.cashAssets);
  const points: ForecastPoint[] = [];
  const history: ForecastHistoryPoint[] = series.map((surplusCents, i) => ({
    month: formatMonth(shiftMonth(targetMonth, -(n - 1 - i))),
    surplus: fromCents(surplusCents),
  }));
  let emergencyShortfallMonth: string | null = null;

  for (let k = 1; k <= horizon; k++) {
    const t = n - 1 + k;
    const cm = shiftMonth(targetMonth, k).month;
    const forecastCents = trendAt(t) + seasonal(cm);
    // 区间（残差 σ；forecast 为 cents 浮点 → 四舍五入）
    const lower = Math.round(forecastCents - UNCERTAINTY_Z * resStd);
    const upper = Math.round(forecastCents + UNCERTAINTY_Z * resStd);
    // 期末现金资产 = 上期现金 + 预测结余
    cashCents = cashCents + Math.round(forecastCents);
    const monthLabel = formatMonth(shiftMonth(targetMonth, k));
    points.push({
      month: monthLabel,
      surplus: fromCents(Math.round(forecastCents)),
      cashBalance: fromCents(cashCents),
      lower: fromCents(lower),
      upper: fromCents(upper),
    });
    // 应急金不足：现金资产低于阈值且尚未定位首个月
    if (emergencyShortfallMonth === null && cashCents < emergencyThresholdCents) {
      emergencyShortfallMonth = monthLabel;
    }
  }

  return {
    targetMonth,
    insufficientHistory: false,
    points,
    emergencyShortfallMonth,
    modelVersion: FORECAST_MODEL_VERSION,
    history,
  };
}

/** 由 ForecastResult 构造缓存 series（jsonb）。 */
function toSeries(result: ForecastResult): ForecastSeries {
  return {
    points: result.points,
    emergencyShortfallMonth: result.emergencyShortfallMonth,
    modelVersion: result.modelVersion,
    history: result.history,
  };
}

/** 由 ForecastResult + 行时间戳构造视图（含 generatedAt）。 */
export interface ForecastView extends ForecastResult {
  generatedAt: string;
}

function toView(
  result: ForecastResult,
  generatedAt: Date,
): ForecastView {
  return { ...result, generatedAt: generatedAt.toISOString() };
}

/**
 * 重新生成预测：取历史序列 + 现金/支出 → 纯函数预测 → 覆盖缓存（幂等）。
 * - targetMonth 缺省取当前月（period.end 所在月）。
 */
export async function generateForecast(
  userId: string,
  opts: { targetMonth?: string; horizon?: number; period: PeriodRange },
): Promise<ForecastView> {
  const targetMonth = opts.targetMonth ?? opts.period.end.slice(0, 7);
  const horizon = opts.horizon ?? FORECAST_HORIZON_MONTHS;
  const period = opts.period;

  const [surplusSeries, monthlyExpense, nw] = await Promise.all([
    getSurplusSeries(userId, period, LOOKBACK_MONTHS),
    getMonthlyExpenseAverage(userId, period, LOOKBACK_MONTHS),
    computeNetWorthAtDate(userId, period.end),
  ]);
  const cashAssets = fromCents(
    addCents(nw.breakdown.cash ?? '0', nw.breakdown.savings ?? '0'),
  );

  const result = computeForecast({
    surplusSeries,
    cashAssets,
    monthlyExpense,
    targetMonth,
    horizon,
  });

  const row = await forecastRepository(userId).upsert({
    targetMonth,
    series: toSeries(result),
    insufficientHistory: result.insufficientHistory,
  });
  return toView(result, row.generatedAt);
}

/** 读取某基准月预测缓存；不存在则即时生成。 */
export async function getForecast(
  userId: string,
  opts: { targetMonth?: string; horizon?: number; period: PeriodRange },
): Promise<ForecastView> {
  const targetMonth = opts.targetMonth ?? opts.period.end.slice(0, 7);
  const cached = await forecastRepository(userId).findByTargetMonth(targetMonth);
  if (cached) {
    return toView(
      {
        targetMonth: cached.targetMonth,
        insufficientHistory: cached.insufficientHistory,
        points: cached.series.points,
        emergencyShortfallMonth: cached.series.emergencyShortfallMonth,
        modelVersion: cached.series.modelVersion,
        history: cached.series.history ?? [],
      },
      cached.generatedAt,
    );
  }
  return generateForecast(userId, opts);
}
