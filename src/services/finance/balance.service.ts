/**
 * 复式记账余额与不变式引擎。
 *
 * 核心不变式：对任意交易，Σ(debit) === Σ(credit)，且每条金额 > 0。
 * 余额 = 初始余额 + Σ(按账户正常方向的有符号分录影响)。
 */
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  financeAccounts,
  entries,
  ASSET_ACCOUNT_TYPES,
  type AccountType,
  type EntrySide,
} from '@/database/schema/finance';
import { fromCents, toCents } from './money';

export class LedgerInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LedgerInvariantError';
  }
}

/** 账户是否为「借方正常余额」（资产类为是；credit 负债类为否）。 */
export function normalBalanceIsDebit(type: AccountType): boolean {
  if (type === 'equity') return false; // 权益类贷方正常（收入贷方增加）
  return ASSET_ACCOUNT_TYPES.includes(type);
}

/** 一条分录对该账户 balance 的带符号增量（分）。 */
export function signedDeltaCents(
  accountType: AccountType,
  side: EntrySide,
  amount: string | number,
): number {
  const amt = toCents(amount);
  const debitNormal = normalBalanceIsDebit(accountType);
  const positive = side === 'debit' ? debitNormal : !debitNormal;
  return positive ? amt : -amt;
}

export interface EntryInput {
  accountId: string;
  side: EntrySide;
  amount: string | number;
}

/** 校验一组分录满足复式平衡：≥2 条、每条 amount>0、Σdebit==Σcredit。 */
export function assertBalanced(entryList: EntryInput[]): void {
  if (entryList.length < 2) {
    throw new LedgerInvariantError('一笔交易至少需要 2 条分录');
  }
  let debit = 0;
  let credit = 0;
  for (const e of entryList) {
    const c = toCents(e.amount);
    if (c <= 0) {
      throw new LedgerInvariantError(`分录金额必须为正，收到 ${e.amount}`);
    }
    if (e.side === 'debit') debit += c;
    else credit += c;
  }
  if (debit !== credit) {
    throw new LedgerInvariantError(
      `分录不平衡：debit=${fromCents(debit)} credit=${fromCents(credit)}`,
    );
  }
}

/** 依据账户的全部分录重算其应有余额（分）。 */
export function computeBalanceCents(
  accountType: AccountType,
  openingBalance: string,
  accountEntries: Array<{ side: EntrySide; amount: string }>,
): number {
  let bal = toCents(openingBalance);
  for (const e of accountEntries) {
    bal += signedDeltaCents(accountType, e.side, e.amount);
  }
  return bal;
}

/**
 * 重算单个账户余额并与物化值比对；不一致则修复。
 * 返回期望值、原值、是否已修复。对应 SC-007 自愈。
 */
export async function recomputeBalance(
  accountId: string,
): Promise<{ expected: string; stored: string; fixed: boolean }> {
  return db.transaction(async (tx) => {
    const [account] = await tx
      .select()
      .from(financeAccounts)
      .where(eq(financeAccounts.id, accountId))
      .limit(1);
    if (!account) throw new LedgerInvariantError(`账户不存在: ${accountId}`);

    const accountEntries = await tx
      .select({ side: entries.side, amount: entries.amount })
      .from(entries)
      .where(eq(entries.accountId, accountId));

    const expectedCents = computeBalanceCents(
      account.type,
      account.openingBalance,
      accountEntries,
    );
    const expected = fromCents(expectedCents);
    const stored = account.balance;
    if (toCents(stored) === expectedCents) {
      return { expected, stored, fixed: false };
    }
    await tx
      .update(financeAccounts)
      .set({ balance: expected, updatedAt: new Date() })
      .where(eq(financeAccounts.id, accountId));
    return { expected, stored, fixed: true };
  });
}

/**
 * 批量校验某用户所有账户余额；返回不一致项（已自动修复）。
 * 用于定时/手动巡检。系统权益账户（user_id='__system__'）不计入。
 */
export async function verifyAll(
  userId: string,
): Promise<Array<{ accountId: string; expected: string; stored: string }>> {
  const userAccounts = await db
    .select({ id: financeAccounts.id })
    .from(financeAccounts)
    .where(
      and(
        eq(financeAccounts.userId, userId),
        isNull(financeAccounts.systemKey),
      ),
    );
  const mismatches: Array<{ accountId: string; expected: string; stored: string }> =
    [];
  for (const a of userAccounts) {
    const r = await recomputeBalance(a.id);
    if (r.fixed) mismatches.push({ accountId: a.id, ...r });
  }
  return mismatches;
}

/** 统计工具：给定一组账户条目，按资产/负债计算净资产（分）。 */
export function netWorthCents(
  accountList: Array<{
    type: AccountType;
    balance: string;
    includeInNetWorth: boolean;
  }>,
): number {
  let net = 0;
  for (const a of accountList) {
    if (!a.includeInNetWorth) continue;
    const cents = toCents(a.balance);
    net += a.type === 'credit' ? -cents : cents;
  }
  return net;
}
