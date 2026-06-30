/**
 * 预算服务（Phase 5，US1）。
 *
 * 纯函数层（确定性、可复现、可追溯，I4/SC-004）：
 * - computePeriodRange：周期边界 [start,end)（month/week/year，D1）。
 * - buildCategorySubtreeMap：分类树 → 子树后代集合（D2）。
 * - sumExpensesInSubtree：子树内 expense 汇总（cents，零双计 I8，仅 expense I7，I2）。
 * - computeBudgetAlert：超支/阈值预警（D3，同构 FindingData value/verdict/riskLevel 哲学）。
 *
 * 「已用」单一事实源——读时现算自 transactions（D1/I1，无物化 live 列）。
 */
import { and, eq, gte, lt } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  transactions,
  categories,
  type BudgetItem,
  type BudgetPeriodType,
  type BudgetStatus,
  type CategoryItem,
  type RiskLevel,
} from '@/database/schema/finance';
import { toCents, fromCents } from './money';
import { budgetRepository } from '@/repositories/finance/budget.repository';
import { LedgerInvariantError } from './ledger.service';

// ============ 纯函数（无 DB，可单测）============

/** ms → YYYY-MM-DD（UTC，避免时区漂移）。 */
function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * 纯函数：周期边界 [start, end)（YYYY-MM-DD，D1）。
 * - month：当月 1 日 → 次月 1 日
 * - week：本周一 → 下周一（ISO 周，周一起）
 * - year：当年 1/1 → 次年 1/1
 */
export function computePeriodRange(
  periodType: BudgetPeriodType,
  refDate: Date,
): { start: string; end: string } {
  const year = refDate.getUTCFullYear();
  const month = refDate.getUTCMonth();
  if (periodType === 'year') {
    return {
      start: isoDate(Date.UTC(year, 0, 1)),
      end: isoDate(Date.UTC(year + 1, 0, 1)),
    };
  }
  if (periodType === 'week') {
    const day = refDate.getUTCDay(); // 0=Sun..6=Sat
    const daysSinceMon = (day + 6) % 7; // 周一为 0
    const mondayMs = Date.UTC(year, month, refDate.getUTCDate() - daysSinceMon);
    return { start: isoDate(mondayMs), end: isoDate(mondayMs + 7 * 86_400_000) };
  }
  return {
    start: isoDate(Date.UTC(year, month, 1)),
    end: isoDate(Date.UTC(year, month + 1, 1)),
  };
}

/**
 * 纯函数：分类树 → 每个分类的子树后代集合（含自身，D2）。
 * - 经 parentId 闭包 BFS 构建后代集；O(分类数)。
 */
export function buildCategorySubtreeMap(
  cats: ReadonlyArray<{ id: string; parentId: string | null }>,
): Map<string, Set<string>> {
  const childrenOf = new Map<string, string[]>();
  for (const c of cats) {
    if (c.parentId) {
      const arr = childrenOf.get(c.parentId) ?? [];
      arr.push(c.id);
      childrenOf.set(c.parentId, arr);
    }
  }
  const result = new Map<string, Set<string>>();
  for (const c of cats) {
    const set = new Set<string>([c.id]);
    const stack = [c.id];
    while (stack.length > 0) {
      const cur = stack.pop()!;
      for (const child of childrenOf.get(cur) ?? []) {
        if (!set.has(child)) {
          set.add(child);
          stack.push(child);
        }
      }
    }
    result.set(c.id, set);
  }
  return result;
}

/**
 * 纯函数：子树内 expense 汇总（cents）。
 * - 仅当 txn.categoryId ∈ subtree 才计入（categoryId=null 不计）。
 * - 一笔交易对一个预算至多贡献一次（按子树判定一次，I8）；cents 求和（I2）。
 * @param expenseTxns 调用方须保证仅 type='expense'（I7）。
 */
export function sumExpensesInSubtree(
  expenseTxns: ReadonlyArray<{ categoryId: string | null; amount: string }>,
  subtree: Set<string>,
): number {
  let total = 0;
  for (const t of expenseTxns) {
    if (t.categoryId && subtree.has(t.categoryId)) {
      total += toCents(t.amount);
    }
  }
  return total;
}

/** 预算预警结果（D3，确定性纯函数产出，同构 FindingData 哲学）。 */
export interface BudgetAlert {
  budgetId: string;
  categoryId: string | null;
  period: { start: string; end: string };
  budgetAmount: string;
  spent: string;
  remaining: string;
  ratio: string;
  status: BudgetStatus;
  riskLevel: RiskLevel;
  verdict: string;
}

/**
 * 纯函数：预算预警（D3/D10）。
 * - ratio = spent / amount（amount>0 由校验保证）。
 * - status：ratio≥1 → overrun(high)；≥alertThreshold → warning(medium)；否则 normal(low/none)。
 * - verdict 为中文结论模板（非 LLM 文本，零幻觉）。
 */
export function computeBudgetAlert(input: {
  budgetId: string;
  categoryId: string | null;
  label: string;
  budgetAmountCents: number;
  alertThreshold: number; // 0..1
  spentCents: number;
  period: { start: string; end: string };
}): BudgetAlert {
  const amount = input.budgetAmountCents;
  const spent = input.spentCents;
  const ratio = amount > 0 ? spent / amount : 0;
  const threshold = input.alertThreshold;

  let status: BudgetStatus;
  let riskLevel: RiskLevel;
  if (ratio >= 1) {
    status = 'overrun';
    riskLevel = 'high';
  } else if (ratio >= threshold) {
    status = 'warning';
    riskLevel = 'medium';
  } else {
    status = 'normal';
    riskLevel = ratio > 0 ? 'low' : 'none';
  }

  const pct = Math.round(ratio * 100);
  const label = input.label || '总支出';
  const verdict =
    status === 'overrun'
      ? `${label}预算已超支 ¥${fromCents(spent - amount)}`
      : status === 'warning'
        ? `${label}预算即将超支（已用 ${pct}%）`
        : `${label}预算使用正常（已用 ${pct}%）`;

  return {
    budgetId: input.budgetId,
    categoryId: input.categoryId,
    period: input.period,
    budgetAmount: fromCents(amount),
    spent: fromCents(spent),
    remaining: fromCents(amount - spent),
    ratio: amount > 0 ? ratio.toFixed(4) : '0.0000',
    status,
    riskLevel,
    verdict,
  };
}

// ============ 编排层（US1，DB 取数 + 写操作）============

/** 预算 + 当前周期派生状态（BudgetDTO 数据形状，contracts/api.md §0.3）。 */
export interface BudgetWithStatus {
  id: string;
  categoryId: string | null;
  name: string | null;
  amount: string;
  periodType: BudgetPeriodType;
  alertThreshold: string;
  rollover: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  period: { start: string; end: string };
  spent: string;
  remaining: string;
  ratio: string;
  status: BudgetStatus;
  riskLevel: RiskLevel;
  verdict: string;
}

/** 预算显示名：预算 name → 分类名 → 「总支出」。 */
function budgetLabel(budget: BudgetItem, categoryName: string | null): string {
  if (budget.name) return budget.name;
  if (budget.categoryId) return categoryName ?? '分类预算';
  return '总支出';
}

/** 由预算 + 派生数据组装 BudgetAlert（verdict 用正确分类名）。 */
function alertFor(
  budget: BudgetItem,
  period: { start: string; end: string },
  spentCents: number,
  categoryName: string | null,
): BudgetAlert {
  return computeBudgetAlert({
    budgetId: budget.id,
    categoryId: budget.categoryId,
    label: budgetLabel(budget, categoryName),
    budgetAmountCents: toCents(budget.amount),
    alertThreshold: Number(budget.alertThreshold),
    spentCents,
    period,
  });
}

function toBudgetWithStatus(budget: BudgetItem, alert: BudgetAlert): BudgetWithStatus {
  return {
    id: budget.id,
    categoryId: budget.categoryId,
    name: budget.name,
    amount: budget.amount,
    periodType: budget.periodType,
    alertThreshold: budget.alertThreshold,
    rollover: budget.rollover,
    active: budget.active,
    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString(),
    period: alert.period,
    spent: alert.spent,
    remaining: alert.remaining,
    ratio: alert.ratio,
    status: alert.status,
    riskLevel: alert.riskLevel,
    verdict: alert.verdict,
  };
}

/** 加载用户分类树并构建子树映射 + byId（D2）。 */
async function loadCategoryContext(userId: string): Promise<{
  map: Map<string, Set<string>>;
  byId: Map<string, CategoryItem>;
}> {
  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId));
  return {
    map: buildCategorySubtreeMap(cats),
    byId: new Map(cats.map((c) => [c.id, c])),
  };
}

/** 取周期内 type='expense' 的交易（categoryId + amount，I7 仅 expense）。 */
async function loadExpenseTxnsInPeriod(
  userId: string,
  period: { start: string; end: string },
): Promise<{ categoryId: string | null; amount: string }[]> {
  return db
    .select({ categoryId: transactions.categoryId, amount: transactions.amount })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.occurredAt, new Date(period.start + 'T00:00:00Z')),
        lt(transactions.occurredAt, new Date(period.end + 'T00:00:00Z')),
      ),
    );
}

/** 计算某预算在给定周期内的 spent（cents）。 */
async function computeSpent(
  userId: string,
  budget: BudgetItem,
  period: { start: string; end: string },
  ctx?: { map: Map<string, Set<string>>; txns?: { categoryId: string | null; amount: string }[] },
): Promise<number> {
  const txns = ctx?.txns ?? (await loadExpenseTxnsInPeriod(userId, period));
  if (budget.categoryId === null) {
    return txns.reduce((s, t) => s + toCents(t.amount), 0);
  }
  const map = ctx?.map ?? (await loadCategoryContext(userId)).map;
  const subtree = map.get(budget.categoryId) ?? new Set([budget.categoryId]);
  return sumExpensesInSubtree(txns, subtree);
}

/** 单预算当前周期 BudgetAlert。 */
export async function getBudgetAlert(
  userId: string,
  budget: BudgetItem,
  refDate: Date,
): Promise<BudgetAlert> {
  const period = computePeriodRange(budget.periodType, refDate);
  const ctx = await loadCategoryContext(userId);
  const spent = await computeSpent(userId, budget, period, {
    map: ctx.map,
    txns: await loadExpenseTxnsInPeriod(userId, period),
  });
  const categoryName = budget.categoryId ? ctx.byId.get(budget.categoryId)?.name ?? null : null;
  return alertFor(budget, period, spent, categoryName);
}

/** 预算列表 + 各自当前周期状态（共享取数，D1 现算）。 */
export async function listBudgetsWithStatus(
  userId: string,
  opts: { active?: boolean; refDate?: Date } = {},
): Promise<BudgetWithStatus[]> {
  const refDate = opts.refDate ?? new Date();
  const budgets = await budgetRepository(userId).listByUser({ active: opts.active });
  if (budgets.length === 0) return [];

  const ctx = await loadCategoryContext(userId);
  // 按周期类型缓存周期内 expense（同类型共享一次查询）
  const periodTxns = new Map<BudgetPeriodType, { categoryId: string | null; amount: string }[]>();
  for (const pt of new Set(budgets.map((b) => b.periodType))) {
    periodTxns.set(pt, await loadExpenseTxnsInPeriod(userId, computePeriodRange(pt, refDate)));
  }

  return Promise.all(
    budgets.map(async (b) => {
      const period = computePeriodRange(b.periodType, refDate);
      const spent = await computeSpent(userId, b, period, {
        map: ctx.map,
        txns: periodTxns.get(b.periodType),
      });
      const categoryName = b.categoryId ? ctx.byId.get(b.categoryId)?.name ?? null : null;
      return toBudgetWithStatus(b, alertFor(b, period, spent, categoryName));
    }),
  );
}

/** 当前周期预警汇总（可按 status 过滤，仅 active 预算）。 */
export async function listBudgetAlerts(
  userId: string,
  opts: { refDate?: Date; status?: BudgetStatus } = {},
): Promise<BudgetAlert[]> {
  const refDate = opts.refDate ?? new Date();
  const budgets = await budgetRepository(userId).listByUser({ active: true });
  if (budgets.length === 0) return [];
  const ctx = await loadCategoryContext(userId);
  const periodTxns = new Map<BudgetPeriodType, { categoryId: string | null; amount: string }[]>();
  for (const pt of new Set(budgets.map((b) => b.periodType))) {
    periodTxns.set(pt, await loadExpenseTxnsInPeriod(userId, computePeriodRange(pt, refDate)));
  }
  const alerts = await Promise.all(
    budgets.map(async (b) => {
      const period = computePeriodRange(b.periodType, refDate);
      const spent = await computeSpent(userId, b, period, {
        map: ctx.map,
        txns: periodTxns.get(b.periodType),
      });
      const categoryName = b.categoryId ? ctx.byId.get(b.categoryId)?.name ?? null : null;
      return alertFor(b, period, spent, categoryName);
    }),
  );
  return opts.status ? alerts.filter((a) => a.status === opts.status) : alerts;
}

/**
 * 写后回带：某笔交易 categoryId（及其祖先链）命中的预算当前 BudgetAlert[]（D9）。
 * - 命中集 = 总支出预算(categoryId=NULL) + 子树包含该 categoryId 的预算。
 * - 仅 type='expense' 交易才可能有命中；非 expense / 无 categoryId → 仅可能命中总支出预算。
 * - best-effort：调用方须 try/catch，失败不得回滚交易。
 */
export async function alertsForTransaction(
  userId: string,
  txnCategoryId: string | null,
  txnType: string,
  refDate: Date,
): Promise<BudgetAlert[]> {
  const budgets = await budgetRepository(userId).listByUser({ active: true });
  if (budgets.length === 0) return [];
  const isExpense = txnType === 'expense';
  const ctx = await loadCategoryContext(userId);

  // 命中判定：预算 categoryId=NULL（总支出，仅对 expense 计）或 txn.categoryId ∈ 子树(budget.categoryId)
  const hit = budgets.filter((b) => {
    if (b.categoryId === null) return isExpense; // 总支出预算：仅 expense 计入
    if (!isExpense || !txnCategoryId) return false;
    const subtree = ctx.map.get(b.categoryId);
    return subtree ? subtree.has(txnCategoryId) : b.categoryId === txnCategoryId;
  });
  if (hit.length === 0) return [];

  const periodTxns = new Map<BudgetPeriodType, { categoryId: string | null; amount: string }[]>();
  for (const pt of new Set(hit.map((b) => b.periodType))) {
    periodTxns.set(pt, await loadExpenseTxnsInPeriod(userId, computePeriodRange(pt, refDate)));
  }
  return Promise.all(
    hit.map(async (b) => {
      const period = computePeriodRange(b.periodType, refDate);
      const spent = await computeSpent(userId, b, period, {
        map: ctx.map,
        txns: periodTxns.get(b.periodType),
      });
      const categoryName = b.categoryId ? ctx.byId.get(b.categoryId)?.name ?? null : null;
      return alertFor(b, period, spent, categoryName);
    }),
  );
}

/** 单预算详情（含当前周期状态）。不存在或不属于用户 → null（路由 404）。 */
export async function getBudget(
  userId: string,
  id: string,
  refDate?: Date,
): Promise<BudgetWithStatus | null> {
  const budget = await budgetRepository(userId).findById(id);
  if (!budget) return null;
  const alert = await getBudgetAlert(userId, budget, refDate ?? new Date());
  return toBudgetWithStatus(budget, alert);
}

/** 创建预算（建前查重，重复→INVARIANT；总支出预算应用层防重复）。 */
export async function createBudget(
  userId: string,
  input: {
    categoryId: string | null;
    name?: string | null;
    amount: string;
    periodType?: BudgetPeriodType;
    alertThreshold?: string;
  },
): Promise<BudgetWithStatus> {
  if (toCents(input.amount) <= 0)
    throw new LedgerInvariantError('预算额度必须为正');
  const periodType = input.periodType ?? 'month';
  const repo = budgetRepository(userId);
  const existing = await repo.findByUserCategoryPeriod(input.categoryId, periodType);
  if (existing) throw new LedgerInvariantError('该分类与周期类型的预算已存在');
  const budget = await repo.create({ ...input, periodType });
  const alert = await getBudgetAlert(userId, budget, new Date());
  return toBudgetWithStatus(budget, alert);
}

/** 更新预算（categoryId 不可改 C6；amount 仅影响当前+未来）。 */
export async function updateBudget(
  userId: string,
  id: string,
  patch: {
    name?: string | null;
    amount?: string;
    periodType?: BudgetPeriodType;
    alertThreshold?: string;
    active?: boolean;
  },
): Promise<BudgetWithStatus | null> {
  if (patch.amount !== undefined && toCents(patch.amount) <= 0)
    throw new LedgerInvariantError('预算额度必须为正');
  const repo = budgetRepository(userId);
  const budget = await repo.findById(id);
  if (!budget) return null;
  const updated = await repo.update(id, patch);
  if (!updated) return null;
  const alert = await getBudgetAlert(userId, updated, new Date());
  return toBudgetWithStatus(updated, alert);
}

/** 软停用（active=false，保留历史）。 */
export async function deactivateBudget(
  userId: string,
  id: string,
): Promise<BudgetWithStatus | null> {
  return updateBudget(userId, id, { active: false });
}

/** 硬删预算（budget_periods FK cascade）。不存在 → false。 */
export async function deleteBudget(userId: string, id: string): Promise<boolean> {
  const repo = budgetRepository(userId);
  const budget = await repo.findById(id);
  if (!budget) return false;
  await repo.delete(id);
  return true;
}

/** 关闭周期快照（不可变 I3；调用方负责只关闭已结束周期）。 */
export async function closePeriod(
  userId: string,
  budgetId: string,
  period: { start: string; end: string },
): Promise<void> {
  const repo = budgetRepository(userId);
  const budget = await repo.findById(budgetId);
  if (!budget) return;
  const ctx = await loadCategoryContext(userId);
  const spent = await computeSpent(userId, budget, period, {
    map: ctx.map,
    txns: await loadExpenseTxnsInPeriod(userId, period),
  });
  const categoryName = budget.categoryId ? ctx.byId.get(budget.categoryId)?.name ?? null : null;
  const alert = alertFor(budget, period, spent, categoryName);
  await repo.upsertSnapshot({
    budgetId,
    periodStart: period.start,
    periodEnd: period.end,
    amountSnapshot: budget.amount,
    spentSnapshot: fromCents(spent),
    status: alert.status,
  });
}

/** 历史周期快照列表（不可变，I3）。 */
export async function listPeriodHistory(
  userId: string,
  budgetId: string,
  from?: string,
  to?: string,
) {
  return budgetRepository(userId).findRange(budgetId, from, to);
}
