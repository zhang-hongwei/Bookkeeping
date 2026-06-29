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

/** 净资产仪表盘（总资产/总负债/净资产 + 今日变化）。 */
export function useNetWorth() {
  return useQuery({
    queryKey: ['finance', 'net-worth'],
    queryFn: () => financeApi.getNetWorth(),
  });
}

/** 净资产曲线（区间快照）。 */
export function useNetWorthSnapshots(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: ['finance', 'net-worth', 'snapshots', from, to],
    queryFn: () => financeApi.getNetWorthSnapshots(from, to),
    enabled,
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
