/**
 * 投资盈亏 / 加权成本 / 配置 纯函数（Phase 3）。
 *
 * 全部为确定性纯计算（research.md R6/R9），不访问 DB，可单测。
 * 金额一律字符串、内部「分」整数（toCents/fromCents，禁止浮点累加）；
 * 份额/价为高精度数值，乘得金额后四舍五入到「分」。
 */
import { toCents, fromCents } from './money';

/** 份额 × 单价 → 金额字符串（四舍五入到分）。 */
export function moneyFromQuantityPrice(
  quantity: string | number,
  price: string | number,
): string {
  const q = Number(quantity);
  const p = Number(price);
  if (!Number.isFinite(q) || !Number.isFinite(p)) return '0';
  return fromCents(Math.round(q * p * 100));
}

/** 成本 = 份额 × 成本价。 */
export function costFrom(quantity: string | number, costPrice: string | number): string {
  return moneyFromQuantityPrice(quantity, costPrice);
}

/** 市值 = 份额 × 现价。 */
export function marketValueFrom(
  quantity: string | number,
  currentPrice: string | number,
): string {
  return moneyFromQuantityPrice(quantity, currentPrice);
}

/** 盈亏 = 市值 − 成本。 */
export function pnl(marketValue: string | number, cost: string | number): string {
  return fromCents(toCents(marketValue) - toCents(cost));
}

/**
 * 盈亏率 = 盈亏 / 成本（小数字符串，如 "0.200000"）。
 * 成本为 0 时返回 null（避免除零；DTO 层转成"-"或提示）。
 */
export function pnlRate(
  pnlAmount: string | number,
  cost: string | number,
): string | null {
  const costCents = toCents(cost);
  if (costCents === 0) return null;
  return (toCents(pnlAmount) / costCents).toFixed(6);
}

/**
 * 加权平均成本价（买入后重算，保留 6 位小数）。
 * totalCost = oldQty×oldCost + addQty×addPrice；newCost = totalCost / totalQty。
 */
export function weightedAvgCost(
  oldQuantity: string | number,
  oldCostPrice: string | number,
  addShares: string | number,
  addPrice: string | number,
): string {
  const oldQty = Number(oldQuantity);
  const oldPrice = Number(oldCostPrice);
  const addQty = Number(addShares);
  const addPriceN = Number(addPrice);
  const totalQty = oldQty + addQty;
  if (!(totalQty > 0)) return Number(oldCostPrice).toFixed(6);
  const totalCost = oldQty * oldPrice + addQty * addPriceN;
  return (totalCost / totalQty).toFixed(6);
}

/** 配置聚合项（按品种类型）。 */
export interface AllocationItem {
  instrumentType: string;
  marketValue: string;
  /** 占比（小数字符串，合计 1）。 */
  ratio: string;
}

/** 按品种类型聚合市值与占比（按市值降序）。 */
export function aggregateByType(
  items: ReadonlyArray<{ instrumentType: string; marketValue: string | number }>,
): AllocationItem[] {
  const sumByType = new Map<string, number>();
  for (const it of items) {
    const cents = toCents(it.marketValue);
    sumByType.set(it.instrumentType, (sumByType.get(it.instrumentType) ?? 0) + cents);
  }
  const total = Array.from(sumByType.values()).reduce((a, b) => a + b, 0);
  const out: AllocationItem[] = [];
  for (const [instrumentType, cents] of sumByType) {
    out.push({
      instrumentType,
      marketValue: fromCents(cents),
      ratio: total === 0 ? '0' : (cents / total).toFixed(6),
    });
  }
  out.sort((a, b) => toCents(b.marketValue) - toCents(a.marketValue));
  return out;
}

/** 多项市值合计。 */
export function allocationTotal(
  items: ReadonlyArray<{ marketValue: string | number }>,
): string {
  return fromCents(items.reduce((s, i) => s + toCents(i.marketValue), 0));
}

/** 单一品种最大集中度占比（小数字符串，如 "0.650000"）。 */
export function maxConcentrationRatio(
  items: ReadonlyArray<{ marketValue: string | number }>,
): string {
  const total = items.reduce((s, i) => s + toCents(i.marketValue), 0);
  if (total === 0) return '0';
  const max = items.reduce((m, i) => Math.max(m, toCents(i.marketValue)), 0);
  return (max / total).toFixed(6);
}
