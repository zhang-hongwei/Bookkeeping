/**
 * 智能预警 + 偏好仓库（Phase 6，FR-002 / FR-008）。按 userId 隔离。
 * - 预警：(userId,kind,period) 幂等覆盖（防疲劳，I6）；冲突时刷新结论但保留用户已读/静默状态。
 * - 偏好：(userId,kind) 幂等 upsert。
 */
import { and, eq, desc } from 'drizzle-orm';
import {
  smartAlerts,
  alertPreferences,
  type SmartAlertItem,
  type AlertPreferenceItem,
  type AlertKind,
  type AlertStatus,
  type AlertSeverity,
  type AlertFindingRef,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface UpsertAlertInput {
  kind: AlertKind;
  severity: AlertSeverity;
  ruleFindingRefs: AlertFindingRef[];
  period: string;
  message: string;
}

export interface UpsertPreferenceInput {
  kind: AlertKind;
  muted: boolean;
  mutedUntil: Date | null;
  channel: string | null;
}

export class AlertRepository extends FinanceRepository {
  /**
   * 幂等写入预警（同 user+kind+period 覆盖，I6）。
   * 冲突时刷新结论（severity/refs/message），但保留用户的 status/dismissedAt（不重复打扰）。
   */
  async upsert(input: UpsertAlertInput): Promise<SmartAlertItem> {
    const [row] = await this.db
      .insert(smartAlerts)
      .values({
        userId: this.requireUserId(),
        kind: input.kind,
        severity: input.severity,
        ruleFindingRefs: input.ruleFindingRefs,
        period: input.period,
        status: 'active',
        message: input.message,
      })
      .onConflictDoUpdate({
        target: [smartAlerts.userId, smartAlerts.kind, smartAlerts.period],
        set: {
          severity: input.severity,
          ruleFindingRefs: input.ruleFindingRefs,
          message: input.message,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row!;
  }

  /** 列表（按状态过滤；status=all 不过滤）。 */
  async list(status?: AlertStatus | 'all'): Promise<SmartAlertItem[]> {
    const conditions = [eq(smartAlerts.userId, this.requireUserId())];
    if (status && status !== 'all') {
      conditions.push(eq(smartAlerts.status, status));
    }
    return this.db
      .select()
      .from(smartAlerts)
      .where(and(...conditions))
      .orderBy(desc(smartAlerts.period), desc(smartAlerts.createdAt));
  }

  async findById(id: string): Promise<SmartAlertItem | null> {
    const [row] = await this.db
      .select()
      .from(smartAlerts)
      .where(
        and(eq(smartAlerts.id, id), eq(smartAlerts.userId, this.requireUserId())),
      )
      .limit(1);
    return row ?? null;
  }

  /** 更新单条预警状态（已读/静默）。 */
  async patchStatus(
    id: string,
    status: AlertStatus,
  ): Promise<SmartAlertItem | null> {
    const [row] = await this.db
      .update(smartAlerts)
      .set({ status, dismissedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(smartAlerts.id, id), eq(smartAlerts.userId, this.requireUserId())),
      )
      .returning();
    return row ?? null;
  }

  // ===== 偏好（FR-008）=====

  /** 幂等 upsert 某 kind 偏好。 */
  async upsertPreference(input: UpsertPreferenceInput): Promise<AlertPreferenceItem> {
    const [row] = await this.db
      .insert(alertPreferences)
      .values({
        userId: this.requireUserId(),
        kind: input.kind,
        muted: input.muted,
        mutedUntil: input.mutedUntil,
        channel: input.channel,
      })
      .onConflictDoUpdate({
        target: [alertPreferences.userId, alertPreferences.kind],
        set: {
          muted: input.muted,
          mutedUntil: input.mutedUntil,
          channel: input.channel,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row!;
  }

  /** 全部偏好。 */
  async listPreferences(): Promise<AlertPreferenceItem[]> {
    return this.db
      .select()
      .from(alertPreferences)
      .where(eq(alertPreferences.userId, this.requireUserId()));
  }
}

export function alertRepository(userId: string): AlertRepository {
  return new AlertRepository(userId);
}
