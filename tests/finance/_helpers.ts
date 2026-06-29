/**
 * Finance 集成测试共享辅助。
 *
 * 这些测试需要可用的 PostgreSQL（finance_* 表已建）。
 * 默认跳过；通过环境变量 FINANCE_INTEGRATION_TEST=1 启用（CI/本地有测试库时）。
 * 启用方式：
 *   FINANCE_INTEGRATION_TEST=1 pnpm test --run finance
 * 测试库需先建表：pnpm exec node --env-file=.env scripts/init-finance.mjs
 *   （指向测试 DATABASE_URL）
 */
import { toCents } from '@/services/finance/money';
import type { EntryItem } from '@/database/schema/finance';

/** 是否启用集成测试（需要真实 DB）。 */
export const INTEGRATION_ENABLED =
  process.env.FINANCE_INTEGRATION_TEST === '1';

/** 生成隔离的测试 userId，避免与真实数据或其他用例冲突。 */
export function uniqueUserId(): string {
  return `vitest_finance_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 汇总一组分录的借贷两方（分）。 */
export function sumSides(
  entries: EntryItem[],
): { debitCents: number; creditCents: number } {
  let debitCents = 0;
  let creditCents = 0;
  for (const e of entries) {
    const c = toCents(e.amount);
    if (e.side === 'debit') debitCents += c;
    else creditCents += c;
  }
  return { debitCents, creditCents };
}

/** 断言一组分录满足 Σdebit==Σcredit 且每条 amount>0（复式平衡不变式）。 */
export function assertEntriesBalanced(
  entries: EntryItem[],
): { balanced: boolean; debitCents: number; creditCents: number } {
  const { debitCents, creditCents } = sumSides(entries);
  const allPositive = entries.every((e) => toCents(e.amount) > 0);
  return { balanced: debitCents === creditCents && allPositive, debitCents, creditCents };
}
