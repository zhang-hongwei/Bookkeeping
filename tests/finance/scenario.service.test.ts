/**
 * US1 情景服务集成测试（T012/T020）—— 门控 FINANCE_INTEGRATION_TEST=1。
 *
 * 需真实 PostgreSQL（finance_* 表已建）。降级路径可在「空用户」下验证（无需种子数据）；
 * 可复现/I3 由纯函数引擎测试 projection.engine.test.ts 覆盖（始终运行）。
 *   FINANCE_INTEGRATION_TEST=1 pnpm test --run scenario.service
 */
import { describe, it, expect } from 'vitest';
import { computeScenario } from '@/services/finance/scenario.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';

const describeIntegration = INTEGRATION_ENABLED ? describe : describe.skip;

describeIntegration('scenario.service（US1 集成）', () => {
  it('空用户（无历史结余）→ status=degraded + missing，projections 为空（SC-005）', async () => {
    const userId = uniqueUserId();
    const { scenario, projections } = await computeScenario({
      userId,
      name: '降薪 30% 持续 6 个月',
      kind: 'income_cut',
      assumptions: { incomeDeltaPct: -0.3, durationMonths: 6 },
      horizonMonths: 12,
    });
    expect(scenario.status).toBe('degraded');
    expect(scenario.missing).toContain('historical_surplus');
    expect(projections).toHaveLength(0);
  });

  it('disclaimers 非空（SC-004 可追溯/免责）', async () => {
    const userId = uniqueUserId();
    const { scenario } = await computeScenario({
      userId,
      name: '测试',
      kind: 'custom',
      assumptions: { incomeDeltaPct: 0, durationMonths: 1 },
      horizonMonths: 6,
    });
    expect(scenario.disclaimers.length).toBeGreaterThan(0);
    expect(scenario.engineVersion).toMatch(/^projection@/);
  });
});
