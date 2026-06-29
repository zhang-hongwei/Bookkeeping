/**
 * Finance TanStack Query hooks。
 *
 * - 写操作（记账/改/删/建账户）成功后使受影响查询失效，保证余额/明细即时一致。
 * - queryKey 统一在 queryKeys 集中管理，便于精确失效。
 */
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  financeApi,
  type CreateAccountPayload,
  type CreateTransactionPayload,
  type CreateAssetPayload,
  type CreateLiabilityPayload,
  type EstimateConfidence,
  type ValuationSource,
  type NetWorthView,
} from '../api';
import type { AccountType, CategoryKind, TransactionType } from '@/database/schema/finance';

export const financeQueryKeys = {
  all: ['finance'] as const,
  accounts: (params?: { type?: AccountType; includeArchived?: boolean }) =>
    ['finance', 'accounts', params ?? {}] as const,
  categories: (kind?: CategoryKind) => ['finance', 'categories', kind ?? 'all'] as const,
  transactions: (params?: Record<string, unknown>) =>
    ['finance', 'transactions', params ?? {}] as const,
};

/** 账户列表（含余额）。 */
export function useAccounts(params?: { type?: AccountType; includeArchived?: boolean }) {
  return useQuery({
    queryKey: financeQueryKeys.accounts(params),
    queryFn: () => financeApi.listAccounts(params),
  });
}

/** 分类列表，可按 kind 过滤。 */
export function useCategories(kind?: CategoryKind) {
  return useQuery({
    queryKey: financeQueryKeys.categories(kind),
    queryFn: () => financeApi.listCategories(kind),
  });
}

/** 交易列表（分页 + 过滤）。 */
export function useTransactions(params?: {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: financeQueryKeys.transactions(params),
    queryFn: () => financeApi.listTransactions(params),
    placeholderData: keepPreviousData,
  });
}

/** 记账（创建交易）。成功后失效账户余额与交易列表。 */
export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      financeApi.createTransaction(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
    },
  });
}

/** 编辑交易。 */
export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateTransactionPayload> }) =>
      financeApi.updateTransaction(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
    },
  });
}

/** 删除交易。 */
export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteTransaction(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
    },
  });
}

/** 建账。 */
export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => financeApi.createAccount(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
    },
  });
}

/** 更新账户（归档/恢复、额度、计入净资产、改名）。不改余额。 */
export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateAccountPayload> & { isArchived?: boolean };
    }) => financeApi.updateAccount(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
    },
  });
}

/** 删除账户（无关联交易才允许，否则后端返回 409 建议归档）。 */
export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteAccount(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
    },
  });
}

/** 启动账单导入（解析去重 → preview）。 */
export function useStartImport() {
  return useMutation({
    mutationFn: (payload: { source?: string; rawText: string; fileName?: string }) =>
      financeApi.startImport(payload),
  });
}

/** 获取导入批次详情（预览/调整）。 */
export function useImportDetail(id: string | null) {
  return useQuery({
    queryKey: ['finance', 'import', id],
    queryFn: () => financeApi.getImport(id!),
    enabled: Boolean(id),
  });
}

/** 确认导入（落库）。成功后失效账户余额与交易明细。 */
export function useConfirmImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { rowIds?: string[]; defaultAccountId?: string } }) =>
      financeApi.confirmImport(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'import'] });
    },
  });
}

/** 自然语言解析 → 候选交易（不落库）。 */
export function useParseNl() {
  return useMutation({
    mutationFn: (text: string) => financeApi.parseNl(text),
  });
}

/** 净资产仪表盘（总资产/总负债/净资产 + 今日变化）。view=high 仅高流动性资产。 */
export function useNetWorth(view?: NetWorthView) {
  return useQuery({
    queryKey: ['finance', 'net-worth', view ?? 'all'],
    queryFn: () => financeApi.getNetWorth(view),
  });
}

/** 净资产曲线（区间快照）。view=high 仅高流动性资产（过滤估值点）。 */
export function useNetWorthSnapshots(from: string, to: string, view?: NetWorthView, enabled = true) {
  return useQuery({
    queryKey: ['finance', 'net-worth', 'snapshots', from, to, view ?? 'all'],
    queryFn: () => financeApi.getNetWorthSnapshots(from, to, view),
    enabled,
  });
}

// ===== Phase 2：资产 / 负债 / 还款 / 账单 =====

/** 资产列表（带明细 + 当前价值 + 估值置信度）。 */
export function useAssets() {
  return useQuery({
    queryKey: ['finance', 'assets'],
    queryFn: () => financeApi.listAssets(),
  });
}

/** 登记资产。成功后失效资产列表 + 净资产/曲线。 */
export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssetPayload) => financeApi.createAsset(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'assets'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

/** 更新资产元数据（不改估值）。 */
export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateAssetPayload> }) =>
      financeApi.updateAsset(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'assets'] });
    },
  });
}

/** 估值更新（revaluation）。成功后失效资产 + 净资产/曲线。 */
export function useRevalueAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { newValue: string; confidence?: EstimateConfidence; source?: ValuationSource };
    }) => financeApi.revalueAsset(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'assets'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

/** 资产处置（disposal）。成功后失效资产 + 账户 + 净资产/曲线。 */
export function useDisposeAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { cashAccountId: string; proceeds: string; note?: string };
    }) => financeApi.disposeAsset(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'assets'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

/** 负债列表（带明细 + 剩余本金 + 已还）。 */
export function useLiabilities() {
  return useQuery({
    queryKey: ['finance', 'liabilities'],
    queryFn: () => financeApi.listLiabilities(),
  });
}

/** 登记负债。成功后失效负债列表 + 净资产/曲线。 */
export function useCreateLiability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLiabilityPayload) => financeApi.createLiability(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'liabilities'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

/** 更新负债元数据（不改余额/已还）。 */
export function useUpdateLiability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateLiabilityPayload> }) =>
      financeApi.updateLiability(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'liabilities'] });
    },
  });
}

/** 还款（本金/利息拆分）。成功后失效负债 + 账户 + 净资产/曲线 + 账单。 */
export function useRepayLiability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { cashAccountId: string; principal: string; interest?: string; note?: string; earlyRepayment?: boolean };
    }) => financeApi.repayLiability(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'liabilities'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

/** 信用卡账单周期（仅 credit 账户）。 */
export function useCreditCardBilling(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ['finance', 'billing', id],
    queryFn: () => financeApi.getCreditCardBilling(id!),
    enabled: Boolean(id) && enabled,
  });
}

/** 截图 OCR → 候选交易（不落库）。 */
export function useParseOcr() {
  return useMutation({
    mutationFn: (file: File) => financeApi.parseOcr(file),
  });
}

/** 规则结论（即时确定性）。 */
export function useFindings(periodStart: string, periodEnd: string, enabled = true) {
  return useQuery({
    queryKey: ['finance', 'findings', periodStart, periodEnd],
    queryFn: () => financeApi.getFindings(periodStart, periodEnd),
    enabled,
  });
}

/** 健康分 + 维度。 */
export function useHealthScore(periodStart: string, periodEnd: string, enabled = true) {
  return useQuery({
    queryKey: ['finance', 'health-score', periodStart, periodEnd],
    queryFn: () => financeApi.getHealthScore(periodStart, periodEnd),
    enabled,
  });
}

/** 生成月报。 */
export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ periodStart, periodEnd }: { periodStart: string; periodEnd: string }) =>
      financeApi.generateMonthly(periodStart, periodEnd),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'reports'] });
    },
  });
}

/** 重新生成月报。 */
export function useRegenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.regenerateReport(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'reports'] });
    },
  });
}

/** 报告列表。 */
export function useReports(periodStart?: string, periodEnd?: string) {
  return useQuery({
    queryKey: ['finance', 'reports', periodStart ?? 'all', periodEnd ?? 'all'],
    queryFn: () => financeApi.listReports(periodStart, periodEnd),
  });
}

/** 报告详情（含 stale 检测）。 */
export function useReport(id: string | null) {
  return useQuery({
    queryKey: ['finance', 'report', id],
    queryFn: () => financeApi.getReport(id!),
    enabled: Boolean(id),
  });
}
