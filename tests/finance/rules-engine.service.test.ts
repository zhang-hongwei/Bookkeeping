/**
 * US3/US4 单元测试（T027/T038）：规则引擎 findings 公式 + 健康分加权（确定性可复现）。
 */
import { describe, it, expect } from 'vitest';
import {
  computeFindingsFromData,
  computeHealthScore,
} from '@/services/finance/rules-engine.service';

describe('computeFindingsFromData（T027 公式，转账不计收支）', () => {
  it('收支/结余/储蓄率/负债率/应急金公式正确', () => {
    const f = computeFindingsFromData({
      incomeTotal: '10000',
      expenseTotal: '6000',
      totalAssets: '50000',
      totalLiabilities: '10000',
      cashAssets: '18000',
    });
    const byMetric = new Map(f.map((x) => [x.metric, x]));
    expect(byMetric.get('income_total')!.value).toBe('10000.00');
    expect(byMetric.get('expense_total')!.value).toBe('6000.00');
    expect(byMetric.get('surplus')!.value).toBe('4000.00'); // 10000-6000
    expect(byMetric.get('savings_rate')!.value).toBe('0.4000'); // 4000/10000
    expect(byMetric.get('debt_ratio')!.value).toBe('0.2000'); // 10000/50000
    expect(byMetric.get('emergency_months')!.value).toBe('3.00'); // 18000/6000
  });

  it('income=0 时 savings_rate 为 null 且标注 verdict', () => {
    const f = computeFindingsFromData({
      incomeTotal: '0',
      expenseTotal: '0',
      totalAssets: '0',
      totalLiabilities: '0',
      cashAssets: '0',
    });
    const sr = f.find((x) => x.metric === 'savings_rate')!;
    expect(sr.value).toBeNull();
    expect(sr.verdict).toBeTruthy();
  });
});

describe('computeHealthScore（T038 加权 + 投资率缺失降权）', () => {
  const metrics = {
    incomeTotal: '10000',
    expenseTotal: '6000',
    totalAssets: '50000',
    totalLiabilities: '10000',
    cashAssets: '18000',
  };

  it('总分在 0–100，投资率缺失降权并标注', () => {
    const h = computeHealthScore(computeFindingsFromData(metrics));
    const total = Number(h.total);
    expect(total).toBeGreaterThanOrEqual(0);
    expect(total).toBeLessThanOrEqual(100);
    expect(h.dimensions.investmentRate.value).toBeNull();
    expect(h.dimensions.investmentRate.reason).toBeTruthy();
  });

  it('确定性可复现：相同输入得分一致（SC-006）', () => {
    const a = computeHealthScore(computeFindingsFromData(metrics)).total;
    const b = computeHealthScore(computeFindingsFromData(metrics)).total;
    expect(a).toBe(b);
  });
});
