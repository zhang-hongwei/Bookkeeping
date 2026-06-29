/**
 * US2/US4 纯函数测试（T025/T045）—— pnl.ts（盈亏/收益率/加权成本/配置/集中度）。
 *
 * 无 DB，立即执行。SC-003：盈亏 = 市值 − 成本、收益率 = 盈亏 / 成本。
 */
import { describe, it, expect } from 'vitest';
import {
  costFrom,
  marketValueFrom,
  pnl,
  pnlRate,
  weightedAvgCost,
  aggregateByType,
  allocationTotal,
  maxConcentrationRatio,
} from '@/services/finance/pnl';

describe('marketValueFrom / costFrom（份额 × 单价，SC-003）', () => {
  it('市值 = 1000 份 × ¥1.20 = ¥1,200.00', () => {
    expect(marketValueFrom('1000', '1.20')).toBe('1200.00');
  });
  it('成本 = 1000 份 × ¥1.00 = ¥1,000.00', () => {
    expect(costFrom('1000', '1.00')).toBe('1000.00');
  });
  it('非数值输入 → 0', () => {
    expect(marketValueFrom('abc', '1.00')).toBe('0');
  });
  it('高精度份额/单价四舍五入到分', () => {
    // 123.456789 份 × ¥1.234567 ≈ 152.42
    expect(marketValueFrom('123.456789', '1.234567')).toBe('152.42');
  });
});

describe('pnl / pnlRate（盈亏与收益率，SC-003）', () => {
  it('盈亏 = 市值 − 成本', () => {
    expect(pnl('1200.00', '1000.00')).toBe('200.00');
    expect(pnl('800.00', '1000.00')).toBe('-200.00');
  });
  it('收益率 = 盈亏 / 成本（+20%）', () => {
    expect(pnlRate('200.00', '1000.00')).toBe('0.200000');
  });
  it('成本为 0 → 收益率 null（不除零）', () => {
    expect(pnlRate('200.00', '0')).toBeNull();
  });
});

describe('weightedAvgCost（买入后加权平均成本价）', () => {
  it('首次买入：成本价 = 成交价', () => {
    expect(weightedAvgCost('0', '0', '1000', '1.000000')).toBe('1.000000');
  });
  it('追加买入：加权平均', () => {
    // 1000 份@1.0 + 1000 份@1.5 → 总成本 2500 / 总份额 2000 = 1.25
    expect(weightedAvgCost('1000', '1.000000', '1000', '1.500000')).toBe('1.250000');
  });
  it('卖出（份额减少）不在此函数处理：成本价不变由调用方保证', () => {
    // 仅校验非追加场景下不误算
    expect(weightedAvgCost('1000', '1.250000', '0', '0')).toBe('1.250000');
  });
});

describe('aggregateByType / allocationTotal / maxConcentrationRatio（配置与集中度，SC-005）', () => {
  const items = [
    { instrumentType: 'fund', marketValue: '1200.00' },
    { instrumentType: 'stock', marketValue: '800.00' },
  ];

  it('按类型聚合占比，合计为 1（按市值降序）', () => {
    const agg = aggregateByType(items);
    expect(agg).toHaveLength(2);
    expect(agg[0]).toMatchObject({ instrumentType: 'fund', marketValue: '1200.00', ratio: '0.600000' });
    expect(agg[1]).toMatchObject({ instrumentType: 'stock', marketValue: '800.00', ratio: '0.400000' });
    // 占比合计 ≈ 1
    const ratioSum = agg.reduce((s, a) => s + Number(a.ratio), 0);
    expect(ratioSum).toBeCloseTo(1, 6);
  });

  it('allocationTotal = Σ 市值', () => {
    expect(allocationTotal(items)).toBe('2000.00');
  });

  it('最大集中度 = max(市值)/总（60%）', () => {
    expect(maxConcentrationRatio(items)).toBe('0.600000');
  });

  it('单一品种超 60% 阈值判定', () => {
    const concentrated = [
      { instrumentType: 'fund', marketValue: '6500.00' },
      { instrumentType: 'stock', marketValue: '3500.00' },
    ];
    const ratio = Number(maxConcentrationRatio(concentrated));
    expect(ratio).toBeGreaterThan(0.6); // 触发集中度预警
  });
});
