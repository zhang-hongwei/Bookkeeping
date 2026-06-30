/**
 * What-if 情景服务（Phase 7，US1，FR-001/SC-001/SC-004/SC-005）。
 *
 * 两层架构（NC5）：取数 → 确定性纯函数投影引擎 → 落表（可追溯）。
 * - 取数：净资产快照（computeNetWorthAtDate）+ 结余画像（getSurplusSeries，与 Phase 6 同口径）。
 * - 引擎：projection.engine 的 projectBaseline/projectScenario（确定性、可复现）。
 * - 降级（NC6）：无历史结余 → status='degraded' + missing[]，不产出编造结论。
 * - 溯源（NC7）：engineVersion + assumptions + baselineSnapshot + disclaimers。
 * - 写操作：scenario + projections 一组（projections 事务内整组覆盖）。
 */
import {
  STABILITY_WINDOW,
  getSurplusSeries,
  getMonthlyExpenseAverage,
} from './rules-engine.service';
import { computeNetWorthAtDate } from './net-worth.service';
import { toCents, fromCents } from './money';
import {
  projectBaseline,
  projectScenario,
  buildSurplusProfile,
  PROJECTION_ENGINE_NAME,
  PROJECTION_ENGINE_VERSION,
  type ScenarioPoint,
} from './projection.engine';
import { scenarioRepository } from '@/repositories/finance/scenario.repository';
import {
  engineVersion,
  disclaimersFor,
  type AnalysisStatus,
} from '@/app/api/finance/_lib/analysis-common';
import type {
  ScenarioKind,
  ScenarioAssumptions,
  BaselineSnapshot,
} from '@/database/schema/finance';
import type { ScenarioItem, ScenarioProjectionItem } from '@/database/schema/finance';

export interface ComputeScenarioInput {
  userId: string;
  name: string;
  kind: ScenarioKind;
  assumptions: ScenarioAssumptions;
  horizonMonths: number;
}

export interface ScenarioResult {
  scenario: ScenarioItem;
  projections: ScenarioProjectionItem[];
}

/** 当前月周期（YYYY-MM-DD；与 rules-engine monthRange 同构）。 */
function currentPeriod(): { start: string; end: string } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const monthIdx = now.getUTCMonth();
  const start = new Date(Date.UTC(year, monthIdx, 1))
    .toISOString()
    .slice(0, 10);
  const end = new Date(Date.UTC(year, monthIdx + 1, 0))
    .toISOString()
    .slice(0, 10);
  return { start, end };
}

/**
 * 计算并保存 what-if 情景。
 * - 取数 → 引擎投影 → 落表（单组事务覆盖 projections）。
 * - 无历史结余 → degraded + missing（NC6），仍落一条情景（points 空）。
 */
export async function computeScenario(
  input: ComputeScenarioInput,
): Promise<ScenarioResult> {
  const repo = scenarioRepository(input.userId);
  const period = currentPeriod();

  const [surplusSeries, expenseAvg, nw] = await Promise.all([
    getSurplusSeries(input.userId, period, STABILITY_WINDOW),
    getMonthlyExpenseAverage(input.userId, period, STABILITY_WINDOW),
    computeNetWorthAtDate(input.userId, period.end),
  ]);

  const expenseAvgCents = toCents(expenseAvg);
  const surplusAvgCents =
    surplusSeries.length > 0
      ? Math.round(
          surplusSeries.reduce((s, x) => s + toCents(x), 0) / surplusSeries.length,
        )
      : 0;
  const incomeAvgCents = surplusAvgCents + expenseAvgCents;

  const startNetWorthCents =
    toCents(nw.totalAssets) - toCents(nw.totalLiabilities);
  const startLiquidAssetsCents =
    toCents(nw.breakdown.cash ?? '0') + toCents(nw.breakdown.savings ?? '0');
  const baselineEmergencyMonths =
    expenseAvgCents > 0 ? startLiquidAssetsCents / expenseAvgCents : null;

  const baselineSnapshot: BaselineSnapshot = {
    netWorth: fromCents(startNetWorthCents),
    monthlySurpluses: surplusSeries,
    emergencyMonths:
      baselineEmergencyMonths === null
        ? null
        : Number(baselineEmergencyMonths.toFixed(4)),
    asOfDate: period.end,
  };

  const engVersion = engineVersion(PROJECTION_ENGINE_NAME, PROJECTION_ENGINE_VERSION);
  const disclaimers = disclaimersFor('generic');

  // 降级判定（NC6）：无历史结余 → 无法建 surplusProfile
  const profile = buildSurplusProfile({
    monthlySurpluses: surplusSeries,
    averageMonthlyIncomeCents: incomeAvgCents,
    averageMonthlyExpenseCents: expenseAvgCents,
  });

  let status: AnalysisStatus = 'ok';
  const missing: string[] = [];
  let points: ScenarioPoint[] = [];
  if (profile === null) {
    status = 'degraded';
    missing.push('historical_surplus');
  } else {
    points = projectScenario({
      startNetWorthCents,
      startLiquidAssetsCents,
      surplusProfile: profile,
      monthlyExpenseCents: expenseAvgCents,
      horizonMonths: input.horizonMonths,
      assumptions: input.assumptions,
    });
  }

  const scenario = await repo.createScenario({
    name: input.name,
    kind: input.kind,
    assumptions: input.assumptions,
    baselineSnapshot,
    horizonMonths: input.horizonMonths,
    engineVersion: engVersion,
    status,
    missing,
    disclaimers,
  });

  const projections = await repo.upsertProjections(
    scenario.id,
    points.map((p) => ({
      monthOffset: p.monthOffset,
      baselineNetWorth: p.baselineNetWorth,
      scenarioNetWorth: p.scenarioNetWorth,
      netWorthDelta: p.netWorthDelta,
      baselineEmergencyMonths:
        p.baselineEmergencyMonths === null
          ? null
          : String(p.baselineEmergencyMonths),
      scenarioEmergencyMonths:
        p.scenarioEmergencyMonths === null
          ? null
          : String(p.scenarioEmergencyMonths),
      // goalImpact：Phase 6 未落地 → null（降级，不编造，NC6）
      goalImpact: null,
    })),
  );

  return { scenario, projections };
}

/** 列表（不含投影点明细）。 */
export async function listScenarios(userId: string): Promise<ScenarioItem[]> {
  return scenarioRepository(userId).listByUser();
}

/** 详情（含全部投影点）。 */
export async function getScenario(
  userId: string,
  id: string,
): Promise<ScenarioResult | null> {
  const { scenario, projections } = await scenarioRepository(
    userId,
  ).findWithProjections(id);
  if (!scenario) return null;
  return { scenario, projections };
}
