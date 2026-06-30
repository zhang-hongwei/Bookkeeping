/**
 * What-if 情景数据仓库（Phase 7，US1）。按 userId 隔离。
 *
 * - scenario CRUD（userId 作用域）。
 * - projections 事务内整组覆盖（按 scenarioId 删后重灌，保证 monthOffset 连续无空洞 I4）。
 */
import { and, eq, asc } from 'drizzle-orm';
import {
  scenarios,
  scenarioProjections,
  type ScenarioItem,
  type ScenarioProjectionItem,
  type ScenarioKind,
  type ScenarioAssumptions,
  type BaselineSnapshot,
  type GoalImpact,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface CreateScenarioRecord {
  name: string;
  kind: ScenarioKind;
  assumptions: ScenarioAssumptions;
  baselineSnapshot: BaselineSnapshot;
  horizonMonths: number;
  engineVersion: string;
  status: 'ok' | 'degraded';
  missing: string[];
  disclaimers: string[];
}

export interface ProjectionRow {
  monthOffset: number;
  baselineNetWorth: string | null;
  scenarioNetWorth: string | null;
  netWorthDelta: string | null;
  baselineEmergencyMonths: string | null;
  scenarioEmergencyMonths: string | null;
  goalImpact?: GoalImpact | null;
}

export class ScenarioRepository extends FinanceRepository {
  /** 创建情景（不含投影点，投影点由 upsertProjections 单独事务写入）。 */
  async createScenario(input: CreateScenarioRecord): Promise<ScenarioItem> {
    const userId = this.requireUserId();
    const [row] = await this.db
      .insert(scenarios)
      .values({
        userId,
        name: input.name,
        kind: input.kind,
        assumptions: input.assumptions,
        baselineSnapshot: input.baselineSnapshot,
        horizonMonths: input.horizonMonths,
        engineVersion: input.engineVersion,
        status: input.status,
        missing: input.missing,
        disclaimers: input.disclaimers,
      })
      .returning();
    if (!row) throw new Error('创建情景失败');
    return row;
  }

  /**
   * 事务内整组覆盖投影点：按 scenarioId 删除旧点后重灌（保证连续无空洞 I4）。
   * 同一情景重算 → 同 (scenarioId, monthOffset) 覆盖（NC7 可复现）。
   */
  async upsertProjections(
    scenarioId: string,
    rows: ProjectionRow[],
  ): Promise<ScenarioProjectionItem[]> {
    const userId = this.requireUserId();
    return this.db.transaction(async (tx) => {
      await tx
        .delete(scenarioProjections)
        .where(eq(scenarioProjections.scenarioId, scenarioId));
      if (rows.length === 0) return [];
      const inserted = await tx
        .insert(scenarioProjections)
        .values(
          rows.map((r) => ({
            scenarioId,
            userId,
            monthOffset: r.monthOffset,
            baselineNetWorth: r.baselineNetWorth,
            scenarioNetWorth: r.scenarioNetWorth,
            netWorthDelta: r.netWorthDelta,
            baselineEmergencyMonths: r.baselineEmergencyMonths,
            scenarioEmergencyMonths: r.scenarioEmergencyMonths,
            goalImpact: r.goalImpact ?? null,
          })),
        )
        .returning();
      return inserted;
    });
  }

  /** 我的情景列表（不含投影点明细）。 */
  async listByUser(): Promise<ScenarioItem[]> {
    return this.db
      .select()
      .from(scenarios)
      .where(eq(scenarios.userId, this.requireUserId()))
      .orderBy(asc(scenarios.createdAt));
  }

  /** 情景详情（含全部投影点，按 monthOffset 升序）。 */
  async findWithProjections(
    id: string,
  ): Promise<{ scenario: ScenarioItem | null; projections: ScenarioProjectionItem[] }> {
    const userId = this.requireUserId();
    const [scenario] = await this.db
      .select()
      .from(scenarios)
      .where(and(eq(scenarios.id, id), eq(scenarios.userId, userId)))
      .limit(1);
    if (!scenario) return { scenario: null, projections: [] };
    const projections = await this.db
      .select()
      .from(scenarioProjections)
      .where(eq(scenarioProjections.scenarioId, id))
      .orderBy(asc(scenarioProjections.monthOffset));
    return { scenario, projections };
  }
}

export function scenarioRepository(userId: string): ScenarioRepository {
  return new ScenarioRepository(userId);
}
