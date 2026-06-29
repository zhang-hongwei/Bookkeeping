/**
 * US3 单元测试（T028）：报告零幻觉 + 数据指纹（stale 检测）。
 * - degradedTemplate：数字全部来自 findings（零幻觉）。
 * - computeSourceDataHash：相同输入同指纹、不同输入异指纹（stale 判定依据）。
 */
import { describe, it, expect } from 'vitest';
import { computeSourceDataHash, degradedTemplate } from '@/services/finance/report.service';
import { computeFindingsFromData } from '@/services/finance/rules-engine.service';

describe('computeSourceDataHash（数据指纹 / stale 检测）', () => {
  const base = {
    incomeTotal: '100',
    expenseTotal: '50',
    totalAssets: '1000',
    totalLiabilities: '0',
    cashAssets: '500',
  };

  it('相同数据 → 相同指纹（确定性）', () => {
    expect(computeSourceDataHash(base)).toBe(computeSourceDataHash(base));
  });

  it('数据变化 → 指纹变化（stale 触发条件）', () => {
    const changed = { ...base, incomeTotal: '200' };
    expect(computeSourceDataHash(changed)).not.toBe(computeSourceDataHash(base));
  });
});

describe('degradedTemplate（LLM 失败模板降级，零幻觉）', () => {
  it('模板中的数字全部取自 findings', () => {
    const findings = computeFindingsFromData({
      incomeTotal: '10000',
      expenseTotal: '6000',
      totalAssets: '50000',
      totalLiabilities: '10000',
      cashAssets: '18000',
    });
    const tpl = degradedTemplate(findings);
    expect(tpl).toContain('10000.00'); // income
    expect(tpl).toContain('6000.00'); // expense
    expect(tpl).toContain('40.0%'); // savings_rate 0.4 → 40.0%
    expect(tpl).toContain('3.0 个月'); // emergency 18000/6000=3.00 → 3.0
  });
});
