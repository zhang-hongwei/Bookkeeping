/**
 * Phase 2 资产/负债 DTO 序列化（服务层组合结果 → API 响应）。
 *
 * 资产/负债当前价值/剩余本金 = 账户 balance（真相源），明细字段扁平化进 DTO。
 */
import type { AssetWithDetail } from '@/services/finance/asset.service';
import type { LiabilityWithDetail } from '@/services/finance/liability.service';

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
