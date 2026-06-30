/**
 * 中国个税确定性纯函数引擎（Phase 7，US2，NC1）。
 *
 * 红线：纯函数、cents 整数运算、零 IO/零 LLM、可复现（SC-002）。
 * 规则取自版本化 `taxRuleConfig`（NC1/NC7），不硬编码；法规变更只改配置。
 *
 * - 综合所得：七级超额累进 + 速算扣除（年口径）。
 * - 年终奖：单独计税（÷12 定档）vs 并入综合所得，输出差额与较优方向（I5，规则化非建议）。
 */
import { toCents, fromCents } from './money';
import {
  taxRuleConfig,
  type TaxBracket,
  type TaxRuleConfig,
} from './config/tax-rule';
import type {
  TaxInputs,
  MethodComparison,
  TaxHint,
} from '@/database/schema/finance/tax-estimates';

export const TAX_ENGINE_NAME = 'tax';
export const TAX_ENGINE_VERSION = '1.0.0';

/** 应纳税所得额对应的税率档（取最高适用档）。 */
function bracketFor(
  taxableIncomeCents: number,
  brackets: TaxBracket[],
): TaxBracket {
  let applicable = brackets[0];
  for (const b of brackets) {
    if (taxableIncomeCents >= toCents(String(b.threshold))) applicable = b;
  }
  return applicable;
}

/**
 * 超额累进税额（年口径）：taxableIncome × 税率 − 速算扣除（≥0）。
 * @param taxableIncomeCents 应纳税所得额（分）
 */
export function computeProgressiveTax(
  taxableIncomeCents: number,
  brackets: TaxBracket[],
): number {
  if (taxableIncomeCents <= 0) return 0;
  const b = bracketFor(taxableIncomeCents, brackets);
  const tax = Math.round(taxableIncomeCents * b.rate) - toCents(String(b.quickDeduction));
  return Math.max(0, tax);
}

/** 年终奖单独计税（÷12 定档 → 奖金 × 税率 − 速算扣除）。 */
export function computeBonusSeparate(
  bonusCents: number,
  brackets: TaxBracket[],
): number {
  if (bonusCents <= 0) return 0;
  const monthlyEq = bonusCents / 12;
  const b = bracketFor(monthlyEq, brackets);
  const tax = Math.round(bonusCents * b.rate) - toCents(String(b.quickDeduction));
  return Math.max(0, tax);
}

/**
 * 年终奖两种计税对比（I5）。
 * - separate.total = 综合税 + 年终奖单独税
 * - merged.total = （应税所得 + 年终奖）的累进税
 * - diff = separate − merged；better 取较小者。
 */
export function compareBonusMethods(args: {
  taxableIncomeCents: number;
  comprehensiveTaxCents: number;
  bonusCents: number;
  brackets: TaxBracket[];
}): MethodComparison {
  const separateTotal = args.comprehensiveTaxCents + computeBonusSeparate(args.bonusCents, args.brackets);
  const mergedTotal = computeProgressiveTax(args.taxableIncomeCents + args.bonusCents, args.brackets);
  const diff = separateTotal - mergedTotal;
  return {
    separate: { taxAmount: fromCents(separateTotal) },
    merged: { taxAmount: fromCents(mergedTotal) },
    diff: fromCents(diff),
    better: diff <= 0 ? 'separate' : 'merged',
  };
}

export interface TaxEstimateResult {
  totalTaxAmount: string;
  effectiveRate: string | null;
  methodComparison: MethodComparison;
  hints: TaxHint[];
}

/**
 * 个税估算总入口：按 config 计算综合税 + 年终奖对比 + 较优方向 + 规则化提示（NC1）。
 */
export function computeEstimate(
  inputs: TaxInputs,
  config: TaxRuleConfig = taxRuleConfig,
): TaxEstimateResult {
  const annualIncomeCents = toCents(inputs.annualIncome);
  const insuranceCents = toCents(inputs.insuranceAndFund);
  // 专项附加扣除：取用户填报金额之和（config 定额为目录参考）
  const specialCents = Object.values(inputs.specialDeductions).reduce(
    (s, v) => s + toCents(v ?? '0'),
    0,
  );
  const basicDeductionCents = toCents(String(config.basicDeductionMonthly)) * 12;

  const taxableIncomeCents =
    annualIncomeCents - insuranceCents - specialCents - basicDeductionCents;

  const comprehensiveTaxCents = computeProgressiveTax(
    taxableIncomeCents,
    config.brackets,
  );

  const bonusCents = inputs.annualBonus ? toCents(inputs.annualBonus) : 0;
  let methodComparison: MethodComparison;
  let totalTaxCents: number;
  if (bonusCents > 0) {
    methodComparison = compareBonusMethods({
      taxableIncomeCents: Math.max(0, taxableIncomeCents),
      comprehensiveTaxCents,
      bonusCents,
      brackets: config.brackets,
    });
    totalTaxCents =
      methodComparison.better === 'separate'
        ? toCents(methodComparison.separate.taxAmount)
        : toCents(methodComparison.merged.taxAmount);
  } else {
    // 无年终奖：两种口径相等（均为综合税）
    methodComparison = {
      separate: { taxAmount: fromCents(comprehensiveTaxCents) },
      merged: { taxAmount: fromCents(comprehensiveTaxCents) },
      diff: '0.00',
      better: 'separate',
    };
    totalTaxCents = comprehensiveTaxCents;
  }

  const effectiveRate =
    taxableIncomeCents > 0
      ? (totalTaxCents / taxableIncomeCents).toFixed(6)
      : null;

  const hints: TaxHint[] = [];
  if (bonusCents > 0) {
    const better = methodComparison.better === 'separate' ? '单独计税' : '并入综合所得';
    hints.push({
      text: `年终奖${better}可少缴 ¥${fromCents(Math.abs(toCents(methodComparison.diff)))}（规则化对比，非税务建议）。`,
    });
  }

  return {
    totalTaxAmount: fromCents(totalTaxCents),
    effectiveRate,
    methodComparison,
    hints,
  };
}
