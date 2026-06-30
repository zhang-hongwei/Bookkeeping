/**
 * 退休模拟服务（Phase 7，US3，FR-003/SC-003/SC-004/SC-005）。
 *
 * 取数（assumptions）→ 确定性投影引擎 projectRetirement + scanSensitivity（三点区间）
 * → 落表（assumptions + 三点 + sustainableVerdict + disclaimers 强制含不确定性 I9）。
 * - 降级（NC6）：无累积期（currentAge≥retirementAge）或月缴 ≤0 → degraded + missing。
 * - 溯源（NC7）：engineVersion + assumptions + disclaimers。
 * - 复用 US1 的 projection.engine（同口径，NC3）。
 */
import {
  scanSensitivity,
  verdictSustainability,
  PROJECTION_ENGINE_NAME,
  PROJECTION_ENGINE_VERSION,
} from './projection.engine';
import { toCents } from './money';
import { retirementRepository } from '@/repositories/finance/retirement.repository';
import {
  engineVersion,
  disclaimersFor,
  type AnalysisStatus,
} from '@/app/api/finance/_lib/analysis-common';
import type {
  RetirementAssumptions,
  RetirementSimulationItem,
} from '@/database/schema/finance';

export interface ComputeRetirementInput {
  userId: string;
  assumptions: RetirementAssumptions;
}

/**
 * 模拟并保存退休三点区间。
 * - 无累积期/无月缴 → degraded + missing（NC6），三点仍按 0 corpus 计算（确定性，不编造）。
 */
export async function computeRetirement(
  input: ComputeRetirementInput,
): Promise<RetirementSimulationItem> {
  const repo = retirementRepository(input.userId);
  const a = input.assumptions;
  const accumulationMonths = Math.max(0, (a.retirementAge - a.currentAge) * 12);

  let status: AnalysisStatus = 'ok';
  const missing: string[] = [];
  if (accumulationMonths <= 0) missing.push('accumulation_period');
  if (toCents(a.monthlyContribution) <= 0) missing.push('monthly_contribution');
  if (missing.length > 0) status = 'degraded';

  // 三点确定性敏感性扫描（I8 单调；即使 degraded 也按 0 corpus 出结果，不编造）
  const { pessimistic, baseline, optimistic } = scanSensitivity({
    assumptions: a,
    horizonMonths: accumulationMonths,
  });
  const verdict = verdictSustainability(baseline, a.postRetirementMonthlySpend);

  return repo.create({
    assumptions: a,
    horizonMonths: accumulationMonths,
    resultPessimistic: pessimistic,
    resultBaseline: baseline,
    resultOptimistic: optimistic,
    sustainableVerdict: verdict,
    engineVersion: engineVersion(PROJECTION_ENGINE_NAME, PROJECTION_ENGINE_VERSION),
    status,
    missing,
    disclaimers: disclaimersFor('retirement'), // 强制含不确定性提示（I9，SC-003）
  });
}

/** 取最近一次模拟（无则 null）。 */
export async function getLatestRetirement(
  userId: string,
): Promise<RetirementSimulationItem | null> {
  return retirementRepository(userId).findLatestByUser();
}

/** 按 id 取（interpret 用）。 */
export async function getRetirement(
  userId: string,
  id: string,
): Promise<RetirementSimulationItem | null> {
  return retirementRepository(userId).findById(id);
}
