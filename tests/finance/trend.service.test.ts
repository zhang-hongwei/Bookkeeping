/**
 * Phase 6 多期趋势对比单测（T041）：
 * - computeTrendMetricSeries（纯函数）：series 值与各期结论一致（SC-004）、
 *   direction/deteriorating 正确（决策 10/13）、金额/比率 decimal 直通（I4）。
 */
import { describe, it, expect } from 'vitest';
import {
  computeTrendMetricSeries,
  TREND_METRICS,
} from '@/services/finance/trend.service';
import { TREND_DECLINE_PERIODS } from '@/services/finance/rules-engine.service';

describe('computeTrendMetricSeries 值直通（SC-004 / I4）', () => {
  it('输出 points 与输入期次/数值一一对应（不重算、不编造）', () => {
    const input = [
      { period: '2026-04', value: '0.4000' },
      { period: '2026-05', value: '0.3500' },
      { period: '2026-06', value: '0.3000' },
    ];
    const s = computeTrendMetricSeries('savings_rate', input);
    expect(s.points.map((p) => p.period)).toEqual(['2026-04', '2026-05', '2026-06']);
    expect(s.points.map((p) => p.value)).toEqual(['0.4000', '0.3500', '0.3000']);
  });

  it('比率/分值原样保留为 decimal 字符串（I4，禁浮点重算）', () => {
    const s = computeTrendMetricSeries('score', [
      { period: '2026-04', value: '80.00' },
      { period: '2026-05', value: '70.00' },
      { period: '2026-06', value: '60.00' },
    ]);
    for (const p of s.points) {
      expect(typeof p.value).toBe('string');
      expect(Number.isFinite(Number(p.value))).toBe(true);
    }
  });

  it('value 为 null 的点不计入输出时序', () => {
    const s = computeTrendMetricSeries('savings_rate', [
      { period: '2026-04', value: '0.4000' },
      { period: '2026-05', value: null },
      { period: '2026-06', value: '0.3000' },
    ]);
    expect(s.points).toHaveLength(2);
    expect(s.points.map((p) => p.period)).toEqual(['2026-04', '2026-06']);
  });
});

describe('computeTrendMetricSeries direction（决策 13）', () => {
  it('首末上升 → up', () => {
    expect(
      computeTrendMetricSeries('savings_rate', [
        { period: '2026-04', value: '0.3000' },
        { period: '2026-05', value: '0.4000' },
        { period: '2026-06', value: '0.5000' },
      ]).direction,
    ).toBe('up');
  });

  it('首末下降 → down', () => {
    expect(
      computeTrendMetricSeries('score', [
        { period: '2026-04', value: '80.00' },
        { period: '2026-05', value: '70.00' },
        { period: '2026-06', value: '60.00' },
      ]).direction,
    ).toBe('down');
  });

  it('首末相等 → flat', () => {
    expect(
      computeTrendMetricSeries('debt_ratio', [
        { period: '2026-04', value: '0.3000' },
        { period: '2026-05', value: '0.3500' },
        { period: '2026-06', value: '0.3000' },
      ]).direction,
    ).toBe('flat');
  });
});

describe('computeTrendMetricSeries deteriorating（决策 10）', () => {
  it('savings_rate 连续下降 → deteriorating=true', () => {
    const s = computeTrendMetricSeries('savings_rate', [
      { period: '2026-04', value: '0.5000' },
      { period: '2026-05', value: '0.4000' },
      { period: '2026-06', value: '0.3000' },
    ]);
    expect(s.deteriorating).toBe(true);
  });

  it('score 连续下降 → deteriorating=true', () => {
    const s = computeTrendMetricSeries('score', [
      { period: '2026-04', value: '80.00' },
      { period: '2026-05', value: '70.00' },
      { period: '2026-06', value: '60.00' },
    ]);
    expect(s.deteriorating).toBe(true);
  });

  it('debt_ratio 连续上升 → deteriorating=true（越低越好）', () => {
    const s = computeTrendMetricSeries('debt_ratio', [
      { period: '2026-04', value: '0.3000' },
      { period: '2026-05', value: '0.4000' },
      { period: '2026-06', value: '0.5000' },
    ]);
    expect(s.deteriorating).toBe(true);
  });

  it('非连续恶化 → deteriorating=false', () => {
    const stable = computeTrendMetricSeries('savings_rate', [
      { period: '2026-04', value: '0.4000' },
      { period: '2026-05', value: '0.4000' },
      { period: '2026-06', value: '0.4000' },
    ]);
    expect(stable.deteriorating).toBe(false);

    // 偶数期反弹、末位回升
    const bounce = computeTrendMetricSeries('savings_rate', [
      { period: '2026-04', value: '0.5000' },
      { period: '2026-05', value: '0.4000' },
      { period: '2026-06', value: '0.4500' },
    ]);
    expect(bounce.deteriorating).toBe(false);
  });

  it('数据不足 TREND_DECLINE_PERIODS 期 → deteriorating=false', () => {
    const s = computeTrendMetricSeries('score', [
      { period: '2026-05', value: '70.00' },
      { period: '2026-06', value: '60.00' },
    ]);
    expect(s.deteriorating).toBe(false);
  });
});

describe('computeTrendMetricSeries 可复现（纯函数）', () => {
  it('相同输入 → 完全一致输出', () => {
    const input = [
      { period: '2026-04', value: '0.4000' },
      { period: '2026-05', value: '0.3500' },
      { period: '2026-06', value: '0.3000' },
    ];
    expect(computeTrendMetricSeries('savings_rate', input)).toEqual(
      computeTrendMetricSeries('savings_rate', input),
    );
  });
});

describe('TREND_METRICS 指标集', () => {
  it('覆盖 savings_rate / debt_ratio / emergency_months / score', () => {
    expect(TREND_METRICS).toContain('savings_rate');
    expect(TREND_METRICS).toContain('debt_ratio');
    expect(TREND_METRICS).toContain('emergency_months');
    expect(TREND_METRICS).toContain('score');
    expect(TREND_DECLINE_PERIODS).toBeGreaterThanOrEqual(2);
  });
});
