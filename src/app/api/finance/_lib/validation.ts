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
  dueDate: z.string().nullable().optional(),
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
  dueDate: z.string().nullable().optional(),
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
