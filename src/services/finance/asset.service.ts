/**
 * 资产业务服务（Phase 2）—— 登记/更新/列表 + 估值更新(revaluation) + 处置(disposal)。
 *
 * - 资产 = real_asset / investment 账户；当前价值 = 账户 balance（真相源）。
 * - 登记建账户 + 1:1 asset_details（成本/估值来源/置信度/估值历史）。
 * - 估值更新/处置必须经分录改 balance（复式不变式），对腿用 __revaluation / __income / __expense。
 * - 生命周期操作在单事务内完成，提交后 best-effort 刷新净资产快照（沿用 Phase 0/1）。
 *
 * `buildRevaluationEntries` / `buildDisposalEntries` 为纯函数，供单测（无 DB）。
 */
import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  financeAccounts,
  transactions,
  entries,
  VALUATION_ACCOUNT_TYPES,
  type AccountItem,
  type EstimateConfidence,
  type ValuationSource,
  type ValuationHistoryEntry,
} from '@/database/schema/finance';
import { accountRepository } from '@/repositories/finance/account.repository';
import {
  assetDetailRepository,
  type UpdateAssetDetailPatch,
} from '@/repositories/finance/asset-detail.repository';
import {
  assertBalanced,
  signedDeltaCents,
  LedgerInvariantError,
  type EntryInput,
} from './balance.service';
import { ensureSystemEquityAccounts } from './ledger.service';
import { refreshSince } from './net-worth.service';
import { toCents, fromCents } from './money';

export { LedgerInvariantError } from './balance.service';

export interface RegisterAssetInput {
  userId: string;
  name: string;
  type: (typeof VALUATION_ACCOUNT_TYPES)[number];
  /** 当前价值 = 账户 openingBalance（建账即 balance）。 */
  currentValue: string;
  costBasis?: string;
  valuationSource?: ValuationSource;
  estimateConfidence?: EstimateConfidence;
  valuationDate?: string | null;
  currency?: string;
  includeInNetWorth?: boolean;
}

export interface UpdateAssetInput {
  userId: string;
  assetAccountId: string;
  name?: string;
  includeInNetWorth?: boolean;
  costBasis?: string;
  valuationSource?: ValuationSource;
  estimateConfidence?: EstimateConfidence;
  valuationDate?: string | null;
}

export interface AssetWithDetail {
  account: AccountItem;
  costBasis: string;
  valuationSource: ValuationSource;
  estimateConfidence: EstimateConfidence;
  valuationDate: string | null;
  valuationHistory: ValuationHistoryEntry[];
  isDisposed: boolean;
  /** 当前价值 = 账户 balance。 */
  currentValue: string;
}

export interface RevalueAssetInput {
  userId: string;
  assetAccountId: string;
  newValue: string;
  confidence?: EstimateConfidence;
  source?: ValuationSource;
  occurredAt?: Date;
}

export interface DisposeAssetInput {
  userId: string;
  assetAccountId: string;
  cashAccountId: string;
  proceeds: string;
  occurredAt?: Date;
  note?: string;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function refreshSnapshots(userId: string, occurredAt: Date): Promise<void> {
  try {
    await refreshSince(userId, dayKey(occurredAt));
  } catch (err) {
    console.error('[asset] snapshot refresh failed:', err);
  }
}

/** 取用户资产账户（real_asset/investment，scoped）。 */
async function fetchAssetAccount(
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
        inArray(financeAccounts.type, [...VALUATION_ACCOUNT_TYPES]),
      ),
    )
    .limit(1);
  if (!account) throw new LedgerInvariantError('资产账户不存在或类型不符');
  return account;
}

/**
 * 纯函数：构造估值更新分录（2 腿，资产 ↔ __revaluation）。
 * - delta > 0（升值）：debit 资产、credit __revaluation
 * - delta < 0（贬值）：debit __revaluation、credit 资产
 * - delta = 0：返回空（无分录，仅更新元数据）
 */
export function buildRevaluationEntries(
  assetAccountId: string,
  currentValue: string,
  newValue: string,
  revaluationEquityId: string,
): EntryInput[] {
  const deltaCents = toCents(newValue) - toCents(currentValue);
  if (deltaCents === 0) return [];
  const amount = fromCents(Math.abs(deltaCents));
  if (deltaCents > 0) {
    return [
      { accountId: assetAccountId, side: 'debit', amount },
      { accountId: revaluationEquityId, side: 'credit', amount },
    ];
  }
  return [
    { accountId: revaluationEquityId, side: 'debit', amount },
    { accountId: assetAccountId, side: 'credit', amount },
  ];
}

/**
 * 纯函数：构造资产处置分录（2–3 腿）。
 * - debit 现金 proceeds、credit 资产 bookValue（清零）
 * - gap = proceeds − book：>0 实现收益 credit __income；<0 实现损失 debit __expense；=0 仅 2 腿
 */
export function buildDisposalEntries(
  assetAccountId: string,
  bookValue: string,
  proceeds: string,
  cashAccountId: string,
  incomeEquityId: string,
  expenseEquityId: string,
): EntryInput[] {
  const bookCents = toCents(bookValue);
  const proceedsCents = toCents(proceeds);
  if (proceedsCents <= 0) throw new LedgerInvariantError('处置款必须为正');
  const gapCents = proceedsCents - bookCents;
  const legs: EntryInput[] = [
    { accountId: cashAccountId, side: 'debit', amount: fromCents(proceedsCents) },
    { accountId: assetAccountId, side: 'credit', amount: fromCents(bookCents) },
  ];
  if (gapCents > 0) {
    legs.push({ accountId: incomeEquityId, side: 'credit', amount: fromCents(gapCents) });
  } else if (gapCents < 0) {
    legs.push({
      accountId: expenseEquityId,
      side: 'debit',
      amount: fromCents(Math.abs(gapCents)),
    });
  }
  return legs;
}

/** 单事务内：写 transaction + entries + 按分录原子更新涉及账户 balance。 */
async function postEntriesTransaction(opts: {
  userId: string;
  type: 'revaluation' | 'disposal';
  amount: string;
  occurredAt: Date;
  note?: string;
  entryInputs: EntryInput[];
  equity: { income: string; expense: string; revaluation: string };
  sign: 1 | -1;
}): Promise<void> {
  await db.transaction(async (tx) => {
    const [txn] = await tx
      .insert(transactions)
      .values({
        userId: opts.userId,
        type: opts.type,
        amount: opts.amount,
        occurredAt: opts.occurredAt,
        note: opts.note,
        source: 'manual',
      })
      .returning();
    await tx.insert(entries).values(
      opts.entryInputs.map((e) => ({
        transactionId: txn!.id,
        accountId: e.accountId,
        side: e.side,
        amount: String(e.amount),
      })),
    );
    // 收集非系统账户，按类型应用带符号增量
    const equityIds = new Set([
      opts.equity.income,
      opts.equity.expense,
      opts.equity.revaluation,
    ]);
    const userAccountIds = Array.from(
      new Set(opts.entryInputs.map((e) => e.accountId).filter((id) => !equityIds.has(id))),
    );
    const accts = userAccountIds.length
      ? await tx
          .select({ id: financeAccounts.id, type: financeAccounts.type })
          .from(financeAccounts)
          .where(inArray(financeAccounts.id, userAccountIds))
      : [];
    const typeById = new Map(accts.map((a) => [a.id, a.type] as const));
    for (const e of opts.entryInputs) {
      if (equityIds.has(e.accountId)) continue;
      const type = typeById.get(e.accountId);
      if (!type) throw new LedgerInvariantError(`账户不存在: ${e.accountId}`);
      const deltaCents = opts.sign * signedDeltaCents(type, e.side, e.amount);
      await tx
        .update(financeAccounts)
        .set({
          balance: sql`${financeAccounts.balance} + ${fromCents(deltaCents)}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(financeAccounts.id, e.accountId));
    }
  });
}

/** 登记资产：建账户 + upsert 明细。 */
export async function registerAsset(input: RegisterAssetInput): Promise<AssetWithDetail> {
  const account = await accountRepository(input.userId).create({
    name: input.name,
    type: input.type,
    openingBalance: input.currentValue,
    currency: input.currency,
    includeInNetWorth: input.includeInNetWorth ?? true,
  });
  const detail = await assetDetailRepository(input.userId).upsertByAccountId({
    accountId: account.id,
    costBasis: input.costBasis ?? input.currentValue,
    valuationSource: input.valuationSource ?? 'manual',
    estimateConfidence: input.estimateConfidence ?? 'medium',
    valuationDate: input.valuationDate ?? null,
    valuationHistory: [
      {
        date: input.valuationDate ?? dayKey(new Date()),
        value: input.currentValue,
        confidence: input.estimateConfidence ?? 'medium',
        source: input.valuationSource ?? 'manual',
      },
    ],
  });
  return {
    account,
    costBasis: detail.costBasis,
    valuationSource: detail.valuationSource,
    estimateConfidence: detail.estimateConfidence,
    valuationDate: detail.valuationDate ? String(detail.valuationDate) : null,
    valuationHistory: detail.valuationHistory,
    isDisposed: detail.isDisposed,
    currentValue: account.balance,
  };
}

/** 更新资产元数据（不改 balance；balance 只能由 revalue/dispose 经分录改）。 */
export async function updateAsset(input: UpdateAssetInput): Promise<AssetWithDetail | null> {
  const accountPatch: { name?: string; includeInNetWorth?: boolean } = {};
  if (input.name !== undefined) accountPatch.name = input.name;
  if (input.includeInNetWorth !== undefined)
    accountPatch.includeInNetWorth = input.includeInNetWorth;
  if (Object.keys(accountPatch).length > 0) {
    await accountRepository(input.userId).update(input.assetAccountId!, accountPatch);
  }
  const detailPatch: UpdateAssetDetailPatch = {};
  if (input.costBasis !== undefined) detailPatch.costBasis = input.costBasis;
  if (input.valuationSource !== undefined) detailPatch.valuationSource = input.valuationSource;
  if (input.estimateConfidence !== undefined)
    detailPatch.estimateConfidence = input.estimateConfidence;
  if (input.valuationDate !== undefined) detailPatch.valuationDate = input.valuationDate;
  if (Object.keys(detailPatch).length > 0) {
    await assetDetailRepository(input.userId).update(input.assetAccountId!, detailPatch);
  }
  return getAsset(input.userId, input.assetAccountId!);
}

/** 列出用户全部资产（带明细 + 当前价值）。 */
export async function listAssets(userId: string): Promise<AssetWithDetail[]> {
  const accounts = await accountRepository(userId).list({ includeArchived: true });
  const assetAccounts = accounts.filter((a) =>
    VALUATION_ACCOUNT_TYPES.includes(a.type),
  );
  const details = await assetDetailRepository(userId).list();
  const detailByAccount = new Map(details.map((d) => [d.accountId, d]));
  return assetAccounts.map((account) => {
    const d = detailByAccount.get(account.id);
    return {
      account,
      costBasis: d?.costBasis ?? '0',
      valuationSource: d?.valuationSource ?? 'manual',
      estimateConfidence: d?.estimateConfidence ?? 'medium',
      valuationDate: d?.valuationDate ? String(d.valuationDate) : null,
      valuationHistory: d?.valuationHistory ?? [],
      isDisposed: d?.isDisposed ?? false,
      currentValue: account.balance,
    };
  });
}

/** 取单个资产（带明细）。 */
export async function getAsset(
  userId: string,
  accountId: string,
): Promise<AssetWithDetail | null> {
  const accounts = await listAssets(userId);
  return accounts.find((a) => a.account.id === accountId) ?? null;
}

/** 估值更新：revaluation 交易（资产 ↔ __revaluation）+ 明细/历史 + 刷新快照。 */
export async function revalueAsset(input: RevalueAssetInput): Promise<AssetWithDetail> {
  const account = await fetchAssetAccount(input.userId, input.assetAccountId);
  if (toCents(input.newValue) < 0)
    throw new LedgerInvariantError('估值不可为负');
  const equity = await ensureSystemEquityAccounts();
  const occurredAt = input.occurredAt ?? new Date();
  const entryInputs = buildRevaluationEntries(
    account.id,
    account.balance,
    input.newValue,
    equity.revaluation,
  );
  const confidence = input.confidence ?? 'medium';
  const source = input.source ?? 'manual';

  // 追加估值历史（无论 delta 是否为 0，记录本次估值点）
  const detail = await assetDetailRepository(input.userId).findByAccountId(account.id);
  const history: ValuationHistoryEntry[] = detail?.valuationHistory ?? [];
  history.push({ date: dayKey(occurredAt), value: input.newValue, confidence, source });
  await assetDetailRepository(input.userId).update(account.id, {
    valuationDate: dayKey(occurredAt),
    valuationHistory: history,
    estimateConfidence: confidence,
    valuationSource: source,
  });

  if (entryInputs.length > 0) {
    assertBalanced(entryInputs);
    await postEntriesTransaction({
      userId: input.userId,
      type: 'revaluation',
      amount: String(entryInputs[0].amount),
      occurredAt,
      entryInputs,
      equity,
      sign: 1,
    });
  }
  await refreshSnapshots(input.userId, occurredAt);
  return (await getAsset(input.userId, account.id))!;
}

/** 资产处置：disposal 交易（现金 + 资产清零 + 实现损益）+ isDisposed + 刷新快照。 */
export async function disposeAsset(input: DisposeAssetInput): Promise<AssetWithDetail> {
  const asset = await fetchAssetAccount(input.userId, input.assetAccountId);
  const [cash] = await db
    .select({ id: financeAccounts.id, type: financeAccounts.type })
    .from(financeAccounts)
    .where(and(eq(financeAccounts.id, input.cashAccountId), eq(financeAccounts.userId, input.userId)))
    .limit(1);
  if (!cash) throw new LedgerInvariantError('现金账户不存在');
  const equity = await ensureSystemEquityAccounts();
  const occurredAt = input.occurredAt ?? new Date();
  const entryInputs = buildDisposalEntries(
    asset.id,
    asset.balance,
    input.proceeds,
    input.cashAccountId,
    equity.income,
    equity.expense,
  );
  assertBalanced(entryInputs);
  await postEntriesTransaction({
    userId: input.userId,
    type: 'disposal',
    amount: input.proceeds,
    occurredAt,
    note: input.note,
    entryInputs,
    equity,
    sign: 1,
  });
  await assetDetailRepository(input.userId).update(asset.id, { isDisposed: true });
  await refreshSnapshots(input.userId, occurredAt);
  return (await getAsset(input.userId, asset.id))!;
}
