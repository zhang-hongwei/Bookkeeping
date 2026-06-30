/**
 * Phase 2/3 资产/负债/投资 DTO 序列化（服务层组合结果 → API 响应）。
 *
 * 资产/负债当前价值/剩余本金 = 账户 balance（真相源）；投资持仓市值 = balance，
 * 派生指标（成本/盈亏/盈亏率）由服务层经 pnl.ts 计算后扁平化进 DTO。
 */
import type { AssetWithDetail } from '@/services/finance/asset.service';
import type { LiabilityWithDetail } from '@/services/finance/liability.service';
import type {
  PositionWithMetrics,
  PerformanceResult,
  AllocationResult,
} from '@/services/finance/investment.service';
import type { InstrumentItem } from '@/database/schema/finance';
import type {
  FamilyItem,
  FamilyMemberItem,
  FindingMetric,
  RiskLevel,
  SmartAlertItem,
  AlertPreferenceItem,
  ForecastHistoryPoint,
  AdvisorSessionItem,
  AdvisorMessageItem,
  ApprovalItem,
} from '@/database/schema/finance';

export interface AssetApiDTO {
  id: string;
  name: string;
  type: string;
  balance: string;
  currentValue: string;
  includeInNetWorth: boolean;
  isArchived: boolean;
  costBasis: string;
  valuationSource: string;
  estimateConfidence: string;
  valuationDate: string | null;
  valuationHistory: { date: string; value: string; confidence: string; source: string }[];
  isDisposed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LiabilityApiDTO {
  id: string;
  name: string;
  type: string;
  balance: string;
  remainingPrincipal: string;
  includeInNetWorth: boolean;
  isArchived: boolean;
  kind: string;
  principal: string;
  interestRate: string | null;
  monthlyPayment: string | null;
  dueDate: string | null;
  paidAmount: string;
  statementDay: number | null;
  repaymentDay: number | null;
  createdAt: string;
  updatedAt: string;
}

export function toAssetDto(a: AssetWithDetail): AssetApiDTO {
  return {
    id: a.account.id,
    name: a.account.name,
    type: a.account.type,
    balance: a.account.balance,
    currentValue: a.currentValue,
    includeInNetWorth: a.account.includeInNetWorth,
    isArchived: a.account.isArchived,
    costBasis: a.costBasis,
    valuationSource: a.valuationSource,
    estimateConfidence: a.estimateConfidence,
    valuationDate: a.valuationDate,
    valuationHistory: a.valuationHistory,
    isDisposed: a.isDisposed,
    createdAt: a.account.createdAt.toISOString(),
    updatedAt: a.account.updatedAt.toISOString(),
  };
}

export function toLiabilityDto(l: LiabilityWithDetail): LiabilityApiDTO {
  return {
    id: l.account.id,
    name: l.account.name,
    type: l.account.type,
    balance: l.account.balance,
    remainingPrincipal: l.remainingPrincipal,
    includeInNetWorth: l.account.includeInNetWorth,
    isArchived: l.account.isArchived,
    kind: l.kind,
    principal: l.principal,
    interestRate: l.interestRate,
    monthlyPayment: l.monthlyPayment,
    dueDate: l.dueDate,
    paidAmount: l.paidAmount,
    statementDay: l.statementDay,
    repaymentDay: l.repaymentDay,
    createdAt: l.account.createdAt.toISOString(),
    updatedAt: l.account.updatedAt.toISOString(),
  };
}

// ===== Phase 3：投资持仓 / 品种 / 配置 / 表现 =====

export interface PositionDTO {
  id: string;
  name: string;
  type: 'investment';
  balance: string;
  includeInNetWorth: boolean;
  isArchived: boolean;
  position: {
    positionId: string;
    instrumentCode: string;
    instrumentType: string;
    quantity: string;
    costPrice: string;
    currentPrice: string;
    priceSource: string;
    lastPriceAt: string | null;
    currency: string;
    estimateConfidence: string;
    isClosed: boolean;
    cost: string;
    marketValue: string;
    pnl: string;
    pnlRate: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export function toPositionDto(pm: PositionWithMetrics): PositionDTO {
  const { account, position } = pm;
  return {
    id: account.id,
    name: account.name,
    type: 'investment',
    balance: account.balance,
    includeInNetWorth: account.includeInNetWorth,
    isArchived: account.isArchived,
    position: {
      positionId: position.id,
      instrumentCode: position.instrumentCode,
      instrumentType: position.instrumentType,
      quantity: position.quantity,
      costPrice: position.costPrice,
      currentPrice: position.currentPrice,
      priceSource: position.priceSource,
      lastPriceAt: position.lastPriceAt ? position.lastPriceAt.toISOString() : null,
      currency: position.currency,
      estimateConfidence: position.estimateConfidence,
      isClosed: position.isClosed,
      cost: pm.cost,
      marketValue: pm.marketValue,
      pnl: pm.pnl,
      pnlRate: pm.pnlRate,
    },
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

export interface InstrumentDTO {
  id: string;
  code: string;
  type: string;
  name: string | null;
  latestPrice: string | null;
  priceSource: string;
  priceUpdatedAt: string | null;
  isStale: boolean;
  currency: string;
}

export function toInstrumentDto(i: InstrumentItem): InstrumentDTO {
  return {
    id: i.id,
    code: i.code,
    type: i.type,
    name: i.name,
    latestPrice: i.latestPrice,
    priceSource: i.priceSource,
    priceUpdatedAt: i.priceUpdatedAt ? i.priceUpdatedAt.toISOString() : null,
    isStale: i.isStale,
    currency: i.currency,
  };
}

export interface PerformanceDTO {
  marketValue: string;
  cost: string;
  pnl: string;
  pnlRate: string | null;
  totalInvested: string;
  irr: {
    annualizedRate: string | null;
    converged: boolean;
    reason?: string;
    asOf: string;
  };
}

export function toPerformanceDto(p: PerformanceResult): PerformanceDTO {
  return { ...p };
}

export interface AllocationDTO {
  items: AllocationResult['items'];
  total: string;
  alerts: { code: string; severity: string; message: string; threshold: string }[];
}

export function toAllocationDto(alloc: AllocationResult): AllocationDTO {
  return { items: alloc.items, total: alloc.total, alerts: alloc.alerts };
}

// ===== Phase 4：家庭财务 DTO =====

export interface FamilyDTO {
  id: string;
  name: string;
  createdByUserId: string;
  defaultCurrency: string;
  createdAt: string;
  /** active 成员数（含 self，不含 joint）。 */
  memberCount: number;
}

export interface FamilyMemberDTO {
  id: string;
  familyId: string;
  userId: string | null;
  displayName: string;
  role: string;
  shareMode: string;
  status: string;
  defaultView: string;
  joinedAt: string;
  leftAt: string | null;
}

export interface FamilyNetWorthDTO {
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  breakdown: Record<string, string>;
  /** `{ [memberId]: netWorth }`，按成员拆分。 */
  memberBreakdown: Record<string, string>;
}

export interface FamilyCurvePointDTO {
  date: string;
  netWorth: string;
  memberBreakdown: Record<string, string>;
}

export interface MemberProfileDTO {
  memberId: string;
  displayName: string;
  role: string;
  income: string;
  expense: string;
  surplus: string;
  topCategories: { categoryId: string | null; name: string; amount: string }[];
}

export function toFamilyDto(family: FamilyItem, memberCount: number): FamilyDTO {
  return {
    id: family.id,
    name: family.name,
    createdByUserId: family.createdByUserId,
    defaultCurrency: family.defaultCurrency,
    createdAt: family.createdAt.toISOString(),
    memberCount,
  };
}

export function toFamilyMemberDto(m: FamilyMemberItem): FamilyMemberDTO {
  return {
    id: m.id,
    familyId: m.familyId,
    userId: m.userId,
    displayName: m.displayName,
    role: m.role,
    shareMode: m.shareMode,
    status: m.status,
    defaultView: m.defaultView,
    joinedAt: m.joinedAt.toISOString(),
    leftAt: m.leftAt ? m.leftAt.toISOString() : null,
  };
}

export function toFamilyNetWorthDto(nw: {
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  breakdown?: Record<string, string>;
  memberBreakdown: Record<string, string>;
}): FamilyNetWorthDTO {
  return {
    totalAssets: nw.totalAssets,
    totalLiabilities: nw.totalLiabilities,
    netWorth: nw.netWorth,
    breakdown: nw.breakdown ?? {},
    memberBreakdown: nw.memberBreakdown,
  };
}

// ===== Phase 6：AI 财富顾问（共享可追溯 / 合规免责封装）=====
//
// 所有预测/预警/顾问/趋势/健康分响应均经 DisclaimerEnvelope 包装（FR-007/FR-009/SC-002）：
// - sourceRefs：本响应数值结论的可追溯锚点（metric + period + value + verdict + riskLevel）。
// - disclaimer：恒定的「非投资建议」免责（FR-009）。

/** 可追溯引用：所有数值结论的标准锚点（SC-002 / I1）。 */
export interface SourceRef {
  metric: FindingMetric;
  /** YYYY-MM（或 YYYY-MM-DD）。 */
  period: string;
  /** decimal 字符串（比率 4 位 / 金额 2 位）；纯定性结论可为 null。 */
  value: string | null;
  verdict: string;
  riskLevel: RiskLevel;
}

/** 合规免责常量（FR-009）。所有预测/建议/预警响应必带。 */
export const NON_INVESTMENT_ADVICE_DISCLAIMER =
  '本内容非投资建议，所有结论来自规则引擎与账目数据，投资决策请自行判断。';

/** 合规 + 可追溯封装（contracts/api.md §0.3）。 */
export interface DisclaimerEnvelope<T> {
  data: T;
  disclaimer: typeof NON_INVESTMENT_ADVICE_DISCLAIMER;
  sourceRefs: SourceRef[];
}

/**
 * 把服务层数据包装为 DisclaimerEnvelope（统一追加免责 + 来源锚点）。
 * - sourceRefs 缺省为空数组（定性响应无数值结论时）。
 */
export function withDisclaimer<T>(
  data: T,
  sourceRefs: SourceRef[] = [],
): DisclaimerEnvelope<T> {
  return { data, disclaimer: NON_INVESTMENT_ADVICE_DISCLAIMER, sourceRefs };
}

/** 由规则结论（FindingData）+ 期次构造 SourceRef（I1 锚点）。 */
export function toSourceRef(
  finding: {
    metric: FindingMetric;
    value: string | null;
    verdict: string;
    riskLevel: RiskLevel;
  },
  period: string,
): SourceRef {
  return {
    metric: finding.metric,
    period,
    value: finding.value,
    verdict: finding.verdict,
    riskLevel: finding.riskLevel,
  };
}

// ===== Phase 6 US1：现金流预测 / 智能预警 DTO =====

export interface ForecastPointDTO {
  month: string;
  surplus: string;
  cashBalance: string;
  lower: string;
  upper: string;
}

export interface ForecastDTO {
  targetMonth: string;
  insufficientHistory: boolean;
  points: ForecastPointDTO[];
  emergencyShortfallMonth: string | null;
  modelVersion: string;
  generatedAt: string;
}

/** 预测视图 → DTO（结构一致；显式映射便于契约锁定）。 */
export function toForecastDto(view: {
  targetMonth: string;
  insufficientHistory: boolean;
  points: ForecastPointDTO[];
  emergencyShortfallMonth: string | null;
  modelVersion: string;
  generatedAt: string;
}): ForecastDTO {
  return {
    targetMonth: view.targetMonth,
    insufficientHistory: view.insufficientHistory,
    points: view.points,
    emergencyShortfallMonth: view.emergencyShortfallMonth,
    modelVersion: view.modelVersion,
    generatedAt: view.generatedAt,
  };
}

export interface AlertDTO {
  id: string;
  kind: string;
  severity: string;
  period: string;
  status: string;
  message: string;
  ruleFindingRefs: SourceRef[];
  createdAt: string;
}

export function toAlertDto(a: SmartAlertItem): AlertDTO {
  return {
    id: a.id,
    kind: a.kind,
    severity: a.severity,
    period: a.period,
    status: a.status,
    message: a.message,
    // 存储为宽松 jsonb 快照；值源于 FindingData，断言回 SourceRef（I1）。
    ruleFindingRefs: a.ruleFindingRefs as SourceRef[],
    createdAt: a.createdAt.toISOString(),
  };
}

export interface AlertPreferenceDTO {
  kind: string;
  muted: boolean;
  mutedUntil: string | null;
  channel: string | null;
}

export function toAlertPreferenceDto(p: AlertPreferenceItem): AlertPreferenceDTO {
  return {
    kind: p.kind,
    muted: p.muted,
    mutedUntil: p.mutedUntil ? p.mutedUntil.toISOString() : null,
    channel: p.channel,
  };
}

/** 预测来源锚点：历史结余输入（SC-002 可追溯）。 */
export function forecastSourceRefs(history: ForecastHistoryPoint[]): SourceRef[] {
  return history.map((h) => ({
    metric: 'surplus' as FindingMetric,
    period: h.month,
    value: h.surplus,
    verdict: '历史结余输入',
    riskLevel: (Number(h.surplus) < 0 ? 'high' : 'none') as RiskLevel,
  }));
}

// ===== Phase 6 US2：顾问对话 / 审批闭环 DTO =====

export interface AdvisorSessionDTO {
  id: string;
  title: string | null;
  createdAt: string;
}

export function toAdvisorSessionDto(s: AdvisorSessionItem): AdvisorSessionDTO {
  return {
    id: s.id,
    title: s.title,
    createdAt: s.createdAt.toISOString(),
  };
}

export interface AdvisorMessageDTO {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citedFindings: SourceRef[];
  degraded: boolean;
  proposalId: string | null;
  createdAt: string;
}

export function toAdvisorMessageDto(m: AdvisorMessageItem): AdvisorMessageDTO {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    citedFindings: m.citedFindings as SourceRef[],
    degraded: m.degraded,
    proposalId: m.proposalId,
    createdAt: m.createdAt.toISOString(),
  };
}

export interface ApprovalDTO {
  id: string;
  kind: string;
  payload: unknown;
  status: string;
  ruleValidation: { passed: boolean; reason?: string; refs: SourceRef[] };
  proposedBy: string | null;
  approvedAt: string | null;
  appliedAt: string | null;
  appliedResult: unknown;
  expiresAt: string;
}

export function toApprovalDto(a: ApprovalItem): ApprovalDTO {
  return {
    id: a.id,
    kind: a.kind,
    payload: a.payload,
    status: a.status,
    ruleValidation: {
      passed: a.ruleValidation.passed,
      reason: a.ruleValidation.reason,
      refs: a.ruleValidation.refs as SourceRef[],
    },
    proposedBy: a.proposedBy,
    approvedAt: a.approvedAt ? a.approvedAt.toISOString() : null,
    appliedAt: a.appliedAt ? a.appliedAt.toISOString() : null,
    appliedResult: a.appliedResult,
    expiresAt: a.expiresAt.toISOString(),
  };
}
