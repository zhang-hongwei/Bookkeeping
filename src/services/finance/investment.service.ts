/**
 * 投资业务服务（Phase 3）—— 持仓登记 / 买入 / 卖出 / 分红 / 估值同步 / 指标 / IRR / 配置。
 *
 * 建模（research.md R1/R2/R5/R8）：
 * - 每个持仓 = 一个 `investment` 账户；**市值 = 账户 balance（真相源，由分录维护）**。
 * - 买入 = transfer 2 腿（借持仓 / 贷现金），**净资产不变**（SC-001）；费用计入成本。
 * - 卖出 = disposal 3 腿（**复用 `buildDisposalEntries`**，bookValue=balance×(shares/quantity)），
 *   实现盈亏计入 `__income`/`__expense`；costPrice 不变、quantity 减少、清仓置 isClosed。
 * - 估值同步 = revaluation 2 腿（**复用 `buildRevaluationEntries`**，对腿 `__revaluation`）。
 * - 分红（现金）= income 2 腿（借现金 / 贷 `__income`），持仓不变。
 *
 * `__revaluation`/revaluation/disposal 类型与分录构造已在 Phase 2 落地（research.md R8 已过时），
 * 本服务直接复用，**不重复实现**。所有写操作在单个 `db.transaction` 内完成 + best-effort `refreshSnapshots`。
 *
 * 纯函数（`buildBuyEntries`/`buildDividendCashEntries`）供单测（无 DB）。
 */
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  financeAccounts,
  financePositions,
  financeInvestmentTrades,
  transactions,
  entries,
  ASSET_ACCOUNT_TYPES,
  type AccountItem,
  type InstrumentType,
  type ValuationSource,
  type PositionItem,
  type TransactionItem,
} from '@/database/schema/finance';
import { accountRepository } from '@/repositories/finance/account.repository';
import {
  positionRepository,
  type UpdatePositionPatch,
} from '@/repositories/finance/position.repository';
import { investmentTradeRepository } from '@/repositories/finance/investment-trade.repository';
import {
  assertBalanced,
  signedDeltaCents,
  LedgerInvariantError,
  type EntryInput,
} from './balance.service';
import { ensureSystemEquityAccounts } from './ledger.service';
import { buildRevaluationEntries, buildDisposalEntries } from './asset.service';
import { refreshSince } from './net-worth.service';
import { toCents, fromCents } from './money';
import {
  costFrom,
  pnl as pnlOf,
  pnlRate,
  weightedAvgCost,
  aggregateByType,
  allocationTotal,
  maxConcentrationRatio,
} from './pnl';
import { computeXirr, type XirrCashflow } from './irr';
import { computeConcentrationAlert, type ConcentrationAlert } from './rules-engine.service';

export { LedgerInvariantError } from './balance.service';

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function refreshSnapshots(userId: string, occurredAt: Date): Promise<void> {
  try {
    await refreshSince(userId, dayKey(occurredAt));
  } catch (err) {
    console.error('[investment] snapshot refresh failed:', err);
  }
}

/** 持仓 + 派生指标（市值=balance、成本、盈亏、盈亏率）。 */
export interface PositionWithMetrics {
  account: AccountItem;
  position: PositionItem;
  cost: string;
  /** 市值 = 账户 balance（真相源）。 */
  marketValue: string;
  pnl: string;
  pnlRate: string | null;
}

/** 由账户 + 持仓组装派生指标。 */
function composePosition(account: AccountItem, position: PositionItem): PositionWithMetrics {
  const cost = costFrom(position.quantity, position.costPrice);
  const marketValue = account.balance;
  const p = pnlOf(marketValue, cost);
  return { account, position, cost, marketValue, pnl: p, pnlRate: pnlRate(p, cost) };
}

/** 取用户持仓账户（investment，scoped）。 */
async function fetchInvestmentAccount(
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
        eq(financeAccounts.type, 'investment'),
      ),
    )
    .limit(1);
  if (!account) throw new LedgerInvariantError('投资账户不存在或类型不符');
  return account;
}

/** 单事务内：写 transaction + entries + 按分录原子更新涉及用户账户 balance。返回 transaction id。 */
async function postEntries(
  opts: {
    userId: string;
    type: 'transfer' | 'disposal' | 'income' | 'revaluation';
    amount: string;
    occurredAt: Date;
    note?: string;
    entryInputs: EntryInput[];
    equity: { income: string; expense: string; revaluation: string };
  },
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<string> {
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
  const equityIds = new Set([opts.equity.income, opts.equity.expense, opts.equity.revaluation]);
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
    const deltaCents = signedDeltaCents(type, e.side, e.amount);
    await tx
      .update(financeAccounts)
      .set({
        balance: sql`${financeAccounts.balance} + ${fromCents(deltaCents)}::numeric`,
        updatedAt: new Date(),
      })
      .where(eq(financeAccounts.id, e.accountId));
  }
  return txn!.id;
}

/** 读取用户最近一条交易（用于返回 transaction 摘要）。 */
async function latestTransaction(userId: string): Promise<TransactionItem> {
  const [last] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(1);
  if (!last) throw new LedgerInvariantError('交易读取失败');
  return last;
}

/**
 * 纯函数：构造买入分录（transfer 2 腿）。
 * - debit 持仓 amount（= shares×price + fee，资金从现金移入持仓）
 * - credit 现金 amount
 * 平衡：Σdebit == Σcredit；净资产不变（SC-001）。
 */
export function buildBuyEntries(
  investmentAccountId: string,
  cashAccountId: string,
  amount: string,
): EntryInput[] {
  return [
    { accountId: investmentAccountId, side: 'debit', amount },
    { accountId: cashAccountId, side: 'credit', amount },
  ];
}

/**
 * 纯函数：构造现金分红分录（income 2 腿）。
 * - debit 现金 amount
 * - credit `__income` amount
 * 持仓不变（分红以现金形式到账）。
 */
export function buildDividendCashEntries(
  cashAccountId: string,
  incomeEquityId: string,
  amount: string,
): EntryInput[] {
  return [
    { accountId: cashAccountId, side: 'debit', amount },
    { accountId: incomeEquityId, side: 'credit', amount },
  ];
}

// ===== 登记 / 列表 / 明细 =====

export interface RegisterPositionInput {
  userId: string;
  name: string;
  instrumentCode: string;
  instrumentType: InstrumentType;
  currency?: string;
  includeInNetWorth?: boolean;
}

/** 登记持仓：建 investment 账户（balance=0）+ 1:1 positions（qty0/cost0）。 */
export async function registerPosition(
  input: RegisterPositionInput,
): Promise<PositionWithMetrics> {
  const account = await accountRepository(input.userId).create({
    name: input.name,
    type: 'investment',
    openingBalance: '0',
    currency: input.currency,
    includeInNetWorth: input.includeInNetWorth ?? true,
  });
  const position = await positionRepository(input.userId).upsertByAccountId({
    accountId: account.id,
    instrumentCode: input.instrumentCode,
    instrumentType: input.instrumentType,
    quantity: '0',
    costPrice: '0',
    currentPrice: '0',
    currency: input.currency,
  });
  return composePosition(account, position);
}

/** 列出持仓（带派生指标，scoped；可按类型/是否平仓过滤）。 */
export async function listPositions(
  userId: string,
  opts?: { instrumentType?: InstrumentType; includeClosed?: boolean },
): Promise<PositionWithMetrics[]> {
  const positions = await positionRepository(userId).list(opts);
  if (positions.length === 0) return [];
  const accountIds = positions.map((p) => p.accountId);
  const accounts = await db
    .select()
    .from(financeAccounts)
    .where(
      and(inArray(financeAccounts.id, accountIds), eq(financeAccounts.userId, userId)),
    );
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  return positions
    .map((p) => {
      const account = accountById.get(p.accountId);
      return account ? composePosition(account, p) : null;
    })
    .filter((x): x is PositionWithMetrics => x !== null);
}

/** 取单个持仓 + 指标（scoped）。 */
export async function getPosition(
  userId: string,
  positionId: string,
): Promise<PositionWithMetrics | null> {
  const position = await positionRepository(userId).findById(positionId);
  if (!position) return null;
  const account = await fetchInvestmentAccount(userId, position.accountId);
  return composePosition(account, position);
}

// ===== 买入 / 卖出 / 分红 / 估值同步 =====

export interface BuyInput {
  userId: string;
  positionId: string;
  cashAccountId: string;
  shares: string;
  price: string;
  fee?: string;
  occurredAt?: Date;
  note?: string;
  dcaPlanId?: string;
}

/**
 * 买入：transfer 2 腿，单事务内改 balance + 重算持仓（加权成本 + 份额）+ 写 investment_trades(buy)。
 * 结果：持仓 balance +amount、现金 −amount、净资产不变（SC-001）。
 */
export async function buy(input: BuyInput): Promise<{
  transaction: TransactionItem;
  position: PositionWithMetrics;
}> {
  const sharesNum = Number(input.shares);
  const priceNum = Number(input.price);
  const fee = input.fee ?? '0';
  if (!(sharesNum > 0)) throw new LedgerInvariantError('买入份额必须为正');
  if (!(priceNum > 0)) throw new LedgerInvariantError('买入单价必须为正');
  if (toCents(fee) < 0) throw new LedgerInvariantError('买入费用不可为负');

  const position = await positionRepository(input.userId).findById(input.positionId);
  if (!position) throw new LedgerInvariantError('持仓不存在或无权操作');

  // 现金账户归属与类型校验（scoped）
  const [cash] = await db
    .select({
      id: financeAccounts.id,
      type: financeAccounts.type,
      userId: financeAccounts.userId,
    })
    .from(financeAccounts)
    .where(
      and(eq(financeAccounts.id, input.cashAccountId), eq(financeAccounts.userId, input.userId)),
    )
    .limit(1);
  if (!cash) throw new LedgerInvariantError('现金账户不存在或无权操作');
  if (!ASSET_ACCOUNT_TYPES.includes(cash.type) || cash.type === 'investment')
    throw new LedgerInvariantError('付款账户必须是现金/储蓄类账户');

  // amount = shares×price + fee（费用计入成本，research.md R7）
  const amount = fromCents(Math.round(sharesNum * priceNum * 100) + toCents(fee));
  if (toCents(amount) <= 0) throw new LedgerInvariantError('买入金额必须为正');

  const equity = await ensureSystemEquityAccounts();
  const entryInputs = buildBuyEntries(position.accountId, input.cashAccountId, amount);
  assertBalanced(entryInputs);
  const occurredAt = input.occurredAt ?? new Date();

  // 买入后的加权平均成本价（费用摊入：等效加价 = amount/shares）
  const addPriceEff = (toCents(amount) / sharesNum / 100).toFixed(6);
  const newCostPrice = weightedAvgCost(
    position.quantity,
    position.costPrice,
    input.shares,
    addPriceEff,
  );
  const newQuantity = (Number(position.quantity) + sharesNum).toFixed(6);

  await db.transaction(async (tx) => {
    const txnId = await postEntries(
      { userId: input.userId, type: 'transfer', amount, occurredAt, note: input.note, entryInputs, equity },
      tx,
    );
    // 持仓：份额累加 + 加权成本重算
    await tx
      .update(financePositions)
      .set({ quantity: newQuantity, costPrice: newCostPrice, updatedAt: new Date() })
      .where(eq(financePositions.id, position.id));
    // 投资交易语义层
    await tx.insert(financeInvestmentTrades).values({
      userId: input.userId,
      positionId: position.id,
      action: 'buy',
      shares: input.shares,
      price: input.price,
      fee,
      amount,
      transactionId: txnId,
      dcaPlanId: input.dcaPlanId,
      occurredAt,
      note: input.note,
    });
  });
  await refreshSnapshots(input.userId, occurredAt);

  const refreshed = await getPosition(input.userId, position.id);
  if (!refreshed) throw new LedgerInvariantError('买入后持仓读取失败');
  return { transaction: await latestTransaction(input.userId), position: refreshed };
}

export interface SellInput {
  userId: string;
  positionId: string;
  cashAccountId: string;
  shares: string;
  price: string;
  fee?: string;
  tax?: string;
  occurredAt?: Date;
  note?: string;
}

/**
 * 卖出：disposal 3 腿（复用 buildDisposalEntries），单事务内改 balance + 减份额 + 写 investment_trades(sell)。
 * - proceeds = shares×price − fee − tax；bookValue = balance×(shares/quantity)
 * - 实现盈亏 gap = proceeds − bookValue → `__income`/`__expense`
 * - costPrice 不变；全部卖出 → isClosed=true
 */
export async function sell(input: SellInput): Promise<{
  transaction: TransactionItem;
  realizedPnl: string;
  position: PositionWithMetrics;
}> {
  const sharesNum = Number(input.shares);
  const priceNum = Number(input.price);
  const fee = input.fee ?? '0';
  const tax = input.tax ?? '0';
  if (!(sharesNum > 0)) throw new LedgerInvariantError('卖出份额必须为正');
  if (!(priceNum > 0)) throw new LedgerInvariantError('卖出单价必须为正');
  if (toCents(fee) < 0 || toCents(tax) < 0)
    throw new LedgerInvariantError('卖出费用/税不可为负');

  const position = await positionRepository(input.userId).findById(input.positionId);
  if (!position) throw new LedgerInvariantError('持仓不存在或无权操作');
  if (Number(position.quantity) <= 0) throw new LedgerInvariantError('持仓已平仓，无可卖份额');
  if (sharesNum - Number(position.quantity) > 1e-9)
    throw new LedgerInvariantError('卖出份额超过持有量');

  const account = await fetchInvestmentAccount(input.userId, position.accountId);
  const [cash] = await db
    .select({ id: financeAccounts.id, userId: financeAccounts.userId })
    .from(financeAccounts)
    .where(
      and(eq(financeAccounts.id, input.cashAccountId), eq(financeAccounts.userId, input.userId)),
    )
    .limit(1);
  if (!cash) throw new LedgerInvariantError('现金账户不存在或无权操作');
  void priceNum;

  const proceeds = fromCents(
    Math.round(sharesNum * priceNum * 100) - toCents(fee) - toCents(tax),
  );
  if (toCents(proceeds) <= 0) throw new LedgerInvariantError('卖出所得必须为正');
  // 账面市值（按比例）：bookValue = balance × (shares / quantity)
  const bookValue = fromCents(
    Math.round((toCents(account.balance) * sharesNum) / Number(position.quantity)),
  );
  const realizedPnl = fromCents(toCents(proceeds) - toCents(bookValue));

  const equity = await ensureSystemEquityAccounts();
  const entryInputs = buildDisposalEntries(
    position.accountId,
    bookValue,
    proceeds,
    input.cashAccountId,
    equity.income,
    equity.expense,
  );
  assertBalanced(entryInputs);
  const occurredAt = input.occurredAt ?? new Date();
  const newQuantity = (Number(position.quantity) - sharesNum).toFixed(6);
  const isClosed = Number(newQuantity) <= 1e-9;

  await db.transaction(async (tx) => {
    const txnId = await postEntries(
      { userId: input.userId, type: 'disposal', amount: proceeds, occurredAt, note: input.note, entryInputs, equity },
      tx,
    );
    const patch: UpdatePositionPatch = { quantity: newQuantity, isClosed };
    await tx
      .update(financePositions)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(financePositions.id, position.id));
    await tx.insert(financeInvestmentTrades).values({
      userId: input.userId,
      positionId: position.id,
      action: 'sell',
      shares: input.shares,
      price: input.price,
      fee,
      tax,
      amount: proceeds,
      transactionId: txnId,
      occurredAt,
      note: input.note,
    });
  });
  await refreshSnapshots(input.userId, occurredAt);

  const refreshed = await getPosition(input.userId, position.id);
  if (!refreshed) throw new LedgerInvariantError('卖出后持仓读取失败');
  return {
    transaction: await latestTransaction(input.userId),
    realizedPnl,
    position: refreshed,
  };
}

export interface DividendInput {
  userId: string;
  positionId: string;
  kind: 'cash' | 'reinvest';
  cashAccountId?: string;
  /** 现金分红金额（kind=cash）。 */
  amount?: string;
  /** 再投资份额/单价（kind=reinvest）。 */
  shares?: string;
  price?: string;
  occurredAt?: Date;
  note?: string;
}

/**
 * 分红：
 * - cash：income 2 腿（借现金 / 贷 `__income`），持仓不变。
 * - reinvest：份额增加 + 成本稀释（总成本不变）+ 一次 revaluation 把 balance 对齐新份额×现价。
 */
export async function dividend(input: DividendInput): Promise<{
  transaction: TransactionItem;
  position: PositionWithMetrics;
}> {
  const position = await positionRepository(input.userId).findById(input.positionId);
  if (!position) throw new LedgerInvariantError('持仓不存在或无权操作');
  const occurredAt = input.occurredAt ?? new Date();
  const equity = await ensureSystemEquityAccounts();

  if (input.kind === 'cash') {
    const amount = input.amount ?? '0';
    if (toCents(amount) <= 0) throw new LedgerInvariantError('现金分红金额必须为正');
    if (!input.cashAccountId) throw new LedgerInvariantError('现金分红需要收款账户');
    const [cash] = await db
      .select({ id: financeAccounts.id, userId: financeAccounts.userId })
      .from(financeAccounts)
      .where(
        and(
          eq(financeAccounts.id, input.cashAccountId),
          eq(financeAccounts.userId, input.userId),
        ),
      )
      .limit(1);
    if (!cash) throw new LedgerInvariantError('现金账户不存在或无权操作');

    const entryInputs = buildDividendCashEntries(input.cashAccountId, equity.income, amount);
    assertBalanced(entryInputs);
    await db.transaction(async (tx) => {
      const txnId = await postEntries(
        { userId: input.userId, type: 'income', amount, occurredAt, note: input.note, entryInputs, equity },
        tx,
      );
      await tx.insert(financeInvestmentTrades).values({
        userId: input.userId,
        positionId: position.id,
        action: 'dividend_cash',
        amount,
        transactionId: txnId,
        occurredAt,
        note: input.note,
      });
    });
    await refreshSnapshots(input.userId, occurredAt);
    const refreshed = await getPosition(input.userId, position.id);
    return { transaction: await latestTransaction(input.userId), position: refreshed! };
  }

  // reinvest：份额 += shares、成本稀释（总成本不变）+ revaluation 对齐 balance
  const sharesNum = Number(input.shares);
  const priceNum = Number(input.price);
  if (!(sharesNum > 0) || !(priceNum > 0))
    throw new LedgerInvariantError('再投资需提供正份额与单价');
  const account = await fetchInvestmentAccount(input.userId, position.accountId);
  const totalQtyNew = Number(position.quantity) + sharesNum;
  const newQuantity = totalQtyNew.toFixed(6);
  // 总成本不变 → 新成本价 = 旧成本价 × 旧份额 / 新份额
  const newCostPrice = (
    (Number(position.costPrice) * Number(position.quantity)) / totalQtyNew
  ).toFixed(6);
  const newValue = fromCents(Math.round(Number(newQuantity) * priceNum * 100));
  const entryInputs = buildRevaluationEntries(account.id, account.balance, newValue, equity.revaluation);

  await db.transaction(async (tx) => {
    const patch: UpdatePositionPatch = {
      quantity: newQuantity,
      costPrice: newCostPrice,
      currentPrice: input.price!,
      priceSource: 'manual',
      lastPriceAt: occurredAt,
    };
    await tx
      .update(financePositions)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(financePositions.id, position.id));

    if (entryInputs.length > 0) {
      const txnId = await postEntries(
        {
          userId: input.userId,
          type: 'revaluation',
          amount: String(entryInputs[0].amount),
          occurredAt,
          note: input.note,
          entryInputs,
          equity,
        },
        tx,
      );
      await tx.insert(financeInvestmentTrades).values({
        userId: input.userId,
        positionId: position.id,
        action: 'dividend_reinvest',
        shares: input.shares,
        price: input.price,
        amount: '0',
        transactionId: txnId,
        occurredAt,
        note: input.note,
      });
    }
  });
  await refreshSnapshots(input.userId, occurredAt);
  const refreshed = await getPosition(input.userId, position.id);
  return { transaction: await latestTransaction(input.userId), position: refreshed! };
}

export interface RevaluePositionInput {
  userId: string;
  positionId: string;
  currentPrice: string;
  source?: ValuationSource;
  fetchedAt?: Date;
}

/**
 * 估值同步（FR-008）：newValue = quantity × currentPrice → revaluation 2 腿（复用 buildRevaluationEntries），
 * 单事务内改 balance=newValue + 更新 positions.currentPrice/priceSource/lastPriceAt，刷新快照。
 */
export async function revalue(input: RevaluePositionInput): Promise<{
  transaction: TransactionItem | null;
  position: PositionWithMetrics;
}> {
  const priceNum = Number(input.currentPrice);
  if (!Number.isFinite(priceNum) || priceNum < 0)
    throw new LedgerInvariantError('现价必须为非负数值');
  const position = await positionRepository(input.userId).findById(input.positionId);
  if (!position) throw new LedgerInvariantError('持仓不存在或无权操作');
  const account = await fetchInvestmentAccount(input.userId, position.accountId);
  const equity = await ensureSystemEquityAccounts();
  const occurredAt = input.fetchedAt ?? new Date();
  const newValue = fromCents(Math.round(Number(position.quantity) * priceNum * 100));
  const entryInputs = buildRevaluationEntries(account.id, account.balance, newValue, equity.revaluation);
  const source = input.source ?? 'manual';

  let transactionId: string | null = null;
  await db.transaction(async (tx) => {
    await tx
      .update(financePositions)
      .set({
        currentPrice: input.currentPrice,
        priceSource: source,
        lastPriceAt: occurredAt,
        updatedAt: new Date(),
      })
      .where(eq(financePositions.id, position.id));

    if (entryInputs.length > 0) {
      transactionId = await postEntries(
        {
          userId: input.userId,
          type: 'revaluation',
          amount: String(entryInputs[0].amount),
          occurredAt,
          entryInputs,
          equity,
        },
        tx,
      );
    }
  });
  await refreshSnapshots(input.userId, occurredAt);

  const refreshed = await getPosition(input.userId, position.id);
  const transaction = transactionId
    ? (await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1))[0] ?? null
    : null;
  return { transaction, position: refreshed! };
}

// ===== 指标 / IRR / 配置（US2/US3/US4） =====

export interface PerformanceResult {
  marketValue: string;
  cost: string;
  pnl: string;
  pnlRate: string | null;
  totalInvested: string;
  irr: { annualizedRate: string | null; converged: boolean; reason?: string; asOf: string };
}

/**
 * 持仓表现（市值/成本/盈亏/收益率 + XIRR，US2/US3）。
 * IRR 现金流：每次买入 −(amount)、现金分红 +amount、终端 +当前市值；不收敛 → null + reason。
 */
export async function getPerformance(
  userId: string,
  positionId: string,
  asOf?: Date,
): Promise<PerformanceResult | null> {
  const pm = await getPosition(userId, positionId);
  if (!pm) return null;
  const trades = await investmentTradeRepository(userId).listByPosition(positionId);
  const refDate = asOf ?? new Date();
  const cashflows: XirrCashflow[] = [];
  let totalInvested = 0;
  for (const t of trades) {
    if (t.action === 'buy') {
      cashflows.push({ date: t.occurredAt, amount: -toCents(t.amount) / 100 });
      totalInvested += toCents(t.amount);
    } else if (t.action === 'dividend_cash') {
      cashflows.push({ date: t.occurredAt, amount: toCents(t.amount) / 100 });
    }
  }
  // 终端市值（当前持仓市值 = account balance）
  if (toCents(pm.marketValue) > 0) {
    cashflows.push({ date: refDate, amount: toCents(pm.marketValue) / 100 });
  }
  const xirr = computeXirr(cashflows);
  return {
    marketValue: pm.marketValue,
    cost: pm.cost,
    pnl: pm.pnl,
    pnlRate: pm.pnlRate,
    totalInvested: fromCents(totalInvested),
    irr: {
      annualizedRate: xirr.annualizedRate === null ? null : xirr.annualizedRate.toFixed(6),
      converged: xirr.converged,
      reason: xirr.reason,
      asOf: refDate.toISOString(),
    },
  };
}

export interface AllocationResult {
  items: { instrumentType: string; marketValue: string; ratio: string }[];
  total: string;
  alerts: ConcentrationAlert[];
}

/** 资产配置（按品种类型聚合 + 集中度预警，US4，FR-007/SC-005）。 */
export async function getAllocation(
  userId: string,
  _view?: string,
): Promise<AllocationResult> {
  void _view;
  const positions = await listPositions(userId, { includeClosed: false });
  const items = aggregateByType(
    positions.map((p) => ({
      instrumentType: p.position.instrumentType,
      marketValue: p.marketValue,
    })),
  );
  // 集中度预警（单一持仓占比 > 阈值 → warn 提示，仅提示不代为操作）
  const concentration = computeConcentrationAlert(
    positions.map((p) => ({ marketValue: p.marketValue })),
  );
  return {
    items,
    total: allocationTotal(items),
    alerts: concentration ? [concentration] : [],
  };
}

/** 集中度（单一品种最大占比，US4 预警用）。 */
export async function getConcentration(userId: string): Promise<{ ratio: string }> {
  const positions = await listPositions(userId, { includeClosed: false });
  return {
    ratio: maxConcentrationRatio(positions.map((p) => ({ marketValue: p.marketValue }))),
  };
}
