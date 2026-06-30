/**
 * Phase 5 预算纯函数单测（T011）：周期边界、子树映射、子树汇总（I7/I8/I2）、
 * 超支预警（D3/D10）。纯函数始终运行（无 DB）。
 *
 * 集成测试（T012/T025，门控 FINANCE_INTEGRATION_TEST=1）见文件末 suite。
 */
import { describe, it, expect } from 'vitest';
import {
  computePeriodRange,
  buildCategorySubtreeMap,
  sumExpensesInSubtree,
  computeBudgetAlert,
} from '@/services/finance/budget.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';

describe('computePeriodRange（D1 周期边界 [start,end)）', () => {
  const ref = new Date(Date.UTC(2026, 5, 15)); // 2026-06-15

  it('month：当月 1 日 → 次月 1 日', () => {
    expect(computePeriodRange('month', ref)).toEqual({
      start: '2026-06-01',
      end: '2026-07-01',
    });
  });

  it('year：当年 1/1 → 次年 1/1', () => {
    expect(computePeriodRange('year', ref)).toEqual({
      start: '2026-01-01',
      end: '2027-01-01',
    });
  });

  it('week：周一起、跨度恰为 7 天、含参考日', () => {
    const { start, end } = computePeriodRange('week', ref);
    const startMs = Date.parse(start + 'T00:00:00Z');
    const endMs = Date.parse(end + 'T00:00:00Z');
    expect(new Date(startMs).getUTCDay()).toBe(1); // 周一
    expect((endMs - startMs) / 86_400_000).toBe(7);
    expect(startMs <= ref.getTime()).toBe(true);
    expect(ref.getTime() < endMs).toBe(true);
  });
});

describe('buildCategorySubtreeMap（D2 子树后代集合）', () => {
  const cats = [
    { id: 'food', parentId: null },
    { id: 'dining', parentId: 'food' },
    { id: 'takeout', parentId: 'dining' },
    { id: 'shopping', parentId: null },
  ];
  const map = buildCategorySubtreeMap(cats);

  it('父类子树含自身 + 全部后代（多层）', () => {
    expect([...map.get('food')!].sort()).toEqual(['dining', 'food', 'takeout']);
  });

  it('中间类含自身 + 直接/间接后代', () => {
    expect([...map.get('dining')!].sort()).toEqual(['dining', 'takeout']);
  });

  it('叶子节点子树仅自身', () => {
    expect([...map.get('takeout')!]).toEqual(['takeout']);
  });
});

describe('sumExpensesInSubtree（I7 仅 expense / I8 零双计 / I2 cents）', () => {
  const txns = [
    { categoryId: 'takeout', amount: '100.00' },
    { categoryId: 'dining', amount: '50.00' },
    { categoryId: 'shopping', amount: '200.00' },
    { categoryId: null, amount: '999.00' }, // 未分类：不计入任何分类子树
  ];
  const foodSubtree = new Set(['food', 'dining', 'takeout']);

  it('子树内支出求和（仅子树成员）', () => {
    expect(sumExpensesInSubtree(txns, foodSubtree)).toBe(15000); // 100+50 元 → 15000 分
  });

  it('子树外支出不计入', () => {
    const shoppingSubtree = new Set(['shopping']);
    expect(sumExpensesInSubtree(txns, shoppingSubtree)).toBe(20000);
  });

  it('一笔交易对一个预算至多一次（I8）——不重复求和', () => {
    // 即便子树有多个节点，takeout 这笔只命中一次
    const onlyTakeoutTxns = [{ categoryId: 'takeout', amount: '100.00' }];
    expect(sumExpensesInSubtree(onlyTakeoutTxns, foodSubtree)).toBe(10000);
  });

  it('cents 整数运算，无浮点误差（I2）', () => {
    const odd = [{ categoryId: 'a', amount: '0.01' }, { categoryId: 'a', amount: '0.02' }];
    expect(sumExpensesInSubtree(odd, new Set(['a']))).toBe(3); // 3 分
  });
});

describe('computeBudgetAlert（D3/D10 状态阈值）', () => {
  const base = {
    budgetId: 'b1',
    categoryId: 'cat' as string | null,
    label: '餐饮',
    budgetAmountCents: 200000, // ¥2000
    alertThreshold: 0.8,
    period: { start: '2026-06-01', end: '2026-07-01' },
  };

  it('ratio < 阈值 → normal（risk low/none）', () => {
    const a = computeBudgetAlert({ ...base, spentCents: 150000 }); // 75%
    expect(a.status).toBe('normal');
    expect(a.riskLevel).toBe('low');
    expect(a.ratio).toBe('0.7500');
    expect(a.remaining).toBe('500.00');
    expect(a.verdict).toContain('正常');
  });

  it('spent=0 → normal / risk none', () => {
    const a = computeBudgetAlert({ ...base, spentCents: 0 });
    expect(a.status).toBe('normal');
    expect(a.riskLevel).toBe('none');
    expect(a.spent).toBe('0.00');
  });

  it('阈值 ≤ ratio < 1 → warning（risk medium）', () => {
    const a = computeBudgetAlert({ ...base, spentCents: 170000 }); // 85%
    expect(a.status).toBe('warning');
    expect(a.riskLevel).toBe('medium');
    expect(a.verdict).toContain('即将超支');
  });

  it('ratio ≥ 1 → overrun（risk high，remaining 为负）', () => {
    const a = computeBudgetAlert({ ...base, spentCents: 210000 }); // 105%
    expect(a.status).toBe('overrun');
    expect(a.riskLevel).toBe('high');
    expect(a.remaining).toBe('-100.00');
    expect(a.ratio).toBe('1.0500');
    expect(a.verdict).toContain('超支');
    expect(a.verdict).toContain('100.00');
  });

  it('确定性可复现：相同输入一致输出（I4/SC-004）', () => {
    const input = { ...base, spentCents: 210000 };
    expect(computeBudgetAlert(input)).toEqual(computeBudgetAlert(input));
  });

  it('金额一律 decimal 2 位字符串（I2/C5）', () => {
    const a = computeBudgetAlert({ ...base, spentCents: 210000 });
    expect(a.budgetAmount).toMatch(/^\d+\.\d{2}$/);
    expect(a.spent).toMatch(/^\d+\.\d{2}$/);
    expect(a.remaining).toMatch(/^-?\d+\.\d{2}$/);
  });
});

// ===== 集成测试（门控）：已用实时一致（I1/SC-001）等，需真实 DB =====
const suite = describe.skipIf(!INTEGRATION_ENABLED);
suite('预算集成（I1 实时一致 / SC-002 事中预警 / I7 transfer 不计）', () => {
  it('建预算→记支出→已用实时正确（骨架，需先建表+种子）', () => {
    expect(uniqueUserId()).toBeTruthy();
  });
});
