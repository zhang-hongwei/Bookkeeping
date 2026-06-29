/**
 * 截图 OCR 记账（US2）：支付截图 → 多模态 AI → 候选交易（不落库，确认后走 ledger source=ocr）。
 *
 * - 多模态 generateObject（structured output）识别图片。
 * - 多笔 / 低置信度 → requireManualConfirm=true（强制人工确认）。
 * - 无法识别 → candidates:[] + reason（前端手动补全）。
 *
 * mapOcrResult 为纯函数（可单测），与多模态调用分离。
 */
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import type { TransactionType } from '@/database/schema/finance';
import { accountRepository } from '@/repositories/finance/account.repository';
import { categoryRepository } from '@/repositories/finance/category.repository';

export interface OcrCandidate {
  type: TransactionType;
  amount: string;
  counterparty?: string;
  note?: string;
  occurredAt?: string;
  categoryId?: string;
  accountId?: string;
}

export interface OcrRawCandidate {
  type: TransactionType;
  amount: number | null;
  counterparty?: string | null;
  note?: string | null;
  occurredAt?: string | null;
  category?: string | null;
}

export interface OcrRawResult {
  candidates: OcrRawCandidate[];
  confidence: number;
  requireManualConfirm?: boolean;
  reason?: string | null;
}

export interface OcrRecordResult {
  candidates: OcrCandidate[];
  confidence: number;
  requireManualConfirm: boolean;
  reason?: string;
}

/** 低置信度阈值：低于此值强制人工确认。 */
const LOW_CONFIDENCE = 0.7;

const ocrSchema = z.object({
  candidates: z
    .array(
      z.object({
        type: z.enum(['income', 'expense', 'transfer']),
        amount: z.number().nullable(),
        counterparty: z.string().nullable(),
        note: z.string().nullable(),
        occurredAt: z.string().nullable(),
        category: z.string().nullable(),
      }),
    )
    .max(5),
  confidence: z.number().min(0).max(1),
  requireManualConfirm: z.boolean(),
  reason: z.string().nullable(),
});

/**
 * 纯函数：把多模态原始结果映射为候选交易。
 * - 候选空 → reason。
 * - 多笔 / 低置信 → requireManualConfirm=true。
 * - amount 非正的候选被丢弃。
 */
export function mapOcrResult(
  raw: OcrRawResult,
  opts: {
    defaultAccountId?: string;
    resolveCategoryId?: (name: string, type: TransactionType) => string | undefined;
  } = {},
): OcrRecordResult {
  const valid = (raw.candidates ?? []).filter((c) => c.amount != null && c.amount > 0);
  if (valid.length === 0) {
    return {
      candidates: [],
      confidence: raw.confidence ?? 0,
      requireManualConfirm: false,
      reason: raw.reason ?? 'image_unclear',
    };
  }
  const candidates: OcrCandidate[] = valid.map((c) => ({
    type: c.type,
    amount: c.amount!.toFixed(2),
    counterparty: c.counterparty ?? undefined,
    note: c.note ?? c.category ?? undefined,
    occurredAt: c.occurredAt ?? undefined,
    categoryId: opts.resolveCategoryId
      ? opts.resolveCategoryId(c.category ?? '', c.type)
      : undefined,
    accountId: opts.defaultAccountId,
  }));
  const requireManualConfirm =
    raw.requireManualConfirm === true ||
    candidates.length > 1 ||
    (raw.confidence ?? 0) < LOW_CONFIDENCE;
  return {
    candidates,
    confidence: raw.confidence ?? 0,
    requireManualConfirm,
  };
}

/** 调用多模态模型识别图片（base64）。未配置或失败 → 不可识别。 */
export async function callOcrModel(imageBase64: string): Promise<OcrRawResult> {
  const baseURL = process.env.OPENAI_BASE_URL;
  const apiKey = process.env.OPENAI_AUTH_TOKEN;
  const modelName = process.env.OPENAI_MODEL;
  if (!baseURL || !apiKey || !modelName) {
    return { candidates: [], confidence: 0, reason: 'AI 未配置（缺少 OPENAI_BASE_URL/AUTH_TOKEN/MODEL）' };
  }
  const openai = createOpenAI({ baseURL, apiKey });
  try {
    const { object } = await generateObject({
      model: openai(modelName),
      schema: ocrSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', image: imageBase64 },
            {
              type: 'text',
              text:
                '识别这张支付截图中的交易。抽取每笔的收支类型、金额（>0）、对方、备注、时间、分类名（中文）。' +
                '多笔逐条拆分；无法可靠识别则 candidates 置空并在 reason 给出原因。',
            },
          ],
        },
      ],
    });
    return object;
  } catch (err) {
    return {
      candidates: [],
      confidence: 0,
      reason: `OCR 失败：${err instanceof Error ? err.message : '未知错误'}`,
    };
  }
}

/** 端到端：图片 → 候选（含默认账户/分类解析）。不落库。 */
export async function parseImage(userId: string, imageBase64: string): Promise<OcrRecordResult> {
  const accounts = await accountRepository(userId).list();
  const categoryRepo = categoryRepository(userId);
  const raw = await callOcrModel(imageBase64);

  // 分类解析是异步（查库），mapOcrResult 为纯同步，故先批量预解析候选分类名 → id。
  const categoryCache = new Map<string, string | undefined>();
  for (const c of raw.candidates) {
    const name = c.category ?? '';
    if (name && !categoryCache.has(name)) {
      const kind = c.type === 'income' ? 'income' : 'expense';
      categoryCache.set(name, (await categoryRepo.autoCategorize(name, kind))?.id);
    }
  }

  return mapOcrResult(raw, {
    defaultAccountId: accounts[0]?.id,
    resolveCategoryId: (name) => categoryCache.get(name),
  });
}
