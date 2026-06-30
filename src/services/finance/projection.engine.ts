/**
 * 确定性投影纯函数引擎（Phase 7，US1 what-if + US3 退休共用，NC2/NC3/NC8）。
 *
 * 红线（research.md NC5/NC8）：
 * - **纯函数、零 IO、零随机性、零 LLM**；同一输入 → 同一输出（可复现，SC-001）。
 * - 金额一律「分」整数运算（`money.ts`），禁浮点。
 * - 口径与 Phase 1 `getPeriodMetrics`（应急金 = (cash+savings)/月支出）+ Phase 6 目标结余均值一致。
 *
 * service 层负责一次性取数（净资产快照 + 结余/收支画像），传入本引擎做 O(horizon) 内存循环。
 */
import { toCents, fromCents } from './money';
import type { ScenarioAssumptions } from '@/database/schema/finance/scenarios';
import type { RetirementAssumptions, RetirementPoint } from '@/database/schema/finance/retirement-simulations';

export const PROJECTION_ENGINE_NAME = 'projection';
export const PROJECTION_ENGINE_VERSION = '1.0.0';

/** 结余/收支画像（与 Phase 6 目标达成同口径、同窗口）。 */
export interface SurplusProfile {
  /** 近 N 月平均月结余（分）。 */
  averageMonthlySurplusCents: number;
  /** 近 N 月平均月收入（分；用于降薪/失业情景按比例调整）。 */
  averageMonthlyIncomeCents: number;
  /** 近 N 月平均月支出（分；应急金口径分母 + 加息支出增量）。 */
  averageMonthlyExpenseCents: number;
  /** 样本月数。 */
  months: number;
}

/**
 * 由历史月度结余序列 + 收支均值构造画像。
 * @returns 空（或全 0 样本）序列 → null（触发降级，NC6）。
 */
export function buildSurplusProfile(args: {
  monthlySurpluses: string[];
  averageMonthlyIncomeCents: number;
  averageMonthlyExpenseCents: number;
}): SurplusProfile | null {
  const series = args.monthlySurpluses;
  if (series.length === 0) return null;
  const n = series.length;
  const sum = series.reduce((acc, s) => acc + toCents(s), 0);
  return {
    averageMonthlySurplusCents: Math.round(sum / n),
    averageMonthlyIncomeCents: args.averageMonthlyIncomeCents,
    averageMonthlyExpenseCents: args.averageMonthlyExpenseCents,
    months: n,
  };
}

/** 基线投影输入（全部确定性数值，cents）。 */
export interface BaselineProjectionInput {
  /** 起点净资产（分）。 */
  startNetWorthCents: number;
  /** 起点流动资产（cash+savings，分；应急金分子）。 */
  startLiquidAssetsCents: number;
  /** 平均月结余画像。 */
  surplusProfile: SurplusProfile;
  /** 月支出（分；应急金分母，0 → 应急金 null）。 */
  monthlyExpenseCents: number;
  /** 投影时长（月）。 */
  horizonMonths: number;
}

/** 基线投影点。 */
export interface BaselinePoint {
  monthOffset: number;
  netWorth: string;
  emergencyMonths: number | null;
}

/**
 * 基线投影：逐月「净资产 = 起点 + 累计结余」「应急金 = 流动资产 / 月支出」。
 * 结余 ≤ 0 → 净资产持平/下行（自然体现，SC-001 edge）。纯内存 O(horizon)。
 */
export function projectBaseline(input: BaselineProjectionInput): BaselinePoint[] {
  const surplus = input.surplusProfile.averageMonthlySurplusCents;
  const points: BaselinePoint[] = [];
  for (let offset = 0; offset <= input.horizonMonths; offset++) {
    const cumulative = surplus * offset;
    const netWorth = input.startNetWorthCents + cumulative;
    const liquid = input.startLiquidAssetsCents + cumulative;
    const emergencyMonths =
      input.monthlyExpenseCents > 0 ? liquid / input.monthlyExpenseCents : null;
    points.push({
      monthOffset: offset,
      netWorth: fromCents(netWorth),
      emergencyMonths:
        emergencyMonths === null
          ? null
          : Number(emergencyMonths.toFixed(4)),
    });
  }
  return points;
}

/** 情景投影点（含与基线的逐点 diff，I3）。 */
export interface ScenarioPoint {
  monthOffset: number;
  baselineNetWorth: string;
  scenarioNetWorth: string;
  /** scenario − baseline（I3，行内一致性）。 */
  netWorthDelta: string;
  baselineEmergencyMonths: number | null;
  scenarioEmergencyMonths: number | null;
}

/** 情景投影输入。 */
export interface ScenarioProjectionInput extends BaselineProjectionInput {
  /** 情景假设（NC2）。 */
  assumptions: ScenarioAssumptions;
  /** 房贷余额（分；加息情景重算月供增量用，0 = 无房贷/不涉及）。 */
  mortgageBalanceCents?: number;
}

/**
 * 计算某月情景结余（分）。
 * - 降薪/失业：在 [1, durationMonths] 内把收入部分按 incomeDeltaPct 调整（失业 = -1.0）。
 * - 加息：对房贷余额按月计增量支出，整个 horizon 生效。
 * 基线结余（窗口外 / 无 delta）= 平均结余（恢复，NC2）。
 */
function scenarioSurplusAt(
  offset: number,
  input: ScenarioProjectionInput,
): number {
  const { assumptions, surplusProfile, mortgageBalanceCents } = input;
  let surplus = surplusProfile.averageMonthlySurplusCents;
  // 降薪/失业：窗口内重算结余
  const duration = Math.max(1, assumptions.durationMonths ?? 0);
  if (
    assumptions.incomeDeltaPct !== 0 &&
    offset >= 1 &&
    offset <= duration
  ) {
    const adjustedIncome = Math.round(
      surplusProfile.averageMonthlyIncomeCents * (1 + assumptions.incomeDeltaPct),
    );
    surplus = adjustedIncome - surplusProfile.averageMonthlyExpenseCents;
  }
  // 加息：房贷月供增量（近似 = 余额 × 月利率增量），整个 horizon
  const rateDelta = assumptions.rateDeltaPct ?? 0;
  if (rateDelta !== 0 && (mortgageBalanceCents ?? 0) > 0 && offset >= 1) {
    const monthlyIncrement = Math.round(
      ((mortgageBalanceCents ?? 0) * rateDelta) / 100 / 12,
    );
    surplus -= monthlyIncrement;
  }
  return surplus;
}

/**
 * 情景投影：在基线之上叠加确定性 delta（降薪/失业窗口、加息、一次性大额支出）。
 * 输出逐点 baseline/scenario/diff（I3/I4，可复现，SC-001）。
 */
export function projectScenario(input: ScenarioProjectionInput): ScenarioPoint[] {
  const baseline = projectBaseline(input);
  const { assumptions } = input;
  const lumpCents =
    assumptions.lumpExpense != null ? toCents(assumptions.lumpExpense) : 0;
  const affectedMonth = assumptions.affectedMonth ?? 0;
  let cumulativeScenario = 0; // 累计情景结余（分）
  const points: ScenarioPoint[] = [];
  for (let offset = 0; offset <= input.horizonMonths; offset++) {
    if (offset >= 1) {
      cumulativeScenario += scenarioSurplusAt(offset, input);
    }
    const lumpDeduction = lumpCents > 0 && offset >= affectedMonth ? lumpCents : 0;
    const scenarioNetWorth =
      input.startNetWorthCents + cumulativeScenario - lumpDeduction;
    const scenarioLiquid =
      input.startLiquidAssetsCents + cumulativeScenario - lumpDeduction;
    const scenarioEmergency =
      input.monthlyExpenseCents > 0
        ? scenarioLiquid / input.monthlyExpenseCents
        : null;
    const baselineNetWorth = toCents(baseline[offset].netWorth);
    points.push({
      monthOffset: offset,
      baselineNetWorth: fromCents(baselineNetWorth),
      scenarioNetWorth: fromCents(scenarioNetWorth),
      netWorthDelta: fromCents(scenarioNetWorth - baselineNetWorth),
      baselineEmergencyMonths: baseline[offset].emergencyMonths,
      scenarioEmergencyMonths:
        scenarioEmergency === null ? null : Number(scenarioEmergency.toFixed(4)),
    });
  }
  return points;
}

// ===================== 退休长期投影（US3，NC3）=====================

/** 退休投影输入。 */
export interface RetirementProjectionInput {
  assumptions: RetirementAssumptions;
  /** 投影总月数（至退休 + 退休后覆盖期）。 */
  horizonMonths: number;
}

/**
 * 退休长期投影（单点，确定性，NC3）。
 * - 累计期（currentAge → retirementAge）：每月按 `realReturnRatePct` 复利增长 + 月缴。
 * - 退休 corpus = 累计终值；monthlySustainable = corpus × 提取率 / 12。
 * - depletionAge：退休后按月支出消耗，若在寿命内耗尽则返回年龄，否则 null（可持续）。
 *
 * @param realReturnRatePctOverride 敏感性扫描用（±2%）；不传则用 assumptions 内值。
 */
export function projectRetirement(
  input: RetirementProjectionInput,
  realReturnRatePctOverride?: number,
): RetirementPoint {
  const a = input.assumptions;
  const monthlyContribution = toCents(a.monthlyContribution);
  const realRatePct = realReturnRatePctOverride ?? a.realReturnRatePct;
  const monthlyRate = realRatePct / 100 / 12;
  const accumulationMonths = Math.max(
    0,
    (a.retirementAge - a.currentAge) * 12,
  );
  const withdrawalMonthlyRate = a.withdrawalRatePct / 100 / 12;

  // 累计期：月初余额 × (1+月率) + 月缴（月初缴，期末复利）
  let corpus = 0;
  for (let m = 0; m < accumulationMonths; m++) {
    corpus = corpus * (1 + monthlyRate) + monthlyContribution;
  }
  corpus = Math.round(corpus);

  const monthlySustainable = Math.round(corpus * withdrawalMonthlyRate);
  const postRetirementMonthlySpend = toCents(a.postRetirementMonthlySpend);

  // 耗尽年龄：仅当提取不足以覆盖月支出时按净消耗估算；可持续 → null。
  const maxAge = 120;
  let depletionAge: number | null = null;
  if (
    postRetirementMonthlySpend > 0 &&
    monthlySustainable < postRetirementMonthlySpend
  ) {
    const netDrawdown = postRetirementMonthlySpend - monthlySustainable;
    const monthsUntilDepletion = Math.ceil(corpus / netDrawdown);
    const ageAtDepletion = a.retirementAge + monthsUntilDepletion / 12;
    if (ageAtDepletion < maxAge) {
      depletionAge = Math.floor(ageAtDepletion);
    }
  }

  return {
    retirementCorpus: fromCents(corpus),
    monthlySustainable: fromCents(monthlySustainable),
    depletionAge,
  };
}

/**
 * 确定性敏感性扫描：回报率 ±2% 三点（NC3，非蒙特卡洛，可复现）。
 * @returns { pessimistic, baseline, optimistic }，corpus 单调（I8）。
 */
export function scanSensitivity(
  input: RetirementProjectionInput,
): {
  pessimistic: RetirementPoint;
  baseline: RetirementPoint;
  optimistic: RetirementPoint;
} {
  const baselineRate = input.assumptions.realReturnRatePct;
  const pessimistic = projectRetirement(input, baselineRate - 2);
  const baseline = projectRetirement(input, baselineRate);
  const optimistic = projectRetirement(input, baselineRate + 2);
  return { pessimistic, baseline, optimistic };
}

/**
 * 可持续性判定（中性口径，规则判定，NC3）。
 * - sustainable：提取覆盖退休后支出（monthlySustainable ≥ spend）。
 * - insufficient：退休即无 corpus（0）或提取远不足。
 * - marginal：介于两者。
 */
export function verdictSustainability(point: RetirementPoint, monthlySpend: string): 'sustainable' | 'marginal' | 'insufficient' {
  const corpus = toCents(point.retirementCorpus);
  const sustainable = toCents(point.monthlySustainable);
  const spend = toCents(monthlySpend);
  if (corpus <= 0) return 'insufficient';
  if (sustainable >= spend) return 'sustainable';
  if (spend > 0 && sustainable >= spend * 0.7) return 'marginal';
  return 'insufficient';
}
