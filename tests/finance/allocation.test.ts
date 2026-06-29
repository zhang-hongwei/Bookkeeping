/**
 * US4 资产配置 / 集中度预警纯函数测试（T042/T045）—— computeConcentrationAlert。
 *
 * 无 DB，立即执行。SC-005：单一持仓占比超阈值 → warn 提示（仅提示，不代为操作）。
 */
import { describe, it, expect } from 'vitest';
import { computeConcentrationAlert } from '@/services/finance/rules-engine.service';

describe('computeConcentrationAlert（集中度预警，SC-005）', () => {
  it('无持仓 / 总市值为 0 → 无预警', () => {
    expect(computeConcentrationAlert([])).toBeNull();
    expect(computeConcentrationAlert([{ marketValue: '0' }, { marketValue: '0' }])).toBeNull();
  });

  it('最大占比未超阈值（50% < 60%）→ 无预警', () => {
    const alert = computeConcentrationAlert([
      { marketValue: '5000.00' },
      { marketValue: '5000.00' },
    ]);
    expect(alert).toBeNull();
  });

  it('最大占比超阈值（65% > 60%）→ warn 预警，含占比与阈值', () => {
    const alert = computeConcentrationAlert([
      { marketValue: '6500.00' },
      { marketValue: '3500.00' },
    ]);
    expect(alert).not.toBeNull();
    expect(alert!.code).toBe('CONCENTRATION');
    expect(alert!.severity).toBe('warn');
    expect(Number(alert!.ratio)).toBeGreaterThan(0.6);
    expect(Number(alert!.threshold)).toBeCloseTo(0.6, 6);
    expect(alert!.message).toContain('集中度');
  });

  it('自定义阈值（30%）：35% > 30% → 预警', () => {
    const alert = computeConcentrationAlert(
      [{ marketValue: '3500.00' }, { marketValue: '6500.00' }],
      0.3,
    );
    expect(alert).not.toBeNull();
    expect(Number(alert!.ratio)).toBeGreaterThan(0.3);
  });

  it('三持仓均衡（各 1/3）→ 无预警', () => {
    const alert = computeConcentrationAlert([
      { marketValue: '3333.33' },
      { marketValue: '3333.33' },
      { marketValue: '3333.34' },
    ]);
    expect(alert).toBeNull();
  });
});
