/**
 * 顾问对话服务（Phase 6，FR-003 / FR-004 / FR-007）。
 *
 * 双层零幻觉架构（research.md 决策 7/8）：
 *   事实层（findings + health + forecast，规则引擎确定性结论）
 *   → LLM 表达层（克隆报告红线 prompt：只引用给定结论，禁算/禁捏造数字）
 *   → assistant 消息（content + citedFindings 锚点）。
 * - LLM 失败/超时 → 降级模板（degraded=true，数字仍来自 findings，SC-005 / I7）。
 * - 高风险动作 → LLM 末尾 JSON 提议块 → 创建 proposed 审批 + 返回 proposalId（不直接落库，FR-004）。
 */
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import {
  computeFindings,
  computeHealthScoreForUser,
  monthPeriod,
  monthKey,
  type FindingData,
  type PeriodRange,
} from './rules-engine.service';
import { getForecast } from './forecast.service';
import {
  type AdvisorMessageItem,
  type AdvisorSessionItem,
  type AdvisorSourceRef,
  type ApprovalKind,
} from '@/database/schema/finance';
import { advisorRepository } from '@/repositories/finance/advisor.repository';
import { propose } from './approval.service';

/** 顾问系统 prompt（克隆 report.service 红线 + 提议 JSON 约定）。 */
const ADVISOR_SYSTEM_PROMPT =
  '你是个人财务顾问。硬性规则：所有具体数字必须直接引用下面给定的结论，' +
  '严禁自行计算、推测或捏造任何数字；结论中未出现的数字一律不得写入。' +
  '只能基于给定结论作答，回答简洁、可执行。\n' +
  '若用户要求高风险动作（补录记账/标记异常交易/调仓建议/改写结论），' +
  '在回答末尾追加一个 JSON 代码块标注提议，格式：\n' +
  '```json\n{"proposal":{"kind":"<create_transaction|flag_transaction_anomaly|rebalance_suggestion|amend_finding_override>","payload":{...}}}\n```\n' +
  '低风险问答不要追加提议块。';

/** findings → 可追溯锚点（I1）。 */
export function findingRefs(
  findings: FindingData[],
  period: string,
): AdvisorSourceRef[] {
  return findings.map((f) => ({
    metric: f.metric,
    period,
    value: f.value,
    verdict: f.verdict,
    riskLevel: f.riskLevel,
  }));
}

/** 降级模板：数字全部取自 findings（零幻觉，SC-005 / I7）。 */
export function advisorDegradedTemplate(findings: FindingData[]): string {
  const byMetric = new Map(findings.map((f) => [f.metric, f]));
  const surplus = byMetric.get('surplus')?.value ?? '0';
  const sr = byMetric.get('savings_rate')?.value;
  const dr = byMetric.get('debt_ratio')?.value;
  const em = byMetric.get('emergency_months')?.value;
  const pct = (v?: string | null) =>
    v == null ? '无法计算' : `${(Number(v) * 100).toFixed(1)}%`;
  return [
    '（AI 顾问暂时不可用，以下为规则结论摘要）',
    '',
    `- 本期结余 ¥${surplus}。`,
    `- 储蓄率 ${pct(sr)}；负债率 ${pct(dr)}；应急金 ${
      em == null ? '无法估算' : `${Number(em).toFixed(1)} 个月`
    }。`,
    '',
    '> 以上数字均来自规则引擎结论，可逐项追溯。',
  ].join('\n');
}

/** 从回答中解析末尾的 JSON 提议块（FR-004 串联）。 */
export function extractProposal(
  content: string,
): { kind: ApprovalKind; payload: Record<string, unknown> } | null {
  const match = content.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]) as { proposal?: { kind?: string; payload?: unknown } };
    const kind = parsed.proposal?.kind;
    const payload = parsed.proposal?.payload;
    const allowed: ApprovalKind[] = [
      'flag_transaction_anomaly',
      'rebalance_suggestion',
      'amend_finding_override',
      'create_transaction',
    ];
    if (kind && allowed.includes(kind as ApprovalKind) && payload && typeof payload === 'object') {
      return {
        kind: kind as ApprovalKind,
        payload: payload as Record<string, unknown>,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** 构造事实层文本（喂给 LLM 的只读结论）。 */
function findingsText(findings: FindingData[], healthScore: string): string {
  const lines = findings.map((f) => `- ${f.metric}: ${f.value ?? 'N/A'}（${f.verdict}）`);
  return `健康分：${healthScore}/100\n\n确定性结论：\n${lines.join('\n')}`;
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// ============ 会话管理 ============

/** 新建会话。 */
export async function createSession(
  userId: string,
  title?: string,
): Promise<AdvisorSessionItem> {
  return advisorRepository(userId).createSession(title);
}

/** 会话列表。 */
export async function listSessions(userId: string): Promise<AdvisorSessionItem[]> {
  return advisorRepository(userId).listSessions();
}

/** 会话历史（校验归属；不属于用户 → null，路由 404）。 */
export async function listMessages(
  userId: string,
  sessionId: string,
): Promise<AdvisorMessageItem[] | null> {
  const repo = advisorRepository(userId);
  const session = await repo.findSession(sessionId);
  if (!session) return null;
  return repo.listMessages(sessionId);
}

export interface SendMessageResult {
  message: AdvisorMessageItem;
}

/**
 * 发送提问：取事实层 → LLM 表达 → 落 assistant 消息（带 citedFindings/degraded/proposalId）。
 * 会话不存在或不属于用户 → null（路由 404）。
 */
export async function sendMessage(
  userId: string,
  sessionId: string,
  content: string,
): Promise<SendMessageResult | null> {
  const repo = advisorRepository(userId);
  const session = await repo.findSession(sessionId);
  if (!session) return null;

  // 持久化用户消息
  await repo.createMessage({ sessionId, role: 'user', content });

  // 取事实层（当前月 findings + health + 预测）
  const periodKey = currentMonth();
  const period: PeriodRange = monthPeriod(periodKey);
  const [findings, health] = await Promise.all([
    computeFindings(userId, period),
    computeHealthScoreForUser(userId, period),
  ]);
  const refs = findingRefs(findings, periodKey);

  // 预测应急金不足点（串联 US1，供顾问引用）
  let forecastLine = '';
  try {
    const forecast = await getForecast(userId, { period });
    if (forecast.emergencyShortfallMonth) {
      forecastLine = `\n预测：${forecast.emergencyShortfallMonth} 应急金将不足。`;
      refs.push({
        metric: 'emergency_months',
        period: forecast.emergencyShortfallMonth,
        value: null,
        verdict: `预测应急金不足：${forecast.emergencyShortfallMonth}`,
        riskLevel: 'high',
      });
    }
  } catch {
    // 预测失败不影响顾问主流程
  }

  const facts = findingsText(findings, health.total) + forecastLine;

  // 表达层：env 缺失/LLM 失败 → 降级模板（SC-005 / I7）
  const baseURL = process.env.OPENAI_BASE_URL;
  const apiKey = process.env.OPENAI_AUTH_TOKEN;
  const modelName = process.env.OPENAI_MODEL;
  let assistantContent: string;
  let degraded: boolean;

  if (!baseURL || !apiKey || !modelName) {
    assistantContent = advisorDegradedTemplate(findings);
    degraded = true;
  } else {
    try {
      const openai = createOpenAI({ baseURL, apiKey });
      const history = await repo.listMessages(sessionId);
      const recent = history.slice(-10); // 最近 10 条上下文
      const messages = [
        ...recent
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(0, -1) // 排除刚写入的当前用户消息（放入 prompt）
          .map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: `${facts}\n\n用户问题：${content}` },
      ];
      const { text } = await generateText({
        model: openai(modelName),
        system: ADVISOR_SYSTEM_PROMPT,
        messages,
      });
      assistantContent = text;
      degraded = false;
    } catch (err) {
      console.error('[advisor] LLM failed, fallback to template:', err);
      assistantContent = advisorDegradedTemplate(findings);
      degraded = true;
    }
  }

  // 高风险提议 → 创建 proposed 审批（不直接落库，FR-004）
  let proposalId: string | null = null;
  const proposal = extractProposal(assistantContent);
  if (proposal) {
    const approval = await propose(userId, {
      kind: proposal.kind,
      payload: proposal.payload,
      refs,
      proposedBy: null,
    });
    proposalId = approval.id;
  }

  const message = await repo.createMessage({
    sessionId,
    role: 'assistant',
    content: assistantContent,
    citedFindings: refs,
    degraded,
    proposalId,
  });

  return { message };
}
