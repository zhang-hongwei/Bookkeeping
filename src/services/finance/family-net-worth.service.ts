/**
 * 家庭合并净资产服务（Phase 4 / US1）。
 *
 * 口径（research.md 决策2/4）：
 * - 家庭净资产 = Σ 各 active 成员「共享账号(visibility='shared')」净资产。
 * - 复用 Phase 1 纯函数 computeNetWorthFromAccounts（今日）/ computeNetWorthAtDatePure（历史），
 *   逐成员聚合后 sumMemberNetWorth 求和。隐私由构造保证（I2/SC-002）：只读 shared 账号。
 *
 * 家庭快照（finance_family_net_worth_snapshots）挂在个人 refreshSnapshots 钩子之后、
 * best-effort 刷新（不阻塞记账，沿用 Phase 1 范式）。
 *
 * 注：净资产按账号 owner 聚合；placeHolder/joint 成员无 userId → 无账号 → 不贡献净资产。
 */
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  financeAccounts,
  entries,
  transactions,
  type AccountType,
  type EntrySide,
} from '@/database/schema/finance';
import {
  computeNetWorthFromAccounts,
  computeNetWorthAtDatePure,
  deriveViewNetWorth,
  type NetWorth,
  type NetWorthView,
} from './net-worth.service';
import { sumMemberNetWorth, type FamilyNetWorth } from './family-aggregate';
import { familyRepository } from '@/repositories/finance/family.repository';
import { familyNetWorthRepository } from '@/repositories/finance/family-net-worth.repository';
import { ShareScopeError } from './balance.service';

/** 与 net-worth.service.AccountView 结构兼容的共享账号视图（多带 userId 用于按 owner 分组）。 */
interface SharedAccountView {
  id: string;
  type: AccountType;
  openingBalance: string;
  balance: string;
  includeInNetWorth: boolean;
  userId: string;
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

/** 取家庭 active 成员中「有 userId」的（placeholder/joint 无账号，不参与聚合）。 */
async function memberUserIds(familyId: string): Promise<{ memberId: string; userId: string }[]> {
  const members = await familyRepository.listActiveMembers(familyId);
  return members
    .filter((m) => m.userId !== null)
    .map((m) => ({ memberId: m.id, userId: m.userId! }));
}

/** 拉取一组用户「共享 + 非系统」账号（含 openingBalance，供历史重算）。 */
async function fetchSharedAccounts(userIds: string[]): Promise<SharedAccountView[]> {
  if (userIds.length === 0) return [];
  return db
    .select({
      id: financeAccounts.id,
      type: financeAccounts.type,
      openingBalance: financeAccounts.openingBalance,
      balance: financeAccounts.balance,
      includeInNetWorth: financeAccounts.includeInNetWorth,
      userId: financeAccounts.userId,
    })
    .from(financeAccounts)
    .where(
      and(
        inArray(financeAccounts.userId, userIds),
        eq(financeAccounts.visibility, 'shared'),
        isNull(financeAccounts.systemKey),
      ),
    );
}

/** 拉取一组用户的分录（带交易发生日）。 */
async function fetchEntries(
  userIds: string[],
): Promise<Array<EntryView & { userId: string }>> {
  if (userIds.length === 0) return [];
  return db
    .select({
      userId: transactions.userId,
      accountId: entries.accountId,
      side: entries.side,
      amount: entries.amount,
      occurredAt: transactions.occurredAt,
    })
    .from(entries)
    .innerJoin(transactions, eq(entries.transactionId, transactions.id))
    .where(inArray(transactions.userId, userIds));
}

async function assertMember(familyId: string, userId: string): Promise<void> {
  const m = await familyRepository.findActiveMember(familyId, userId);
  if (!m) throw new ShareScopeError('无权访问该家庭数据');
}

/**
 * 家庭合并净资产（今日，实时）。Σ 各成员共享账号 live 净资产，含 memberBreakdown。
 * 隐私硬过滤：仅 visibility='shared' 账号（I2/SC-002）。
 */
export async function computeFamilyNetWorthLive(
  familyId: string,
  userId: string,
  view: NetWorthView = 'all',
): Promise<NetWorth & { memberBreakdown: Record<string, string> }> {
  await assertMember(familyId, userId);
  const members = await memberUserIds(familyId);
  const accounts = await fetchSharedAccounts(members.map((m) => m.userId));
  const byOwner = new Map<string, SharedAccountView[]>();
  for (const a of accounts) {
    const list = byOwner.get(a.userId) ?? [];
    list.push(a);
    byOwner.set(a.userId, list);
  }
  const memberResults = members.map((m) => {
    const nw = computeNetWorthFromAccounts(byOwner.get(m.userId) ?? []);
    return { memberId: m.memberId, netWorth: nw };
  });
  const family = sumMemberNetWorth(memberResults);
  const viewed = deriveViewNetWorth(
    { totalAssets: family.totalAssets, totalLiabilities: family.totalLiabilities, netWorth: family.netWorth, breakdown: {} },
    view,
  );
  return {
    totalAssets: viewed.totalAssets,
    totalLiabilities: viewed.totalLiabilities,
    netWorth: viewed.netWorth,
    breakdown: viewed.breakdown,
    memberBreakdown: family.memberBreakdown,
  };
}

/** 家庭某日合并净资产（历史重算，Σ 各成员共享账号）。 */
async function computeFamilyNetWorthAtDate(
  familyId: string,
  date: string,
): Promise<FamilyNetWorth> {
  const members = await memberUserIds(familyId);
  const [accounts, allEntries] = await Promise.all([
    fetchSharedAccounts(members.map((m) => m.userId)),
    fetchEntries(members.map((m) => m.userId)),
  ]);
  const accountsByOwner = new Map<string, SharedAccountView[]>();
  for (const a of accounts) {
    const list = accountsByOwner.get(a.userId) ?? [];
    list.push(a);
    accountsByOwner.set(a.userId, list);
  }
  const entriesByOwner = new Map<string, EntryView[]>();
  for (const e of allEntries) {
    const list = entriesByOwner.get(e.userId) ?? [];
    list.push({ accountId: e.accountId, side: e.side, amount: e.amount, occurredAt: e.occurredAt });
    entriesByOwner.set(e.userId, list);
  }
  const memberResults = members.map((m) => {
    const nw = computeNetWorthAtDatePure(
      accountsByOwner.get(m.userId) ?? [],
      entriesByOwner.get(m.userId) ?? [],
      date,
    );
    return { memberId: m.memberId, netWorth: nw };
  });
  return sumMemberNetWorth(memberResults);
}

/** 写/重算家庭某日快照。 */
async function snapshotFamilyForDate(
  familyId: string,
  date: string,
): Promise<FamilyNetWorth> {
  const nw = await computeFamilyNetWorthAtDate(familyId, date);
  await familyNetWorthRepository.upsert(familyId, { date, ...nw });
  return nw;
}

/**
 * 重算 [fromDate..today] 家庭快照（挂个人记账事务之后，best-effort）。
 * 成本 ≈ M 成员 × D 天 × entries（M 通常 ≤6、D 多为近几天），可接受。
 */
export async function refreshFamilySince(
  familyId: string,
  fromDate: string,
): Promise<void> {
  const today = todayStr();
  let cursor = new Date(fromDate + 'T00:00:00Z');
  while (dayStr(cursor) <= today) {
    await snapshotFamilyForDate(familyId, dayStr(cursor));
    cursor = addDay(cursor);
  }
}

/**
 * 用户记账后 best-effort 刷新其所在家庭快照（由 ledger.service refreshSnapshots 调用）。
 * 用户可能是一个或多个家庭的 active 成员；逐个刷新。
 */
export async function refreshFamilySnapshotsForUser(
  userId: string,
  fromDate: string,
): Promise<void> {
  const families = await familyRepository.findFamiliesByUser(userId);
  for (const f of families) {
    try {
      await refreshFamilySince(f.id, fromDate);
    } catch (err) {
      console.error('[family] snapshot refresh failed:', err);
    }
  }
}

/** 家庭净资产曲线（读快照 + 缺口懒回填，典型 30–90 天区间）。 */
export async function getFamilyCurve(
  familyId: string,
  userId: string,
  from: string,
  to: string,
): Promise<Array<{ date: string; netWorth: string; memberBreakdown: Record<string, string> }>> {
  await assertMember(familyId, userId);
  const existing = await familyNetWorthRepository.findRange(familyId, from, to);
  const have = new Set(existing.map((s) => s.date));
  let cursor = new Date(from + 'T00:00:00Z');
  while (dayStr(cursor) <= to) {
    const d = dayStr(cursor);
    if (!have.has(d)) await snapshotFamilyForDate(familyId, d);
    cursor = addDay(cursor);
  }
  const rows = await familyNetWorthRepository.findRange(familyId, from, to);
  return rows.map((s) => ({
    date: s.date,
    netWorth: s.netWorth,
    memberBreakdown: s.memberBreakdown,
  }));
}
