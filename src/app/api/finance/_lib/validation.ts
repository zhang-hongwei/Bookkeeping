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

export const createTransactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer']),
    amount: positiveAmount,
    fromAccountId: z.string().nullable().optional(),
    toAccountId: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    occurredAt: z.string().optional(),
    note: z.string().max(500).optional(),
    source: z.enum(['manual', 'import', 'nl', 'ocr']).optional(),
  })
  .superRefine((val, ctx) => {
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

export const patchTransactionSchema = createTransactionSchema.partial();
export type PatchTransactionBody = z.infer<typeof patchTransactionSchema>;

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['cash', 'savings', 'credit', 'investment', 'real_asset']),
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

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  kind: z.enum(['income', 'expense', 'transfer']),
  parentId: z.string().nullable().optional(),
  keywords: z.array(z.string()).optional(),
});
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
