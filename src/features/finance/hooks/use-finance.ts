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
  type CreatePositionPayload,
  type BuyPayload,
  type SellPayload,
  type InstrumentType,
  type PriceSource,
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

// ===== Phase 3：投资持仓 / 买卖 / 行情 / 表现 / 配置 / 定投 =====

/** 持仓列表（带市值/成本/盈亏/收益率）。 */
export function usePositions(params?: { instrumentType?: InstrumentType; includeClosed?: boolean }) {
  return useQuery({
    queryKey: ['finance', 'positions', params ?? {}],
    queryFn: () => financeApi.listPositions(params),
  });
}

/** 登记持仓。成功后失效持仓 + 账户 + 净资产。 */
export function useCreatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePositionPayload) => financeApi.createPosition(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'positions'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

/** 更新持仓元数据（不改市值/份额/成本）。 */
export function useUpdatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreatePositionPayload> & { estimateConfidence?: EstimateConfidence };
    }) => financeApi.updatePosition(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'positions'] });
    },
  });
}

/** 买入（transfer，净资产不变，SC-001）。失效持仓 + 账户 + 净资产 + 交易。 */
export function useBuyPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BuyPayload }) =>
      financeApi.buyPosition(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'positions'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

/** 卖出（disposal，实现盈亏）。 */
export function useSellPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SellPayload }) =>
      financeApi.sellPosition(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'positions'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

/** 分红（现金/再投资）。 */
export function useDividendPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload:
        | { kind: 'cash'; cashAccountId: string; amount: string; note?: string; occurredAt?: string }
        | { kind: 'reinvest'; shares: string; price: string; note?: string; occurredAt?: string };
    }) => financeApi.dividendPosition(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'positions'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

/** 估值同步（revaluation，FR-008）。 */
export function useRevaluePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { currentPrice: string; source?: PriceSource; fetchedAt?: string };
    }) => financeApi.revaluePosition(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'positions'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

/** 持仓表现（市值/盈亏/收益率 + IRR）。 */
export function usePositionPerformance(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ['finance', 'positions', 'performance', id],
    queryFn: () => financeApi.getPositionPerformance(id!),
    enabled: Boolean(id) && enabled,
  });
}

/** 品种行情缓存列表。 */
export function useInstruments(type?: InstrumentType) {
  return useQuery({
    queryKey: ['finance', 'instruments', type ?? 'all'],
    queryFn: () => financeApi.listInstruments(type),
  });
}

/** 拉取品种实时行情（含降级）。 */
export function useInstrumentQuote(code: string | null, type: InstrumentType, enabled = true) {
  return useQuery({
    queryKey: ['finance', 'instruments', 'quote', code, type],
    queryFn: () => financeApi.getInstrumentQuote(code!, type),
    enabled: Boolean(code) && enabled,
  });
}

/** 手动录入/修正品种现价（行情降级兜底，SC-004）。 */
export function useUpsertManualPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { code: string; type: InstrumentType; name?: string; latestPrice: string }) =>
      financeApi.upsertManualPrice(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'instruments'] });
    },
  });
}

/** 资产配置（按品种类型）+ 集中度预警。 */
export function useAllocation(view?: 'by_type') {
  return useQuery({
    queryKey: ['finance', 'allocation', view ?? 'by_type'],
    queryFn: () => financeApi.getAllocation(view),
  });
}

/** 定投计划列表。 */
export function useDcaPlans() {
  return useQuery({
    queryKey: ['finance', 'dca-plans'],
    queryFn: () => financeApi.listDcaPlans(),
  });
}

// ===== Phase 4：家庭财务 =====

/** 我的家庭列表（active 成员）。 */
export function useMyFamilies() {
  return useQuery({
    queryKey: ['finance', 'families'],
    queryFn: () => financeApi.listMyFamilies(),
  });
}

/** 家庭详情 + 成员列表。 */
export function useFamily(familyId: string | null | undefined, includeLeft = false) {
  return useQuery({
    queryKey: ['finance', 'families', familyId, { includeLeft }],
    queryFn: () => financeApi.getFamily(familyId!, includeLeft),
    enabled: Boolean(familyId),
  });
}

export function useCreateFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; defaultCurrency?: string }) =>
      financeApi.createFamily(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'families'] });
    },
  });
}

export function useUpdateFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      financeApi.updateFamily(id, { name }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'families'] });
    },
  });
}

export function useDissolveFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.dissolveFamily(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'families'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'family-net-worth'] });
    },
  });
}

export function useAddFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      familyId,
      ...payload
    }: Parameters<typeof financeApi.addFamilyMember>[1] & { familyId: string }) =>
      financeApi.addFamilyMember(familyId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'families'] });
    },
  });
}

export function useUpdateFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      familyId,
      memberId,
      ...payload
    }: {
      familyId: string;
      memberId: string;
      displayName?: string;
      role?: 'partner' | 'child' | 'parent' | 'other';
      shareMode?: 'shared' | 'private_by_default';
      defaultView?: 'personal' | 'family';
    }) => financeApi.updateFamilyMember(familyId, memberId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'families'] });
    },
  });
}

/** 成员退出（软删除）。 */
export function useLeaveFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ familyId, memberId }: { familyId: string; memberId: string }) =>
      financeApi.leaveFamily(familyId, memberId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'families'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'family-net-worth'] });
    },
  });
}

/** 家庭合并净资产（今日，含 memberBreakdown）。 */
export function useFamilyNetWorth(
  familyId: string | null | undefined,
  view?: 'high' | 'all',
) {
  return useQuery({
    queryKey: ['finance', 'family-net-worth', familyId, view ?? 'all'],
    queryFn: () => financeApi.getFamilyNetWorth(familyId!, view),
    enabled: Boolean(familyId),
  });
}

/** 家庭净资产曲线。 */
export function useFamilyCurve(
  familyId: string | null | undefined,
  from: string,
  to: string,
) {
  return useQuery({
    queryKey: ['finance', 'family-net-worth', 'curve', familyId, from, to],
    queryFn: () => financeApi.getFamilyCurve(familyId!, from, to),
    enabled: Boolean(familyId),
  });
}

/** 成员支出画像（按 memberId 聚合）。 */
export function useMemberProfile(
  familyId: string | null | undefined,
  memberId: string | null | undefined,
  range?: { from?: string; to?: string },
) {
  return useQuery({
    queryKey: ['finance', 'family', 'profile', familyId, memberId, range ?? {}],
    queryFn: () => financeApi.getMemberProfile(familyId!, memberId!, range),
    enabled: Boolean(familyId && memberId),
  });
}

/** 切换账号家庭可见性（shared/private）。 */
export function useUpdateAccountVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: 'shared' | 'private' }) =>
      financeApi.updateAccountVisibility(id, visibility),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'family-net-worth'] });
    },
  });
}

// ===== Phase 6：现金流预测 / 智能预警 =====

/** 现金流预测（读取/即时生成缓存；带不确定性区间 + 应急金不足点）。 */
export function useForecast(params?: { months?: number; target?: string }) {
  return useQuery({
    queryKey: ['finance', 'forecast', params ?? {}],
    queryFn: () => financeApi.getForecast(params),
  });
}

/** 重新生成预测（覆盖缓存）。 */
export function useRegenerateForecast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { targetMonth?: string; months?: number }) =>
      financeApi.regenerateForecast(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'forecast'] });
    },
  });
}

/** 智能预警列表（active 默认过滤已静默 kind）。 */
export function useAlerts(status?: 'active' | 'acknowledged' | 'silenced' | 'all') {
  return useQuery({
    queryKey: ['finance', 'alerts', status ?? 'active'],
    queryFn: () => financeApi.getAlerts(status),
  });
}

/** 更新单条预警状态（已读/静默）。 */
export function usePatchAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'acknowledged' | 'silenced' }) =>
      financeApi.patchAlert(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'alerts'] });
    },
  });
}

/** 预警偏好/静默列表。 */
export function useAlertPreferences() {
  return useQuery({
    queryKey: ['finance', 'alert-preferences'],
    queryFn: () => financeApi.getAlertPreferences(),
  });
}

/** 更新预警偏好（按 kind upsert 静默）。 */
export function usePatchAlertPreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      kind: import('../api').AlertKindDTO;
      muted?: boolean;
      mutedUntil?: string | null;
      channel?: string | null;
    }) => financeApi.patchAlertPreference(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'alert-preferences'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'alerts'] });
    },
  });
}

// ===== Phase 6 US2：顾问对话 / 审批闭环 =====

/** 顾问会话列表。 */
export function useAdvisorSessions() {
  return useQuery({
    queryKey: ['finance', 'advisor-sessions'],
    queryFn: () => financeApi.listAdvisorSessions(),
  });
}

/** 新建顾问会话。 */
export function useCreateAdvisorSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { title?: string }) =>
      financeApi.createAdvisorSession(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'advisor-sessions'] });
    },
  });
}

/** 会话历史。 */
export function useAdvisorMessages(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: ['finance', 'advisor-messages', sessionId],
    queryFn: () => financeApi.listAdvisorMessages(sessionId!),
    enabled: Boolean(sessionId),
  });
}

/** 发送提问（LLM 表达 + 降级 + 可能提议）。 */
export function useSendAdvisorMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      financeApi.sendAdvisorMessage(sessionId, content),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: ['finance', 'advisor-messages', vars.sessionId],
      });
      // 可能产生高风险提议 → 刷新审批列表
      void qc.invalidateQueries({ queryKey: ['finance', 'approvals'] });
    },
  });
}

/** 审批列表。 */
export function useApprovals(status?: import('../api').ApprovalStatusDTO | 'all') {
  return useQuery({
    queryKey: ['finance', 'approvals', status ?? 'all'],
    queryFn: () => financeApi.listApprovals(status),
  });
}

/** 批准 / 拒绝。 */
export function useDecideApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approve' | 'reject' }) =>
      financeApi.decideApproval(id, decision),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'approvals'] });
    },
  });
}

/** 落库（幂等）。 */
export function useApplyApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.applyApproval(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'approvals'] });
      // create_transaction 落库影响账目/净资产
      void qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
    },
  });
}

// ===== Phase 6 US3：多期趋势对比 =====

/** 多期趋势对比（按指标时序 + 方向 + 显著恶化标记）。 */
export function useTrends(
  params?: {
    metrics?: import('../api').TrendMetricDTO[];
    periods?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: ['finance', 'trends', params ?? {}],
    queryFn: () => financeApi.getTrends(params),
    enabled,
  });
}

// ===== Phase 5：预算 =====

/** 预算列表（含当前周期派生状态）。 */
export function useBudgets(params?: { active?: boolean; period?: string }) {
  return useQuery({
    queryKey: ['finance', 'budgets', params ?? {}],
    queryFn: () => financeApi.listBudgets(params),
  });
}

/** 预算详情（含当前周期状态）。 */
export function useBudget(id: string | null | undefined, period?: string) {
  return useQuery({
    queryKey: ['finance', 'budget', id, period ?? ''],
    queryFn: () => financeApi.getBudget(id!, period),
    enabled: Boolean(id),
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof financeApi.createBudget>[0]) =>
      financeApi.createBudget(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'budgets'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'budget-alerts'] });
    },
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof financeApi.updateBudget>[1] }) =>
      financeApi.updateBudget(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'budgets'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'budget'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'budget-alerts'] });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteBudget(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'budgets'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'budget-alerts'] });
    },
  });
}

/** 当前周期预警汇总（即将超支/已超支）。 */
export function useBudgetAlerts(params?: { period?: string; status?: 'warning' | 'overrun' }) {
  return useQuery({
    queryKey: ['finance', 'budget-alerts', params ?? {}],
    queryFn: () => financeApi.listBudgetAlerts(params),
  });
}

/** 预算历史周期快照（不可变）。 */
export function useBudgetPeriods(id: string | null | undefined, from?: string, to?: string) {
  return useQuery({
    queryKey: ['finance', 'budget-periods', id, from ?? '', to ?? ''],
    queryFn: () => financeApi.listBudgetPeriods(id!, from, to),
    enabled: Boolean(id),
  });
}

// ===== Phase 5：目标 =====

/** 目标列表（含 ETA）。 */
export function useGoals(status?: 'active' | 'archived') {
  return useQuery({
    queryKey: ['finance', 'goals', status ?? 'active'],
    queryFn: () => financeApi.listGoals(status),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof financeApi.createGoal>[0]) =>
      financeApi.createGoal(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'goals'] });
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof financeApi.updateGoal>[1] }) =>
      financeApi.updateGoal(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'goals'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'goal-progress'] });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteGoal(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'goals'] });
    },
  });
}

/** 目标进度 + ETA 明细（surplusSeries 可解释可追溯，SC-003）。 */
export function useGoalProgress(id: string | null | undefined, windowMonths?: number) {
  return useQuery({
    queryKey: ['finance', 'goal-progress', id, windowMonths ?? 3],
    queryFn: () => financeApi.getGoalProgress(id!, windowMonths),
    enabled: Boolean(id),
  });
}

// ===== Phase 7：高级分析（what-if / 个税 / 退休 / 组合）=====
//
// 写操作（创建情景/估算/模拟）成功后失效对应集合；解读为按需 mutation（返回文本旁注）。
// 结构化数字始终来自引擎结果；解读文本仅旁注（NC5）。

/** US1：我的 what-if 情景列表（不含投影点明细）。 */
export function useScenarios(familyId?: string) {
  return useQuery({
    queryKey: ['finance', 'scenarios', familyId ?? 'me'],
    queryFn: () => financeApi.listScenarios(familyId),
  });
}

/** US1：情景详情（含全部投影点）。 */
export function useScenario(id: string | null | undefined) {
  return useQuery({
    queryKey: ['finance', 'scenario', id],
    queryFn: () => financeApi.getScenario(id!),
    enabled: Boolean(id),
  });
}

/** US1：计算并保存情景（确定性投影，可复现）。 */
export function useCreateScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof financeApi.createScenario>[0]) =>
      financeApi.createScenario(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'scenarios'] });
    },
  });
}

/** US1：LLM 解读（仅文本旁注，零编造；LLM 不可用→空文本）。 */
export function useInterpretScenario() {
  return useMutation({
    mutationFn: ({ id, familyId }: { id: string; familyId?: string }) =>
      financeApi.interpretScenario(id, familyId),
  });
}

/** US2：取最近一次个税估算（无则 null）。 */
export function useLatestTax(taxYear?: number, familyId?: string) {
  return useQuery({
    queryKey: ['finance', 'tax-estimates', 'latest', taxYear ?? 'current', familyId ?? 'me'],
    queryFn: () => financeApi.getLatestTaxEstimate(taxYear, familyId),
  });
}

/** US2：估算个税（支持年终奖单独/合并对比）。 */
export function useComputeTax() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof financeApi.computeTaxEstimate>[0]) =>
      financeApi.computeTaxEstimate(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'tax-estimates'] });
    },
  });
}

/** US2：LLM 解读计税方式差异（仅文本旁注）。 */
export function useInterpretTax() {
  return useMutation({
    mutationFn: (id: string) => financeApi.interpretTax(id),
  });
}

/** US3：取最近一次退休模拟（无则 null）。 */
export function useLatestRetirement(familyId?: string) {
  return useQuery({
    queryKey: ['finance', 'retirement', 'latest', familyId ?? 'me'],
    queryFn: () => financeApi.getLatestRetirement(familyId),
  });
}

/** US3：模拟退休三点区间 + 可持续性。 */
export function useComputeRetirement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof financeApi.computeRetirement>[0]) =>
      financeApi.computeRetirement(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finance', 'retirement'] });
    },
  });
}

/** US3：LLM 解读（仅文本旁注，须保留不确定性原意）。 */
export function useInterpretRetirement() {
  return useMutation({
    mutationFn: (id: string) => financeApi.interpretRetirement(id),
  });
}

/** US4：当前持仓的方向建议（随持仓重算覆盖；无持仓→空 hints）。 */
export function usePortfolioHints(familyId?: string) {
  return useQuery({
    queryKey: ['finance', 'portfolio-hints', familyId ?? 'me'],
    queryFn: () => financeApi.getPortfolioHints(familyId),
  });
}

/** US4：LLM 解读方向建议（仅文本旁注，严禁品种/买卖指令）。 */
export function useInterpretPortfolioHints() {
  return useMutation({
    mutationFn: (familyId?: string) => financeApi.interpretPortfolioHints(familyId),
  });
}
