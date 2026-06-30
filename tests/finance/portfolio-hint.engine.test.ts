/**
 * US4 组合优化纯函数引擎测试（T041）—— portfolio-hint.engine。
 *
 * 无 DB，立即执行。
 * - I10：direction='ok' ⇔ 落在 band 内（under/over/ok 正确）。
 * - I11：hint 不含具体品种/买卖数量。
 * - 扩展不破坏既有 computeConcentrationAlert。
 * - 总市值 0 / 空持仓 → 空（NC6 不编造）。
 */
import { describe, it, expect } from 'vitest';
import {
  aggregateByAssetClass,
  computeHints,
  INSTRUMENT_TYPE_TO_ASSET_CLASS,
  PORTFOLIO_HINT_ENGINE_VERSION,
} from '@/services/finance/portfolio-hint.engine';
import { targetBands } from '@/services/finance/config/target-bands';
import { toCents } from '@/services/finance/money';
import { computeConcentrationAlert } from '@/services/finance/rules-engine.service';

describe('aggregateByAssetClass（按资产类别聚合占比）', () => {
  it('按 instrumentType → assetClass 映射聚合（equity/fixed_income）', () => {
    const { items, totalCents } = aggregateByAssetClass([
      { instrumentType: 'stock', marketValue: '60000.00' },
      { instrumentType: 'etf', marketValue: '20000.00' }, // → equity
      { instrumentType: 'bond', marketValue: '20000.00' }, // → fixed_income
    ]);
    expect(totalCents).toBe(toCents('100000'));
    const equity = items.find((i) => i.assetClass === 'equity');
    expect(equity?.ratio).toBeCloseTo(0.8, 6);
    const fi = items.find((i) => i.assetClass === 'fixed_income');
    expect(fi?.ratio).toBeCloseTo(0.2, 6);
  });

  it('总市值 0 / 空持仓 → 空 items（NC6 不编造）', () => {
    expect(aggregateByAssetClass([]).items).toEqual([]);
    expect(
      aggregateByAssetClass([{ instrumentType: 'stock', marketValue: '0' }]).items,
    ).toEqual([]);
  });

  it('未知品种类型 → 归入 alternative（保守归类，避免漏算）', () => {
    const { items } = aggregateByAssetClass([
      { instrumentType: 'stock', marketValue: '100.00' },
      { instrumentType: 'unknown_type', marketValue: '100.00' },
    ]);
    expect(items.find((i) => i.assetClass === 'alternative')).toBeTruthy();
  });

  it('gold/reits/crypto → alternative', () => {
    const { items } = aggregateByAssetClass([
      { instrumentType: 'gold', marketValue: '10.00' },
      { instrumentType: 'crypto', marketValue: '10.00' },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].assetClass).toBe('alternative');
    expect(items[0].ratio).toBeCloseTo(1, 6);
  });
});

describe('computeHints（I10 direction / I11 不含品种数量）', () => {
  it('低于下限 → under；高于上限 → over；区间内 → ok（I10）', () => {
    // targetBands: equity 0.3–0.6, fixed_income 0.2–0.4, alternative 0–0.15
    const ratios = [
      { assetClass: 'equity', ratio: 0.8, marketValueCents: 8000 }, // over
      { assetClass: 'fixed_income', ratio: 0.1, marketValueCents: 1000 }, // under
      { assetClass: 'alternative', ratio: 0.1, marketValueCents: 1000 }, // ok
    ];
    const byClass = Object.fromEntries(
      computeHints(ratios, targetBands.bands).map((h) => [h.assetClass, h]),
    );
    expect(byClass.equity.direction).toBe('over');
    expect(byClass.fixed_income.direction).toBe('under');
    expect(byClass.alternative.direction).toBe('ok');
  });

  it('direction=ok ⇔ 落在 band 内（I10 边界等价）', () => {
    const band = { min: 0.3, max: 0.6 };
    const mk = (r: number) =>
      computeHints(
        [{ assetClass: 'equity', ratio: r, marketValueCents: 1 }],
        { equity: band },
      )[0].direction;
    expect(mk(0.3)).toBe('ok');
    expect(mk(0.6)).toBe('ok');
    expect(mk(0.45)).toBe('ok');
    expect(mk(0.29)).toBe('under');
    expect(mk(0.61)).toBe('over');
  });

  it('hint 仅含方向/占比/区间/依据，不含品种与买卖数量（I11）', () => {
    const hints = computeHints(
      [{ assetClass: 'equity', ratio: 0.8, marketValueCents: 8000 }],
      { equity: { min: 0.3, max: 0.6 } },
    );
    expect(hints).toHaveLength(1);
    const h = hints[0];
    expect(Object.keys(h).sort()).toEqual(
      ['assetClass', 'currentRatio', 'direction', 'reason', 'targetBand'].sort(),
    );
    // reason 仅引用占比与区间，不出现买卖/份额/品种等指令性词汇
    const blob = JSON.stringify(hints);
    expect(blob).not.toMatch(/买入|卖出|份额|数量|调仓|建议(买|卖)|股\d|手\d/);
  });

  it('类别不在 targetBands → 跳过（无基准，不编造方向）', () => {
    const hints = computeHints(
      [{ assetClass: 'cash', ratio: 1, marketValueCents: 100 }],
      { equity: { min: 0.3, max: 0.6 } },
    );
    expect(hints).toHaveLength(0);
  });
});

describe('与既有 computeConcentrationAlert 不冲突（扩展而非替换）', () => {
  it('computeConcentrationAlert 仍按单一持仓阈值判定（未被破坏）', () => {
    const alert = computeConcentrationAlert(
      [{ marketValue: '90.00' }, { marketValue: '10.00' }],
      0.6,
    );
    expect(alert?.code).toBe('CONCENTRATION'); // 90% > 60% 阈值
    const ok = computeConcentrationAlert(
      [{ marketValue: '50.00' }, { marketValue: '50.00' }],
      0.6,
    );
    expect(ok).toBeNull();
  });
});

describe('engine 元信息（可追溯，NC7）', () => {
  it('engineVersion 与 targetBands 版本/分类映射齐备', () => {
    expect(PORTFOLIO_HINT_ENGINE_VERSION).toBe('1.0.0');
    expect(targetBands.targetBandsVersion).toMatch(/-/);
    expect(Object.keys(INSTRUMENT_TYPE_TO_ASSET_CLASS).length).toBeGreaterThan(0);
  });
});
