/**
 * Finance API 客户端（前端用）。
 *
 * 对接 src/app/api/finance/* 路由。金额一律字符串（避免 JS number 精度问题）。
 * 认证由 Supabase 会话 cookie 承载，请求体不携带 userId。
 */
import type {
  AccountType,
  CategoryKind,
  EntrySide,
  TransactionType,
  TransactionSource,
} from '@/database/schema/finance';

export interface AccountDTO {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: string;
  balance: string;
  creditLimit: string | null;
  includeInNetWorth: boolean;
  isArchived: boolean;
  systemKey: string | null;
  /** Phase 4：家庭共享范围（shared 并入家庭视图；private 仅个人可见）。 */
  visibility: 'shared' | 'private';
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  kind: CategoryKind;
  parentId: string | null;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EntryDTO {
  id: string;
  transactionId: string;
  accountId: string;
  side: EntrySide;
  amount: string;
  createdAt: string;
}

export interface TransactionDTO {
  id: string;
  userId: string;
  type: TransactionType;
  categoryId: string | null;
  amount: string;
  occurredAt: string;
  note: string | null;
  source: TransactionSource;
  confidence: string;
  billImportId: string | null;
  createdAt: string;
  updatedAt: string;
  entries: EntryDTO[];
}

export interface TransactionListResponse {
  items: TransactionDTO[];
  total: number;
  page: number;
}

export interface BillImportPreviewRow {
  id: string;
  status: 'pending' | 'imported' | 'duplicate' | 'error';
  parsed: {
    amount: string;
    type?: TransactionType;
    counterparty?: string;
    note?: string;
    occurredAt?: string;
    categoryId?: string;
    accountId?: string;
  };
}

export interface StartImportResponse {
  billImportId: string;
  total: number;
  preview: BillImportPreviewRow[];
}

export interface BillImportBatchDTO {
  id: string;
  source: string;
  fileName: string | null;
  status: 'parsing' | 'preview' | 'confirmed' | 'failed';
  total: number;
  imported: number;
  skipped: number;
}

export interface ImportBatchDetail {
  batch: BillImportBatchDTO;
  rows: BillImportPreviewRow[];
}

export interface ConfirmImportResult {
  imported: number;
  skipped: number;
  failed: number;
}

export interface NlCandidateDTO {
  type: TransactionType;
  amount: string;
  categoryId?: string;
  accountId?: string;
  occurredAt?: string;
  note?: string;
}

export interface NlRecordResultDTO {
  candidate: NlCandidateDTO | null;
  confidence: number;
  reason?: string;
}

export interface NetWorthDTO {
  date: string;
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  todayChange: string;
  breakdown: Record<string, string>;
}

export interface NetWorthSnapshotDTO {
  date: string;
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  breakdown: Record<string, string>;
}

export interface OcrCandidateDTO {
  type: TransactionType;
  amount: string;
  counterparty?: string;
  note?: string;
  occurredAt?: string;
  categoryId?: string;
  accountId?: string;
}

export interface OcrRecordResultDTO {
  candidates: OcrCandidateDTO[];
  confidence: number;
  requireManualConfirm: boolean;
  reason?: string;
}

export interface FindingDTO {
  metric: string;
  value: string | null;
  verdict: string;
  riskLevel: string;
}

export interface DimensionScoreDTO {
  value: string | null;
  score?: number | null;
  reason?: string;
}

export interface HealthScoreDTO {
  total: string;
  dimensions: {
    savingsRate: DimensionScoreDTO;
    debtRatio: DimensionScoreDTO;
    emergency: DimensionScoreDTO;
    investmentRate: DimensionScoreDTO;
    cashflow: DimensionScoreDTO;
  };
}

export interface ReportViewDTO {
  id: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  score: string | null;
  dimensions: Record<string, DimensionScoreDTO> | null;
  status: string;
  stale: boolean;
  content: string | null;
  contentRef: string | null;
  generatedAt: string;
}

export interface ReportMetaDTO {
  id: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  score: string | null;
  status: string;
  generatedAt: string;
}

export interface GenerateReportResult {
  reportId: string;
  status: string;
  score: string;
  stale: boolean;
  contentRef: string | null;
}

// ===== Phase 2：资产 / 负债 / 还款 / 账单 =====

export type EstimateConfidence = 'high' | 'medium' | 'low';
export type ValuationSource = 'manual' | 'market' | 'estimate';
export type LiabilityKind = 'credit' | 'mortgage' | 'car_loan' | 'consumer_loan' | 'borrowing';
export type AssetType = 'real_asset' | 'investment';
export type NetWorthView = 'high' | 'all';

export interface ValuationHistoryEntryDTO {
  date: string;
  value: string;
  confidence: EstimateConfidence;
  source: ValuationSource;
}

export interface AssetDTO {
  id: string;
  name: string;
  type: AssetType;
  balance: string;
  currentValue: string;
  includeInNetWorth: boolean;
  isArchived: boolean;
  costBasis: string;
  valuationSource: ValuationSource;
  estimateConfidence: EstimateConfidence;
  valuationDate: string | null;
  valuationHistory: ValuationHistoryEntryDTO[];
  isDisposed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LiabilityDTO {
  id: string;
  name: string;
  type: LiabilityKind;
  balance: string;
  remainingPrincipal: string;
  includeInNetWorth: boolean;
  isArchived: boolean;
  kind: LiabilityKind;
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

export interface RepayResultDTO {
  transaction: {
    id: string;
    type: 'repayment';
    amount: string;
    principalAmount: string | null;
    interestAmount: string | null;
    occurredAt: string;
  };
  remainingPrincipal: string;
  paidAmount: string;
}

export interface CreditBillingDTO {
  periodStart: string;
  periodEnd: string;
  statementAmount: string;
  paidAmount: string;
  remaining: string;
  statementDay: number;
  repaymentDay: number;
  dueSoon: boolean;
  daysUntilDue: number | null;
}

export interface CreateAssetPayload {
  name: string;
  type: AssetType;
  currentValue: string;
  costBasis?: string;
  valuationSource?: ValuationSource;
  estimateConfidence?: EstimateConfidence;
  valuationDate?: string;
  currency?: string;
  includeInNetWorth?: boolean;
}

export interface CreateLiabilityPayload {
  name: string;
  type: LiabilityKind;
  openingBalance: string;
  principal?: string;
  interestRate?: string | null;
  monthlyPayment?: string | null;
  dueDate?: string | null;
  statementDay?: number | null;
  repaymentDay?: number | null;
  currency?: string;
  includeInNetWorth?: boolean;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: string;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  occurredAt?: string;
  note?: string;
  source?: TransactionSource;
  /** Phase 4：家庭归属（family_members.id，含 joint）。 */
  memberId?: string | null;
}

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  openingBalance: string;
  currency?: string;
  creditLimit?: string | null;
  includeInNetWorth?: boolean;
}

// ===== Phase 3：投资持仓 / 买卖 / 品种 / 表现 / 配置 / 定投 =====

export type InstrumentType = 'stock' | 'fund' | 'bond' | 'gold' | 'etf' | 'reits' | 'crypto';
export type PriceSource = 'manual' | 'market' | 'estimate';

export interface PositionDetailDTO {
  positionId: string;
  instrumentCode: string;
  instrumentType: InstrumentType;
  quantity: string;
  costPrice: string;
  currentPrice: string;
  priceSource: PriceSource;
  lastPriceAt: string | null;
  currency: string;
  estimateConfidence: EstimateConfidence;
  isClosed: boolean;
  cost: string;
  marketValue: string;
  pnl: string;
  pnlRate: string | null;
}

export interface PositionDTO {
  id: string;
  name: string;
  type: 'investment';
  balance: string;
  includeInNetWorth: boolean;
  isArchived: boolean;
  position: PositionDetailDTO;
  createdAt: string;
  updatedAt: string;
}

export interface BuyResultDTO {
  transaction: { id: string; type: 'transfer'; amount: string; occurredAt: string };
  position: PositionDTO;
}

export interface SellResultDTO {
  transaction: { id: string; type: 'disposal'; amount: string; occurredAt: string };
  realizedPnl: string;
  position: PositionDTO;
}

export interface DividendResultDTO {
  transaction: { id: string; type: string; amount: string; occurredAt: string };
  position: PositionDTO;
}

export interface RevaluePositionResultDTO {
  transaction: { id: string; type: 'revaluation'; amount: string; occurredAt: string } | null;
  position: PositionDTO;
}

export interface InstrumentDTO {
  id: string;
  code: string;
  type: InstrumentType;
  name: string | null;
  latestPrice: string | null;
  priceSource: PriceSource;
  priceUpdatedAt: string | null;
  isStale: boolean;
  currency: string;
}

export interface InstrumentQuoteDTO {
  code: string;
  type: InstrumentType;
  latestPrice: string | null;
  priceSource: PriceSource;
  priceUpdatedAt: string | null;
  isStale: boolean;
}

export interface PerformanceDTO {
  marketValue: string;
  cost: string;
  pnl: string;
  pnlRate: string | null;
  totalInvested: string;
  irr: { annualizedRate: string | null; converged: boolean; reason?: string; asOf: string };
}

export interface AllocationItemDTO {
  instrumentType: InstrumentType;
  marketValue: string;
  ratio: string;
}

export interface AllocationDTO {
  items: AllocationItemDTO[];
  total: string;
  alerts: { code: string; severity: string; message: string; threshold: string }[];
}

export interface DcaPlanDTO {
  id: string;
  instrumentCode: string;
  instrumentType: InstrumentType;
  amount: string | null;
  frequency: 'monthly' | 'biweekly' | 'weekly';
  dayOfPeriod: number | null;
  cashAccountId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionPayload {
  name: string;
  instrumentCode: string;
  instrumentType: InstrumentType;
  currency?: string;
  includeInNetWorth?: boolean;
}

export interface BuyPayload {
  cashAccountId: string;
  shares: string;
  price: string;
  fee?: string;
  occurredAt?: string;
  note?: string;
  dcaPlanId?: string;
}

export interface SellPayload {
  cashAccountId: string;
  shares: string;
  price: string;
  fee?: string;
  tax?: string;
  occurredAt?: string;
  note?: string;
}

export interface CreateDcaPlanPayload {
  instrumentCode: string;
  instrumentType: InstrumentType;
  amount?: string;
  frequency?: 'monthly' | 'biweekly' | 'weekly';
  dayOfPeriod?: number;
  cashAccountId?: string | null;
  active?: boolean;
}

async function http<T>(url: string, init?: RequestInit): Promise<T> {  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && String((data as { error: unknown }).error)) ||
      `请求失败 (${res.status})`;
    throw new Error(message);
  }
  return data as T;
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
  /** `{ [memberId]: netWorth }`。 */
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
export type FamilyMemberRoleBody = 'partner' | 'child' | 'parent' | 'other';
export type ShareModeBody = 'shared' | 'private_by_default';
export type DefaultViewBody = 'personal' | 'family';

// ===== Phase 6：AI 财富顾问（预测 / 预警 / 顾问 / 审批 / 趋势）DTO =====

/** 可追溯来源锚点（SC-002 / I1）。 */
export interface SourceRefDTO {
  metric: string;
  period: string;
  value: string | null;
  verdict: string;
  riskLevel: string;
}

/** 合规 + 可追溯封装（FR-009）。 */
export interface DisclaimerEnvelope<T> {
  data: T;
  disclaimer: string;
  sourceRefs: SourceRefDTO[];
}

export type AlertKindDTO =
  | 'emergency_shortfall'
  | 'savings_rate_decline'
  | 'debt_ratio_high'
  | 'trend_deterioration'
  | 'concentration';
export type AlertSeverityDTO = 'low' | 'medium' | 'high';
export type AlertStatusDTO = 'active' | 'acknowledged' | 'silenced';

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
export interface AlertDTO {
  id: string;
  kind: AlertKindDTO;
  severity: AlertSeverityDTO;
  period: string;
  status: AlertStatusDTO;
  message: string;
  ruleFindingRefs: SourceRefDTO[];
  createdAt: string;
}
export interface AlertPreferenceDTO {
  kind: AlertKindDTO;
  muted: boolean;
  mutedUntil: string | null;
  channel: string | null;
}

export interface AdvisorSessionDTO {
  id: string;
  title: string | null;
  createdAt: string;
}
export interface AdvisorMessageDTO {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citedFindings: SourceRefDTO[];
  degraded: boolean;
  proposalId: string | null;
  createdAt: string;
}
export type ApprovalKindDTO =
  | 'flag_transaction_anomaly'
  | 'rebalance_suggestion'
  | 'amend_finding_override'
  | 'create_transaction';
export type ApprovalStatusDTO =
  | 'proposed'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'applied'
  | 'expired';
export interface ApprovalDTO {
  id: string;
  kind: ApprovalKindDTO;
  payload: unknown;
  status: ApprovalStatusDTO;
  ruleValidation: { passed: boolean; reason?: string; refs: SourceRefDTO[] };
  proposedBy: string | null;
  approvedAt: string | null;
  appliedAt: string | null;
  appliedResult: unknown;
  expiresAt: string;
}

/** Phase 6 US3：多期趋势对比。 */
export type TrendMetricDTO = 'savings_rate' | 'debt_ratio' | 'emergency_months' | 'score';
export type TrendDirectionDTO = 'up' | 'down' | 'flat';
export interface TrendPointDTO {
  period: string;
  value: string;
}
export interface TrendSeriesDTO {
  metric: string;
  points: TrendPointDTO[];
  direction: TrendDirectionDTO;
  deteriorating: boolean;
}
export interface TrendDTO {
  series: TrendSeriesDTO[];
}

/** Phase 5：预算与目标。 */
export type BudgetPeriodTypeDTO = 'month' | 'week' | 'year';
export type BudgetStatusDTO = 'normal' | 'warning' | 'overrun';
export interface BudgetDTO {
  id: string;
  categoryId: string | null;
  name: string | null;
  amount: string;
  periodType: BudgetPeriodTypeDTO;
  alertThreshold: string;
  rollover: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  period: { start: string; end: string };
  spent: string;
  remaining: string;
  ratio: string;
  status: BudgetStatusDTO;
  riskLevel: string;
  verdict: string;
}
export interface BudgetAlertDTO {
  budgetId: string;
  categoryId: string | null;
  period: { start: string; end: string };
  budgetAmount: string;
  spent: string;
  remaining: string;
  ratio: string;
  status: BudgetStatusDTO;
  riskLevel: string;
  verdict: string;
}
export interface BudgetPeriodDTO {
  id: string;
  budgetId: string;
  periodStart: string;
  periodEnd: string;
  amountSnapshot: string;
  spentSnapshot: string;
  status: BudgetStatusDTO;
  closedAt: string;
}
export type GoalProgressBasisDTO = 'manual' | 'linked' | 'net_worth';
export type GoalEtaStatusDTO = 'on_track' | 'at_risk' | 'unreachable' | 'completed';
export interface GoalEtaDTO {
  etaDate: string | null;
  etaStatus: GoalEtaStatusDTO;
  monthsToGoal: number | null;
  avgMonthlySurplus: string;
  windowMonths: number;
}
export interface GoalDTO {
  id: string;
  name: string;
  targetAmount: string;
  targetDate: string | null;
  progressBasis: GoalProgressBasisDTO;
  linkedAccountIds: string[];
  manualAmount: string;
  notes: string | null;
  status: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentAmount: string;
  progressRate: string;
  completed: boolean;
  eta: GoalEtaDTO;
}
export interface SurplusPointDTO {
  month: string;
  income: string;
  expense: string;
  surplus: string;
}
export interface GoalProgressDTO {
  currentAmount: string;
  targetAmount: string;
  remaining: string;
  progressRate: string;
  completed: boolean;
  surplusSeries: SurplusPointDTO[];
  eta: GoalEtaDTO;
}
export interface GoalProgressResponse {
  goal: GoalDTO;
  progress: GoalProgressDTO;
}

// ===== Phase 7：高级分析（what-if / 个税 / 退休 / 组合）DTO =====
//
// 红线（NC5）：所有数字由确定性引擎在服务端计算；前端始终渲染结构化数字，
// /interpret 返回的解读文本仅作旁注（不依赖其数字）。disclaimers[] 必显著渲染。

export type ScenarioKindDTO =
  | 'income_cut'
  | 'rate_hike'
  | 'lump_expense'
  | 'unemployment'
  | 'custom';
export type AnalysisStatusDTO = 'ok' | 'degraded';

export interface ScenarioAssumptionsDTO {
  incomeDeltaPct: number;
  durationMonths: number;
  rateDeltaPct?: number | null;
  lumpExpense?: string | null;
  affectedMonth?: number | null;
}

export interface BaselineSnapshotDTO {
  netWorth: string;
  monthlySurpluses: string[];
  emergencyMonths: number | null;
  asOfDate: string;
}

export interface ScenarioPointDTO {
  monthOffset: number;
  baselineNetWorth: string;
  scenarioNetWorth: string;
  netWorthDelta: string;
  baselineEmergencyMonths: string | null;
  scenarioEmergencyMonths: string | null;
}

export interface ScenarioDTO {
  id: string;
  name: string;
  kind: ScenarioKindDTO;
  assumptions: ScenarioAssumptionsDTO;
  horizonMonths: number;
  status: AnalysisStatusDTO;
  missing: string[];
  baselineSnapshot: BaselineSnapshotDTO;
  projections: ScenarioPointDTO[];
  engineVersion: string;
  disclaimers: string[];
}

export interface CreateScenarioPayload {
  name: string;
  kind: ScenarioKindDTO;
  assumptions: ScenarioAssumptionsDTO;
  horizonMonths: number;
  familyId?: string;
}

export interface TaxInputsDTO {
  annualIncome: string;
  insuranceAndFund: string;
  specialDeductions: Record<string, string>;
  annualBonus?: string | null;
}

export interface MethodComparisonDTO {
  separate: { taxAmount: string };
  merged: { taxAmount: string };
  diff: string;
  better: 'separate' | 'merged';
}

export interface TaxHintDTO {
  text: string;
}

export interface TaxEstimateDTO {
  id: string;
  taxYear: number;
  ruleVintage: string;
  inputs: TaxInputsDTO;
  methodComparison: MethodComparisonDTO;
  totalTaxAmount: string;
  effectiveRate: string | null;
  hints: TaxHintDTO[];
  status: AnalysisStatusDTO;
  missing: string[];
  engineVersion: string;
  disclaimers: string[];
}

export interface ComputeTaxPayload {
  taxYear: number;
  inputs: TaxInputsDTO;
  familyId?: string;
}

export interface RetirementAssumptionsDTO {
  currentAge: number;
  retirementAge: number;
  monthlyContribution: string;
  realReturnRatePct: number;
  inflationPct: number;
  postRetirementMonthlySpend: string;
  withdrawalRatePct: number;
}

export interface RetirementPointDTO {
  retirementCorpus: string;
  monthlySustainable: string;
  depletionAge: number | null;
}

export interface RetirementDTO {
  id: string;
  assumptions: RetirementAssumptionsDTO;
  horizonMonths: number;
  resultPessimistic: RetirementPointDTO;
  resultBaseline: RetirementPointDTO;
  resultOptimistic: RetirementPointDTO;
  sustainableVerdict: 'sustainable' | 'marginal' | 'insufficient';
  status: AnalysisStatusDTO;
  missing: string[];
  engineVersion: string;
  disclaimers: string[];
}

export interface ComputeRetirementPayload {
  assumptions: RetirementAssumptionsDTO;
  familyId?: string;
}

export interface PortfolioHintDTO {
  assetClass: string;
  currentRatio: string;
  targetBand: { min: number; max: number };
  direction: 'under' | 'over' | 'ok';
  reason: string;
}

export interface PortfolioHintsDTO {
  batchId: string;
  targetBandsVersion: string;
  totalMarketValue: string;
  hints: PortfolioHintDTO[];
  engineVersion: string;
  disclaimers: string[];
}

const BASE = '/api/finance';

export const financeApi = {
  listAccounts: (params?: { type?: AccountType; includeArchived?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.includeArchived) qs.set('include_archived', 'true');
    const query = qs.toString();
    return http<{ accounts: AccountDTO[] }>(`${BASE}/accounts${query ? `?${query}` : ''}`);
  },
  createAccount: (payload: CreateAccountPayload) =>
    http<{ account: AccountDTO }>(`${BASE}/accounts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAccount: (id: string, payload: Partial<CreateAccountPayload> & { isArchived?: boolean }) =>
    http<{ account: AccountDTO }>(`${BASE}/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteAccount: (id: string) =>
    http<void>(`${BASE}/accounts/${id}`, { method: 'DELETE' }),

  listCategories: (kind?: CategoryKind) => {
    const qs = kind ? `?kind=${kind}` : '';
    return http<{ categories: CategoryDTO[] }>(`${BASE}/categories${qs}`);
  },

  listTransactions: (params?: {
    accountId?: string;
    categoryId?: string;
    type?: TransactionType;
    source?: TransactionSource;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const qs = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const query = qs.toString();
    return http<TransactionListResponse>(`${BASE}/transactions${query ? `?${query}` : ''}`);
  },
  createTransaction: (payload: CreateTransactionPayload) =>
    http<{ transaction: TransactionDTO }>(`${BASE}/transactions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTransaction: (id: string, payload: Partial<CreateTransactionPayload>) =>
    http<{ transaction: TransactionDTO }>(`${BASE}/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteTransaction: (id: string) =>
    http<void>(`${BASE}/transactions/${id}`, { method: 'DELETE' }),

  startImport: (payload: { source?: string; rawText: string; fileName?: string }) =>
    http<StartImportResponse>(`${BASE}/import`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getImport: (id: string) => http<ImportBatchDetail>(`${BASE}/import/${id}`),
  confirmImport: (id: string, payload: { rowIds?: string[]; defaultAccountId?: string }) =>
    http<ConfirmImportResult>(`${BASE}/import/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    }),

  parseNl: (text: string) =>
    http<NlRecordResultDTO>(`${BASE}/nl-record`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  getNetWorth: (view?: NetWorthView) => {
    const qs = view ? `?view=${view}` : '';
    return http<NetWorthDTO & { view?: NetWorthView }>(`${BASE}/net-worth${qs}`);
  },
  getNetWorthSnapshots: (from: string, to: string, view?: NetWorthView) => {
    const qs = new URLSearchParams({ from, to });
    if (view) qs.set('view', view);
    return http<{ items: NetWorthSnapshotDTO[]; view?: NetWorthView }>(
      `${BASE}/net-worth/snapshots?${qs.toString()}`,
    );
  },

  listAssets: () => http<{ items: AssetDTO[] }>(`${BASE}/assets`),
  createAsset: (payload: CreateAssetPayload) =>
    http<{ asset: AssetDTO }>(`${BASE}/assets`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAsset: (id: string, payload: Partial<CreateAssetPayload>) =>
    http<{ asset: AssetDTO }>(`${BASE}/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  revalueAsset: (
    id: string,
    payload: { newValue: string; confidence?: EstimateConfidence; source?: ValuationSource },
  ) =>
    http<{ asset: AssetDTO }>(`${BASE}/assets/${id}/revalue`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  disposeAsset: (id: string, payload: { cashAccountId: string; proceeds: string; note?: string }) =>
    http<{ asset: AssetDTO }>(`${BASE}/assets/${id}/dispose`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listLiabilities: () => http<{ items: LiabilityDTO[] }>(`${BASE}/liabilities`),
  createLiability: (payload: CreateLiabilityPayload) =>
    http<{ liability: LiabilityDTO }>(`${BASE}/liabilities`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateLiability: (id: string, payload: Partial<CreateLiabilityPayload>) =>
    http<{ liability: LiabilityDTO }>(`${BASE}/liabilities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  repayLiability: (
    id: string,
    payload: { cashAccountId: string; principal: string; interest?: string; note?: string; earlyRepayment?: boolean },
  ) =>
    http<RepayResultDTO>(`${BASE}/liabilities/${id}/repay`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCreditCardBilling: (id: string) => http<CreditBillingDTO>(`${BASE}/liabilities/${id}/billing`),

  parseOcr: async (file: File): Promise<OcrRecordResultDTO> => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${BASE}/ocr-record`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? `请求失败 (${res.status})`);
    return data as OcrRecordResultDTO;
  },

  getFindings: (periodStart: string, periodEnd: string) =>
    http<{ findings: FindingDTO[] }>(
      `${BASE}/findings?periodStart=${periodStart}&periodEnd=${periodEnd}`,
    ),
  getHealthScore: (periodStart: string, periodEnd: string) =>
    http<DisclaimerEnvelope<HealthScoreDTO>>(
      `${BASE}/health-score?periodStart=${periodStart}&periodEnd=${periodEnd}`,
    ),
  generateMonthly: (periodStart: string, periodEnd: string) =>
    http<GenerateReportResult>(`${BASE}/reports/monthly`, {
      method: 'POST',
      body: JSON.stringify({ periodStart, periodEnd }),
    }),
  getReport: (id: string) => http<ReportViewDTO>(`${BASE}/reports/${id}`),
  listReports: (periodStart?: string, periodEnd?: string) => {
    const qs = periodStart && periodEnd ? `?periodStart=${periodStart}&periodEnd=${periodEnd}` : '';
    return http<{ items: ReportMetaDTO[] }>(`${BASE}/reports${qs}`);
  },
  regenerateReport: (id: string) =>
    http<GenerateReportResult>(`${BASE}/reports/${id}/regenerate`, { method: 'POST' }),

  // ===== Phase 3：投资 =====
  listPositions: (params?: { instrumentType?: InstrumentType; includeClosed?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.instrumentType) qs.set('instrumentType', params.instrumentType);
    if (params?.includeClosed) qs.set('includeClosed', 'true');
    const query = qs.toString();
    return http<{ items: PositionDTO[] }>(`${BASE}/positions${query ? `?${query}` : ''}`);
  },
  createPosition: (payload: CreatePositionPayload) =>
    http<{ position: PositionDTO }>(`${BASE}/positions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updatePosition: (id: string, payload: Partial<CreatePositionPayload> & { estimateConfidence?: EstimateConfidence }) =>
    http<{ position: PositionDTO }>(`${BASE}/positions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  buyPosition: (id: string, payload: BuyPayload) =>
    http<BuyResultDTO>(`${BASE}/positions/${id}/buy`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  sellPosition: (id: string, payload: SellPayload) =>
    http<SellResultDTO>(`${BASE}/positions/${id}/sell`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  dividendPosition: (
    id: string,
    payload:
      | { kind: 'cash'; cashAccountId: string; amount: string; note?: string; occurredAt?: string }
      | { kind: 'reinvest'; shares: string; price: string; note?: string; occurredAt?: string },
  ) =>
    http<DividendResultDTO>(`${BASE}/positions/${id}/dividend`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  revaluePosition: (
    id: string,
    payload: { currentPrice: string; source?: PriceSource; fetchedAt?: string },
  ) =>
    http<RevaluePositionResultDTO>(`${BASE}/positions/${id}/revalue`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getPositionPerformance: (id: string, asOf?: string) => {
    const qs = asOf ? `?asOf=${asOf}` : '';
    return http<PerformanceDTO>(`${BASE}/positions/${id}/performance${qs}`);
  },
  listInstruments: (type?: InstrumentType) => {
    const qs = type ? `?type=${type}` : '';
    return http<{ items: InstrumentDTO[] }>(`${BASE}/instruments${qs}`);
  },
  upsertManualPrice: (
    payload: { code: string; type: InstrumentType; name?: string; latestPrice: string },
  ) =>
    http<{ instrument: InstrumentDTO }>(`${BASE}/instruments`, {
      method: 'POST',
      body: JSON.stringify({ ...payload, source: 'manual' }),
    }),
  getInstrumentQuote: (code: string, type: InstrumentType) => {
    const qs = new URLSearchParams({ type });
    return http<InstrumentQuoteDTO>(`${BASE}/instruments/${code}/quote?${qs.toString()}`);
  },
  getAllocation: (view?: 'by_type') => {
    const qs = view ? `?view=${view}` : '';
    return http<AllocationDTO>(`${BASE}/allocation${qs}`);
  },
  listDcaPlans: () => http<{ items: DcaPlanDTO[] }>(`${BASE}/dca-plans`),
  createDcaPlan: (payload: CreateDcaPlanPayload) =>
    http<{ plan: DcaPlanDTO }>(`${BASE}/dca-plans`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // ===== Phase 4：家庭财务 =====
  listMyFamilies: () => http<{ families: FamilyDTO[] }>(`${BASE}/families`),
  createFamily: (payload: { name: string; defaultCurrency?: string }) =>
    http<{ family: FamilyDTO; members: FamilyMemberDTO[] }>(`${BASE}/families`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getFamily: (id: string, includeLeft = false) => {
    const qs = includeLeft ? '?include_left=1' : '';
    return http<{ family: FamilyDTO; members: FamilyMemberDTO[] }>(
      `${BASE}/families/${id}${qs}`,
    );
  },
  updateFamily: (id: string, payload: { name: string }) =>
    http<{ family: FamilyDTO }>(`${BASE}/families/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  dissolveFamily: (id: string) =>
    http<{ ok: boolean }>(`${BASE}/families/${id}`, { method: 'DELETE' }),
  listFamilyMembers: (id: string, includeLeft = false) => {
    const qs = includeLeft ? '?include_left=1' : '';
    return http<{ members: FamilyMemberDTO[] }>(`${BASE}/families/${id}/members${qs}`);
  },
  addFamilyMember: (
    id: string,
    payload: {
      userId?: string | null;
      displayName: string;
      role: FamilyMemberRoleBody;
      shareMode?: ShareModeBody;
    },
  ) =>
    http<{ member: FamilyMemberDTO }>(`${BASE}/families/${id}/members`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateFamilyMember: (
    familyId: string,
    memberId: string,
    payload: {
      displayName?: string;
      role?: FamilyMemberRoleBody;
      shareMode?: ShareModeBody;
      defaultView?: DefaultViewBody;
    },
  ) =>
    http<{ member: FamilyMemberDTO }>(
      `${BASE}/families/${familyId}/members/${memberId}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    ),
  leaveFamily: (familyId: string, memberId: string) =>
    http<{ member: FamilyMemberDTO }>(
      `${BASE}/families/${familyId}/members/${memberId}`,
      { method: 'DELETE' },
    ),
  getFamilyNetWorth: (id: string, view?: 'high' | 'all') => {
    const qs = view ? `?view=${view}` : '';
    return http<{ netWorth: FamilyNetWorthDTO }>(`${BASE}/families/${id}/net-worth${qs}`);
  },
  getFamilyCurve: (id: string, from: string, to: string) => {
    const qs = new URLSearchParams({ from, to });
    return http<{ points: FamilyCurvePointDTO[] }>(
      `${BASE}/families/${id}/net-worth/curve?${qs.toString()}`,
    );
  },
  getMemberProfile: (
    familyId: string,
    memberId: string,
    range?: { from?: string; to?: string },
  ) => {
    const qs = new URLSearchParams();
    if (range?.from) qs.set('from', range.from);
    if (range?.to) qs.set('to', range.to);
    return http<{ profile: MemberProfileDTO }>(
      `${BASE}/families/${familyId}/members/${memberId}/profile?${qs.toString()}`,
    );
  },
  updateAccountVisibility: (id: string, visibility: 'shared' | 'private') =>
    http<{ account: AccountDTO }>(`${BASE}/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility }),
    }),

  // ===== Phase 6：现金流预测 / 智能预警 =====
  getForecast: (params?: { months?: number; target?: string }) => {
    const qs = new URLSearchParams();
    if (params?.months) qs.set('months', String(params.months));
    if (params?.target) qs.set('target', params.target);
    const query = qs.toString();
    return http<DisclaimerEnvelope<ForecastDTO>>(
      `${BASE}/forecasts${query ? `?${query}` : ''}`,
    );
  },
  regenerateForecast: (payload?: { targetMonth?: string; months?: number }) =>
    http<DisclaimerEnvelope<ForecastDTO>>(`${BASE}/forecasts`, {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    }),
  getAlerts: (status?: AlertStatusDTO | 'all') => {
    const qs = status ? `?status=${status}` : '';
    return http<DisclaimerEnvelope<{ alerts: AlertDTO[] }>>(`${BASE}/alerts${qs}`);
  },
  patchAlert: (id: string, status: 'acknowledged' | 'silenced') =>
    http<AlertDTO>(`${BASE}/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getAlertPreferences: () =>
    http<{ preferences: AlertPreferenceDTO[] }>(`${BASE}/alerts/preferences`),
  patchAlertPreference: (payload: {
    kind: AlertKindDTO;
    muted?: boolean;
    mutedUntil?: string | null;
    channel?: string | null;
  }) =>
    http<AlertPreferenceDTO>(`${BASE}/alerts/preferences`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // ===== Phase 6 US2：顾问对话 / 审批闭环 =====
  createAdvisorSession: (payload?: { title?: string }) =>
    http<{ sessionId: string; session: AdvisorSessionDTO }>(`${BASE}/advisor/sessions`, {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    }),
  listAdvisorSessions: () =>
    http<{ sessions: AdvisorSessionDTO[] }>(`${BASE}/advisor/sessions`),
  listAdvisorMessages: (sessionId: string) =>
    http<DisclaimerEnvelope<{ messages: AdvisorMessageDTO[] }>>(
      `${BASE}/advisor/sessions/${sessionId}/messages`,
    ),
  sendAdvisorMessage: (sessionId: string, content: string) =>
    http<DisclaimerEnvelope<AdvisorMessageDTO>>(
      `${BASE}/advisor/sessions/${sessionId}/messages`,
      { method: 'POST', body: JSON.stringify({ content }) },
    ),
  listApprovals: (status?: ApprovalStatusDTO | 'all') => {
    const qs = status ? `?status=${status}` : '';
    return http<{ approvals: ApprovalDTO[] }>(`${BASE}/approvals${qs}`);
  },
  getApproval: (id: string) => http<ApprovalDTO>(`${BASE}/approvals/${id}`),
  decideApproval: (id: string, decision: 'approve' | 'reject') =>
    http<ApprovalDTO>(`${BASE}/approvals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ decision }),
    }),
  applyApproval: (id: string) =>
    http<{ status: string; appliedResult: unknown; approval: ApprovalDTO; idempotent: boolean }>(
      `${BASE}/approvals/${id}/apply`,
      { method: 'POST' },
    ),

  // ===== Phase 6 US3：多期趋势对比 =====
  getTrends: (params?: { metrics?: TrendMetricDTO[]; periods?: number }) => {
    const qs = new URLSearchParams();
    if (params?.metrics && params.metrics.length > 0) {
      qs.set('metric', params.metrics.join(','));
    }
    if (params?.periods) qs.set('periods', String(params.periods));
    const query = qs.toString();
    return http<DisclaimerEnvelope<TrendDTO>>(`${BASE}/trends${query ? `?${query}` : ''}`);
  },

  // ===== Phase 5：预算 =====
  listBudgets: (params?: { active?: boolean; period?: string }) => {
    const qs = new URLSearchParams();
    if (params?.active !== undefined) qs.set('active', String(params.active));
    if (params?.period) qs.set('period', params.period);
    const query = qs.toString();
    return http<{ budgets: BudgetDTO[] }>(`${BASE}/budgets${query ? `?${query}` : ''}`);
  },
  createBudget: (payload: {
    categoryId?: string | null;
    name?: string | null;
    amount: string;
    periodType?: BudgetPeriodTypeDTO;
    alertThreshold?: string;
  }) =>
    http<{ budget: BudgetDTO }>(`${BASE}/budgets`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getBudget: (id: string, period?: string) => {
    const qs = period ? `?period=${period}` : '';
    return http<{ budget: BudgetDTO }>(`${BASE}/budgets/${id}${qs}`);
  },
  updateBudget: (id: string, payload: Partial<{
    name: string | null;
    amount: string;
    periodType: BudgetPeriodTypeDTO;
    alertThreshold: string;
    active: boolean;
  }>) =>
    http<{ budget: BudgetDTO }>(`${BASE}/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteBudget: (id: string) =>
    http<{ ok: boolean }>(`${BASE}/budgets/${id}`, { method: 'DELETE' }),
  listBudgetAlerts: (params?: { period?: string; status?: 'warning' | 'overrun' }) => {
    const qs = new URLSearchParams();
    if (params?.period) qs.set('period', params.period);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return http<{ alerts: BudgetAlertDTO[] }>(`${BASE}/budgets/alerts${query ? `?${query}` : ''}`);
  },
  listBudgetPeriods: (id: string, from?: string, to?: string) => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const query = qs.toString();
    return http<{ periods: BudgetPeriodDTO[] }>(`${BASE}/budgets/${id}/periods${query ? `?${query}` : ''}`);
  },

  // ===== Phase 5：目标 =====
  listGoals: (status?: 'active' | 'archived') => {
    const qs = status ? `?status=${status}` : '';
    return http<{ goals: GoalDTO[] }>(`${BASE}/goals${qs}`);
  },
  createGoal: (payload: {
    name: string;
    targetAmount: string;
    targetDate?: string | null;
    progressBasis?: GoalProgressBasisDTO;
    linkedAccountIds?: string[];
    manualAmount?: string;
    notes?: string | null;
  }) =>
    http<{ goal: GoalDTO }>(`${BASE}/goals`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getGoal: (id: string) => http<{ goal: GoalDTO }>(`${BASE}/goals/${id}`),
  updateGoal: (id: string, payload: Partial<{
    name: string;
    targetAmount: string;
    targetDate: string | null;
    progressBasis: GoalProgressBasisDTO;
    linkedAccountIds: string[];
    manualAmount: string;
    notes: string | null;
    status: 'active' | 'archived';
  }>) =>
    http<{ goal: GoalDTO }>(`${BASE}/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteGoal: (id: string) =>
    http<{ ok: boolean }>(`${BASE}/goals/${id}`, { method: 'DELETE' }),
  getGoalProgress: (id: string, windowMonths?: number) => {
    const qs = windowMonths ? `?windowMonths=${windowMonths}` : '';
    return http<GoalProgressResponse>(`${BASE}/goals/${id}/progress${qs}`);
  },

  // ===== Phase 7：高级分析（what-if / 个税 / 退休 / 组合）=====

  // US1：what-if 情景
  createScenario: (payload: CreateScenarioPayload) =>
    http<{ scenario: ScenarioDTO }>(`${BASE}/scenarios`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listScenarios: (familyId?: string) => {
    const qs = familyId ? `?familyId=${familyId}` : '';
    return http<{ scenarios: ScenarioDTO[] }>(`${BASE}/scenarios${qs}`);
  },
  getScenario: (id: string) => http<{ scenario: ScenarioDTO }>(`${BASE}/scenarios/${id}`),
  interpretScenario: (id: string, familyId?: string) =>
    http<{ text: string }>(`${BASE}/scenarios/${id}/interpret`, {
      method: 'POST',
      body: JSON.stringify(familyId ? { familyId } : {}),
    }),

  // US2：个税估算
  computeTaxEstimate: (payload: ComputeTaxPayload) =>
    http<{ taxEstimate: TaxEstimateDTO }>(`${BASE}/tax-estimates`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getLatestTaxEstimate: (taxYear?: number, familyId?: string) => {
    const qs = new URLSearchParams();
    if (taxYear) qs.set('taxYear', String(taxYear));
    if (familyId) qs.set('familyId', familyId);
    const query = qs.toString();
    return http<{ taxEstimate: TaxEstimateDTO | null }>(
      `${BASE}/tax-estimates${query ? `?${query}` : ''}`,
    );
  },
  interpretTax: (id: string) =>
    http<{ text: string }>(`${BASE}/tax-estimates/${id}/interpret`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // US3：退休模拟
  computeRetirement: (payload: ComputeRetirementPayload) =>
    http<{ retirement: RetirementDTO }>(`${BASE}/retirement`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getLatestRetirement: (familyId?: string) => {
    const qs = familyId ? `?familyId=${familyId}` : '';
    return http<{ retirement: RetirementDTO | null }>(`${BASE}/retirement/latest${qs}`);
  },
  interpretRetirement: (id: string) =>
    http<{ text: string }>(`${BASE}/retirement/${id}/interpret`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // US4：组合优化方向（GET 随持仓重算覆盖）
  getPortfolioHints: (familyId?: string) => {
    const qs = familyId ? `?familyId=${familyId}` : '';
    return http<{ portfolioHints: PortfolioHintsDTO }>(`${BASE}/portfolio-hints${qs}`);
  },
  interpretPortfolioHints: (familyId?: string) =>
    http<{ text: string }>(`${BASE}/portfolio-hints/interpret`, {
      method: 'POST',
      body: JSON.stringify(familyId ? { familyId } : {}),
    }),
};
