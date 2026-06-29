/**
 * 家庭净资产聚合纯函数（Phase 4 Foundational）。
 *
 * 家庭净资产 = Σ 各成员净资产（research.md 决策2）。本函数把逐成员的净值结果求和，
 * 产出家庭合计 + memberBreakdown。无 DB 依赖、可单测（不变量 I1/I5）。
 *
 * 金额一律经「分」整数运算（toCents/fromCents），禁止浮点累加（I8）。
 */
import { toCents, fromCents } from './money';

/** 单成员净值（来自复用 computeNetWorthFromAccounts 的纯计算结果）。 */
export interface MemberNetWorth {
  memberId: string;
  netWorth: {
    totalAssets: string;
    totalLiabilities: string;
    netWorth: string;
  };
}

/** 家庭合并净值：合计 + 按成员拆分（memberId → netWorth 字符串）。 */
export interface FamilyNetWorth {
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  memberBreakdown: Record<string, string>;
}

/**
 * 逐成员净值求和 → 家庭净值。
 * memberBreakdown 的 key 为 memberId；其和 == 家庭 netWorth（I1：家庭=Σ成员）。
 */
export function sumMemberNetWorth(members: MemberNetWorth[]): FamilyNetWorth {
  let assetsCents = 0;
  let liabilitiesCents = 0;
  let netCents = 0;
  const memberBreakdown: Record<string, string> = {};
  for (const m of members) {
    assetsCents += toCents(m.netWorth.totalAssets);
    liabilitiesCents += toCents(m.netWorth.totalLiabilities);
    netCents += toCents(m.netWorth.netWorth);
    memberBreakdown[m.memberId] = m.netWorth.netWorth;
  }
  return {
    totalAssets: fromCents(assetsCents),
    totalLiabilities: fromCents(liabilitiesCents),
    // 与 Σ(totalAssets − totalLiabilities) 恒等；用 Σ成员净值以严格兑现「家庭=Σ成员」。
    netWorth: fromCents(netCents),
    memberBreakdown,
  };
}
