/**
 * Phase 6 现金流预测单测（T005）：纯函数可复现（I3）、不确定性区间、
 * 历史不足降级（SC-001/SC-005）、金额 decimal（I4）。
 */
import { describe, it, expect } from 'vitest';
import { computeForecast, FORECAST_MODEL_VERSION } from '@/services/finance/forecast.service';

const DECIMAL_RE = /^-?\d+\.\d{2}$/;

describe('computeForecast 历史不足降级（SC-005 / I3）', () => {
  it('历史 < MIN_HISTORY_MONTHS → insufficientHistory=true、points 为空', () => {
    const r = computeForecast({
      surplusSeries: ['4000', '3500'], // 2 个月 < 3
      cashAssets: '10000',
      monthlyExpense: '5000',
      targetMonth: '2026-06',
      horizon: 3,
    });
    expect(r.insufficientHistory).toBe(true);
    expect(r.points).toEqual([]);
    expect(r.emergencyShortfallMonth).toBeNull();
  });
});

describe('computeForecast 充足历史（SC-001）', () => {
  const baseInput = {
    surplusSeries: ['4000', '4000', '4000', '4000', '4000', '4000'],
    cashAssets: '50000',
    monthlyExpense: '1000',
    targetMonth: '2026-06',
    horizon: 3,
  };

  it('产出 horizon 个预测点，月份连续递增', () => {
    const r = computeForecast(baseInput);
    expect(r.insufficientHistory).toBe(false);
    expect(r.points).toHaveLength(3);
    expect(r.points.map((p) => p.month)).toEqual(['2026-07', '2026-08', '2026-09']);
  });

  it('每个点含不确定性区间且 lower ≤ surplus ≤ upper（决策 2/3）', () => {
    const r = computeForecast(baseInput);
    for (const p of r.points) {
      expect(Number(p.lower)).toBeLessThanOrEqual(Number(p.surplus));
      expect(Number(p.surplus)).toBeLessThanOrEqual(Number(p.upper));
    }
  });

  it('稳定序列 → 区间收窄（残差≈0，lower≈upper≈surplus）', () => {
    const r = computeForecast(baseInput);
    for (const p of r.points) {
      expect(Number(p.upper) - Number(p.lower)).toBeLessThanOrEqual(2); // 几乎无波动
    }
  });

  it('波动序列 → 区间变宽（反映残差）', () => {
    const steady = computeForecast(baseInput);
    const volatile = computeForecast({
      ...baseInput,
      surplusSeries: ['8000', '0', '8000', '0', '8000', '0'],
    });
    const steadyWidth =
      Number(steady.points[0].upper) - Number(steady.points[0].lower);
    const volatileWidth =
      Number(volatile.points[0].upper) - Number(volatile.points[0].lower);
    expect(volatileWidth).toBeGreaterThan(steadyWidth);
  });

  it('金额一律 decimal 2 位字符串（I4）', () => {
    const r = computeForecast(baseInput);
    for (const p of r.points) {
      expect(p.surplus).toMatch(DECIMAL_RE);
      expect(p.cashBalance).toMatch(DECIMAL_RE);
      expect(p.lower).toMatch(DECIMAL_RE);
      expect(p.upper).toMatch(DECIMAL_RE);
    }
  });

  it('模型版本非空（SC-002 可追溯）', () => {
    const r = computeForecast(baseInput);
    expect(r.modelVersion).toBe(FORECAST_MODEL_VERSION);
  });
});

describe('computeForecast 应急金不足点（User Story 1）', () => {
  it('现金充足且结余为正 → 无不足月', () => {
    const r = computeForecast({
      surplusSeries: ['4000', '4000', '4000', '4000', '4000', '4000'],
      cashAssets: '50000',
      monthlyExpense: '1000',
      targetMonth: '2026-06',
      horizon: 3,
    });
    expect(r.emergencyShortfallMonth).toBeNull();
  });

  it('高支出低现金 → 定位首个不足月', () => {
    const r = computeForecast({
      surplusSeries: ['1000', '1000', '1000', '1000', '1000', '1000'],
      cashAssets: '5000',
      monthlyExpense: '6000', // 阈值 = 3×6000 = 18000，现金 5000 远低
      targetMonth: '2026-06',
      horizon: 3,
    });
    expect(r.emergencyShortfallMonth).toBe('2026-07'); // 首个未来月即不足
  });

  it('结余为负持续消耗现金 → 后续月份触发不足', () => {
    const r = computeForecast({
      surplusSeries: ['5000', '4000', '3000', '2000', '1000', '0'],
      cashAssets: '12000',
      monthlyExpense: '2000', // 阈值 = 6000
      targetMonth: '2026-06',
      horizon: 6,
    });
    // 趋势下行；首个月未必不足，但若干月后现金跌破阈值
    expect(r.emergencyShortfallMonth).not.toBeNull();
  });
});

describe('computeForecast 纯函数可复现（I3）', () => {
  it('相同输入 → 完全一致输出', () => {
    const input = {
      surplusSeries: ['3000', '3500', '4000', '3800', '4200', '4500'],
      cashAssets: '20000',
      monthlyExpense: '3000',
      targetMonth: '2026-06',
      horizon: 3,
    };
    const a = computeForecast(input);
    const b = computeForecast(input);
    expect(a).toEqual(b);
  });

  it('不同输入 → 不同输出', () => {
    const base = {
      surplusSeries: ['3000', '3500', '4000', '3800', '4200', '4500'],
      cashAssets: '20000',
      monthlyExpense: '3000',
      targetMonth: '2026-06',
      horizon: 3,
    };
    const a = computeForecast(base);
    const b = computeForecast({ ...base, surplusSeries: base.surplusSeries.map((s) => `${Number(s) + 1000}`) });
    expect(a.points).not.toEqual(b.points);
  });
});
