/**
 * US3/US4 单元测试（T027/T038）：规则引擎 findings 公式 + 健康分加权（确定性可复现）。
 * Phase 6（T004）：investmentRate 接持仓 + cashflow 方差稳定性。
 */
import { describe, it, expect } from 'vitest';
import {
  computeFindingsFromData,
  computeHealthScore,
  cashflowStabilityScore,
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

describe('computeHealthScore investmentRate（T004，接 Phase 3 持仓）', () => {
  const findings = computeFindingsFromData({
    incomeTotal: '10000',
    expenseTotal: '6000',
    totalAssets: '50000',
    totalLiabilities: '10000',
    cashAssets: '18000',
  });

  it('提供持仓数据时 investmentRate 有值且计入加权', () => {
    const h = computeHealthScore(findings, {
      investmentAssets: '20000',
      totalAssets: '50000',
    });
    expect(h.dimensions.investmentRate.value).toBe('0.4000'); // 20000/50000
    expect(h.dimensions.investmentRate.score).not.toBeNull();
    expect(h.dimensions.investmentRate.score).toBeGreaterThanOrEqual(0);
    expect(h.dimensions.investmentRate.score).toBeLessThanOrEqual(100);
  });

  it('不提供持仓数据时 investmentRate 降权（null + reason）', () => {
    const h = computeHealthScore(findings);
    expect(h.dimensions.investmentRate.value).toBeNull();
    expect(h.dimensions.investmentRate.score).toBeNull();
    expect(h.dimensions.investmentRate.reason).toBeTruthy();
  });

  it('总资产为 0 时 investmentRate 标注 no_assets', () => {
    const h = computeHealthScore(findings, {
      investmentAssets: '0',
      totalAssets: '0',
    });
    expect(h.dimensions.investmentRate.value).toBeNull();
    expect(h.dimensions.investmentRate.reason).toBe('no_assets');
  });

  it('投资率越高得分越高（单调）', () => {
    const low = computeHealthScore(findings, {
      investmentAssets: '2500',
      totalAssets: '50000',
    });
    const high = computeHealthScore(findings, {
      investmentAssets: '25000',
      totalAssets: '50000',
    });
    expect(
      (high.dimensions.investmentRate.score ?? 0) >=
        (low.dimensions.investmentRate.score ?? 0),
    ).toBe(true);
  });
});

describe('cashflowStabilityScore（T004，方差稳定性 / 决策 12）', () => {
  it('单点序列退化为正负二元（向后兼容）', () => {
    expect(cashflowStabilityScore([500000]).score).toBe(100);
    expect(cashflowStabilityScore([-500000]).score).toBe(30);
  });

  it('相同最近一期结余、不同波动 → 不同得分（反映方差）', () => {
    const stable = [400000, 400000, 400000, 400000]; // 均值稳定、低方差
    const volatile = [1000000, -200000, 1000000, -200000]; // 最近一期=200000 与 stable 不同
    // 直接验证：稳定序列得分高于高方差序列（取最近一期相同的对照）
    const stableScore = cashflowStabilityScore([300000, 400000, 350000, 400000]).score;
    const volatileScore = cashflowStabilityScore([800000, -50000, 800000, 400000]).score;
    expect(stableScore).toBeGreaterThan(volatileScore);
  });

  it('全非负且稳定的序列得分高于含透支月的序列', () => {
    const allPositive = cashflowStabilityScore([400000, 400000, 400000]).score;
    const withDeficit = cashflowStabilityScore([400000, -100000, 400000]).score;
    expect(allPositive).toBeGreaterThan(withDeficit);
  });

  it('得分钳制在 [20, 100]', () => {
    const worst = cashflowStabilityScore([-100, -200, -300, -4000000]).score;
    expect(worst).toBeGreaterThanOrEqual(20);
    expect(worst).toBeLessThanOrEqual(100);
  });
});

describe('computeHealthScore cashflow（T004，反映方差）', () => {
  const findings = computeFindingsFromData({
    incomeTotal: '10000',
    expenseTotal: '6000',
    totalAssets: '50000',
    totalLiabilities: '10000',
    cashAssets: '18000',
  });

  it('稳定序列得分高于波动序列', () => {
    const stable = computeHealthScore(findings, {
      surplusSeries: ['4000', '4000', '4000'],
    });
    const volatile = computeHealthScore(findings, {
      surplusSeries: ['8000', '-2000', '4000'],
    });
    expect(stable.dimensions.cashflow.score).toBeGreaterThan(
      volatile.dimensions.cashflow.score ?? 0,
    );
  });

  it('确定性可复现：相同序列得分一致', () => {
    const a = computeHealthScore(findings, {
      surplusSeries: ['4000', '3800', '4200'],
    }).dimensions.cashflow.score;
    const b = computeHealthScore(findings, {
      surplusSeries: ['4000', '3800', '4200'],
    }).dimensions.cashflow.score;
    expect(a).toBe(b);
  });
});
