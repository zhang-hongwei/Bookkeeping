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

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: string;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  occurredAt?: string;
  note?: string;
  source?: TransactionSource;
}

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  openingBalance: string;
  currency?: string;
  creditLimit?: string | null;
  includeInNetWorth?: boolean;
}

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
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

  getNetWorth: () => http<NetWorthDTO>(`${BASE}/net-worth`),
  getNetWorthSnapshots: (from: string, to: string) =>
    http<{ items: NetWorthSnapshotDTO[] }>(
      `${BASE}/net-worth/snapshots?from=${from}&to=${to}`,
    ),

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
    http<HealthScoreDTO>(
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
};
