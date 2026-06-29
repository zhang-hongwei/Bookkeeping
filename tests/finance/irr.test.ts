/**
 * US3 纯函数测试（T037）—— computeXirr（资金时间价值年化收益率）。
 *
 * 无 DB，立即执行。SC-002：结果与主流基金 IRR 计算器一致；不收敛 → null + reason。
 */
import { describe, it, expect } from 'vitest';
import { computeXirr } from '@/services/finance/irr';

const D = (s: string) => new Date(s);

describe('computeXirr（已知答案用例，SC-002）', () => {
  it('单期投入回收：−100 → +110（整 365 天），IRR = 10%', () => {
    // 注：2021 非闰年，2021-01-01→2022-01-01 恰 365 天，年分数=1.0
    const r = computeXirr([
      { date: D('2021-01-01'), amount: -100 },
      { date: D('2022-01-01'), amount: 110 },
    ]);
    expect(r.converged).toBe(true);
    expect(r.annualizedRate).not.toBeNull();
    expect(Number(r.annualizedRate)).toBeCloseTo(0.1, 5);
  });

  it('两年期：−1000 → +1210（整 730 天），IRR = 10%', () => {
    const r = computeXirr([
      { date: D('2021-01-01'), amount: -1000 },
      { date: D('2023-01-01'), amount: 1210 },
    ]);
    expect(r.converged).toBe(true);
    expect(Number(r.annualizedRate)).toBeCloseTo(0.1, 5);
  });

  it('亏损：−100 → +90（整 365 天），IRR = −10%', () => {
    const r = computeXirr([
      { date: D('2021-01-01'), amount: -100 },
      { date: D('2022-01-01'), amount: 90 },
    ]);
    expect(r.converged).toBe(true);
    expect(Number(r.annualizedRate)).toBeCloseTo(-0.1, 5);
  });

  it('多期定投 + 终端市值：收敛且为正', () => {
    // 每月投 1000，12 个月后市值 13000（盈利）
    const cfs = Array.from({ length: 12 }, (_, i) => ({
      date: new Date(Date.UTC(2020, i, 1)),
      amount: -1000,
    }));
    cfs.push({ date: new Date(Date.UTC(2020, 11, 1)), amount: 13000 });
    const r = computeXirr(cfs);
    expect(r.converged).toBe(true);
    expect(Number(r.annualizedRate)).toBeGreaterThan(0);
  });
});

describe('computeXirr（降级与边界）', () => {
  it('现金流不足 2 条 → null', () => {
    const r = computeXirr([{ date: D('2020-01-01'), amount: -100 }]);
    expect(r.converged).toBe(false);
    expect(r.annualizedRate).toBeNull();
  });

  it('现金流同号（无符号变化）→ null + reason', () => {
    const r = computeXirr([
      { date: D('2020-01-01'), amount: -100 },
      { date: D('2021-01-01'), amount: -50 },
    ]);
    expect(r.converged).toBe(false);
    expect(r.annualizedRate).toBeNull();
    expect(r.reason).toBeTruthy();
  });

  it('终端市值为 0（全亏）仍可给出负收益', () => {
    const r = computeXirr([
      { date: D('2020-01-01'), amount: -1000 },
      { date: D('2021-01-01'), amount: 0.01 },
    ]);
    expect(r.converged).toBe(true);
    expect(Number(r.annualizedRate)).toBeLessThan(-0.9);
  });
});
