/**
 * 预算/目标规则事实装配（Phase 5，US3，FR-008/SC-004）。
 *
 * 把 US1 的 BudgetAlert（T013）与 US2 的 GoalProgress（T028）转为**结构化事实**
 *（同构 FindingData 的 value/verdict/riskLevel 哲学），作为 AI 月报的只读输入。
 *
 * 红线（决策3 / SC-004）：数值结论 100% 来自规则层纯函数对账目的计算，可逐项追溯、
 * 可复现；LLM 仅做个性化表达，**不得**重新计算或编造金额。
 */
import type { RiskLevel } from '@/database/schema/finance';
import { listBudgetAlerts } from './budget.service';
import { listGoalsWithProgress, DEFAULT_ETA_WINDOW_MONTHS } from './goal.service';

/** 预算/目标结构化事实（metric 为 budget_ 与 goal_ 前缀，宽松于 FindingMetric 枚举）。 */
export interface BudgetGoalFact {
  metric: string;
  value: string | null;
  verdict: string;
  riskLevel: RiskLevel;
}

/**
 * 收集预算超支 + 目标进度/ETA 事实（决策 3）。
 * - 预算：overrun/warning 的 BudgetAlert（value=超支额或已用比，verdict 含分类与额度）。
 * - 目标：每个目标的进度率 + ETA 状态（unreachable 标 high）。
 * - 全部为派生自账目/净资产的确定性结论（I1/I4），LLM 只引用不编造。
 */
export async function collectBudgetGoalFacts(
  userId: string,
  windowMonths: number = DEFAULT_ETA_WINDOW_MONTHS,
): Promise<BudgetGoalFact[]> {
  const facts: BudgetGoalFact[] = [];

  // 预算超支/预警（仅 warning+overrun 进事实；normal 不打扰）
  const alerts = await listBudgetAlerts(userId, {});
  for (const a of alerts) {
    if (a.status === 'overrun') {
      const over = Number(a.spent) - Number(a.budgetAmount);
      facts.push({
        metric: 'budget_overrun',
        value: over.toFixed(2),
        verdict: `${a.verdict}（额度 ${a.budgetAmount}，已用 ${a.spent}，超支 ${over.toFixed(2)}）`,
        riskLevel: 'high',
      });
    } else if (a.status === 'warning') {
      facts.push({
        metric: 'budget_warning',
        value: a.ratio,
        verdict: `${a.verdict}（额度 ${a.budgetAmount}，已用 ${a.spent}）`,
        riskLevel: 'medium',
      });
    }
  }

  // 目标进度 + ETA
  const goals = await listGoalsWithProgress(userId, { windowMonths });
  for (const g of goals) {
    const pct = (Number(g.progressRate) * 100).toFixed(0);
    if (g.eta.etaStatus === 'unreachable') {
      facts.push({
        metric: 'goal_unreachable',
        value: g.progressRate,
        verdict: `目标「${g.name}」进度 ${pct}%，按近期结余节奏无法达成（月均结余 ${g.eta.avgMonthlySurplus}），需调整。`,
        riskLevel: 'high',
      });
    } else if (g.completed) {
      facts.push({
        metric: 'goal_completed',
        value: g.progressRate,
        verdict: `目标「${g.name}」已达成（${pct}%）。`,
        riskLevel: 'none',
      });
    } else {
      const etaDesc = g.eta.etaDate
        ? `预计 ${g.eta.etaDate} 达成（约 ${g.eta.monthsToGoal} 个月）`
        : g.eta.etaStatus === 'at_risk'
          ? '预计达成已晚于目标日'
          : '开放式目标，仅显示进度';
      facts.push({
        metric: 'goal_progress',
        value: g.progressRate,
        verdict: `目标「${g.name}」进度 ${pct}%（当前 ${g.currentAmount}/${g.targetAmount}），${etaDesc}。`,
        riskLevel: g.eta.etaStatus === 'at_risk' ? 'medium' : 'low',
      });
    }
  }

  return facts;
}

/** 事实列表 → 喂给 LLM 的只读文本（与 findings 文本同构，便于红线约束）。 */
export function budgetGoalFactsText(facts: BudgetGoalFact[]): string {
  if (facts.length === 0) return '预算与目标：无超支预警，目标进度正常。';
  return '预算与目标结论：\n' + facts.map((f) => `- ${f.metric}: ${f.value ?? 'N/A'}（${f.verdict}）`).join('\n');
}
