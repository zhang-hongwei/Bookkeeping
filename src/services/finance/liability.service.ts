/**
 * 负债业务服务（Phase 2）—— 登记/更新/列表。
 *
 * - 负债 = credit / mortgage / car_loan / consumer_loan / borrowing 账户；
 *   剩余本金（当前欠款）= 账户 balance（真相源，由分录维护）。
 * - 登记建账户（openingBalance = 初始欠款/本金）+ 1:1 liability_details
 *   （本金/利率/月供/到期/已还/账单周期）。
 * - kind 与账户 type 对齐（credit/mortgage/car_loan/consumer_loan/borrowing）。
 *
 * 还款（recordRepayment）见 ledger.service；账单周期（getCreditCardPeriod）见本文件。
 */
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  financeAccounts,
  entries,
  transactions,
  LIABILITY_ACCOUNT_TYPES,
  type AccountItem,
  type LiabilityKind,
} from '@/database/schema/finance';
import { accountRepository } from '@/repositories/finance/account.repository';
import {
  liabilityDetailRepository,
  type UpdateLiabilityDetailPatch,
} from '@/repositories/finance/liability-detail.repository';
import { toCents, fromCents } from './money';

export { LedgerInvariantError } from './balance.service';

export interface RegisterLiabilityInput {
  userId: string;
  name: string;
  type: LiabilityKind;
  /** 初始欠款 / 本金 = 账户 openingBalance（建账即 balance）。 */
  openingBalance: string;
  /** 原始本金（默认 = openingBalance；credit 可为 0）。 */
  principal?: string;
  interestRate?: string | null;
  monthlyPayment?: string | null;
  dueDate?: string | null;
  /** 仅 credit：账单日 / 还款日（月内 1–31）。 */
  statementDay?: number | null;
  repaymentDay?: number | null;
  currency?: string;
  includeInNetWorth?: boolean;
}

export interface UpdateLiabilityInput {
  userId: string;
  liabilityAccountId: string;
  name?: string;
  includeInNetWorth?: boolean;
  interestRate?: string | null;
  monthlyPayment?: string | null;
  dueDate?: string | null;
  statementDay?: number | null;
  repaymentDay?: number | null;
}

export interface LiabilityWithDetail {
  account: AccountItem;
  kind: LiabilityKind;
  principal: string;
  interestRate: string | null;
  monthlyPayment: string | null;
  dueDate: string | null;
  paidAmount: string;
  statementDay: number | null;
  repaymentDay: number | null;
  /** 剩余本金 / 当前欠款 = 账户 balance。 */
  remainingPrincipal: string;
}

/** 取用户负债账户（scoped，须为负债类型）。 */
async function fetchLiabilityAccount(
  userId: string,
  accountId: string,
): Promise<AccountItem> {
  const [account] = await db
    .select()
    .from(financeAccounts)
    .where(
      and(
        eq(financeAccounts.id, accountId),
        eq(financeAccounts.userId, userId),
        inArray(financeAccounts.type, [...LIABILITY_ACCOUNT_TYPES]),
      ),
    )
    .limit(1);
  if (!account) throw new Error('负债账户不存在或类型不符');
  return account;
}

/** 登记负债：建账户 + upsert 明细。 */
export async function registerLiability(
  input: RegisterLiabilityInput,
): Promise<LiabilityWithDetail> {
  const account = await accountRepository(input.userId).create({
    name: input.name,
    type: input.type,
    openingBalance: input.openingBalance,
    currency: input.currency,
    includeInNetWorth: input.includeInNetWorth ?? true,
  });
  const detail = await liabilityDetailRepository(input.userId).upsertByAccountId({
    accountId: account.id,
    kind: input.type,
    principal: input.principal ?? input.openingBalance,
    interestRate: input.interestRate ?? null,
    monthlyPayment: input.monthlyPayment ?? null,
    dueDate: input.dueDate ?? null,
    paidAmount: '0',
    statementDay: input.statementDay ?? null,
    repaymentDay: input.repaymentDay ?? null,
  });
  return toView(account, detail.principal, detail.interestRate, detail.monthlyPayment, detail.dueDate ? String(detail.dueDate) : null, detail.paidAmount, detail.statementDay, detail.repaymentDay, detail.kind);
}

/** 更新负债元数据（不改 balance/paidAmount——只能由交易驱动）。 */
export async function updateLiability(
  input: UpdateLiabilityInput,
): Promise<LiabilityWithDetail | null> {
  const accountPatch: { name?: string; includeInNetWorth?: boolean } = {};
  if (input.name !== undefined) accountPatch.name = input.name;
  if (input.includeInNetWorth !== undefined)
    accountPatch.includeInNetWorth = input.includeInNetWorth;
  if (Object.keys(accountPatch).length > 0) {
    await accountRepository(input.userId).update(input.liabilityAccountId, accountPatch);
  }
  const detailPatch: UpdateLiabilityDetailPatch = {};
  if (input.interestRate !== undefined) detailPatch.interestRate = input.interestRate;
  if (input.monthlyPayment !== undefined) detailPatch.monthlyPayment = input.monthlyPayment;
  if (input.dueDate !== undefined) detailPatch.dueDate = input.dueDate;
  if (input.statementDay !== undefined) detailPatch.statementDay = input.statementDay;
  if (input.repaymentDay !== undefined) detailPatch.repaymentDay = input.repaymentDay;
  if (Object.keys(detailPatch).length > 0) {
    await liabilityDetailRepository(input.userId).update(
      input.liabilityAccountId,
      detailPatch,
    );
  }
  return getLiability(input.userId, input.liabilityAccountId);
}

function toView(
  account: AccountItem,
  principal: string,
  interestRate: string | null,
  monthlyPayment: string | null,
  dueDate: string | null,
  paidAmount: string,
  statementDay: number | null,
  repaymentDay: number | null,
  kind: LiabilityKind,
): LiabilityWithDetail {
  return {
    account,
    kind,
    principal,
    interestRate,
    monthlyPayment,
    dueDate,
    paidAmount,
    statementDay,
    repaymentDay,
    remainingPrincipal: account.balance,
  };
}

/** 列出用户全部负债（带明细 + 剩余本金）。 */
export async function listLiabilities(userId: string): Promise<LiabilityWithDetail[]> {
  const accounts = await accountRepository(userId).list({ includeArchived: true });
  const liabilityAccounts = accounts.filter((a) =>
    LIABILITY_ACCOUNT_TYPES.includes(a.type),
  );
  const details = await liabilityDetailRepository(userId).list();
  const detailByAccount = new Map(details.map((d) => [d.accountId, d]));
  return liabilityAccounts.map((account) => {
    const d = detailByAccount.get(account.id);
    return toView(
      account,
      d?.principal ?? '0',
      d?.interestRate ?? null,
      d?.monthlyPayment ?? null,
      d?.dueDate ? String(d.dueDate) : null,
      d?.paidAmount ?? '0',
      d?.statementDay ?? null,
      d?.repaymentDay ?? null,
      (d?.kind ?? account.type) as LiabilityKind,
    );
  });
}

/** 取单个负债（带明细）。 */
export async function getLiability(
  userId: string,
  accountId: string,
): Promise<LiabilityWithDetail | null> {
  const list = await listLiabilities(userId);
  return list.find((l) => l.account.id === accountId) ?? null;
}

// ===== 信用卡账单周期（US3，见后）=====
export interface CreditBilling {
  periodStart: string;
  periodEnd: string;
  statementAmount: string;
  paidAmount: string;
  remaining: string;
  statementDay: number;
  repaymentDay: number;
  dueSoon: boolean;
  daysUntilDue: number | null;
}

/**
 * 纯函数：由账单日 + 参考日计算「当前账单周期」[上一 statementDay, 当前 statementDay)。
 * statementDay 为月内日（1–31）；自动跨月滚动。返回 ISO 日期字符串。
 */
export function computeBillingPeriod(
  statementDay: number,
  reference: Date,
): { periodStart: string; periodEnd: string } {
  const ref = new Date(reference.getTime());
  // 本月的账单日（若当月天数不足，取当月最后一天）
  const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const clampDay = (y: number, m: number, d: number) => Math.min(d, daysInMonth(y, m));

  const thisYear = ref.getUTCFullYear();
  const thisMonth = ref.getUTCMonth();
  const thisStatement = new Date(
    Date.UTC(thisYear, thisMonth, clampDay(thisYear, thisMonth, statementDay)),
  );
  // 若参考日 < 本月账单日，则当前周期起 = 上月账单日；否则 = 本月账单日
  const periodStart =
    ref.getTime() < thisStatement.getTime()
      ? new Date(Date.UTC(thisYear, thisMonth - 1, clampDay(thisYear, thisMonth - 1, statementDay)))
      : thisStatement;
  const periodEnd = new Date(
    Date.UTC(
      periodStart.getUTCFullYear(),
      periodStart.getUTCMonth() + 1,
      clampDay(periodStart.getUTCFullYear(), periodStart.getUTCMonth() + 1, statementDay),
    ),
  );
  return {
    periodStart: periodStart.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10),
  };
}

/**
 * 纯函数：由账单周期内的分录聚合本期账单/已还/待还。
 * - statementAmount = Σ credit 侧（消费使欠款增加）
 * - paidAmount = Σ debit 侧（还款使欠款减少）
 * - remaining = statement − paid
 */
export function aggregateBillingFromEntries(
  accountEntries: Array<{ side: 'debit' | 'credit'; amount: string; occurredAt: string }>,
  periodStart: string,
  periodEnd: string,
): { statementAmount: string; paidAmount: string; remaining: string } {
  let statementCents = 0;
  let paidCents = 0;
  for (const e of accountEntries) {
    const day = e.occurredAt.slice(0, 10);
    if (day < periodStart || day >= periodEnd) continue;
    if (e.side === 'credit') statementCents += toCents(e.amount);
    else paidCents += toCents(e.amount);
  }
  return {
    statementAmount: fromCents(statementCents),
    paidAmount: fromCents(paidCents),
    remaining: fromCents(statementCents - paidCents),
  };
}

/** 信用卡账单周期（US3）：聚合 entries + 还款提示。仅 credit 账户。 */
export async function getCreditCardPeriod(
  userId: string,
  accountId: string,
  reference: Date = new Date(),
): Promise<CreditBilling> {
  const account = await fetchLiabilityAccount(userId, accountId);
  if (account.type !== 'credit') {
    throw new Error('NOT_CREDIT: 仅信用卡账户支持账单周期');
  }
  const detail = await liabilityDetailRepository(userId).findByAccountId(accountId);
  const statementDay = detail?.statementDay ?? 1;
  const repaymentDay = detail?.repaymentDay ?? statementDay;
  const { periodStart, periodEnd } = computeBillingPeriod(statementDay, reference);

  const accountEntries = await db
    .select({
      side: entries.side,
      amount: entries.amount,
      occurredAt: transactions.occurredAt,
    })
    .from(entries)
    .innerJoin(transactions, eq(entries.transactionId, transactions.id))
    .where(and(eq(entries.accountId, accountId), eq(transactions.userId, userId)));

  const agg = aggregateBillingFromEntries(
    accountEntries.map((e) => ({
      side: e.side,
      amount: e.amount,
      occurredAt: e.occurredAt.toISOString(),
    })),
    periodStart,
    periodEnd,
  );

  // 还款日倒计时（本月还款日相对 reference）
  const refYear = reference.getUTCFullYear();
  const refMonth = reference.getUTCMonth();
  const dim = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const repaymentDate = new Date(
    Date.UTC(refYear, refMonth, Math.min(repaymentDay, dim(refYear, refMonth))),
  );
  const daysUntilDue = Math.ceil(
    (repaymentDate.getTime() - reference.getTime()) / (24 * 60 * 60 * 1000),
  );

  return {
    periodStart,
    periodEnd,
    statementAmount: agg.statementAmount,
    paidAmount: agg.paidAmount,
    remaining: agg.remaining,
    statementDay,
    repaymentDay,
    dueSoon: daysUntilDue >= 0 && daysUntilDue <= 3 && toCents(agg.remaining) > 0,
    daysUntilDue: daysUntilDue >= 0 ? daysUntilDue : null,
  };
}
