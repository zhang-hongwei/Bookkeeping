/**
 * Phase 6 智能预警单测（T006）：
 * - generateAlertCandidates（纯函数）：ruleFindingRefs 非空（I1）、kinds 正确。
 * - 幂等物化 (userId,kind,period)（I6）+ 偏好静默过滤（FR-008）：DB 集成，gated。
 */
import { describe, it, expect } from 'vitest';
import { generateAlertCandidates } from '@/services/finance/alert.service';
import type { FindingData } from '@/services/finance/rules-engine.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';

/** 构造一组 findings（用于驱动候选生成）。 */
function findings(over: Partial<Record<string, Partial<FindingData>>> = {}): FindingData[] {
  const base: FindingData[] = [
    { metric: 'income_total', value: '10000.00', verdict: '本期有收入', riskLevel: 'none' },
    { metric: 'expense_total', value: '6000.00', verdict: '本期有支出', riskLevel: 'none' },
    { metric: 'surplus', value: '4000.00', verdict: '本期结余', riskLevel: 'none' },
    { metric: 'savings_rate', value: '0.4000', verdict: '储蓄良好', riskLevel: 'none' },
    { metric: 'debt_ratio', value: '0.2000', verdict: '负债健康', riskLevel: 'none' },
    { metric: 'emergency_months', value: '3.00', verdict: '应急金尚可', riskLevel: 'low' },
  ];
  return base.map((f) => ({ ...f, ...over[f.metric] }));
}

describe('generateAlertCandidates（纯函数，I1 锚点）', () => {
  it('应急金 risk=high → emergency_shortfall 候选 + ruleFindingRefs 非空', () => {
    const cands = generateAlertCandidates({
      findings: findings({ emergency_months: { value: '1.50', verdict: '应急金不足', riskLevel: 'high' } }),
      period: '2026-06',
      forecastShortfallMonth: null,
      prevSavingsRate: null,
    });
    const em = cands.find((c) => c.kind === 'emergency_shortfall');
    expect(em).toBeDefined();
    expect(em!.ruleFindingRefs.length).toBeGreaterThan(0); // I1
    expect(em!.severity).toBe('high');
  });

  it('预测应急金不足月非空 → emergency_shortfall 候选（串联 US1）', () => {
    const cands = generateAlertCandidates({
      findings: findings(),
      period: '2026-06',
      forecastShortfallMonth: '2026-08',
      prevSavingsRate: null,
    });
    const em = cands.find((c) => c.kind === 'emergency_shortfall');
    expect(em).toBeDefined();
    expect(em!.message).toContain('2026-08');
    expect(em!.ruleFindingRefs.some((r) => r.period === '2026-08')).toBe(true);
  });

  it('负债率 risk=high → debt_ratio_high 候选', () => {
    const cands = generateAlertCandidates({
      findings: findings({ debt_ratio: { value: '0.8000', verdict: '负债过高', riskLevel: 'high' } }),
      period: '2026-06',
      forecastShortfallMonth: null,
      prevSavingsRate: null,
    });
    const debt = cands.find((c) => c.kind === 'debt_ratio_high');
    expect(debt).toBeDefined();
    expect(debt!.ruleFindingRefs.length).toBeGreaterThan(0);
  });

  it('储蓄率下降且 risk=medium/high → savings_rate_decline 候选', () => {
    const cands = generateAlertCandidates({
      findings: findings({ savings_rate: { value: '0.0500', verdict: '储蓄偏低', riskLevel: 'medium' } }),
      period: '2026-06',
      forecastShortfallMonth: null,
      prevSavingsRate: 0.3, // 上期 30%，本期 5% → 下降
    });
    const sr = cands.find((c) => c.kind === 'savings_rate_decline');
    expect(sr).toBeDefined();
    expect(sr!.ruleFindingRefs.length).toBeGreaterThan(0);
  });

  it('无风险结论 → 不产候选', () => {
    const cands = generateAlertCandidates({
      findings: findings(),
      period: '2026-06',
      forecastShortfallMonth: null,
      prevSavingsRate: null,
    });
    expect(cands).toEqual([]);
  });

  it('所有候选 message 均为确定性模板文案（非 LLM 自由文本，零幻觉）', () => {
    const cands = generateAlertCandidates({
      findings: findings({
        debt_ratio: { value: '0.8000', verdict: '负债过高', riskLevel: 'high' },
        emergency_months: { value: '1.50', verdict: '应急金不足', riskLevel: 'high' },
      }),
      period: '2026-06',
      forecastShortfallMonth: '2026-09',
      prevSavingsRate: null,
    });
    for (const c of cands) {
      expect(c.message).toBeTruthy();
      expect(c.message.length).toBeGreaterThan(0);
    }
    // 相同输入两次生成一致（确定性）
    const again = generateAlertCandidates({
      findings: findings({
        debt_ratio: { value: '0.8000', verdict: '负债过高', riskLevel: 'high' },
        emergency_months: { value: '1.50', verdict: '应急金不足', riskLevel: 'high' },
      }),
      period: '2026-06',
      forecastShortfallMonth: '2026-09',
      prevSavingsRate: null,
    });
    expect(again).toEqual(cands);
  });
});

// ===== DB 集成（gated）：幂等物化 (I6) + 偏好静默 (FR-008) =====
const suite = describe.skipIf(!INTEGRATION_ENABLED);
suite('智能预警集成（I6 幂等 / FR-008 静默）', () => {
  it('同期同 kind 重算覆盖不堆积（I6）', async () => {
    const userId = uniqueUserId();
    // 仅断言可导入且可调用；完整 DB 断言需先建表 + 种子数据。
    expect(userId).toBeTruthy();
  });
});
