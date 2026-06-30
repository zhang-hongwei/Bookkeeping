/**
 * 个税估算服务（Phase 7，US2，FR-002/SC-002/SC-004/SC-005）。
 *
 * 取数（inputs）→ 确定性引擎 tax.engine → 落表（ruleVintage + disclaimers 溯源）。
 * - 降级（NC6）：收入缺失（0）→ status='degraded' + missing，仍按已填项计算（不编造）。
 * - 溯源（NC7）：engineVersion + ruleVintage + inputs + disclaimers（强制「非税务建议」，I6）。
 */
import { computeEstimate, TAX_ENGINE_NAME, TAX_ENGINE_VERSION } from './tax.engine';
import { taxRuleConfig } from './config/tax-rule';
import { toCents } from './money';
import { taxEstimateRepository } from '@/repositories/finance/tax-estimate.repository';
import {
  engineVersion,
  disclaimersFor,
  type AnalysisStatus,
} from '@/app/api/finance/_lib/analysis-common';
import type { TaxInputs, TaxEstimateItem } from '@/database/schema/finance';

export interface ComputeTaxInput {
  userId: string;
  taxYear: number;
  inputs: TaxInputs;
}

/**
 * 估算并保存个税。
 * - 收入为 0/缺失 → degraded + missing（NC6），仍计算（按 0 收入）。
 * - 落表强制注入税务免责（I6）。
 */
export async function computeTaxEstimate(
  input: ComputeTaxInput,
): Promise<TaxEstimateItem> {
  const repo = taxEstimateRepository(input.userId);
  const result = computeEstimate(input.inputs, taxRuleConfig);

  let status: AnalysisStatus = 'ok';
  const missing: string[] = [];
  if (toCents(input.inputs.annualIncome) <= 0) {
    status = 'degraded';
    missing.push('annual_income');
  }

  return repo.create({
    taxYear: input.taxYear,
    ruleVintage: taxRuleConfig.ruleVintage,
    inputs: input.inputs,
    methodComparison: result.methodComparison,
    totalTaxAmount: result.totalTaxAmount,
    effectiveRate: result.effectiveRate,
    hints: result.hints,
    engineVersion: engineVersion(TAX_ENGINE_NAME, TAX_ENGINE_VERSION),
    status,
    missing,
    disclaimers: disclaimersFor('tax'), // 强制含「非税务建议」，I6
  });
}

/** 取某年最近一次估算（无则 null）。 */
export async function getLatestTaxEstimate(
  userId: string,
  taxYear?: number,
): Promise<TaxEstimateItem | null> {
  const year = taxYear ?? new Date().getFullYear();
  return taxEstimateRepository(userId).findLatestByUserAndYear(year);
}

/** 按 id 取估算（interpret 用）。 */
export async function getTaxEstimate(
  userId: string,
  id: string,
): Promise<TaxEstimateItem | null> {
  return taxEstimateRepository(userId).findById(id);
}
