/**
 * Phase 5 目标纯函数单测（T026）：三口径当前金额（D4）、进度+ETA（D5）、
 * unreachable 边界（I5/SC-003）、开放式目标不估 ETA（edge）。纯函数始终运行（无 DB）。
 *
 * 集成测试（T027/T035，门控 FINANCE_INTEGRATION_TEST=1）见文件末 suite。
 */
import { describe, it, expect } from 'vitest';
import {
  computeGoalCurrent,
  computeGoalProgress,
} from '@/services/finance/goal.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';

const NOW = new Date(Date.UTC(2026, 5, 1)); // 2026-06-01（确定性）

describe('computeGoalCurrent（D4 三口径）', () => {
  it('manual → manualAmount', () => {
    expect(
      computeGoalCurrent({ progressBasis: 'manual', manualAmount: '5000.00' }, {}),
    ).toBe(500000);
  });

  it('linked → Σ 关联账户余额（调用方传入）', () => {
    expect(
      computeGoalCurrent(
        { progressBasis: 'linked', manualAmount: '0' },
        { linkedBalanceCents: 300000 },
      ),
    ).toBe(300000);
  });

  it('net_worth → 总净资产', () => {
    expect(
      computeGoalCurrent(
        { progressBasis: 'net_worth', manualAmount: '0' },
        { netWorthCents: 1000000 },
      ),
    ).toBe(1000000);
  });
});

describe('computeGoalProgress（D5 ETA 算法）', () => {
  const base = {
    targetAmountCents: 3_000_000, // ¥30000
    currentCents: 1_000_000, // ¥10000
    windowMonths: 3,
    targetDate: '2026-12-31' as string | null,
    now: NOW,
  };

  it('avgSurplus>0 且可达 → on_track，monthsToGoal=ceil(remaining/avgSurplus)', () => {
    const p = computeGoalProgress({ ...base, surplusCents: [500000, 500000, 500000] }); // 月均 ¥5000
    expect(p.completed).toBe(false);
    expect(p.progressRate).toBe('0.3333');
    expect(p.eta.etaStatus).toBe('on_track');
    expect(p.eta.monthsToGoal).toBe(4); // ceil(20000/5000)
    expect(p.eta.etaDate).toBe('2026-10-01'); // now+4 月
    expect(p.eta.avgMonthlySurplus).toBe('5000.00');
  });

  it('ETA 超过 targetDate → at_risk', () => {
    const p = computeGoalProgress({
      ...base,
      surplusCents: [100000, 100000, 100000], // 月均 ¥1000 → 需 20 月
      targetDate: '2026-08-01',
    });
    expect(p.eta.etaStatus).toBe('at_risk');
    expect(p.eta.monthsToGoal).toBe(20);
  });

  it('avgSurplus≤0 → unreachable，无虚假日期（I5/SC-003）', () => {
    const neg = computeGoalProgress({ ...base, surplusCents: [-100000, -200000] });
    expect(neg.eta.etaStatus).toBe('unreachable');
    expect(neg.eta.etaDate).toBeNull();
    expect(neg.eta.monthsToGoal).toBeNull();

    const zero = computeGoalProgress({ ...base, surplusCents: [0, 0, 0] });
    expect(zero.eta.etaStatus).toBe('unreachable');
    expect(zero.eta.etaDate).toBeNull();
  });

  it('current≥target → completed（progressRate≥1）', () => {
    const p = computeGoalProgress({
      ...base,
      currentCents: 3_000_000,
      surplusCents: [500000, 500000, 500000],
    });
    expect(p.completed).toBe(true);
    expect(p.progressRate).toBe('1.0000');
    expect(p.eta.etaStatus).toBe('completed');
  });

  it('无 targetDate（开放式）→ 仅进度，不估 ETA（edge）', () => {
    const p = computeGoalProgress({
      ...base,
      targetDate: null,
      surplusCents: [500000, 500000, 500000],
    });
    expect(p.eta.etaDate).toBeNull();
    expect(p.eta.monthsToGoal).toBeNull();
    expect(p.progressRate).toBe('0.3333'); // 进度仍显示
  });

  it('确定性可复现：相同输入一致输出（SC-003）', () => {
    const input = { ...base, surplusCents: [500000, 400000, 600000] };
    expect(computeGoalProgress(input)).toEqual(computeGoalProgress(input));
  });
});

// ===== 集成测试（门控）：三口径取数、ETA 复现，需真实 DB =====
const suite = describe.skipIf(!INTEGRATION_ENABLED);
suite('目标集成（D4 三口径 / SC-003 ETA 复现）', () => {
  it('linked/net_worth 口径取数正确（骨架，需先建表+种子）', () => {
    expect(uniqueUserId()).toBeTruthy();
  });
});
