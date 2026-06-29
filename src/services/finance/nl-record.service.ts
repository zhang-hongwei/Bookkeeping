/**
 * 自然语言记账（US4）：一句话 → 候选交易（不落库，交用户确认）。
 *
 * - 用 Vercel AI SDK generateObject（structured output，Zod schema）解析一句话。
 * - 候选解析纯函数 rawToCandidate 与 AI 调用分离，便于单测（SC-005）。
 * - 默认 occurredAt=now、accountId=用户首个账户；分类按名匹配。
 *
 * 模型配置沿用项目约定：OPENAI_BASE_URL / OPENAI_AUTH_TOKEN / OPENAI_MODEL。
 */
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import type { TransactionType } from '@/database/schema/finance';
import { accountRepository } from '@/repositories/finance/account.repository';
import { categoryRepository } from '@/repositories/finance/category.repository';

export interface RawNlParse {
  type: TransactionType | null;
  amount: number | null;
  category?: string | null;
  note?: string | null;
  occurredAt?: string | null;
  confidence?: number | null;
  reason?: string | null;
}

export interface NlCandidate {
  type: TransactionType;
  amount: string;
  categoryId?: string;
  accountId?: string;
  occurredAt?: string;
  note?: string;
}

export interface NlRecordResult {
  candidate: NlCandidate | null;
  confidence: number;
  reason?: string;
}

const nlSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']).nullable(),
  amount: z.number().nullable(),
  category: z.string().nullable(),
  note: z.string().nullable(),
  occurredAt: z.string().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  reason: z.string().nullable(),
});

/**
 * 纯函数：把 AI 原始解析映射为候选交易。
 * - type/amount 缺失或金额非正 → candidate:null + reason。
 * - 分类按名解析（resolveCategoryId 注入，便于单测）。
 */
export function rawToCandidate(
  raw: RawNlParse,
  opts: {
    defaultAccountId?: string;
    resolveCategoryId?: (name: string, type: TransactionType) => string | undefined;
  } = {},
): NlRecordResult {
  if (!raw || raw.type == null || raw.amount == null || !(raw.amount > 0)) {
    return {
      candidate: null,
      confidence: 0,
      reason: raw?.reason || '无法解析为有效交易',
    };
  }
  const categoryId = opts.resolveCategoryId
    ? opts.resolveCategoryId(raw.category ?? '', raw.type)
    : undefined;
  return {
    candidate: {
      type: raw.type,
      amount: raw.amount.toFixed(2),
      categoryId,
      accountId: opts.defaultAccountId,
      occurredAt: raw.occurredAt ?? undefined,
      note: raw.note ?? raw.category ?? undefined,
    },
    confidence: raw.confidence ?? 0.9,
  };
}

/** 调用 AI 模型解析一句话（structured output）。AI 未配置或失败 → 返回不可解析。 */
export async function callNlModel(text: string): Promise<RawNlParse> {
  const baseURL = process.env.OPENAI_BASE_URL;
  const apiKey = process.env.OPENAI_AUTH_TOKEN;
  const modelName = process.env.OPENAI_MODEL;
  if (!baseURL || !apiKey || !modelName) {
    return { type: null, amount: null, reason: 'AI 未配置（缺少 OPENAI_BASE_URL/AUTH_TOKEN/MODEL）' };
  }
  const openai = createOpenAI({ baseURL, apiKey });
  try {
    const { object } = await generateObject({
      model: openai(modelName),
      schema: nlSchema,
      system:
        '你是记账助手。把用户的一句话解析为一笔候选交易。' +
        '只抽取明确信息：收支类型、金额（必须为正）、分类名（中文，如「餐饮」）、备注、发生时间（ISO）。' +
        '若无法可靠解析（金额缺失/含义不明），type 与 amount 置 null 并在 reason 给出原因。',
      prompt: text,
    });
    return object;
  } catch (err) {
    return {
      type: null,
      amount: null,
      reason: `AI 解析失败：${err instanceof Error ? err.message : '未知错误'}`,
    };
  }
}

/** 端到端解析：AI → 候选（含默认账户/分类解析）。不落库。 */
export async function parseNaturalLanguage(
  userId: string,
  text: string,
): Promise<NlRecordResult> {
  const accounts = await accountRepository(userId).list();
  const categoryRepo = categoryRepository(userId);
  const raw = await callNlModel(text);

  // 分类解析是异步（查库），rawToCandidate 为纯同步函数，故先解析再注入。
  let resolvedCategoryId: string | undefined;
  if (raw.category) {
    const kind = raw.type === 'income' ? 'income' : 'expense';
    resolvedCategoryId = (await categoryRepo.autoCategorize(raw.category, kind))?.id;
  }

  return rawToCandidate(raw, {
    defaultAccountId: accounts[0]?.id,
    resolveCategoryId: (name) => (name && name === raw.category ? resolvedCategoryId : undefined),
  });
}
