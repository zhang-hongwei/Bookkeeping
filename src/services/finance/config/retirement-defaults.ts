/**
 * 退休模拟默认假设（版本化，NC3）。
 *
 * ⚠️ 占位配置：保守默认值，仅供引擎可计算/可测（SC-003）。
 *    - `realReturnRatePct` 取股债组合长期实际回报的历史区间下沿（保守，不承诺高收益）。
 *    - `withdrawalRatePct` 参考「4% 规则」经验值，UI 须显著标注其为经验假设。
 *    **临近上线按真实数据/产品定位复核回填。**
 *    UI 须显著标注这些为经验假设（SC-003）。
 */
export interface RetirementDefaults {
  /** 实际回报率（百分点/年，保守）。 */
  realReturnRatePct: number;
  /** 通胀率（百分点/年）。 */
  inflationPct: number;
  /** 安全提取率（百分点/年，经验假设「4% 规则」类）。 */
  withdrawalRatePct: number;
}

/** 当前生效默认（保守，占位）。 */
export const retirementDefaults: RetirementDefaults = {
  realReturnRatePct: 4.0, // 股债组合长期实际回报下沿（保守）
  inflationPct: 2.5,
  withdrawalRatePct: 4.0, // 经验假设，UI 须显著标注
};
