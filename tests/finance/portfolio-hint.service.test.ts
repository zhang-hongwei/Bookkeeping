/**
 * US4 组合服务集成测试（T042/T050）—— 门控 FINANCE_INTEGRATION_TEST=1。
 * 需真实 PostgreSQL + positions 表。SC-004/SC-005 落表 + targetBandsVersion/disclaimers 溯源（I10/I11）。
 *   FINANCE_INTEGRATION_TEST=1 pnpm test --run portfolio-hint.service
 */
import { describe, it, expect } from 'vitest';
import { computeHintsForUser, getLatestStoredHints } from '@/services/finance/portfolio-hint.service';
import { targetBands } from '@/services/finance/config/target-bands';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';

const describeIntegration = INTEGRATION_ENABLED ? describe : describe.skip;

describeIntegration('portfolio-hint.service（US4 集成）', () => {
  it('无持仓 → hints 空（NC6 不编造），仍返回 batchId + 免责（SC-004/SC-005）', async () => {
    const result = await computeHintsForUser({ userId: uniqueUserId() });
    expect(result.hints).toEqual([]);
    expect(result.totalMarketValue).toBe('0.00');
    expect(result.targetBandsVersion).toBe(targetBands.targetBandsVersion);
    expect(result.disclaimers.some((d) => d.includes('非投资建议'))).toBe(true);
  });

  it('最近落表批次可读回（getLatestStoredHints，无则 null）', async () => {
    const userId = uniqueUserId();
    expect(await getLatestStoredHints(userId)).toBeNull();
    await computeHintsForUser({ userId });
    // 无持仓 → 空批次，getLatestStoredHints 返回 null（items 为空）
    expect(await getLatestStoredHints(userId)).toBeNull();
  });
});
