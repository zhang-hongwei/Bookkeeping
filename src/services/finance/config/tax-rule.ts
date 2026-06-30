/**
 * 中国个税规则配置（版本化，NC1）。
 *
 * ⚠️ 占位配置：具体数值为公开的长期有效口径（综合所得七级累进 + 速算扣除），
 *    仅供引擎可计算/可测（SC-002）。**临近上线前必须按当时有效的《个人所得税法》
 *    及国家税务总局公告复核回填**，并升级 `ruleVintage`。
 *    引擎 `tax.engine.ts` 消费本配置（不硬编码），法规变更只改本文件。
 */

/** 超额累进税率档（年应纳税所得额）。 */
export interface TaxBracket {
  /** 档下限（年应纳税所得额，元；首档为 0）。 */
  threshold: number;
  /** 该档税率（0–1，如 0.03）。 */
  rate: number;
  /** 速算扣除数（元）。 */
  quickDeduction: number;
}

/** 专项附加扣除目录（年定额，元；NC1）。0 表示按实际填报（如大病医疗），由 inputs 提供。 */
export type SpecialDeductionAmounts = Record<string, number>;

export interface TaxRuleConfig {
  /** 规则版本（落表溯源，I7），如 `PRC-IIT-2026`。 */
  ruleVintage: string;
  /** 综合所得七级超额累进年税率表（按 threshold 升序）。 */
  brackets: TaxBracket[];
  /** 基本减除费用（月，元；5000/月）。 */
  basicDeductionMonthly: number;
  /** 专项附加扣除目录年定额（占位；临近上线按当时办法复核）。 */
  specialDeductions: SpecialDeductionAmounts;
}

/** 当前生效配置。 */
export const taxRuleConfig: TaxRuleConfig = {
  ruleVintage: 'PRC-IIT-2026',
  // 综合所得（工资薪金等）年税率表（2018 起长期口径，TODO：按当期公告复核）
  brackets: [
    { threshold: 0, rate: 0.03, quickDeduction: 0 },
    { threshold: 36000, rate: 0.1, quickDeduction: 2520 },
    { threshold: 144000, rate: 0.2, quickDeduction: 16920 },
    { threshold: 300000, rate: 0.25, quickDeduction: 31920 },
    { threshold: 420000, rate: 0.3, quickDeduction: 52920 },
    { threshold: 660000, rate: 0.35, quickDeduction: 85920 },
    { threshold: 960000, rate: 0.45, quickDeduction: 181920 },
  ],
  basicDeductionMonthly: 5000,
  // 专项附加扣除年定额占位（TODO：按《个人所得税专项附加扣除暂行办法》当期口径复核）
  specialDeductions: {
    children_education: 24000, // 2000/月 × 12（每孩）
    continuing_education: 4800, // 400/月 × 12（占位）
    serious_illness: 0, // 按实际填报，非定额
    housing_loan_interest: 12000, // 1000/月 × 12
    housing_rent: 12000, // 城市差异，占位 1000/月 × 12
    supporting_elderly: 24000, // 独生/非独差异，占位 2000/月 × 12
    infant_care: 24000, // 2000/月 × 12（每孩）
  },
};
