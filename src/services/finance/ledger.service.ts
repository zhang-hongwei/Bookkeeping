/**
 * 复式记账核心服务：记账 / 改 / 删。
 *
 * - 收入/支出通过对腿写入系统权益账户 __income/__expense，使全套账目恒等式成立。
 * - 转账 = 借目标 + 贷来源，净资产不变。
 * - 所有写操作在单个数据库事务内完成：写 transaction + entries + 原子更新账户余额。
 * - 落库前 assertBalanced 强制 Σdebit==Σcredit、金额>0，违反则整体回滚。
 *
 * 注：因 `db` 为多驱动联合类型，事务对象无法跨函数精确标注，
 * 故「查询账户类型 + 更新余额」的 tx 操作内联到各事务回调内（保证 tx 被正确推断），
 * 仅把与 tx 无关的纯计算（增量数学）抽成强类型 helper。
 */
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  financeAccounts,
  transactions,
  entries,
  financeLiabilityDetails,
  EQUITY_ACCOUNT_NAMES,
  LIABILITY_ACCOUNT_TYPES,
  type AccountType,
  type TransactionType,
  type TransactionSource,
  type TransactionItem,
  type EntryItem,
} from '@/database/schema/finance';
import {
  assertBalanced,
  LedgerInvariantError,
  signedDeltaCents,
  type EntryInput,
} from './balance.service';
import { fromCents, toCents } from './money';
import { refreshSince } from './net-worth.service';

// 复式不变式错误统一从 ledger.service 再导出，便于 API 层一处导入。
export { LedgerInvariantError } from './balance.service';

/** 把 Date 转 YYYY-MM-DD（UTC 切片）。 */
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * best-effort 净资产快照重算：记账/改/删事务提交后刷新 [occurredAt..today] 曲线。
 * 失败仅记日志、不阻断主记账操作（账目正确性优先于曲线刷新）。
 *
 * Phase 4：顺带 best-effort 刷新调用者所在家庭的合并快照（动态 import 避免循环依赖，
 * 家庭不在任何用户时为 no-op）。隐私口径由家庭聚合层保证（仅 shared 账号）。
 */
async function refreshSnapshots(userId: string, occurredAt: Date): Promise<void> {
  try {
    await refreshSince(userId, dayKey(occurredAt));
  } catch (err) {
    console.error('[ledger] snapshot refresh failed:', err);
  }
  try {
    const { refreshFamilySnapshotsForUser } = await import(
      './family-net-worth.service'
    );
    await refreshFamilySnapshotsForUser(userId, dayKey(occurredAt));
  } catch {
    // 家庭刷新为可选增强，不阻断记账
  }
}

const SYSTEM_USER_ID = '__system__';

export interface CreateTransactionInput {
  userId: string;
  type: TransactionType;
  amount: string; // 必须为正
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  occurredAt?: Date;
  note?: string;
  source?: TransactionSource;
  confidence?: string;
  billImportId?: string;
  /** Phase 4：家庭归属（谁花/谁赚，指向 family_members.id；含 joint）。归属只作用于收支画像。 */
  memberId?: string;
}

export interface SystemEquityAccounts {
  income: string;
  expense: string;
  /** Phase 2：未实现损益桶（资产估值变动对腿）。 */
  revaluation: string;
}

/** 幂等确保系统权益账户存在（__income / __expense / __revaluation）。 */
export async function ensureSystemEquityAccounts(): Promise<SystemEquityAccounts> {
  const rows = await db
    .select({ id: financeAccounts.id, systemKey: financeAccounts.systemKey })
    .from(financeAccounts)
    .where(inArray(financeAccounts.systemKey, ['income', 'expense', 'revaluation']));
  const map = new Map(rows.map((r) => [r.systemKey, r.id]));
  let income = map.get('income');
  let expense = map.get('expense');
  let revaluation = map.get('revaluation');
  if (!income) {
    const [created] = await db
      .insert(financeAccounts)
      .values({
        userId: SYSTEM_USER_ID,
        name: EQUITY_ACCOUNT_NAMES.income,
        type: 'equity',
        systemKey: 'income',
      })
      .returning({ id: financeAccounts.id });
    income = created!.id;
  }
  if (!expense) {
    const [created] = await db
      .insert(financeAccounts)
      .values({
        userId: SYSTEM_USER_ID,
        name: EQUITY_ACCOUNT_NAMES.expense,
        type: 'equity',
        systemKey: 'expense',
      })
      .returning({ id: financeAccounts.id });
    expense = created!.id;
  }
  if (!revaluation) {
    const [created] = await db
      .insert(financeAccounts)
      .values({
        userId: SYSTEM_USER_ID,
        name: EQUITY_ACCOUNT_NAMES.revaluation,
        type: 'equity',
        systemKey: 'revaluation',
        // 未实现损益不计入净资产
        includeInNetWorth: false,
      })
      .returning({ id: financeAccounts.id });
    revaluation = created!.id;
  }
  return { income: income!, expense: expense!, revaluation: revaluation! };
}

function buildEntries(
  input: CreateTransactionInput,
  equity: SystemEquityAccounts,
): EntryInput[] {
  const { amount } = input;
  switch (input.type) {
    case 'expense': {
      if (!input.fromAccountId)
        throw new LedgerInvariantError('支出需要 fromAccountId');
      return [
        { accountId: equity.expense, side: 'debit', amount },
        { accountId: input.fromAccountId, side: 'credit', amount },
      ];
    }
    case 'income': {
      const acc = input.toAccountId ?? input.fromAccountId;
      if (!acc) throw new LedgerInvariantError('收入需要账户');
      return [
        { accountId: acc, side: 'debit', amount },
        { accountId: equity.income, side: 'credit', amount },
      ];
    }
    case 'transfer': {
      if (!input.fromAccountId || !input.toAccountId)
        throw new LedgerInvariantError('转账需要 fromAccountId 与 toAccountId');
      return [
        { accountId: input.toAccountId, side: 'debit', amount },
        { accountId: input.fromAccountId, side: 'credit', amount },
      ];
    }
    default:
      throw new LedgerInvariantError(`未知交易类型: ${String(input.type)}`);
  }
}

/** 取出分录中涉及的用户账户 id（排除系统权益账户），去重。 */
function userAccountIdsOf(
  entryList: EntryInput[],
  equity: SystemEquityAccounts,
): string[] {
  return Array.from(
    new Set(
      entryList
        .filter(
          (e) =>
            e.accountId !== equity.income && e.accountId !== equity.expense,
        )
        .map((e) => e.accountId),
    ),
  );
}

/** 纯计算：依据账户类型，把每条分录换算为对该账户 balance 的带符号增量（分）。 */
function computeDeltas(
  entryList: EntryInput[],
  typeById: Map<string, AccountType>,
  equity: SystemEquityAccounts,
  sign: 1 | -1,
): Array<{ accountId: string; deltaCents: number }> {
  const out: Array<{ accountId: string; deltaCents: number }> = [];
  for (const e of entryList) {
    if (e.accountId === equity.income || e.accountId === equity.expense) continue;
    const type = typeById.get(e.accountId);
    if (!type) throw new LedgerInvariantError(`账户不存在: ${e.accountId}`);
    out.push({
      accountId: e.accountId,
      deltaCents: sign * signedDeltaCents(type, e.side, e.amount),
    });
  }
  return out;
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<{ transaction: TransactionItem }> {
  if (toCents(input.amount) <= 0)
    throw new LedgerInvariantError('金额必须为正');
  const equity = await ensureSystemEquityAccounts();
  const entryInputs = buildEntries(input, equity);
  assertBalanced(entryInputs);

  const __createResult = await db.transaction(async (tx) => {
    const [txn] = await tx
      .insert(transactions)
      .values({
        userId: input.userId,
        type: input.type,
        categoryId: input.categoryId,
        amount: input.amount,
        occurredAt: input.occurredAt ?? new Date(),
        note: input.note,
        source: input.source ?? 'manual',
        confidence: input.confidence ?? '1.00',
        billImportId: input.billImportId,
        memberId: input.memberId,
      })
      .returning();
    await tx.insert(entries).values(
      entryInputs.map((e) => ({
        transactionId: txn!.id,
        accountId: e.accountId,
        side: e.side,
        amount: String(e.amount),
      })),
    );

    const ids = userAccountIdsOf(entryInputs, equity);
    const accts = ids.length
      ? await tx
          .select({ id: financeAccounts.id, type: financeAccounts.type })
          .from(financeAccounts)
          .where(inArray(financeAccounts.id, ids))
      : [];
    const typeById = new Map(accts.map((a) => [a.id, a.type] as const));
    for (const { accountId, deltaCents } of computeDeltas(
      entryInputs,
      typeById,
      equity,
      1,
    )) {
      await tx
        .update(financeAccounts)
        .set({
          balance: sql`${financeAccounts.balance} + ${fromCents(
            deltaCents,
          )}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(financeAccounts.id, accountId));
    }

    return { transaction: txn! };
  });
  await refreshSnapshots(input.userId, __createResult.transaction.occurredAt);
  return __createResult;
}

export async function deleteTransaction(
  userId: string,
  transactionId: string,
): Promise<void> {
  let __occurredAt: Date | null = null;
  await db.transaction(async (tx) => {
    const [txn] = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);
    if (!txn) throw new LedgerInvariantError('交易不存在');
    if (txn.userId !== userId) throw new LedgerInvariantError('无权操作该交易');
    __occurredAt = txn.occurredAt;

    const equity = await ensureSystemEquityAccounts();
    const oldEntries: EntryInput[] = (
      await tx.select().from(entries).where(eq(entries.transactionId, transactionId))
    ).map((e) => ({ accountId: e.accountId, side: e.side, amount: e.amount }));

    const ids = userAccountIdsOf(oldEntries, equity);
    const accts = ids.length
      ? await tx
          .select({ id: financeAccounts.id, type: financeAccounts.type })
          .from(financeAccounts)
          .where(inArray(financeAccounts.id, ids))
      : [];
    const typeById = new Map(accts.map((a) => [a.id, a.type] as const));
    for (const { accountId, deltaCents } of computeDeltas(
      oldEntries,
      typeById,
      equity,
      -1,
    )) {
      await tx
        .update(financeAccounts)
        .set({
          balance: sql`${financeAccounts.balance} + ${fromCents(
            deltaCents,
          )}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(financeAccounts.id, accountId));
    }

    // cascade 删除关联 entries
    await tx.delete(transactions).where(eq(transactions.id, transactionId));
  });
  if (__occurredAt) await refreshSnapshots(userId, __occurredAt);
}

export async function editTransaction(
  userId: string,
  transactionId: string,
  input: CreateTransactionInput,
): Promise<{ transaction: TransactionItem }> {
  if (toCents(input.amount) <= 0)
    throw new LedgerInvariantError('金额必须为正');
  const equity = await ensureSystemEquityAccounts();
  const entryInputs = buildEntries(input, equity);
  assertBalanced(entryInputs);

  const __editResult = await db.transaction(async (tx) => {
    const [txn] = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);
    if (!txn) throw new LedgerInvariantError('交易不存在');
    if (txn.userId !== userId) throw new LedgerInvariantError('无权操作该交易');

    const oldEntries: EntryInput[] = (
      await tx.select().from(entries).where(eq(entries.transactionId, transactionId))
    ).map((e) => ({ accountId: e.accountId, side: e.side, amount: e.amount }));

    // 先反转旧分录影响
    const oldIds = userAccountIdsOf(oldEntries, equity);
    const oldAccts = oldIds.length
      ? await tx
          .select({ id: financeAccounts.id, type: financeAccounts.type })
          .from(financeAccounts)
          .where(inArray(financeAccounts.id, oldIds))
      : [];
    const oldTypeById = new Map(oldAccts.map((a) => [a.id, a.type] as const));
    for (const { accountId, deltaCents } of computeDeltas(
      oldEntries,
      oldTypeById,
      equity,
      -1,
    )) {
      await tx
        .update(financeAccounts)
        .set({
          balance: sql`${financeAccounts.balance} + ${fromCents(
            deltaCents,
          )}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(financeAccounts.id, accountId));
    }
    await tx.delete(entries).where(eq(entries.transactionId, transactionId));

    // 写新分录并应用影响
    await tx.insert(entries).values(
      entryInputs.map((e) => ({
        transactionId,
        accountId: e.accountId,
        side: e.side,
        amount: String(e.amount),
      })),
    );
    const newIds = userAccountIdsOf(entryInputs, equity);
    const newAccts = newIds.length
      ? await tx
          .select({ id: financeAccounts.id, type: financeAccounts.type })
          .from(financeAccounts)
          .where(inArray(financeAccounts.id, newIds))
      : [];
    const newTypeById = new Map(newAccts.map((a) => [a.id, a.type] as const));
    for (const { accountId, deltaCents } of computeDeltas(
      entryInputs,
      newTypeById,
      equity,
      1,
    )) {
      await tx
        .update(financeAccounts)
        .set({
          balance: sql`${financeAccounts.balance} + ${fromCents(
            deltaCents,
          )}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(financeAccounts.id, accountId));
    }

    const [updated] = await tx
      .update(transactions)
      .set({
        type: input.type,
        categoryId: input.categoryId,
        amount: input.amount,
        occurredAt: input.occurredAt ?? txn.occurredAt,
        note: input.note,
        source: input.source ?? txn.source,
        confidence: input.confidence ?? txn.confidence,
        memberId: input.memberId,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId))
      .returning();
    return { transaction: updated! };
  });
  await refreshSnapshots(userId, __editResult.transaction.occurredAt);
  return __editResult;
}

/** PATCH 输入：所有字段可选（部分更新）。 */
export interface PatchTransactionInput {
  type?: TransactionType;
  amount?: string;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string | null;
  occurredAt?: Date;
  note?: string | null;
  source?: TransactionSource;
  confidence?: string;
  /** Phase 4：家庭归属（null 表示清除归属）。 */
  memberId?: string | null;
}

/**
 * 从既有分录推导 from/to 账户（用于 PATCH 合并）。
 * - income：debit 侧为用户账户（to），credit 侧为 __income
 * - expense：credit 侧为用户账户（from），debit 侧为 __expense
 * - transfer：debit=to，credit=from
 */
function deriveAccounts(
  existing: EntryItem[],
  equity: SystemEquityAccounts,
): { fromAccountId?: string; toAccountId?: string } {
  const userEntries = existing.filter(
    (e) => e.accountId !== equity.income && e.accountId !== equity.expense,
  );
  const debit = userEntries.find((e) => e.side === 'debit');
  const credit = userEntries.find((e) => e.side === 'credit');
  return {
    fromAccountId: credit?.accountId,
    toAccountId: debit?.accountId,
  };
}

/**
 * 部分更新交易：合并 patch 与既有交易，再走 editTransaction 原子重建分录与余额。
 * 未提供结构字段（type/amount/accounts）时沿用既有值；metadata（note/categoryId/occurredAt）
 * 亦可单独更新。重建等价分录时余额净变化为 0，自洽（SC-007）。
 */
export async function patchTransaction(
  userId: string,
  transactionId: string,
  patch: PatchTransactionInput,
): Promise<{ transaction: TransactionItem }> {
  const [existing] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);
  if (!existing) throw new LedgerInvariantError('交易不存在');
  if (existing.userId !== userId)
    throw new LedgerInvariantError('无权操作该交易');

  const equity = await ensureSystemEquityAccounts();
  const existingEntries = await db
    .select()
    .from(entries)
    .where(eq(entries.transactionId, transactionId));
  const derived = deriveAccounts(existingEntries, equity);

  const full: CreateTransactionInput = {
    userId,
    type: patch.type ?? existing.type,
    amount: patch.amount ?? existing.amount,
    fromAccountId: patch.fromAccountId ?? derived.fromAccountId,
    toAccountId: patch.toAccountId ?? derived.toAccountId,
    categoryId:
      patch.categoryId !== undefined
        ? patch.categoryId ?? undefined
        : (existing.categoryId ?? undefined),
    occurredAt: patch.occurredAt ?? existing.occurredAt,
    note:
      patch.note !== undefined ? (patch.note ?? undefined) : existing.note ?? undefined,
    source: patch.source ?? existing.source,
    confidence: patch.confidence ?? existing.confidence,
    memberId:
      patch.memberId !== undefined
        ? (patch.memberId ?? undefined)
        : (existing.memberId ?? undefined),
  };

  return editTransaction(userId, transactionId, full);
}

// ===== Phase 2：贷款还款（repayment，3 腿本金/利息拆分）=====

export interface RepayInput {
  userId: string;
  liabilityAccountId: string;
  cashAccountId: string;
  /** 还款本金（>0）。 */
  principal: string;
  /** 还款利息（>=0）。 */
  interest: string;
  occurredAt?: Date;
  note?: string;
  /** 提前还款：若还清则清除到期日（完整摊销重算超出本阶段范围）。 */
  earlyRepayment?: boolean;
}

/**
 * 纯函数：构造还款分录（2–3 腿）。
 * - debit 负债 principal（减少欠款）
 * - debit __expense interest（利息计入支出，interest>0 时）
 * - credit 现金 principal+interest（现金减少合计）
 * 平衡：Σdebit(principal+interest) == Σcredit(principal+interest)。
 */
export function buildRepaymentEntries(
  liabilityAccountId: string,
  cashAccountId: string,
  expenseEquityId: string,
  principal: string,
  interest: string,
): EntryInput[] {
  const principalCents = toCents(principal);
  const interestCents = toCents(interest);
  if (principalCents <= 0) throw new LedgerInvariantError('还款本金必须为正');
  if (interestCents < 0) throw new LedgerInvariantError('还款利息不可为负');
  const legs: EntryInput[] = [
    { accountId: liabilityAccountId, side: 'debit', amount: fromCents(principalCents) },
    { accountId: cashAccountId, side: 'credit', amount: fromCents(principalCents + interestCents) },
  ];
  if (interestCents > 0) {
    legs.push({ accountId: expenseEquityId, side: 'debit', amount: fromCents(interestCents) });
  }
  return legs;
}

/**
 * 记录贷款/信用卡还款：3 腿本金/利息拆分，单事务内更新两账户 balance + 累计已还本金，
 * 提交后刷新净资产快照。结果：负债 −principal、现金 −(principal+interest)、净资产 −interest、
 * 资产端不变（SC-001）。
 */
export async function recordRepayment(
  input: RepayInput,
): Promise<{
  transaction: TransactionItem;
  remainingPrincipal: string;
  paidAmount: string;
}> {
  const equity = await ensureSystemEquityAccounts();
  const entryInputs = buildRepaymentEntries(
    input.liabilityAccountId,
    input.cashAccountId,
    equity.expense,
    input.principal,
    input.interest,
  );
  assertBalanced(entryInputs);
  const occurredAt = input.occurredAt ?? new Date();
  const totalAmount = fromCents(toCents(input.principal) + toCents(input.interest));

  // 校验账户归属与类型（scoped）
  const [liability] = await db
    .select({ id: financeAccounts.id, type: financeAccounts.type, userId: financeAccounts.userId })
    .from(financeAccounts)
    .where(eq(financeAccounts.id, input.liabilityAccountId))
    .limit(1);
  if (!liability || liability.userId !== input.userId)
    throw new LedgerInvariantError('负债账户不存在或无权操作');
  if (!LIABILITY_ACCOUNT_TYPES.includes(liability.type))
    throw new LedgerInvariantError('目标账户不是负债类型');
  const [cash] = await db
    .select({ id: financeAccounts.id, userId: financeAccounts.userId })
    .from(financeAccounts)
    .where(eq(financeAccounts.id, input.cashAccountId))
    .limit(1);
  if (!cash || cash.userId !== input.userId)
    throw new LedgerInvariantError('现金账户不存在或无权操作');

  const result = await db.transaction(async (tx) => {
    const [txn] = await tx
      .insert(transactions)
      .values({
        userId: input.userId,
        type: 'repayment',
        amount: totalAmount,
        principalAmount: input.principal,
        interestAmount: input.interest,
        occurredAt,
        note: input.note,
        source: 'manual',
      })
      .returning();
    await tx.insert(entries).values(
      entryInputs.map((e) => ({
        transactionId: txn!.id,
        accountId: e.accountId,
        side: e.side,
        amount: String(e.amount),
      })),
    );

    // 按分录原子更新涉及账户 balance（复式增量）
    const ids = Array.from(new Set(entryInputs.map((e) => e.accountId)));
    const accts = await tx
      .select({ id: financeAccounts.id, type: financeAccounts.type })
      .from(financeAccounts)
      .where(inArray(financeAccounts.id, ids));
    const typeById = new Map(accts.map((a) => [a.id, a.type] as const));
    for (const e of entryInputs) {
      const type = typeById.get(e.accountId);
      if (!type) continue; // 系统权益账户（__expense）不维护余额
      const deltaCents = signedDeltaCents(type, e.side, e.amount);
      await tx
        .update(financeAccounts)
        .set({
          balance: sql`${financeAccounts.balance} + ${fromCents(deltaCents)}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(financeAccounts.id, e.accountId));
    }

    // 累计已还本金（同事务，防漂移）
    await tx
      .update(financeLiabilityDetails)
      .set({
        paidAmount: sql`${financeLiabilityDetails.paidAmount} + ${input.principal}::numeric`,
        updatedAt: new Date(),
      })
      .where(eq(financeLiabilityDetails.accountId, input.liabilityAccountId));

    // 提前还款且还清：清除到期日（完整摊销重算超出本阶段范围）
    if (input.earlyRepayment) {
      const [updatedLiab] = await tx
        .select({ balance: financeAccounts.balance })
        .from(financeAccounts)
        .where(eq(financeAccounts.id, input.liabilityAccountId))
        .limit(1);
      if (updatedLiab && Math.abs(toCents(updatedLiab.balance)) <= 0) {
        await tx
          .update(financeLiabilityDetails)
          .set({ dueDate: null, updatedAt: new Date() })
          .where(eq(financeLiabilityDetails.accountId, input.liabilityAccountId));
      }
    }

    // 读回最新余额/已还
    const [finalLiab] = await tx
      .select({ balance: financeAccounts.balance })
      .from(financeAccounts)
      .where(eq(financeAccounts.id, input.liabilityAccountId))
      .limit(1);
    const [finalDetail] = await tx
      .select({ paidAmount: financeLiabilityDetails.paidAmount })
      .from(financeLiabilityDetails)
      .where(eq(financeLiabilityDetails.accountId, input.liabilityAccountId))
      .limit(1);
    return {
      transaction: txn!,
      remainingPrincipal: finalLiab!.balance,
      paidAmount: finalDetail?.paidAmount ?? '0',
    };
  });
  await refreshSnapshots(input.userId, occurredAt);
  return result;
}
