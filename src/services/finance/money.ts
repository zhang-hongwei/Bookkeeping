/**
 * 金额「分」整数运算工具。
 *
 * 财务金额禁止浮点（浮点累加误差会破坏账目平衡不变式）。
 * 这里把 decimal 字符串统一解析为「分」的整数后做整数运算，再格式化回字符串。
 */

/** 把金额（字符串/数字）解析为「分」的整数。支持负数与 0~2 位小数。 */
export function toCents(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const str =
    typeof value === 'number' ? value.toFixed(2) : String(value).trim();
  if (str === '') return 0;
  const neg = str.startsWith('-');
  const clean = neg ? str.slice(1) : str;
  const dotIndex = clean.indexOf('.');
  let whole: string;
  let frac: string;
  if (dotIndex === -1) {
    whole = clean;
    frac = '';
  } else {
    whole = clean.slice(0, dotIndex);
    frac = clean.slice(dotIndex + 1);
  }
  // 仅保留数字，去除可能的千分位逗号
  const wholeDigits = whole.replace(/[^0-9]/g, '') || '0';
  const fracPadded = ((frac || '').replace(/[^0-9]/g, '') + '00').slice(0, 2);
  const cents = Number.parseInt(`${wholeDigits}${fracPadded}`, 10);
  return neg ? -cents : cents;
}

/** 把「分」整数格式化为金额字符串（2 位小数，如 "123.00"、"-35.50"）。 */
export function fromCents(cents: number): string {
  const neg = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  const str = `${whole}.${frac.toString().padStart(2, '0')}`;
  return neg ? `-${str}` : str;
}

/** 金额相加（分），返回分整数。 */
export function addCents(a: string | number, b: string | number): number {
  return toCents(a) + toCents(b);
}
