/**
 * US2 个税纯函数引擎测试（T021）—— tax.engine。
 *
 * 无 DB，立即执行。SC-002：与权威计算器一致（允许末位差）；I5：separate/merged 差额正确；I7：ruleVintage 一致。
 */
import { describe, it, expect } from 'vitest';
import {
  computeProgressiveTax,
  computeBonusSeparate,
  compareBonusMethods,
  computeEstimate,
  TAX_ENGINE_VERSION,
} from '@/services/finance/tax.engine';
import { taxRuleConfig } from '@/services/finance/config/tax-rule';
import { toCents } from '@/services/finance/money';

describe('computeProgressiveTax（七级累进，SC-002 权威一致）', () => {
  it('应税 150000 → 13080（20% 档，速算扣除 16920）', () => {
    expect(computeProgressiveTax(toCents('150000'), taxRuleConfig.brackets)).toBe(
      toCents('13080'),
    );
  });

  it('应税 36000 → 3% 档，税 1080', () => {
    expect(computeProgressiveTax(toCents('36000'), taxRuleConfig.brackets)).toBe(
      toCents('1080'),
    );
  });

  it('应税 ≤ 0 → 0', () => {
    expect(computeProgressiveTax(0, taxRuleConfig.brackets)).toBe(0);
    expect(computeProgressiveTax(-100, taxRuleConfig.brackets)).toBe(0);
  });

  it('高收入 1000000 → 45% 档，速算扣除 181920', () => {
    // 1000000*0.45 - 181920 = 450000 - 181920 = 268080
    expect(computeProgressiveTax(toCents('1000000'), taxRuleConfig.brackets)).toBe(
      toCents('268080'),
    );
  });
});

describe('computeBonusSeparate（÷12 定档）', () => {
  it('年终奖 60000 → /12=5000 落 3% 档 → 1800', () => {
    expect(computeBonusSeparate(toCents('60000'), taxRuleConfig.brackets)).toBe(
      toCents('1800'),
    );
  });
});

describe('compareBonusMethods（I5 差额 / better）', () => {
  it('diff = separate.total − merged.total；better 取较小者', () => {
    // 应税所得 100000，年终奖 60000
    const taxable = toCents('100000');
    const comp = computeProgressiveTax(taxable, taxRuleConfig.brackets);
    const r = compareBonusMethods({
      taxableIncomeCents: taxable,
      comprehensiveTaxCents: comp,
      bonusCents: toCents('60000'),
      brackets: taxRuleConfig.brackets,
    });
    const separate = Number(r.separate.taxAmount);
    const merged = Number(r.merged.taxAmount);
    expect(Number(r.diff)).toBeCloseTo(separate - merged, 2);
    expect(r.better).toBe(separate <= merged ? 'separate' : 'merged');
  });
});

describe('computeEstimate（综合 + 对比 + effectiveRate + I7 ruleVintage）', () => {
  it('无年终奖：separate == merged == 综合税；effectiveRate 正确', () => {
    const r = computeEstimate({
      annualIncome: '200000.00',
      insuranceAndFund: '24000.00',
      specialDeductions: { children_education: '24000.00' },
    });
    expect(r.methodComparison.separate.taxAmount).toBe(
      r.methodComparison.merged.taxAmount,
    );
    // 应税 = 200000 − 24000 − 24000 − 60000 = 92000 → 10% 档：92000*0.1 − 2520 = 6680
    expect(r.totalTaxAmount).toBe('6680.00');
    expect(r.effectiveRate).not.toBeNull();
  });

  it('ruleVintage 来自配置（I7）', () => {
    expect(taxRuleConfig.ruleVintage).toMatch(/^PRC-IIT-/);
    expect(TAX_ENGINE_VERSION).toBe('1.0.0');
  });
});
