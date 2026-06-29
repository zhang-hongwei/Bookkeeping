/**
 * 家庭净资产聚合纯函数测试（Phase 4 / US1）。
 *
 * 纯函数、无 DB，始终运行（不依赖 FINANCE_INTEGRATION_TEST）。
 * 覆盖不变量 I1（家庭=Σ成员）、I5（按 memberId 不重复计）、I8（金额字符串/内部 cents）。
 */
import { describe, it, expect } from 'vitest';
import { sumMemberNetWorth } from '@/services/finance/family-aggregate';

describe('sumMemberNetWorth', () => {
  it('家庭净值 = 各成员净值之和（I1）', () => {
    const r = sumMemberNetWorth([
      {
        memberId: 'm-a',
        netWorth: { totalAssets: '500.00', totalLiabilities: '100.00', netWorth: '400.00' },
      },
      {
        memberId: 'm-b',
        netWorth: { totalAssets: '360.00', totalLiabilities: '60.00', netWorth: '300.00' },
      },
    ]);
    expect(r.totalAssets).toBe('860.00');
    expect(r.totalLiabilities).toBe('160.00');
    expect(r.netWorth).toBe('700.00'); // 400 + 300 == 860 - 160
  });

  it('memberBreakdown 的 key 为 memberId，且其和 == 家庭净值（I1/I5）', () => {
    const r = sumMemberNetWorth([
      { memberId: 'a', netWorth: { totalAssets: '1.00', totalLiabilities: '0', netWorth: '1.00' } },
      { memberId: 'b', netWorth: { totalAssets: '2.00', totalLiabilities: '0', netWorth: '2.00' } },
      { memberId: 'c', netWorth: { totalAssets: '3.30', totalLiabilities: '0', netWorth: '3.30' } },
    ]);
    expect(r.memberBreakdown).toEqual({ a: '1.00', b: '2.00', c: '3.30' });
    // 按成员求和 == 家庭净值（无重复计入，I5）
    const sumBreakdown = Object.values(r.memberBreakdown).reduce(
      (s, v) => s + Number(v),
      0,
    );
    expect(Number(r.netWorth)).toBeCloseTo(sumBreakdown, 2);
  });

  it('空家庭净值 = 0（边界）', () => {
    const r = sumMemberNetWorth([]);
    expect(r.totalAssets).toBe('0.00');
    expect(r.totalLiabilities).toBe('0.00');
    expect(r.netWorth).toBe('0.00');
    expect(r.memberBreakdown).toEqual({});
  });

  it('单成员恒等：家庭净值 == 该成员净值', () => {
    const r = sumMemberNetWorth([
      { memberId: 'solo', netWorth: { totalAssets: '123.45', totalLiabilities: '23.45', netWorth: '100.00' } },
    ]);
    expect(r.netWorth).toBe('100.00');
    expect(r.memberBreakdown).toEqual({ solo: '100.00' });
  });

  it('金额字符串保持 2 位小数（I8，内部 cents 求和避免浮点漂移）', () => {
    const r = sumMemberNetWorth([
      { memberId: 'a', netWorth: { totalAssets: '0.10', totalLiabilities: '0', netWorth: '0.10' } },
      { memberId: 'b', netWorth: { totalAssets: '0.20', totalLiabilities: '0', netWorth: '0.20' } },
    ]);
    expect(r.netWorth).toBe('0.30'); // 非浮点 0.30000000004
  });

  it('支持负净值成员（负债 > 资产）', () => {
    const r = sumMemberNetWorth([
      { memberId: 'a', netWorth: { totalAssets: '50.00', totalLiabilities: '150.00', netWorth: '-100.00' } },
      { memberId: 'b', netWorth: { totalAssets: '300.00', totalLiabilities: '0', netWorth: '300.00' } },
    ]);
    expect(r.netWorth).toBe('200.00');
  });
});
