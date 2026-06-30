/**
 * 投资组合优化方向确定性纯函数引擎（Phase 7，US4，NC4）。
 *
 * 红线：纯函数、cents/比率运算、零 IO/零 LLM、可复现（SC-004）。
 * 扩展 computeConcentrationAlert 范式：单一持仓集中度 → 资产类别配置偏离。
 * 目标区间取自版本化 `targetBands`（NC4/NC7），不硬编码；产品定位变更只改配置。
 *
 * - aggregateByAssetClass：按资产类别（现金/固收/权益/另类）聚合持仓市值占比。
 * - computeHints：对比当前占比与目标区间，输出方向（under/over/ok）+ 可解释依据。
 *
 * I11：hint 仅给方向，不含具体品种/买卖数量（FR-004，前端据此渲染方向卡）。
 */
import { toCents } from './money';
import type { TargetBand } from '@/database/schema/finance/portfolio-hints';

export const PORTFOLIO_HINT_ENGINE_NAME = 'portfolio-hint';
export const PORTFOLIO_HINT_ENGINE_VERSION = '1.0.0';

/** 资产类别（复用 Phase 3 allocation 分类口径，与 target-bands 配置一致，NC4）。 */
export const ASSET_CLASSES = [
  'cash',
  'fixed_income',
  'equity',
  'alternative',
] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];

/**
 * 投资品种类型 → 资产类别映射（NC4 分类法）。
 * 品种类型来自 finance_instruments.type（stock/fund/bond/gold/etf/reits/crypto）。
 * fund 默认归入 equity（多数公募为权益/混合；品种级细分需额外标签，留待配置化）。
 * cash 类别无对应投资持仓（现金属流动性缓冲，非持仓），故不在此映射。
 */
export const INSTRUMENT_TYPE_TO_ASSET_CLASS: Record<string, AssetClass> = {
  stock: 'equity',
  etf: 'equity',
  fund: 'equity',
  bond: 'fixed_income',
  gold: 'alternative',
  reits: 'alternative',
  crypto: 'alternative',
};

/** 输入持仓（品种类型 + 市值）。 */
export interface PortfolioPositionInput {
  instrumentType: string;
  marketValue: string;
}

/** 聚合后的资产类别占比（0–1）+ 市值（分）。 */
export interface AssetClassRatio {
  assetClass: string;
  ratio: number;
  marketValueCents: number;
}

/** 单条方向建议（仅方向，I11；不含品种/数量）。 */
export interface PortfolioHint {
  assetClass: string;
  currentRatio: number;
  targetBand: TargetBand;
  direction: 'under' | 'over' | 'ok';
  reason: string;
}

/**
 * 按资产类别聚合持仓占比（复用 Phase 3 allocation 分类口径）。
 * - 总市值 ≤ 0 或空持仓 → 返回空 items（不编造，NC6）。
 * - 未知品种类型 → 归入 'alternative'（保守归类，避免漏算）。
 * - 按 ASSET_CLASSES 固定顺序排序，保证可复现（NC7）。
 */
export function aggregateByAssetClass(
  positions: ReadonlyArray<PortfolioPositionInput>,
): { items: AssetClassRatio[]; totalCents: number } {
  const totalCents = positions.reduce((s, p) => s + toCents(p.marketValue), 0);
  if (totalCents <= 0 || positions.length === 0) {
    return { items: [], totalCents };
  }
  const byClass = new Map<string, number>();
  for (const p of positions) {
    const assetClass =
      INSTRUMENT_TYPE_TO_ASSET_CLASS[p.instrumentType] ?? 'alternative';
    byClass.set(assetClass, (byClass.get(assetClass) ?? 0) + toCents(p.marketValue));
  }
  const items: AssetClassRatio[] = [];
  for (const [assetClass, marketValueCents] of byClass) {
    items.push({ assetClass, ratio: marketValueCents / totalCents, marketValueCents });
  }
  items.sort(
    (a, b) =>
      ASSET_CLASSES.indexOf(a.assetClass as AssetClass) -
      ASSET_CLASSES.indexOf(b.assetClass as AssetClass),
  );
  return { items, totalCents };
}

/**
 * 由当前占比 + 目标区间产出方向建议（I10：direction='ok' ⇔ 落在 band 内）。
 * - 仅对「持仓中出现的类别」给建议（不编造未持有类别的占比）。
 * - 类别不在 targetBands → 跳过（无可比基准）。
 * - hint 仅含方向/占比/区间/可解释依据，不含品种与买卖数量（I11）。
 */
export function computeHints(
  ratios: ReadonlyArray<AssetClassRatio>,
  targetBands: Record<string, TargetBand>,
): PortfolioHint[] {
  const hints: PortfolioHint[] = [];
  for (const r of ratios) {
    const band = targetBands[r.assetClass];
    if (!band) continue;
    const pct = (r.ratio * 100).toFixed(1);
    const minPct = (band.min * 100).toFixed(0);
    const maxPct = (band.max * 100).toFixed(0);
    let direction: PortfolioHint['direction'];
    let reason: string;
    if (r.ratio < band.min) {
      direction = 'under';
      reason = `当前占比 ${pct}% 低于目标下限 ${minPct}%（仅方向参考，非买卖指令）`;
    } else if (r.ratio > band.max) {
      direction = 'over';
      reason = `当前占比 ${pct}% 高于目标上限 ${maxPct}%（仅方向参考，非买卖指令）`;
    } else {
      direction = 'ok';
      reason = `当前占比 ${pct}% 处于目标区间 ${minPct}%–${maxPct}%`;
    }
    hints.push({
      assetClass: r.assetClass,
      currentRatio: r.ratio,
      targetBand: band,
      direction,
      reason,
    });
  }
  return hints;
}
