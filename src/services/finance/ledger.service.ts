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
  EQUITY_ACCOUNT_NAMES,
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

// 复式不变式错误统一从 ledger.service 再导出，便于 API 层一处导入。
export { LedgerInvariantError } from './balance.service';

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
}

export interface SystemEquityAccounts {
  income: string;
  expense: string;
}

/** 幂等确保系统权益账户存在（__income / __expense）。 */
export async function ensureSystemEquityAccounts(): Promise<SystemEquityAccounts> {
  const rows = await db
    .select({ id: financeAccounts.id, systemKey: financeAccounts.systemKey })
    .from(financeAccounts)
    .where(inArray(financeAccounts.systemKey, ['income', 'expense']));
  const map = new Map(rows.map((r) => [r.systemKey, r.id]));
  let income = map.get('income');
  let expense = map.get('expense');
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
  return { income: income!, expense: expense! };
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

  return db.transaction(async (tx) => {
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
}

export async function deleteTransaction(
  userId: string,
  transactionId: string,
): Promise<void> {
  return db.transaction(async (tx) => {
    const [txn] = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);
    if (!txn) throw new LedgerInvariantError('交易不存在');
    if (txn.userId !== userId) throw new LedgerInvariantError('无权操作该交易');

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

  return db.transaction(async (tx) => {
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
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId))
      .returning();
    return { transaction: updated! };
  });
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
  };

  return editTransaction(userId, transactionId, full);
}
