/**
 * 投资组合目标配置区间（版本化，NC4）。
 *
 * ⚠️ 占位配置：各资产类别目标占比区间为经验默认值，仅供引擎可计算/可测（SC-004）。
 *    不同风险偏好应可配；**临近上线按产品定位复核回填**，并升级 `targetBandsVersion`。
 *    引擎 `portfolio-hint.engine.ts` 消费本配置（不硬编码）。
 */
import type { TargetBand } from '@/database/schema/finance/portfolio-hints';

/** 资产类别 → 目标占比区间（0–1）。复用 Phase 3 allocation 类别（现金/固收/权益/另类）。 */
export type TargetBands = Record<string, TargetBand>;

export interface TargetBandsConfig {
  /** band 配置版本（落表溯源，NC4/NC7）。 */
  targetBandsVersion: string;
  /** 各资产类别目标区间。 */
  bands: TargetBands;
}

/** 当前生效配置（中等风险偏好默认，占位）。 */
export const targetBands: TargetBandsConfig = {
  targetBandsVersion: 'balanced-2026',
  bands: {
    // 现金类：流动性缓冲，低占比
    cash: { min: 0.05, max: 0.15 },
    // 固定收益：稳定基底
    fixed_income: { min: 0.2, max: 0.4 },
    // 权益：增长引擎
    equity: { min: 0.3, max: 0.6 },
    // 另类（商品/另类）：分散，小占比
    alternative: { min: 0.0, max: 0.15 },
  },
};
