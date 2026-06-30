/**
 * US2 个税服务集成测试（T022/T030）—— 门控 FINANCE_INTEGRATION_TEST=1。
 * 需真实 PostgreSQL。SC-002/SC-005 落表 + ruleVintage/disclaimers 溯源（I6/I7）。
 *   FINANCE_INTEGRATION_TEST=1 pnpm test --run tax.service
 */
import { describe, it, expect } from 'vitest';
import { computeTaxEstimate } from '@/services/finance/tax.service';
import { taxRuleConfig } from '@/services/finance/config/tax-rule';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';

const describeIntegration = INTEGRATION_ENABLED ? describe : describe.skip;

describeIntegration('tax.service（US2 集成）', () => {
  it('正常估算落表含 ruleVintage + 税务免责（I6/I7）', async () => {
    const item = await computeTaxEstimate({
      userId: uniqueUserId(),
      taxYear: 2026,
      inputs: {
        annualIncome: '360000.00',
        insuranceAndFund: '36000.00',
        specialDeductions: { supporting_elderly: '24000.00' },
        annualBonus: '60000.00',
      },
    });
    expect(item.ruleVintage).toBe(taxRuleConfig.ruleVintage);
    expect(item.disclaimers.some((d) => d.includes('非税务建议'))).toBe(true);
    expect(item.methodComparison.better === 'separate' || item.methodComparison.better === 'merged').toBe(true);
    expect(item.status).toBe('ok');
  });

  it('收入为 0 → status=degraded + missing 含 annual_income（SC-005）', async () => {
    const item = await computeTaxEstimate({
      userId: uniqueUserId(),
      taxYear: 2026,
      inputs: {
        annualIncome: '0.00',
        insuranceAndFund: '0.00',
        specialDeductions: {},
      },
    });
    expect(item.status).toBe('degraded');
    expect(item.missing).toContain('annual_income');
  });
});
