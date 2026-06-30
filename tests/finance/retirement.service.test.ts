/**
 * US3 退休服务集成测试（T032/T040）—— 门控 FINANCE_INTEGRATION_TEST=1。
 * 需真实 PostgreSQL。SC-003/SC-005 落表 + 三点单调 I8 + 不确定性免责 I9 + 可复现。
 *   FINANCE_INTEGRATION_TEST=1 pnpm test --run retirement.service
 */
import { describe, it, expect } from 'vitest';
import { computeRetirement } from '@/services/finance/retirement.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';

const describeIntegration = INTEGRATION_ENABLED ? describe : describe.skip;

describeIntegration('retirement.service（US3 集成）', () => {
  it('正常模拟落表含三点区间 + 不确定性免责（I8 单调 / I9）', async () => {
    const item = await computeRetirement({
      userId: uniqueUserId(),
      assumptions: {
        currentAge: 30,
        retirementAge: 60,
        monthlyContribution: '5000.00',
        realReturnRatePct: 4,
        inflationPct: 2.5,
        postRetirementMonthlySpend: '8000.00',
        withdrawalRatePct: 4,
      },
    });
    // I8：三点 corpus 单调（悲观 ≤ 中性 ≤ 乐观）
    const p = Number(item.resultPessimistic.retirementCorpus);
    const b = Number(item.resultBaseline.retirementCorpus);
    const o = Number(item.resultOptimistic.retirementCorpus);
    expect(p).toBeLessThanOrEqual(b);
    expect(b).toBeLessThanOrEqual(o);
    // I9：disclaimers 含不确定性提示（SC-003）
    expect(item.disclaimers.some((d) => /非确定预测|方向参考|假设/.test(d))).toBe(true);
    expect(item.status).toBe('ok');
    expect(item.sustainableVerdict).toMatch(/sustainable|marginal|insufficient/);
    expect(item.engineVersion).toMatch(/^projection@/);
  });

  it('无累积期（currentAge≥retirementAge）→ degraded + missing（SC-005 不编造）', async () => {
    const item = await computeRetirement({
      userId: uniqueUserId(),
      assumptions: {
        currentAge: 60,
        retirementAge: 60,
        monthlyContribution: '5000.00',
        realReturnRatePct: 4,
        inflationPct: 2.5,
        postRetirementMonthlySpend: '8000.00',
        withdrawalRatePct: 4,
      },
    });
    expect(item.status).toBe('degraded');
    expect(item.missing).toContain('accumulation_period');
  });

  it('月缴 ≤ 0 → degraded + missing monthly_contribution（SC-005）', async () => {
    const item = await computeRetirement({
      userId: uniqueUserId(),
      assumptions: {
        currentAge: 30,
        retirementAge: 60,
        monthlyContribution: '0.00',
        realReturnRatePct: 4,
        inflationPct: 2.5,
        postRetirementMonthlySpend: '8000.00',
        withdrawalRatePct: 4,
      },
    });
    expect(item.status).toBe('degraded');
    expect(item.missing).toContain('monthly_contribution');
  });

  it('同输入可复现（确定性引擎，中性 corpus 稳定）', async () => {
    const base = {
      currentAge: 35,
      retirementAge: 60,
      monthlyContribution: '3000.00',
      realReturnRatePct: 5,
      inflationPct: 2,
      postRetirementMonthlySpend: '7000.00',
      withdrawalRatePct: 4,
    };
    const a = await computeRetirement({ userId: uniqueUserId(), assumptions: base });
    const b = await computeRetirement({ userId: uniqueUserId(), assumptions: base });
    expect(a.resultBaseline.retirementCorpus).toBe(b.resultBaseline.retirementCorpus);
  });
});
