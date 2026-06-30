/**
 * 智能预警服务（Phase 6，FR-002 / FR-008）。
 *
 * 规则触发的预警：依据来自规则引擎结论（零幻觉，I1）；幂等物化 `(userId,kind,period)`（I6）；
 * 偏好静默过滤（FR-008）。message 为规则结论模板文案（非 LLM 文本）。
 *
 * 生成逻辑复用 computeFindings（事实层）+ 预测应急金不足点 + 集中度（Phase 3）模式。
 */
import type {
  AlertKind,
  AlertSeverity,
  AlertFindingRef,
  AlertPreferenceItem,
  SmartAlertItem,
} from '@/database/schema/finance';
import {
  computeFindings,
  shiftMonthKey,
  monthPeriod,
  type FindingData,
  type PeriodRange,
} from './rules-engine.service';
import type { RiskLevel } from '@/database/schema/finance';
import { alertRepository } from '@/repositories/finance/alert.repository';

/** 待物化的候选预警（纯函数产出，I1 锚点齐全）。 */
export interface AlertCandidate {
  kind: AlertKind;
  severity: AlertSeverity;
  ruleFindingRefs: AlertFindingRef[];
  /** 触发期 YYYY-MM。 */
  period: string;
  message: string;
}

/** riskLevel → severity（none 不产预警）。 */
function toSeverity(risk: RiskLevel): AlertSeverity | null {
  if (risk === 'high') return 'high';
  if (risk === 'medium') return 'medium';
  if (risk === 'low') return 'low';
  return null;
}

function toRef(f: FindingData, period: string): AlertFindingRef {
  return {
    metric: f.metric,
    period,
    value: f.value,
    verdict: f.verdict,
    riskLevel: f.riskLevel,
  };
}

/**
 * 纯函数：由本期 findings + 预测应急金不足点 + 上期储蓄率，生成候选预警（零幻觉，I1）。
 * - emergency_shortfall：应急金 risk=high 或预测应急金不足月非空。
 * - debt_ratio_high：负债率 risk=high。
 * - savings_rate_decline：储蓄率 medium/high 且低于上期。
 */
export function generateAlertCandidates(input: {
  findings: FindingData[];
  period: string;
  forecastShortfallMonth: string | null;
  prevSavingsRate: number | null;
}): AlertCandidate[] {
  const { period } = input;
  const byMetric = new Map(input.findings.map((f) => [f.metric, f]));
  const out: AlertCandidate[] = [];

  // emergency_shortfall
  const em = byMetric.get('emergency_months');
  const emRisky = em?.riskLevel === 'high';
  if (emRisky || input.forecastShortfallMonth) {
    const refs: AlertFindingRef[] = [];
    if (em) refs.push(toRef(em, period));
    if (input.forecastShortfallMonth) {
      refs.push({
        metric: 'emergency_months',
        period: input.forecastShortfallMonth,
        value: em?.value ?? null,
        verdict: `预测应急金不足：${input.forecastShortfallMonth}`,
        riskLevel: 'high',
      });
    }
    out.push({
      kind: 'emergency_shortfall',
      severity: 'high',
      ruleFindingRefs: refs,
      period,
      message: input.forecastShortfallMonth
        ? `预测 ${input.forecastShortfallMonth} 应急金将不足，建议提前预留储备。`
        : `当前应急金不足（${em?.verdict ?? ''}），建议储备 3–6 个月支出。`,
    });
  }

  // debt_ratio_high
  const debt = byMetric.get('debt_ratio');
  if (debt && debt.riskLevel === 'high') {
    out.push({
      kind: 'debt_ratio_high',
      severity: 'high',
      ruleFindingRefs: [toRef(debt, period)],
      period,
      message: `负债率过高（${debt.value ?? 'N/A'}），建议优先偿还高息负债。`,
    });
  }

  // savings_rate_decline（需上期对比）
  const sr = byMetric.get('savings_rate');
  if (sr && sr.value != null && input.prevSavingsRate != null) {
    const cur = Number(sr.value);
    const declining = cur < input.prevSavingsRate;
    const sev = toSeverity(sr.riskLevel);
    if (declining && sev && (sr.riskLevel === 'medium' || sr.riskLevel === 'high')) {
      out.push({
        kind: 'savings_rate_decline',
        severity: sev,
        ruleFindingRefs: [toRef(sr, period)],
        period,
        message: `储蓄率较上期下降（${(cur * 100).toFixed(1)}% ← ${(
          input.prevSavingsRate * 100
        ).toFixed(1)}%），注意控制支出。`,
      });
    }
  }

  return out;
}

/**
 * 物化本期预警：取 findings + 上期储蓄率 → 候选 → 幂等 upsert（I6）。
 * - 调用方传入预测应急金不足点（来自 forecast.service）以串联 US1。
 */
export async function materializeAlerts(
  userId: string,
  opts: {
    period: PeriodRange;
    periodKey: string;
    forecastShortfallMonth?: string | null;
  },
): Promise<AlertCandidate[]> {
  const findings = await computeFindings(userId, opts.period);
  // 上期储蓄率（用于下降判定）
  const prevKey = shiftMonthKey(opts.periodKey, -1);
  const prevFindings = await computeFindings(userId, monthPeriod(prevKey));
  const prevSavings = prevFindings.find((f) => f.metric === 'savings_rate');
  const prevSavingsRate =
    prevSavings?.value != null ? Number(prevSavings.value) : null;

  const candidates = generateAlertCandidates({
    findings,
    period: opts.periodKey,
    forecastShortfallMonth: opts.forecastShortfallMonth ?? null,
    prevSavingsRate,
  });

  const repo = alertRepository(userId);
  await Promise.all(candidates.map((c) => repo.upsert(c)));
  return candidates;
}

/** 偏好是否当前生效静音（muted 且未过期）。 */
function isMutedActive(pref: AlertPreferenceItem, now: Date): boolean {
  if (!pref.muted) return false;
  if (pref.mutedUntil == null) return true; // 永久静默
  return pref.mutedUntil.getTime() > now.getTime();
}

/** 预警列表（FR-008：active 列表过滤已静默 kind；其它状态不过滤）。 */
export async function listAlerts(
  userId: string,
  status: 'active' | 'acknowledged' | 'silenced' | 'all',
): Promise<SmartAlertItem[]> {
  const repo = alertRepository(userId);
  const [alerts, prefs] = await Promise.all([
    repo.list(status),
    repo.listPreferences(),
  ]);
  if (status === 'active') {
    const now = new Date();
    const mutedKinds = new Set(
      prefs.filter((p) => isMutedActive(p, now)).map((p) => p.kind),
    );
    return alerts.filter((a) => !mutedKinds.has(a.kind));
  }
  return alerts;
}

/** 单条预警状态更新（已读/静默）。 */
export async function patchAlertStatus(
  userId: string,
  id: string,
  status: 'acknowledged' | 'silenced',
): Promise<SmartAlertItem | null> {
  return alertRepository(userId).patchStatus(id, status);
}

// ===== 偏好（FR-008）=====

export interface AlertPreferenceView {
  kind: AlertKind;
  muted: boolean;
  mutedUntil: string | null;
  channel: string | null;
}

function toPrefView(p: AlertPreferenceItem): AlertPreferenceView {
  return {
    kind: p.kind,
    muted: p.muted,
    mutedUntil: p.mutedUntil ? p.mutedUntil.toISOString() : null,
    channel: p.channel,
  };
}

export async function listPreferences(userId: string): Promise<AlertPreferenceView[]> {
  const prefs = await alertRepository(userId).listPreferences();
  return prefs.map(toPrefView);
}

export async function upsertPreference(
  userId: string,
  input: {
    kind: AlertKind;
    muted?: boolean;
    mutedUntil?: string | null;
    channel?: string | null;
  },
): Promise<AlertPreferenceView> {
  // 读现有偏好以支持部分更新（PATCH）
  const existing = (await alertRepository(userId).listPreferences()).find(
    (p) => p.kind === input.kind,
  );
  const muted = input.muted ?? existing?.muted ?? false;
  const mutedUntil =
    input.mutedUntil !== undefined
      ? input.mutedUntil
        ? new Date(input.mutedUntil)
        : null
      : existing?.mutedUntil ?? null;
  const channel =
    input.channel !== undefined ? input.channel : existing?.channel ?? null;
  const row = await alertRepository(userId).upsertPreference({
    kind: input.kind,
    muted,
    mutedUntil,
    channel,
  });
  return toPrefView(row);
}
