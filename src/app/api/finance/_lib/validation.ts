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
