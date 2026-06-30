/**
 * 储蓄目标服务（Phase 5，US2）。
 *
 * 纯函数层（确定性、可复现、可追溯，I4/I5/SC-003）：
 * - computeGoalCurrent：按 progressBasis 派生当前金额（manual/linked/net_worth，D4）。
 * - computeGoalProgress：进度率 + ETA（近 N 月平均结余；负/零→unreachable，I5/SC-003）。
 * - getMonthlySurplusSeries：近 N 月结余序列（sumAmountByType 同口径，transfers 排除）。
 *
 * 当前金额/进度/ETA 均为派生（单一事实源 I1），不落库。
 */
import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  transactions,
  financeAccounts,
  type GoalItem,
  type GoalProgressBasis,
} from '@/database/schema/finance';
import { toCents, fromCents } from './money';
import { computeNetWorthLive } from './net-worth.service';
import { monthPeriod, shiftMonthKey } from './rules-engine.service';
import { goalRepository } from '@/repositories/finance/goal.repository';
import { LedgerInvariantError } from './ledger.service';

// ============ 纯函数（无 DB，可单测）============

/**
 * 纯函数：按 progressBasis 派生当前金额（cents，D4）。
 * - manual → manualAmount
 * - linked → Σ 关联账户余额（调用方算好传入）
 * - net_worth → 总净资产（调用方传入）
 */
export function computeGoalCurrent(
  goal: { progressBasis: GoalProgressBasis; manualAmount: string },
  data: { linkedBalanceCents?: number; netWorthCents?: number },
): number {
  if (goal.progressBasis === 'manual') return toCents(goal.manualAmount);
  if (goal.progressBasis === 'linked') return data.linkedBalanceCents ?? 0;
  return data.netWorthCents ?? 0;
}

export type GoalEtaStatus = 'on_track' | 'at_risk' | 'unreachable' | 'completed';

export interface GoalEta {
  etaDate: string | null; // YYYY-MM-DD 或 null
  etaStatus: GoalEtaStatus;
  monthsToGoal: number | null;
  avgMonthlySurplus: string; // decimal（可负）
  windowMonths: number;
}

export interface GoalProgress {
  currentAmount: string;
  targetAmount: string;
  remaining: string;
  progressRate: string; // 4dp
  completed: boolean;
  eta: GoalEta;
}

/** ms → YYYY-MM-DD（UTC）。 */
function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** 某日期 + N 个月 → 月粒度 YYYY-MM-DD（目标月首日，D5 月粒度）。 */
function addMonthsISO(from: Date, months: number): string {
  const total = from.getUTCFullYear() * 12 + from.getUTCMonth() + months;
  return isoDate(Date.UTC(Math.floor(total / 12), total % 12, 1));
}

/**
 * 纯函数：进度率 + ETA（D5，可复现 SC-003）。
 * - remaining = max(0, target − current)。
 * - avgSurplus = mean(surplusCents[−N..])（无数据→0）。
 * - current≥target → completed；avgSurplus≤0 → unreachable（无虚假日期，I5）。
 * - 有 targetDate 且可达 → monthsToGoal=ceil(remaining/avgSurplus)，etaDate=now+monthsToGoal；
 *   etaDate>targetDate → at_risk，否则 on_track。
 * - 无 targetDate（开放式）→ 仅进度，不估 ETA（etaDate=null、monthsToGoal=null，edge）。
 */
export function computeGoalProgress(input: {
  targetAmountCents: number;
  currentCents: number;
  surplusCents: number[]; // 升序，已按 windowMonths 截取
  windowMonths: number;
  targetDate: string | null;
  now: Date;
}): GoalProgress {
  const target = input.targetAmountCents;
  const current = input.currentCents;
  const remaining = Math.max(0, target - current);
  const progressRate = target > 0 ? current / target : 0;
  const completed = target > 0 && current >= target;

  const series = input.surplusCents;
  const avgSurplus =
    series.length > 0
      ? series.reduce((s, x) => s + x, 0) / series.length
      : 0;

  let etaStatus: GoalEtaStatus;
  let etaDate: string | null = null;
  let monthsToGoal: number | null = null;

  if (completed) {
    etaStatus = 'completed';
    monthsToGoal = 0;
  } else if (avgSurplus <= 0) {
    // 负/零结余：无法达成，绝不给出虚假日期（I5/SC-003）
    etaStatus = 'unreachable';
  } else {
    monthsToGoal = Math.ceil(remaining / avgSurplus);
    if (input.targetDate === null) {
      // 开放式目标：仅显进度，不估 ETA（edge）
      etaStatus = 'on_track';
      monthsToGoal = null;
    } else {
      etaDate = addMonthsISO(input.now, monthsToGoal);
      etaStatus = etaDate > input.targetDate ? 'at_risk' : 'on_track';
    }
  }

  return {
    currentAmount: fromCents(current),
    targetAmount: fromCents(target),
    remaining: fromCents(remaining),
    progressRate: progressRate.toFixed(4),
    completed,
    eta: {
      etaDate,
      etaStatus,
      monthsToGoal,
      avgMonthlySurplus: fromCents(Math.round(avgSurplus)),
      windowMonths: input.windowMonths,
    },
  };
}

// ============ DB 取数 ============

/** 近 N 月结余序列（{month,income,expense,surplus}，升序，D6）。
 *  口径同 rules-engine.sumAmountByType：type∈{income,expense}、按 occurredAt 月份、transfers 排除。 */
export async function getMonthlySurplusSeries(
  userId: string,
  months: number,
): Promise<{ month: string; income: string; expense: string; surplus: string }[]> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const out: { month: string; income: string; expense: string; surplus: string }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const month = shiftMonthKey(currentMonth, -i);
    const period = monthPeriod(month);
    const [income, expense] = await Promise.all([
      sumByType(userId, 'income', period),
      sumByType(userId, 'expense', period),
    ]);
    out.push({
      month,
      income,
      expense,
      surplus: fromCents(toCents(income) - toCents(expense)),
    });
  }
  return out;
}

/** 某周期内某类型交易金额合计（转账不计收支，D6 口径）。 */
async function sumByType(
  userId: string,
  type: 'income' | 'expense',
  period: { start: string; end: string },
): Promise<string> {
  const [row] = await db
    .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, type),
        gte(transactions.occurredAt, new Date(period.start + 'T00:00:00Z')),
        lt(transactions.occurredAt, new Date(period.end + 'T00:00:00Z')),
      ),
    );
  return row?.total ?? '0';
}

/** basis=linked 时：Σ 关联账户余额（校验账号属当前用户，cents）。 */
async function linkedBalanceCents(userId: string, linkedAccountIds: string[]): Promise<number> {
  if (linkedAccountIds.length === 0) return 0;
  const rows = await db
    .select({ balance: financeAccounts.balance })
    .from(financeAccounts)
    .where(
      and(
        eq(financeAccounts.userId, userId),
        sql`${financeAccounts.id} = ANY(${sql.raw(`ARRAY[${linkedAccountIds.map((id) => `'${id}'`).join(',')}]::text[]`)})`,
      ),
    );
  return rows.reduce((s, r) => s + toCents(r.balance), 0);
}

// ============ 编排层（US2）============

/** 默认 ETA 结余窗口（D5，spec 允许 3–6，默认 3）。 */
export const DEFAULT_ETA_WINDOW_MONTHS = 3;

/** 目标 + 派生进度（GoalDTO 数据形状，contracts/api.md §0.3/§3.6）。 */
export interface GoalWithProgress {
  id: string;
  name: string;
  targetAmount: string;
  targetDate: string | null;
  progressBasis: GoalProgressBasis;
  linkedAccountIds: string[];
  manualAmount: string;
  notes: string | null;
  status: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentAmount: string;
  progressRate: string;
  completed: boolean;
  eta: GoalEta;
}

async function resolveCurrentCents(userId: string, goal: GoalItem): Promise<number> {
  if (goal.progressBasis === 'manual') return toCents(goal.manualAmount);
  if (goal.progressBasis === 'linked')
    return linkedBalanceCents(userId, goal.linkedAccountIds ?? []);
  const nw = await computeNetWorthLive(userId);
  return toCents(nw.netWorth);
}

/** 计算目标进度（取数→current→surplusSeries→computeGoalProgress）。 */
export async function getGoalProgress(
  userId: string,
  goal: GoalItem,
  windowMonths: number = DEFAULT_ETA_WINDOW_MONTHS,
): Promise<{ progress: GoalProgress; surplusSeries: { month: string; income: string; expense: string; surplus: string }[] }> {
  const [currentCents, series] = await Promise.all([
    resolveCurrentCents(userId, goal),
    getMonthlySurplusSeries(userId, windowMonths),
  ]);
  const progress = computeGoalProgress({
    targetAmountCents: toCents(goal.targetAmount),
    currentCents,
    surplusCents: series.map((s) => toCents(s.surplus)),
    windowMonths,
    targetDate: goal.targetDate,
    now: new Date(),
  });
  return { progress, surplusSeries: series };
}

function toGoalWithProgress(goal: GoalItem, progress: GoalProgress): GoalWithProgress {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    targetDate: goal.targetDate,
    progressBasis: goal.progressBasis,
    linkedAccountIds: goal.linkedAccountIds ?? [],
    manualAmount: goal.manualAmount,
    notes: goal.notes,
    status: goal.status,
    completedAt: goal.completedAt ? goal.completedAt.toISOString() : null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    currentAmount: progress.currentAmount,
    progressRate: progress.progressRate,
    completed: progress.completed,
    eta: progress.eta,
  };
}

/** 单目标 + 进度。不存在/不属于用户 → null（路由 404）。 */
export async function getGoalWithProgress(
  userId: string,
  id: string,
  windowMonths: number = DEFAULT_ETA_WINDOW_MONTHS,
): Promise<GoalWithProgress | null> {
  const goal = await goalRepository(userId).findById(id);
  if (!goal) return null;
  const { progress } = await getGoalProgress(userId, goal, windowMonths);
  return toGoalWithProgress(goal, progress);
}

/** 单目标 + 进度明细（含 surplusSeries，可解释可追溯 SC-003）。null → 路由 404。 */
export async function getGoalProgressDetail(
  userId: string,
  id: string,
  windowMonths: number = DEFAULT_ETA_WINDOW_MONTHS,
): Promise<{
  goal: GoalWithProgress;
  progress: GoalProgress;
  surplusSeries: { month: string; income: string; expense: string; surplus: string }[];
} | null> {
  const goal = await goalRepository(userId).findById(id);
  if (!goal) return null;
  const { progress, surplusSeries } = await getGoalProgress(userId, goal, windowMonths);
  return { goal: toGoalWithProgress(goal, progress), progress, surplusSeries };
}

/** 目标列表 + 各自进度。 */
export async function listGoalsWithProgress(
  userId: string,
  opts: { status?: 'active' | 'archived'; windowMonths?: number } = {},
): Promise<GoalWithProgress[]> {
  const goals = await goalRepository(userId).listByUser({ status: opts.status });
  return Promise.all(
    goals.map(async (g) => {
      const { progress } = await getGoalProgress(userId, g, opts.windowMonths ?? DEFAULT_ETA_WINDOW_MONTHS);
      return toGoalWithProgress(g, progress);
    }),
  );
}

/** 校验 linked 账号属当前用户（INVARIANT，C7）。 */
async function assertLinkedAccountsOwn(userId: string, linkedAccountIds: string[]): Promise<void> {
  if (linkedAccountIds.length === 0) return;
  const rows = await db
    .select({ id: financeAccounts.id })
    .from(financeAccounts)
    .where(and(eq(financeAccounts.userId, userId), sql`${financeAccounts.id} = ANY(${sql.raw(`ARRAY[${linkedAccountIds.map((id) => `'${id}'`).join(',')}]::text[]`)})`));
  if (rows.length !== linkedAccountIds.length)
    throw new LedgerInvariantError('关联账户不属于当前用户');
}

/** 创建目标（basis=linked 须账号非空且属当前用户，否则 INVARIANT）。 */
export async function createGoal(
  userId: string,
  input: {
    name: string;
    targetAmount: string;
    targetDate?: string | null;
    progressBasis?: GoalProgressBasis;
    linkedAccountIds?: string[];
    manualAmount?: string;
    notes?: string | null;
  },
): Promise<GoalWithProgress> {
  if (toCents(input.targetAmount) <= 0)
    throw new LedgerInvariantError('目标金额必须为正');
  const basis = input.progressBasis ?? 'manual';
  const linkedAccountIds = input.linkedAccountIds ?? [];
  if (basis === 'linked') {
    if (linkedAccountIds.length === 0)
      throw new LedgerInvariantError('linked 口径需提供关联账户');
    await assertLinkedAccountsOwn(userId, linkedAccountIds);
  }
  const goal = await goalRepository(userId).create({ ...input, progressBasis: basis, linkedAccountIds });
  const { progress } = await getGoalProgress(userId, goal);
  return toGoalWithProgress(goal, progress);
}

/** 更新目标（首次达标记 completedAt，C4）。不存在 → null。 */
export async function updateGoal(
  userId: string,
  id: string,
  patch: {
    name?: string;
    targetAmount?: string;
    targetDate?: string | null;
    progressBasis?: GoalProgressBasis;
    linkedAccountIds?: string[];
    manualAmount?: string;
    notes?: string | null;
    status?: 'active' | 'archived';
  },
): Promise<GoalWithProgress | null> {
  if (patch.targetAmount !== undefined && toCents(patch.targetAmount) <= 0)
    throw new LedgerInvariantError('目标金额必须为正');
  const repo = goalRepository(userId);
  const existing = await repo.findById(id);
  if (!existing) return null;
  if (patch.progressBasis === 'linked' || (patch.linkedAccountIds && (patch.progressBasis ?? existing.progressBasis) === 'linked')) {
    const ids = patch.linkedAccountIds ?? existing.linkedAccountIds ?? [];
    if (ids.length === 0) throw new LedgerInvariantError('linked 口径需提供关联账户');
    await assertLinkedAccountsOwn(userId, ids);
  }
  const updated = await repo.update(id, patch);
  if (!updated) return null;
  // 首次达标 → 记 completedAt（事件标记，C4；不改 status）
  const { progress } = await getGoalProgress(userId, updated);
  if (progress.completed && !updated.completedAt) {
    const marked = await repo.update(id, { completedAt: new Date() });
    return toGoalWithProgress(marked ?? updated, progress);
  }
  return toGoalWithProgress(updated, progress);
}

/** 硬删目标。不存在 → false。 */
export async function deleteGoal(userId: string, id: string): Promise<boolean> {
  const repo = goalRepository(userId);
  const goal = await repo.findById(id);
  if (!goal) return false;
  await repo.delete(id);
  return true;
}
