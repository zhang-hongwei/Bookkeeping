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
