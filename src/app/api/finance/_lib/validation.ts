/**
 * Finance API 请求体校验（Zod v4）。
 *
 * 金额一律字符串（避免 JS number 精度问题，见 contracts/api.md）。
 * 交易金额必须为正；账户初始余额允许 0/负（信用账户）。
 */
import { z } from 'zod';

/** 合法金额字符串（允许负数与 0）。 */
const moneyString = z
  .string()
  .refine((s) => s.trim() !== '' && Number.isFinite(Number(s)), {
    message: '非法金额',
  });

/** 正金额字符串（交易金额，>0）。 */
const positiveAmount = moneyString.refine((s) => Number(s) > 0, {
  message: '金额必须为正',
});

/** 交易字段定义（不含 refine），create / patch 共用。 */
const transactionBase = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: positiveAmount,
  fromAccountId: z.string().nullable().optional(),
  toAccountId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  occurredAt: z.string().optional(),
  note: z.string().max(500).optional(),
  source: z.enum(['manual', 'import', 'nl', 'ocr']).optional(),
  /** Phase 4：家庭归属（family_members.id，含 joint；null=无归属/清除）。 */
  memberId: z.string().nullable().optional(),
});

export const createTransactionSchema = transactionBase.superRefine((val, ctx) => {
  if (val.type === 'transfer') {
    if (!val.fromAccountId)
      ctx.addIssue({
        code: 'custom',
        message: '转账需要 fromAccountId',
        path: ['fromAccountId'],
      });
    if (!val.toAccountId)
      ctx.addIssue({
        code: 'custom',
        message: '转账需要 toAccountId',
        path: ['toAccountId'],
      });
  }
  if (val.type === 'expense' && !val.fromAccountId) {
    ctx.addIssue({
      code: 'custom',
      message: '支出需要 fromAccountId',
      path: ['fromAccountId'],
    });
  }
  if (val.type === 'income' && !val.toAccountId && !val.fromAccountId) {
    ctx.addIssue({
      code: 'custom',
      message: '收入需要账户',
      path: ['toAccountId'],
    });
  }
});

export type CreateTransactionBody = z.infer<typeof createTransactionSchema>;

// Zod v4：`.partial()` 不能作用于带 refine 的 schema，故从 base 派生。
export const patchTransactionSchema = transactionBase.partial();
export type PatchTransactionBody = z.infer<typeof patchTransactionSchema>;

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  // Phase 2：追加 mortgage/car_loan/consumer_loan/borrowing 负债类型（equity 为系统账户，不在此）。
  type: z.enum([
    'cash',
    'savings',
    'credit',
    'investment',
    'real_asset',
    'mortgage',
    'car_loan',
    'consumer_loan',
    'borrowing',
  ]),
  openingBalance: moneyString,
  currency: z.string().max(8).optional(),
  creditLimit: z.string().nullable().optional(),
  includeInNetWorth: z.boolean().optional(),
});
export type CreateAccountBody = z.infer<typeof createAccountSchema>;

export const patchAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isArchived: z.boolean().optional(),
  includeInNetWorth: z.boolean().optional(),
  creditLimit: z.string().nullable().optional(),
  /** Phase 4：家庭共享范围。 */
  visibility: z.enum(['shared', 'private']).optional(),
});
export type PatchAccountBody = z.infer<typeof patchAccountSchema>;

// ===== Phase 2：资产 / 负债 / 还款 / 估值 / 处置 =====

/** 非负金额字符串（建账欠款/估值可为 0）。 */
const nonNegativeAmount = moneyString.refine((s) => Number(s) >= 0, {
  message: '金额不可为负',
});

/** 账单日/还款日：月内 1–31。 */
const dayOfMonth = z.number().int().min(1).max(31);

/** 日期字符串 YYYY-MM-DD（与 date 列对齐，拒绝 "2051" 这类非法值）。 */
const isoDateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD');

export const createAssetSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['real_asset', 'investment']),
  currentValue: positiveAmount,
  costBasis: moneyString.optional(),
  valuationSource: z.enum(['manual', 'market', 'estimate']).optional(),
  estimateConfidence: z.enum(['high', 'medium', 'low']).optional(),
  valuationDate: z.string().optional(),
  currency: z.string().max(8).optional(),
  includeInNetWorth: z.boolean().optional(),
});
export type CreateAssetBody = z.infer<typeof createAssetSchema>;

export const patchAssetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  includeInNetWorth: z.boolean().optional(),
  costBasis: moneyString.optional(),
  valuationSource: z.enum(['manual', 'market', 'estimate']).optional(),
  estimateConfidence: z.enum(['high', 'medium', 'low']).optional(),
  valuationDate: z.string().nullable().optional(),
});
export type PatchAssetBody = z.infer<typeof patchAssetSchema>;

export const createLiabilitySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['credit', 'mortgage', 'car_loan', 'consumer_loan', 'borrowing']),
  openingBalance: nonNegativeAmount,
  principal: moneyString.optional(),
  interestRate: z.string().nullable().optional(),
  monthlyPayment: z.string().nullable().optional(),
  dueDate: isoDateStr.nullable().optional(),
  statementDay: dayOfMonth.nullable().optional(),
  repaymentDay: dayOfMonth.nullable().optional(),
  currency: z.string().max(8).optional(),
  includeInNetWorth: z.boolean().optional(),
});
export type CreateLiabilityBody = z.infer<typeof createLiabilitySchema>;

export const patchLiabilitySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  includeInNetWorth: z.boolean().optional(),
  interestRate: z.string().nullable().optional(),
  monthlyPayment: z.string().nullable().optional(),
  dueDate: isoDateStr.nullable().optional(),
  statementDay: dayOfMonth.nullable().optional(),
  repaymentDay: dayOfMonth.nullable().optional(),
});
export type PatchLiabilityBody = z.infer<typeof patchLiabilitySchema>;

export const revalueSchema = z.object({
  newValue: positiveAmount,
  confidence: z.enum(['high', 'medium', 'low']).optional(),
  source: z.enum(['manual', 'market', 'estimate']).optional(),
  occurredAt: z.string().optional(),
});
export type RevalueBody = z.infer<typeof revalueSchema>;

export const disposeSchema = z.object({
  cashAccountId: z.string().min(1),
  proceeds: positiveAmount,
  occurredAt: z.string().optional(),
  note: z.string().max(500).optional(),
});
export type DisposeBody = z.infer<typeof disposeSchema>;

export const repaySchema = z.object({
  cashAccountId: z.string().min(1),
  principal: positiveAmount,
  interest: nonNegativeAmount.default('0'),
  occurredAt: z.string().optional(),
  note: z.string().max(500).optional(),
  earlyRepayment: z.boolean().optional(),
});
export type RepayBody = z.infer<typeof repaySchema>;

export const netWorthViewSchema = z.enum(['high', 'all']).default('all');
export type NetWorthViewParam = z.infer<typeof netWorthViewSchema>;

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  kind: z.enum(['income', 'expense', 'transfer']),
  parentId: z.string().nullable().optional(),
  keywords: z.array(z.string()).optional(),
});
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;

// ===== Phase 3：投资持仓 / 买卖 / 分红 / 估值 / 品种 / 配置 / 定投 =====

/** 投资品种类型（FR-001）。 */
export const instrumentTypeEnum = z.enum([
  'stock',
  'fund',
  'bond',
  'gold',
  'etf',
  'reits',
  'crypto',
]);
export type InstrumentTypeBody = z.infer<typeof instrumentTypeEnum>;

/** 正份额/数量字符串（高精度，>0）。 */
const positiveShares = z
  .string()
  .refine((s) => Number(s) > 0, { message: '份额必须为正' });

/** 非负金额（费用/税 ≥0）。 */
const nonNegativeAmountBody = moneyString.refine((s) => Number(s) >= 0, {
  message: '金额不可为负',
});

/** 正价格字符串（>0）。 */
const positivePrice = z.string().refine((s) => Number(s) > 0, {
  message: '单价必须为正',
});

export const createPositionSchema = z.object({
  name: z.string().min(1).max(100),
  instrumentCode: z.string().min(1).max(32),
  instrumentType: instrumentTypeEnum,
  currency: z.string().max(8).optional(),
  includeInNetWorth: z.boolean().optional(),
});
export type CreatePositionBody = z.infer<typeof createPositionSchema>;

export const patchPositionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  estimateConfidence: z.enum(['high', 'medium', 'low']).optional(),
  includeInNetWorth: z.boolean().optional(),
});
export type PatchPositionBody = z.infer<typeof patchPositionSchema>;

export const buySchema = z.object({
  cashAccountId: z.string().min(1),
  shares: positiveShares,
  price: positivePrice,
  fee: nonNegativeAmountBody.default('0'),
  occurredAt: z.string().optional(),
  note: z.string().max(500).optional(),
  dcaPlanId: z.string().optional(),
});
export type BuyBody = z.infer<typeof buySchema>;

export const sellSchema = z.object({
  cashAccountId: z.string().min(1),
  shares: positiveShares,
  price: positivePrice,
  fee: nonNegativeAmountBody.default('0'),
  tax: nonNegativeAmountBody.default('0'),
  occurredAt: z.string().optional(),
  note: z.string().max(500).optional(),
});
export type SellBody = z.infer<typeof sellSchema>;

export const dividendSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('cash'),
    cashAccountId: z.string().min(1),
    amount: positiveAmount,
    occurredAt: z.string().optional(),
    note: z.string().max(500).optional(),
  }),
  z.object({
    kind: z.literal('reinvest'),
    shares: positiveShares,
    price: positivePrice,
    occurredAt: z.string().optional(),
    note: z.string().max(500).optional(),
  }),
]);
export type DividendBody = z.infer<typeof dividendSchema>;

export const revaluePositionSchema = z.object({
  currentPrice: z
    .string()
    .refine((s) => Number(s) >= 0, { message: '现价不可为负' }),
  source: z.enum(['manual', 'market', 'estimate']).optional(),
  fetchedAt: z.string().optional(),
});
export type RevaluePositionBody = z.infer<typeof revaluePositionSchema>;

export const upsertManualPriceSchema = z.object({
  code: z.string().min(1).max(32),
  type: instrumentTypeEnum,
  name: z.string().max(128).optional(),
  latestPrice: z
    .string()
    .refine((s) => Number(s) >= 0, { message: '价格不可为负' }),
});
export type UpsertManualPriceBody = z.infer<typeof upsertManualPriceSchema>;

export const performanceQuerySchema = z.object({
  asOf: z.string().optional(),
});
export type PerformanceQuery = z.infer<typeof performanceQuerySchema>;

export const allocationViewSchema = z.enum(['by_type']).default('by_type');
export type AllocationViewParam = z.infer<typeof allocationViewSchema>;

export const createDcaPlanSchema = z.object({
  instrumentCode: z.string().min(1).max(32),
  instrumentType: instrumentTypeEnum,
  amount: nonNegativeAmountBody.optional(),
  frequency: z.enum(['monthly', 'biweekly', 'weekly']).optional(),
  dayOfPeriod: z.number().int().min(1).max(31).optional(),
  cashAccountId: z.string().nullable().optional(),
  active: z.boolean().optional(),
});
export type CreateDcaPlanBody = z.infer<typeof createDcaPlanSchema>;

// ===== Phase 4：家庭财务 =====

/** 家庭成员角色（用户可设；self/joint 由系统管理，不在此）。 */
const familyMemberRoleBody = z.enum(['partner', 'child', 'parent', 'other']);

export const createFamilySchema = z.object({
  name: z.string().min(1).max(100),
  defaultCurrency: z.string().max(8).optional(),
});
export type CreateFamilyBody = z.infer<typeof createFamilySchema>;

export const updateFamilySchema = z.object({
  name: z.string().min(1).max(100),
});
export type UpdateFamilyBody = z.infer<typeof updateFamilySchema>;

/** 添加成员（形态 A：邀请已注册用户 userId；形态 B：预占槽位，仅 displayName + role）。 */
export const addMemberSchema = z.object({
  userId: z.string().nullable().optional(),
  displayName: z.string().min(1).max(50),
  role: familyMemberRoleBody,
  shareMode: z.enum(['shared', 'private_by_default']).optional(),
});
export type AddMemberBody = z.infer<typeof addMemberSchema>;

export const updateMemberSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  role: familyMemberRoleBody.optional(),
  shareMode: z.enum(['shared', 'private_by_default']).optional(),
  defaultView: z.enum(['personal', 'family']).optional(),
});
export type UpdateMemberBody = z.infer<typeof updateMemberSchema>;

export const memberProfileQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});
export type MemberProfileQuery = z.infer<typeof memberProfileQuerySchema>;

export const familyCurveQuerySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});
export type FamilyCurveQuery = z.infer<typeof familyCurveQuerySchema>;

/** 账户可见性（家庭共享范围）。 */
export const accountVisibilitySchema = z.enum(['shared', 'private']);
export type AccountVisibilityBody = z.infer<typeof accountVisibilitySchema>;

// ===== Phase 6：AI 财富顾问（预测/预警/顾问/审批/趋势）=====
//
// 共享 Zod 原语，跨 user story 复用（forecast/alert/advisor/approval/trend）。
// 各 story 的具体请求体 schema 在对应实现任务中追加。

/** 目标月 / 期次月：YYYY-MM。 */
export const targetMonthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, '目标月格式应为 YYYY-MM');
export type TargetMonthParam = z.infer<typeof targetMonthSchema>;

/** 通用周期查询：?periodStart=&periodEnd=（YYYY-MM-DD）。 */
export const periodQuerySchema = z.object({
  periodStart: z.string().min(1).optional(),
  periodEnd: z.string().min(1).optional(),
});
export type PeriodQuery = z.infer<typeof periodQuerySchema>;

/** 风险等级（沿用 finance 域 RISK_LEVELS）。 */
export const riskLevelEnum = z.enum(['none', 'low', 'medium', 'high']);
export type RiskLevelParam = z.infer<typeof riskLevelEnum>;

/** 预警严重度（由 riskLevel 映射而来，不含 none）。 */
export const severityEnum = z.enum(['low', 'medium', 'high']);
export type SeverityParam = z.infer<typeof severityEnum>;

/** 智能预警种类（FR-002）。 */
export const alertKindEnum = z.enum([
  'emergency_shortfall',
  'savings_rate_decline',
  'debt_ratio_high',
  'trend_deterioration',
  'concentration',
]);
export type AlertKindParam = z.infer<typeof alertKindEnum>;

/** 预警状态（FR-008）。 */
export const alertStatusEnum = z.enum(['active', 'acknowledged', 'silenced']);
export type AlertStatusParam = z.infer<typeof alertStatusEnum>;

/** 预警列表查询状态（含 all 回看）。 */
export const alertQueryStatusEnum = z.enum([
  'active',
  'acknowledged',
  'silenced',
  'all',
]);
export type AlertQueryStatusParam = z.infer<typeof alertQueryStatusEnum>;

/** 审批状态机（FR-004 / SC-003）。 */
export const approvalStatusEnum = z.enum([
  'proposed',
  'pending',
  'approved',
  'rejected',
  'applied',
  'expired',
]);
export type ApprovalStatusParam = z.infer<typeof approvalStatusEnum>;

/** 审批动作种类白名单（FR-004 / 决策 6）。 */
export const approvalKindEnum = z.enum([
  'flag_transaction_anomaly',
  'rebalance_suggestion',
  'amend_finding_override',
  'create_transaction',
]);
export type ApprovalKindParam = z.infer<typeof approvalKindEnum>;

/** 预警列表查询：?status=。 */
export const alertQuerySchema = z.object({
  status: alertQueryStatusEnum.optional(),
});
export type AlertQuery = z.infer<typeof alertQuerySchema>;

// ===== Phase 6 US1：现金流预测 / 预警 请求 schema =====

/** 预测查询：?months=&target=YYYY-MM（months 从 query 字符串强制转数值）。 */
export const forecastQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).optional(),
  target: targetMonthSchema.optional(),
});
export type ForecastQuery = z.infer<typeof forecastQuerySchema>;

/** 预测重算请求体：{ targetMonth?, months? }。 */
export const forecastPostSchema = z.object({
  targetMonth: targetMonthSchema.optional(),
  months: z.number().int().min(1).max(24).optional(),
});
export type ForecastPostBody = z.infer<typeof forecastPostSchema>;

/** 单条预警状态更新：{ status: acknowledged | silenced }。 */
export const patchAlertSchema = z.object({
  status: z.enum(['acknowledged', 'silenced']),
});
export type PatchAlertBody = z.infer<typeof patchAlertSchema>;

/** 预警偏好更新：{ kind, muted?, mutedUntil?, channel? }（按 userId+kind upsert）。 */
export const patchAlertPreferenceSchema = z.object({
  kind: alertKindEnum,
  muted: z.boolean().optional(),
  mutedUntil: z.string().nullable().optional(),
  channel: z.string().max(20).nullable().optional(),
});
export type PatchAlertPreferenceBody = z.infer<typeof patchAlertPreferenceSchema>;

// ===== Phase 6 US2：顾问对话 / 审批 请求 schema =====

/** 新建顾问会话：{ title? }。 */
export const createAdvisorSessionSchema = z.object({
  title: z.string().max(120).optional(),
});
export type CreateAdvisorSessionBody = z.infer<typeof createAdvisorSessionSchema>;

/** 发送提问：{ content }。 */
export const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});
export type SendMessageBody = z.infer<typeof sendMessageSchema>;

/** 审批决定：{ decision: approve | reject }。 */
export const approvalDecisionSchema = z.object({
  decision: z.enum(['approve', 'reject']),
});
export type ApprovalDecisionBody = z.infer<typeof approvalDecisionSchema>;

// ===== Phase 6 US3：多期趋势对比 请求 schema =====

/**
 * 趋势对比查询：?metric=savings_rate,debt_ratio,score&periods=12
 * - metric：逗号分隔的指标列表（service 侧校验白名单）；缺省=全部指标。
 * - periods：回看期数（1–24，service 侧再 clamp；默认 12）。
 */
export const trendQuerySchema = z.object({
  metric: z.string().optional(),
  periods: z.coerce.number().int().min(1).max(24).optional(),
});
export type TrendQuery = z.infer<typeof trendQuerySchema>;

// ===== Phase 5：预算与目标 请求 schema =====

/** 阈值字符串：0.00–1.00。 */
const thresholdAmount = z
  .string()
  .refine((s) => Number.isFinite(Number(s)) && Number(s) >= 0 && Number(s) <= 1, {
    message: '阈值应为 0–1',
  });

/** 创建预算：categoryId 可空（总支出预算）；amount>0；periodType 默认 month；阈值默认 0.80。 */
export const createBudgetSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().max(100).nullable().optional(),
  amount: positiveAmount,
  periodType: z.enum(['month', 'week', 'year']).optional(),
  alertThreshold: thresholdAmount.optional(),
});
export type CreateBudgetBody = z.infer<typeof createBudgetSchema>;

/** 更新预算：categoryId 不可改（C6，故 omit）；其余可选。 */
export const updateBudgetSchema = z.object({
  name: z.string().max(100).nullable().optional(),
  amount: positiveAmount.optional(),
  periodType: z.enum(['month', 'week', 'year']).optional(),
  alertThreshold: thresholdAmount.optional(),
  active: z.boolean().optional(),
});
export type UpdateBudgetBody = z.infer<typeof updateBudgetSchema>;

/** 预算列表查询：?active=&period=YYYY-MM-DD。 */
export const budgetQuerySchema = z.object({
  active: z.enum(['true', 'false']).optional(),
  period: isoDateStr.optional(),
});
export type BudgetQuery = z.infer<typeof budgetQuerySchema>;

/** 预算预警查询：?period=&status=warning|overrun。 */
export const budgetAlertsQuerySchema = z.object({
  period: isoDateStr.optional(),
  status: z.enum(['warning', 'overrun']).optional(),
});
export type BudgetAlertsQuery = z.infer<typeof budgetAlertsQuerySchema>;

/** 历史周期区间查询：?from=&to=（YYYY-MM-DD）。 */
export const periodRangeSchema = z.object({
  from: isoDateStr.optional(),
  to: isoDateStr.optional(),
});
export type PeriodRangeQuery = z.infer<typeof periodRangeSchema>;

/** 创建目标：targetAmount>0；linked 须 linkedAccountIds 非空。 */
export const createGoalSchema = z
  .object({
    name: z.string().min(1).max(100),
    targetAmount: positiveAmount,
    targetDate: isoDateStr.nullable().optional(),
    progressBasis: z.enum(['manual', 'linked', 'net_worth']).optional(),
    linkedAccountIds: z.array(z.string().min(1)).optional(),
    manualAmount: moneyString.optional(),
    notes: z.string().max(500).nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if ((val.progressBasis ?? 'manual') === 'linked' &&
      (!val.linkedAccountIds || val.linkedAccountIds.length === 0)) {
      ctx.addIssue({
        code: 'custom',
        message: 'linked 口径需提供关联账户',
        path: ['linkedAccountIds'],
      });
    }
  });
export type CreateGoalBody = z.infer<typeof createGoalSchema>;

/** 更新目标：全部可选。 */
export const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetAmount: positiveAmount.optional(),
  targetDate: isoDateStr.nullable().optional(),
  progressBasis: z.enum(['manual', 'linked', 'net_worth']).optional(),
  linkedAccountIds: z.array(z.string().min(1)).optional(),
  manualAmount: moneyString.optional(),
  notes: z.string().max(500).nullable().optional(),
  status: z.enum(['active', 'archived']).optional(),
});
export type UpdateGoalBody = z.infer<typeof updateGoalSchema>;

/** 目标进度查询：?windowMonths=（默认 3）。 */
export const progressQuerySchema = z.object({
  windowMonths: z.coerce.number().int().min(1).max(12).optional(),
});
export type ProgressQuery = z.infer<typeof progressQuerySchema>;

// ===== Phase 7：高级分析（what-if / 个税 / 退休 / 组合）请求 schema =====

/** 家庭视角可选查询（?familyId=）。 */
export const familyQuerySchema = z.object({
  familyId: z.string().min(1).optional(),
});
export type FamilyQuery = z.infer<typeof familyQuerySchema>;

/** US1：创建 what-if 情景（I1：durationMonths ∈ [1, horizonMonths]）。 */
export const createScenarioSchema = z
  .object({
    name: z.string().min(1).max(120),
    kind: z.enum([
      'income_cut',
      'rate_hike',
      'lump_expense',
      'unemployment',
      'custom',
    ]),
    assumptions: z.object({
      incomeDeltaPct: z.number(),
      durationMonths: z.number().int().min(1),
      rateDeltaPct: z.number().nullable().optional(),
      lumpExpense: moneyString.nullable().optional(),
      affectedMonth: z.number().int().min(0).nullable().optional(),
    }),
    horizonMonths: z.number().int().min(1).max(60),
    familyId: z.string().min(1).optional(),
  })
  .refine((d) => d.assumptions.durationMonths <= d.horizonMonths, {
    message: 'durationMonths 不得超过 horizonMonths（I1）',
    path: ['assumptions', 'durationMonths'],
  });
export type CreateScenarioBody = z.infer<typeof createScenarioSchema>;

/** US2：个税估算。 */
export const taxEstimateSchema = z.object({
  taxYear: z.number().int().min(2000).max(2100),
  inputs: z.object({
    annualIncome: moneyString,
    insuranceAndFund: moneyString,
    specialDeductions: z.record(z.string(), moneyString).default({}),
    annualBonus: moneyString.nullable().optional(),
  }),
  familyId: z.string().min(1).optional(),
});
export type TaxEstimateBody = z.infer<typeof taxEstimateSchema>;

/** US2：取最近估算查询（?taxYear=&familyId=）。 */
export const taxYearQuerySchema = z.object({
  taxYear: z.coerce.number().int().optional(),
  familyId: z.string().min(1).optional(),
});
export type TaxYearQuery = z.infer<typeof taxYearQuerySchema>;

/** US3：退休模拟。 */
export const retirementSchema = z.object({
  assumptions: z.object({
    currentAge: z.number().int().min(0).max(120),
    retirementAge: z.number().int().min(0).max(120),
    monthlyContribution: moneyString,
    realReturnRatePct: z.number(),
    inflationPct: z.number(),
    postRetirementMonthlySpend: moneyString,
    withdrawalRatePct: z.number(),
  }),
  familyId: z.string().min(1).optional(),
});
export type RetirementBody = z.infer<typeof retirementSchema>;

/** US3/US4 interpret 请求体：仅可选 familyId。 */
export const familyBodySchema = z.object({
  familyId: z.string().min(1).optional(),
});
export type FamilyBody = z.infer<typeof familyBodySchema>;
