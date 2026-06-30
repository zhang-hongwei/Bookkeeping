/**
 * 预算数据仓库（Phase 5）。按 userId 隔离。
 *
 * - 预算 CRUD + 建前查重（防同分类同周期重复，含总支出预算 categoryId=NULL）。
 * - 历史周期快照读写（finance_budget_periods，写入后不可变 I3）。
 */
import { and, eq, isNull, desc, gte, lte } from 'drizzle-orm';
import {
  budgets,
  budgetPeriods,
  type BudgetItem,
  type BudgetPeriodItem,
  type BudgetPeriodType,
  type BudgetStatus,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface CreateBudgetInput {
  categoryId: string | null;
  name?: string | null;
  amount: string;
  periodType?: BudgetPeriodType;
  alertThreshold?: string;
}

export interface UpdateBudgetPatch {
  name?: string | null;
  amount?: string;
  periodType?: BudgetPeriodType;
  alertThreshold?: string;
  active?: boolean;
}

export class BudgetRepository extends FinanceRepository {
  async create(input: CreateBudgetInput): Promise<BudgetItem> {
    const [row] = await this.db
      .insert(budgets)
      .values({
        userId: this.requireUserId(),
        categoryId: input.categoryId,
        name: input.name ?? null,
        amount: input.amount,
        periodType: input.periodType ?? 'month',
        alertThreshold: input.alertThreshold ?? '0.80',
      })
      .returning();
    if (!row) throw new Error('创建预算失败');
    return row;
  }

  async findById(id: string): Promise<BudgetItem | null> {
    const [row] = await this.db
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, this.requireUserId())))
      .limit(1);
    return row ?? null;
  }

  /** 列表，可按 active 过滤。 */
  async listByUser(opts: { active?: boolean } = {}): Promise<BudgetItem[]> {
    const conds = [eq(budgets.userId, this.requireUserId())];
    if (opts.active !== undefined) conds.push(eq(budgets.active, opts.active));
    return this.db.select().from(budgets).where(and(...conds));
  }

  async update(id: string, patch: UpdateBudgetPatch): Promise<BudgetItem | null> {
    const [row] = await this.db
      .update(budgets)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(budgets.id, id), eq(budgets.userId, this.requireUserId())))
      .returning();
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, this.requireUserId())));
  }

  /**
   * 建前查重：同用户同分类同周期类型是否已存在预算（INVARIANT / 应用层防重复）。
   * - categoryId=NULL（总支出预算）：Postgres 唯一索引视 NULL 互异，故此处显式 isNull 匹配。
   */
  async findByUserCategoryPeriod(
    categoryId: string | null,
    periodType: BudgetPeriodType,
  ): Promise<BudgetItem | null> {
    const conds = [
      eq(budgets.userId, this.requireUserId()),
      eq(budgets.periodType, periodType),
      categoryId === null ? isNull(budgets.categoryId) : eq(budgets.categoryId, categoryId),
    ];
    const [row] = await this.db
      .select()
      .from(budgets)
      .where(and(...conds))
      .limit(1);
    return row ?? null;
  }

  // ===== 历史周期快照（不可变，I3）=====

  /** upsert 一条周期快照（周期关闭/手动/AI 引用时调用）。写入后不可变。 */
  async upsertSnapshot(input: {
    budgetId: string;
    periodStart: string;
    periodEnd: string;
    amountSnapshot: string;
    spentSnapshot: string;
    status: BudgetStatus;
  }): Promise<BudgetPeriodItem> {
    const userId = this.requireUserId();
    const [row] = await this.db
      .insert(budgetPeriods)
      .values({
        budgetId: input.budgetId,
        userId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        amountSnapshot: input.amountSnapshot,
        spentSnapshot: input.spentSnapshot,
        status: input.status,
      })
      .onConflictDoUpdate({
        target: [budgetPeriods.budgetId, budgetPeriods.periodStart],
        set: {
          periodEnd: input.periodEnd,
          amountSnapshot: input.amountSnapshot,
          spentSnapshot: input.spentSnapshot,
          status: input.status,
          closedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    if (!row) throw new Error('写入预算周期快照失败');
    return row;
  }

  /** 某预算的历史周期快照（按 periodStart 升序）。 */
  async findRange(
    budgetId: string,
    from?: string,
    to?: string,
  ): Promise<BudgetPeriodItem[]> {
    const conds = [
      eq(budgetPeriods.budgetId, budgetId),
      eq(budgetPeriods.userId, this.requireUserId()),
    ];
    if (from) conds.push(gte(budgetPeriods.periodStart, from));
    if (to) conds.push(lte(budgetPeriods.periodStart, to));
    return this.db
      .select()
      .from(budgetPeriods)
      .where(and(...conds))
      .orderBy(desc(budgetPeriods.periodStart));
  }

  /** 某预算最近一条快照（用于回填/判断是否已关闭过当前期）。 */
  async findLatest(budgetId: string): Promise<BudgetPeriodItem | null> {
    const [row] = await this.db
      .select()
      .from(budgetPeriods)
      .where(
        and(
          eq(budgetPeriods.budgetId, budgetId),
          eq(budgetPeriods.userId, this.requireUserId()),
        ),
      )
      .orderBy(desc(budgetPeriods.periodStart))
      .limit(1);
    return row ?? null;
  }
}

export function budgetRepository(userId: string): BudgetRepository {
  return new BudgetRepository(userId);
}
