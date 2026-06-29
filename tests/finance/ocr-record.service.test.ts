/**
 * US2 单元测试（T021）：OCR 候选映射 —— 多笔/低置信/无法识别/非法金额。
 *
 * 纯函数 mapOcrResult 可运行；多模态端到端见 gated。
 */
import { describe, it, expect } from 'vitest';
import { mapOcrResult } from '@/services/finance/ocr-record.service';

const resolveCat = (name: string) => (name.includes('餐') ? 'cat_food' : undefined);

describe('mapOcrResult', () => {
  it('单笔高置信 → 1 候选，无需人工确认', () => {
    const r = mapOcrResult(
      { candidates: [{ type: 'expense', amount: 35, counterparty: '美团', category: '餐饮' }], confidence: 0.92 },
      { resolveCategoryId: resolveCat },
    );
    expect(r.candidates).toHaveLength(1);
    expect(r.candidates[0].amount).toBe('35.00');
    expect(r.candidates[0].categoryId).toBe('cat_food');
    expect(r.requireManualConfirm).toBe(false);
  });

  it('多笔 → 强制人工确认', () => {
    const r = mapOcrResult(
      { candidates: [{ type: 'expense', amount: 10 }, { type: 'expense', amount: 20 }], confidence: 0.9 },
    );
    expect(r.candidates).toHaveLength(2);
    expect(r.requireManualConfirm).toBe(true);
  });

  it('低置信度 → 强制人工确认', () => {
    const r = mapOcrResult(
      { candidates: [{ type: 'expense', amount: 10 }], confidence: 0.5 },
    );
    expect(r.requireManualConfirm).toBe(true);
  });

  it('空候选 → reason，前端手动补全', () => {
    const r = mapOcrResult({ candidates: [], confidence: 0, reason: 'image_unclear' });
    expect(r.candidates).toHaveLength(0);
    expect(r.reason).toBe('image_unclear');
  });

  it('amount<=0 的候选被丢弃', () => {
    const r = mapOcrResult(
      { candidates: [{ type: 'expense', amount: 0 }, { type: 'expense', amount: 10 }], confidence: 0.9 },
    );
    expect(r.candidates).toHaveLength(1);
  });
});
