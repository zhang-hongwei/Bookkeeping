/**
 * 复式记账余额与不变式引擎。
 *
 * 核心不变式：对任意交易，Σ(debit) === Σ(credit)，且每条金额 > 0。
 * 余额 = 初始余额 + Σ(按账户正常方向的有符号分录影响)。
 */
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  financeAccounts,
  financeLiabilityDetails,
  entries,
  ASSET_ACCOUNT_TYPES,
  LIABILITY_ACCOUNT_TYPES,
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

/**
 * 共享范围/越权错误（Phase 4）。
 * 用于家庭隐私边界：成员越权访问他人「仅个人」数据、伪造归属 memberId、
 * 对 joint 行执行不可逆操作等。API 层映射为 403 FORBIDDEN（contracts/api.md §0.2）。
 */
export class ShareScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShareScopeError';
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
    // Phase 2：负债类（credit + 贷款类型）为负贡献，资产类为正。
    net += LIABILITY_ACCOUNT_TYPES.includes(a.type) ? -cents : cents;
  }
  return net;
}

/**
 * 单条负债是否满足「剩余本金」不变式（防漂移，research R8）：
 * 对非 credit 贷款，账户 balance 应 == principal − paidAmount。
 * credit（信用卡）欠款随消费/还款滚动，不适用此不变式，恒视为一致。
 */
export function liabilityIsConsistent(
  type: AccountType,
  balance: string,
  principal: string,
  paidAmount: string,
): boolean {
  if (type === 'credit') return true;
  return toCents(principal) - toCents(paidAmount) === toCents(balance);
}

export interface LiabilityInconsistency {
  accountId: string;
  /** 期望剩余本金 = principal − paidAmount。 */
  expected: string;
  /** 物化账户 balance。 */
  stored: string;
  /** 偏差（stored − expected）。 */
  diff: string;
}

/**
 * 批量校验某用户非 credit 负债的「剩余本金」一致性（principal − paidAmount == balance）；
 * 返回偏差项（不自动修复——负债明细与 balance 漂移需人工介入，调用方应据返回值告警）。
 * 与 verifyAll 对称：verifyAll 校验「账户余额 vs 分录」自洽，本函数校验「负债明细 vs 余额」自洽。
 */
export async function verifyLiabilityConsistency(
  userId: string,
): Promise<LiabilityInconsistency[]> {
  const rows = await db
    .select({
      accountId: financeAccounts.id,
      type: financeAccounts.type,
      balance: financeAccounts.balance,
      principal: financeLiabilityDetails.principal,
      paidAmount: financeLiabilityDetails.paidAmount,
    })
    .from(financeAccounts)
    .innerJoin(
      financeLiabilityDetails,
      eq(financeLiabilityDetails.accountId, financeAccounts.id),
    )
    .where(
      and(
        eq(financeAccounts.userId, userId),
        inArray(financeAccounts.type, [...LIABILITY_ACCOUNT_TYPES]),
      ),
    );

  const mismatches: LiabilityInconsistency[] = [];
  for (const r of rows) {
    if (liabilityIsConsistent(r.type, r.balance, r.principal, r.paidAmount)) continue;
    const expectedCents = toCents(r.principal) - toCents(r.paidAmount);
    const storedCents = toCents(r.balance);
    mismatches.push({
      accountId: r.accountId,
      expected: fromCents(expectedCents),
      stored: r.balance,
      diff: fromCents(storedCents - expectedCents),
    });
  }
  return mismatches;
}
