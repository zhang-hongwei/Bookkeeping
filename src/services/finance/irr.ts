/**
 * XIRR（资金时间价值年化收益率）纯函数（Phase 3）。
 *
 * 自实现、不引新依赖（research.md R6）：二分法求 NPV(rate)=0 的根，
 * 区间 (-0.999999, 10)，tol 1e-9；不收敛/无符号变化/超出区间 → 返回 `converged:false`，
 * **绝不返回错误数字**（SC-002：结果与主流基金 IRR 计算器一致）。
 *
 * 现金流约定：流出（买入）为负、流入（现金分红/终端市值）为正；
 * 时间以「最早日期」为基准换算成年分数（XIRR 标准口径）。
 */

export interface XirrCashflow {
  /** 现金流日期。 */
  date: Date;
  /** 金额（流出为负、流入为正；单位任意，IRR 是比率不受量纲影响）。 */
  amount: number;
}

export interface XirrResult {
  /** 年化收益率（小数，如 0.12 表示 12%）；不收敛为 null。 */
  annualizedRate: number | null;
  converged: boolean;
  reason?: string;
}

const MS_PER_DAY = 86_400_000;
const MS_PER_YEAR = 365 * MS_PER_DAY;
const LO = -0.999999;
const HI = 10;

/** 以最早日期为基准，换算各现金流到「年」的偏移。 */
function toYears(cashflows: ReadonlyArray<XirrCashflow>): number[] {
  const t0 = Math.min(...cashflows.map((c) => c.date.getTime()));
  return cashflows.map((c) => (c.date.getTime() - t0) / MS_PER_YEAR);
}

/** NPV(rate) = Σ amount_i / (1+rate)^years_i。 */
function npv(
  rate: number,
  cashflows: ReadonlyArray<XirrCashflow>,
  years: ReadonlyArray<number>,
): number {
  let sum = 0;
  for (let i = 0; i < cashflows.length; i++) {
    sum += cashflows[i].amount / Math.pow(1 + rate, years[i]);
  }
  return sum;
}

function nullResult(reason: string): XirrResult {
  return { annualizedRate: null, converged: false, reason };
}

/**
 * 计算 XIRR。
 * - 不足 2 条现金流、或无正负符号变化 → null + reason。
 * - 在 [LO, HI] 内寻找符号变化区间后二分；找不到变号或不收敛 → null + reason。
 */
export function computeXirr(cashflows: ReadonlyArray<XirrCashflow>): XirrResult {
  if (cashflows.length < 2) return nullResult('现金流不足');
  const hasPositive = cashflows.some((c) => c.amount > 0);
  const hasNegative = cashflows.some((c) => c.amount < 0);
  if (!hasPositive || !hasNegative) return nullResult('现金流需有正有负');

  const years = toYears(cashflows);
  const f = (r: number) => npv(r, cashflows, years);

  let lo = LO;
  let hi = HI;
  let flo = f(lo);
  let fhi = f(hi);
  if (!Number.isFinite(flo) || !Number.isFinite(fhi)) return nullResult('IRR 无法收敛');

  // 端点未变号 → 扫描更小区间寻找变号（处理多解/单调情形）
  if (flo * fhi > 0) {
    let prevR = lo;
    let prevF = flo;
    let found = false;
    const steps = 2000;
    for (let i = 1; i <= steps; i++) {
      const r = LO + (HI - LO) * (i / steps);
      const fr = f(r);
      if (Number.isFinite(fr) && prevF * fr < 0) {
        lo = prevR;
        hi = r;
        flo = prevF;
        fhi = fr;
        found = true;
        break;
      }
      prevR = r;
      prevF = fr;
    }
    if (!found) return nullResult('IRR 无法收敛');
  }

  // 二分法：以区间宽度作为收敛判据（在 r→-1 渐近线附近 |f| 陡峭，
  // 用 |f| 判据会误判；二分区间宽度与根的距离一致，更稳健）。
  let rate = (lo + hi) / 2;
  for (let iter = 0; iter < 200 && hi - lo > 1e-10; iter++) {
    rate = (lo + hi) / 2;
    const fm = f(rate);
    if (Math.abs(fm) < 1e-12) {
      lo = rate;
      hi = rate;
      break;
    }
    if (flo * fm <= 0) {
      hi = rate;
      fhi = fm;
    } else {
      lo = rate;
      flo = fm;
    }
  }
  rate = (lo + hi) / 2;
  if (hi - lo > 1e-6) return nullResult('IRR 无法收敛');
  if (rate <= LO || rate >= HI) return nullResult('IRR 超出合理区间');
  return { annualizedRate: rate, converged: true };
}
