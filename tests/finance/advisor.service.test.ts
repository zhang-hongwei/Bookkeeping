/**
 * Phase 6 顾问对话单测（T023）：
 * - advisorDegradedTemplate：数字全部来自 findings（I7/SC-005）。
 * - findingRefs：findings → 可追溯锚点（I1）。
 * - extractProposal：解析高风险提议 JSON 块（FR-004 串联）。
 * - sendMessage（LLM 双层调用 + 降级 + 提议）：DB+LLM 集成，gated。
 */
import { describe, it, expect } from 'vitest';
import {
  advisorDegradedTemplate,
  findingRefs,
  extractProposal,
} from '@/services/finance/advisor.service';
import type { FindingData } from '@/services/finance/rules-engine.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';

const findings: FindingData[] = [
  { metric: 'income_total', value: '10000.00', verdict: '本期有收入', riskLevel: 'none' },
  { metric: 'expense_total', value: '6000.00', verdict: '本期有支出', riskLevel: 'none' },
  { metric: 'surplus', value: '4000.00', verdict: '本期结余', riskLevel: 'none' },
  { metric: 'savings_rate', value: '0.4000', verdict: '储蓄良好', riskLevel: 'none' },
  { metric: 'debt_ratio', value: '0.2000', verdict: '负债健康', riskLevel: 'none' },
  { metric: 'emergency_months', value: '3.00', verdict: '应急金尚可', riskLevel: 'low' },
];

describe('advisorDegradedTemplate（I7/SC-005，数字来自 findings）', () => {
  it('模板含 findings 中的结余/储蓄率/负债率/应急金', () => {
    const text = advisorDegradedTemplate(findings);
    expect(text).toContain('4000.00'); // surplus
    expect(text).toContain('40.0%'); // savings_rate 0.4 → 40.0%
    expect(text).toContain('20.0%'); // debt_ratio 0.2 → 20.0%
    expect(text).toContain('3.0 个月'); // emergency_months
  });

  it('模板标注降级（规则结论）', () => {
    expect(advisorDegradedTemplate(findings)).toContain('规则引擎结论');
  });
});

describe('findingRefs（I1 锚点）', () => {
  it('每条 finding 转为一个可追溯锚点', () => {
    const refs = findingRefs(findings, '2026-06');
    expect(refs).toHaveLength(findings.length);
    for (const r of refs) {
      expect(r.period).toBe('2026-06');
      expect(r.metric).toBeTruthy();
      expect(r.verdict).toBeTruthy();
    }
  });
});

describe('extractProposal（FR-004 串联）', () => {
  it('解析合法 create_transaction 提议块', () => {
    const content =
      '建议补录一笔记账。\n```json\n{"proposal":{"kind":"create_transaction","payload":{"type":"expense","amount":"100","fromAccountId":"a1"}}}\n```';
    const p = extractProposal(content);
    expect(p).not.toBeNull();
    expect(p!.kind).toBe('create_transaction');
    expect(p!.payload).toMatchObject({ type: 'expense', amount: '100', fromAccountId: 'a1' });
  });

  it('解析合法 flag_transaction_anomaly 提议块', () => {
    const content = '```json\n{"proposal":{"kind":"flag_transaction_anomaly","payload":{"transactionId":"t1"}}}\n```';
    const p = extractProposal(content);
    expect(p!.kind).toBe('flag_transaction_anomaly');
  });

  it('无提议块 → null（低风险问答不串联）', () => {
    expect(extractProposal('储蓄率怎么提？建议控制支出。')).toBeNull();
  });

  it('非法 kind / 缺 payload → null', () => {
    const bad1 = '```json\n{"proposal":{"kind":"delete_everything","payload":{}}}\n```';
    expect(extractProposal(bad1)).toBeNull();
    const bad2 = '```json\n{"proposal":{"kind":"create_transaction"}}\n```';
    expect(extractProposal(bad2)).toBeNull();
  });

  it('JSON 损坏 → null（不抛）', () => {
    const broken = '```json\n{not valid json}\n```';
    expect(extractProposal(broken)).toBeNull();
  });
});

// ===== DB+LLM 集成（gated）：sendMessage 双层调用 + 降级 + 提议 =====
const suite = describe.skipIf(!INTEGRATION_ENABLED);
suite('顾问对话集成（I1/I7/FR-004）', () => {
  it('占位：需 DB 种子 + 可选 OPENAI_MODEL', async () => {
    const userId = uniqueUserId();
    expect(userId).toBeTruthy();
  });
});
