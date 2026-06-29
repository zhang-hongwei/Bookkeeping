/**
 * 净资产服务（US1）。
 *
 * 口径（research R1）：
 * - 总资产 = Σ balance(资产类 AND include_in_net_worth)
 * - 总负债 = Σ |balance(credit)|
 * - 净资产 = 总资产 − 总负债
 *
 * 快照（R2/R10）：每用户每日一行；交易增/改/删后重算 [occurredAt 当日 .. today]；
 * 首次启用历史回填；verifySnapshots 自愈（SC-001）。
 *
 * 纯函数（computeNetWorthFromAccounts / computeNetWorthAtDatePure）单独导出供单测。
 */
import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  financeAccounts,
  entries,
  transactions,
  ASSET_ACCOUNT_TYPES,
  type AccountType,
  type EntrySide,
} from '@/database/schema/finance';
import { signedDeltaCents } from './balance.service';
import { toCents, fromCents } from './money';
import { netWorthRepository } from '@/repositories/finance/net-worth.repository';

export interface NetWorth {
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  breakdown: Record<string, string>;
}

interface AccountView {
  id: string;
  type: AccountType;
  openingBalance: string;
  balance: string;
  includeInNetWorth: boolean;
}

interface EntryView {
  accountId: string;
  side: EntrySide;
  amount: string;
  occurredAt: Date | string;
}

function dayStr(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return Number.isNaN(date.getTime()) ? String(d) : date.toISOString().slice(0, 10);
}

function todayStr(): string {
  return dayStr(new Date());
}

function addDay(d: Date): Date {
  const n = new Date(d.getTime());
  n.setUTCDate(n.getUTCDate() + 1);
  return n;
}

function breakdownFromCents(map: Record<string, number>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) out[k] = fromCents(v);
  return out;
}

/** 纯函数：由账户「当前余额」推导净值（实时/今日）。 */
export function computeNetWorthFromAccounts(accounts: AccountView[]): NetWorth {
  let assetsCents = 0;
  let liabilitiesCents = 0;
  const breakdownCents: Record<string, number> = {};
  for (const a of accounts) {
    if (a.type === 'equity') continue;
    const c = toCents(a.balance);
    breakdownCents[a.type] = (breakdownCents[a.type] ?? 0) + c;
    if (a.type === 'credit') liabilitiesCents += Math.abs(c);
    else if (ASSET_ACCOUNT_TYPES.includes(a.type) && a.includeInNetWorth)
      assetsCents += c;
  }
  return {
    totalAssets: fromCents(assetsCents),
    totalLiabilities: fromCents(liabilitiesCents),
    netWorth: fromCents(assetsCents - liabilitiesCents),
    breakdown: breakdownFromCents(breakdownCents),
  };
}

/**
 * 纯函数：由账户（含 opening_balance）+ 全部 entries，重算「截止 date 当日」的净值。
 * 用于历史快照回填与校验。账户余额(date) = opening + Σ(delta where 发生日 <= date)。
 */
export function computeNetWorthAtDatePure(
  accounts: AccountView[],
  entriesList: EntryView[],
  date: string,
): NetWorth {
  let assetsCents = 0;
  let liabilitiesCents = 0;
  const breakdownCents: Record<string, number> = {};
  for (const a of accounts) {
    if (a.type === 'equity') continue;
    let balCents = toCents(a.openingBalance);
    for (const e of entriesList) {
      if (e.accountId !== a.id) continue;
      if (dayStr(e.occurredAt) > date) continue;
      balCents += signedDeltaCents(a.type, e.side, e.amount);
    }
    breakdownCents[a.type] = (breakdownCents[a.type] ?? 0) + balCents;
    if (a.type === 'credit') liabilitiesCents += Math.abs(balCents);
    else if (ASSET_ACCOUNT_TYPES.includes(a.type) && a.includeInNetWorth)
      assetsCents += balCents;
  }
  return {
    totalAssets: fromCents(assetsCents),
    totalLiabilities: fromCents(liabilitiesCents),
    netWorth: fromCents(assetsCents - liabilitiesCents),
    breakdown: breakdownFromCents(breakdownCents),
  };
}

/** 查询用户全部非系统账户（含归档）。 */
async function fetchUserAccounts(userId: string): Promise<AccountView[]> {
  return db
    .select({
      id: financeAccounts.id,
      type: financeAccounts.type,
      openingBalance: financeAccounts.openingBalance,
      balance: financeAccounts.balance,
      includeInNetWorth: financeAccounts.includeInNetWorth,
    })
    .from(financeAccounts)
    .where(
      and(eq(financeAccounts.userId, userId), isNull(financeAccounts.systemKey)),
    );
}

/** 查询用户全部分录（带交易发生日，按 userId 隔离）。 */
async function fetchUserEntries(userId: string): Promise<EntryView[]> {
  return db
    .select({
      accountId: entries.accountId,
      side: entries.side,
      amount: entries.amount,
      occurredAt: transactions.occurredAt,
    })
    .from(entries)
    .innerJoin(transactions, eq(entries.transactionId, transactions.id))
    .where(eq(transactions.userId, userId));
}

/** 实时净资产（由当前 balance 推导，今日）。 */
export async function computeNetWorthLive(userId: string): Promise<NetWorth> {
  const accounts = await fetchUserAccounts(userId);
  return computeNetWorthFromAccounts(accounts);
}

/** 某日净资产（由 entries 重算，历史）。 */
export async function computeNetWorthAtDate(
  userId: string,
  date: string,
): Promise<NetWorth> {
  const [accounts, entriesList] = await Promise.all([
    fetchUserAccounts(userId),
    fetchUserEntries(userId),
  ]);
  return computeNetWorthAtDatePure(accounts, entriesList, date);
}

/** 写/重算某日快照。 */
export async function snapshotForDate(
  userId: string,
  date: string,
): Promise<NetWorth> {
  const nw = await computeNetWorthAtDate(userId, date);
  await netWorthRepository(userId).upsert({ date, ...nw });
  return nw;
}

/** 今日快照。 */
export async function snapshotToday(userId: string): Promise<NetWorth> {
  return snapshotForDate(userId, todayStr());
}

/**
 * 区间快照（曲线数据源）。缺口懒回填：对区间内每一天若无快照则计算写入。
 * 适合典型 30–90 天区间；超大区间建议先 backfillHistory。
 */
export async function snapshotRange(
  userId: string,
  from: string,
  to: string,
) {
  const repo = netWorthRepository(userId);
  const existing = await repo.findRange(from, to);
  const have = new Set(existing.map((s) => s.date));
  let cursor = new Date(from + 'T00:00:00Z');
  const end = to;
  while (dayStr(cursor) <= end) {
    const d = dayStr(cursor);
    if (!have.has(d)) await snapshotForDate(userId, d);
    cursor = addDay(cursor);
  }
  return repo.findRange(from, to);
}

/** 首次启用：从最早交易日起逐日回填到今天。无交易则仅写今日。 */
export async function backfillHistory(userId: string): Promise<number> {
  const [row] = await db
    .select({ min: sql<string | null>`MIN(${transactions.occurredAt})` })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  const minDate = row?.min ? dayStr(row.min) : null;
  const today = todayStr();
  let count = 0;
  if (!minDate) {
    await snapshotForDate(userId, today);
    return 1;
  }
  let cursor = new Date(minDate + 'T00:00:00Z');
  while (dayStr(cursor) <= today) {
    await snapshotForDate(userId, dayStr(cursor));
    cursor = addDay(cursor);
    count++;
  }
  return count;
}

/** 校验所有快照净值 vs 重算净值；不一致则修复。返回不一致项（已自愈）。 */
export async function verifySnapshots(
  userId: string,
): Promise<Array<{ date: string; stored: string; expected: string }>> {
  const repo = netWorthRepository(userId);
  const existing = await repo.findRange('1970-01-01', todayStr());
  const mismatches: Array<{ date: string; stored: string; expected: string }> = [];
  for (const s of existing) {
    const expected = await computeNetWorthAtDate(userId, s.date);
    if (toCents(expected.netWorth) !== toCents(s.netWorth)) {
      await repo.upsert({ date: s.date, ...expected });
      mismatches.push({ date: s.date, stored: s.netWorth, expected: expected.netWorth });
    }
  }
  return mismatches;
}

/**
 * 重算 [fromDate .. today] 区间快照（挂 ledger 记账/改/删之后，R10）。
 * 在 ledger 事务提交后调用，读取最新余额/分录。
 */
export async function refreshSince(userId: string, fromDate: string): Promise<void> {
  const today = todayStr();
  let cursor = new Date(fromDate + 'T00:00:00Z');
  while (dayStr(cursor) <= today) {
    await snapshotForDate(userId, dayStr(cursor));
    cursor = addDay(cursor);
  }
}
