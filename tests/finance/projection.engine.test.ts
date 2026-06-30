/**
 * Phase 7 纯函数引擎测试（T011 US1 + T031 US3）—— projection.engine。
 *
 * 无 DB，立即执行（始终运行，不依赖 FINANCE_INTEGRATION_TEST）。
 * - SC-001：what-if 可复现、与基线一致（netWorthDelta = scenario − baseline，I3）。
 * - I4：投影点 monthOffset 连续无空洞。
 * - I8：退休三点单调（悲观 ≤ 中性 ≤ 乐观）。
 */
import { describe, it, expect } from 'vitest';
import {
  buildSurplusProfile,
  projectBaseline,
  projectScenario,
  projectRetirement,
  scanSensitivity,
  verdictSustainability,
} from '@/services/finance/projection.engine';
import type { RetirementAssumptions } from '@/database/schema/finance/retirement-simulations';

const baselineInput = {
  startNetWorthCents: 1_000_000, // 10000.00
  startLiquidAssetsCents: 300_000, // 3000.00
  monthlyExpenseCents: 100_000, // 1000.00 → 应急金 3 月
  horizonMonths: 12,
};

const profile = buildSurplusProfile({
  monthlySurpluses: ['5000.00', '5000.00', '5000.00'],
  averageMonthlyIncomeCents: 150_000, // 1500.00
  averageMonthlyExpenseCents: 100_000, // 1000.00 → 结余 5000... wait 500.00
})!;

describe('buildSurplusProfile', () => {
  it('空序列 → null（触发降级，NC6）', () => {
    expect(
      buildSurplusProfile({
        monthlySurpluses: [],
        averageMonthlyIncomeCents: 0,
        averageMonthlyExpenseCents: 0,
      }),
    ).toBeNull();
  });

  it('计算平均结余（分）', () => {
    expect(profile.averageMonthlySurplusCents).toBe(500_000); // 5000.00
    expect(profile.months).toBe(3);
  });
});

describe('projectBaseline（SC-001 可复现 / I4 连续）', () => {
  it('同输入重算结果一致（可复现）', () => {
    const a = projectBaseline({ ...baselineInput, surplusProfile: profile });
    const b = projectBaseline({ ...baselineInput, surplusProfile: profile });
    expect(a).toEqual(b);
  });

  it('monthOffset 连续 0..horizon 无空洞（I4）', () => {
    const pts = projectBaseline({ ...baselineInput, surplusProfile: profile });
    expect(pts.map((p) => p.monthOffset)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('净资产 = 起点 + 累计结余；应急金 = 流动资产 / 月支出', () => {
    const pts = projectBaseline({ ...baselineInput, surplusProfile: profile });
    // offset 0: netWorth 10000.00, emergency 3.0
    expect(pts[0].netWorth).toBe('10000.00');
    expect(pts[0].emergencyMonths).toBe(3);
    // offset 12: +12×5000 = +60000 → 70000.00；流动 3000+60000=63000 → /1000=63
    expect(pts[12].netWorth).toBe('70000.00');
    expect(pts[12].emergencyMonths).toBe(63);
  });

  it('结余 ≤ 0 → 基线持平/下行', () => {
    const flat = buildSurplusProfile({
      monthlySurpluses: ['0.00', '0.00'],
      averageMonthlyIncomeCents: 100_000,
      averageMonthlyExpenseCents: 100_000,
    })!;
    const pts = projectBaseline({ ...baselineInput, surplusProfile: flat });
    expect(pts[0].netWorth).toBe(pts[12].netWorth); // 持平
  });
});

describe('projectScenario（I3 diff / 降薪窗口恢复 / 大额支出）', () => {
  it('无 delta 时 scenario == baseline（delta=0）', () => {
    const pts = projectScenario({
      ...baselineInput,
      surplusProfile: profile,
      assumptions: { incomeDeltaPct: 0, durationMonths: 1 },
    });
    for (const p of pts) {
      expect(p.netWorthDelta).toBe('0.00');
      expect(p.scenarioNetWorth).toBe(p.baselineNetWorth);
    }
  });

  it('netWorthDelta = scenarioNetWorth − baselineNetWorth（I3，逐点）', () => {
    const pts = projectScenario({
      ...baselineInput,
      surplusProfile: profile,
      assumptions: { incomeDeltaPct: -0.3, durationMonths: 6 },
    });
    for (const p of pts) {
      const diff =
        Math.round((Number(p.scenarioNetWorth) - Number(p.baselineNetWorth)) * 100) / 100;
      expect(Number(p.netWorthDelta)).toBeCloseTo(diff, 2);
    }
  });

  it('降薪 30% 持续 6 月：窗口内下行，之后恢复与基线平行（NC2）', () => {
    const pts = projectScenario({
      ...baselineInput,
      surplusProfile: profile,
      assumptions: { incomeDeltaPct: -0.3, durationMonths: 6 },
    });
    // offset 0 无影响
    expect(pts[0].netWorthDelta).toBe('0.00');
    // 窗口内 delta 为负（降薪减少结余）
    expect(Number(pts[3].netWorthDelta)).toBeLessThan(0);
    // 窗口外（offset 8）每月增量恢复为基线结余，故 delta 在 7..12 各月增量相同（平行）
    const delta7 = Number(pts[7].netWorthDelta);
    const delta8 = Number(pts[8].netWorthDelta);
    const delta9 = Number(pts[9].netWorthDelta);
    expect(delta8 - delta7).toBeCloseTo(delta9 - delta8, 2);
  });

  it('一次性大额支出在 affectedMonth 扣除', () => {
    const pts = projectScenario({
      ...baselineInput,
      surplusProfile: profile,
      assumptions: {
        incomeDeltaPct: 0,
        durationMonths: 1,
        lumpExpense: '2000.00',
        affectedMonth: 3,
      },
    });
    // offset 2 未扣
    expect(Number(pts[2].netWorthDelta)).toBe(0);
    // offset 3 起扣 2000 → delta -2000
    expect(Number(pts[3].netWorthDelta)).toBe(-2000);
    expect(Number(pts[12].netWorthDelta)).toBe(-2000);
  });
});

describe('projectRetirement / scanSensitivity（I8 三点单调）', () => {
  const assumptions: RetirementAssumptions = {
    currentAge: 30,
    retirementAge: 60,
    monthlyContribution: '5000.00',
    realReturnRatePct: 4.0,
    inflationPct: 2.5,
    postRetirementMonthlySpend: '8000.00',
    withdrawalRatePct: 4.0,
  };
  const input = { assumptions, horizonMonths: 360 };

  it('三点 corpus 单调（悲观 ≤ 中性 ≤ 乐观，I8）', () => {
    const { pessimistic, baseline, optimistic } = scanSensitivity(input);
    const p = Number(pessimistic.retirementCorpus);
    const b = Number(baseline.retirementCorpus);
    const o = Number(optimistic.retirementCorpus);
    expect(p).toBeLessThanOrEqual(b);
    expect(b).toBeLessThanOrEqual(o);
  });

  it('长期 480 点性能 < 50ms（NC8）', () => {
    const longInput = { assumptions, horizonMonths: 480 };
    const start = Date.now();
    for (let i = 0; i < 10; i++) scanSensitivity(longInput);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500); // 10 次 < 500ms（含扫描三点，宽松上限）
  });

  it('verdictSustainability：提取覆盖支出 → sustainable；corpus 0 → insufficient', () => {
    const ok = {
      retirementCorpus: '1000000.00',
      monthlySustainable: '10000.00', // ≥ 8000 支出
      depletionAge: null,
    };
    expect(verdictSustainability(ok, '8000.00')).toBe('sustainable');
    const broke = {
      retirementCorpus: '0.00',
      monthlySustainable: '0.00',
      depletionAge: 61,
    };
    expect(verdictSustainability(broke, '8000.00')).toBe('insufficient');
  });
});
