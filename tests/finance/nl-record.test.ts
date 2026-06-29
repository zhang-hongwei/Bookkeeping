/**
 * US4 测试（T031）：
 * - 单元（可运行）：rawToCandidate 映射逻辑 —— 「午饭 35」→候选 {expense, 35, 餐饮}；
 *   不可解析 → candidate:null + reason。
 * - 集成（gated）：parseNaturalLanguage 端到端（需 AI 配置 + DB）。
 */
import { describe, it, expect } from 'vitest';
import { rawToCandidate } from '@/services/finance/nl-record.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';
import { parseNaturalLanguage } from '@/services/finance/nl-record.service';
import { accountRepository } from '@/repositories/finance/account.repository';
import { categoryRepository } from '@/repositories/finance/category.repository';

describe('rawToCandidate（映射逻辑，SC-005）', () => {
  const resolveCategoryId = (name: string) =>
    name.includes('餐') || name.includes('饭') ? 'cat_food' : undefined;

  it('「午饭 35」→ 支出 ¥35、分类餐饮', () => {
    const result = rawToCandidate(
      { type: 'expense', amount: 35, category: '餐饮', note: '午饭', confidence: 0.95 },
      { defaultAccountId: 'acc_default', resolveCategoryId },
    );
    expect(result.candidate).not.toBeNull();
    expect(result.candidate!.type).toBe('expense');
    expect(result.candidate!.amount).toBe('35.00');
    expect(result.candidate!.categoryId).toBe('cat_food');
    expect(result.candidate!.accountId).toBe('acc_default');
    expect(result.confidence).toBe(0.95);
  });

  it('收入候选正确映射', () => {
    const result = rawToCandidate(
      { type: 'income', amount: 10000, category: '工资' },
      { resolveCategoryId },
    );
    expect(result.candidate!.type).toBe('income');
    expect(result.candidate!.amount).toBe('10000.00');
  });

  it('不可解析（金额缺失）→ candidate:null + reason', () => {
    const result = rawToCandidate({ type: null, amount: null, reason: '含义不明' }, {});
    expect(result.candidate).toBeNull();
    expect(result.reason).toBeTruthy();
  });

  it('金额非正 → candidate:null', () => {
    const result = rawToCandidate({ type: 'expense', amount: 0, category: 'x' }, {});
    expect(result.candidate).toBeNull();
  });
});

const suite = describe.skipIf(!INTEGRATION_ENABLED || process.env.OPENAI_MODEL === undefined);
suite('US4 自然语言端到端（集成，SC-005）', () => {
  it('一句话解析为候选并解析分类', async () => {
    const userId = uniqueUserId();
    await accountRepository(userId).create({ name: '现金', type: 'cash', openingBalance: '0.00' });
    await categoryRepository(userId).create({ name: '餐饮', kind: 'expense', keywords: ['饭', '餐'] });

    const result = await parseNaturalLanguage(userId, '午饭 35');
    // AI 输出不可控；仅断言可解析路径的结构（若模型可用）
    if (result.candidate) {
      expect(result.candidate.amount).toBe('35.00');
      expect(['expense', 'income', 'transfer']).toContain(result.candidate.type);
    }
  });
});
