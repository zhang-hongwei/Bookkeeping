/**
 * 月度 AI 报告服务（US3）。
 *
 * 两段式零幻觉流水线（research R4/R5/R6）：
 *   事实层 findings（规则引擎确定性结论）→ LLM 表达层（只解读、禁算数字）→ markdown 正文。
 * - LLM 失败/超时 → 降级 findings 模板（status=degraded），数字仍来自 findings（SC-004）。
 * - sourceDataHash：周期数据指纹；查看时比对，不一致 → stale（FR-010）。
 */
import { createHash } from 'node:crypto';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import {
  computeFindingsFromData,
  computeHealthScore,
  getPeriodMetrics,
  type FindingData,
  type PeriodRange,
} from './rules-engine.service';
import { reportRepository } from '@/repositories/finance/report.repository';
import { findingRepository } from '@/repositories/finance/finding.repository';
import type { PeriodMetrics } from './rules-engine.service';

export function computeSourceDataHash(m: PeriodMetrics): string {
  return createHash('sha1')
    .update(
      [m.incomeTotal, m.expenseTotal, m.totalAssets, m.totalLiabilities, m.cashAssets].join('|'),
    )
    .digest('hex');
}

/** 降级模板：数字全部取自 findings（零幻觉）。 */
export function degradedTemplate(findings: FindingData[]): string {
  const byMetric = new Map(findings.map((f) => [f.metric, f]));
  const income = byMetric.get('income_total')?.value ?? '0';
  const expense = byMetric.get('expense_total')?.value ?? '0';
  const surplus = byMetric.get('surplus')?.value ?? '0';
  const sr = byMetric.get('savings_rate')?.value;
  const dr = byMetric.get('debt_ratio')?.value;
  const em = byMetric.get('emergency_months')?.value;
  const pct = (v?: string | null) =>
    v == null ? '无法计算' : `${(Number(v) * 100).toFixed(1)}%`;
  return [
    '## 月度财务摘要（规则结论模板）',
    '',
    `- 本月收入 ¥${income}，支出 ¥${expense}，结余 ¥${surplus}。`,
    `- 储蓄率 ${pct(sr)}`,
    `- 负债率 ${pct(dr)}`,
    `- 应急金 ${em == null ? '无法估算' : `${Number(em).toFixed(1)} 个月`}`,
    '',
    '> 本报告由规则引擎结论生成（LLM 不可用已降级），所有数字均可逐项追溯。',
  ].join('\n');
}

/** LLM 表达层：findings 作为只读事实喂入；失败降级模板。 */
async function generateReportContent(
  findings: FindingData[],
  score: string,
): Promise<{ content: string; ok: boolean }> {
  const baseURL = process.env.OPENAI_BASE_URL;
  const apiKey = process.env.OPENAI_AUTH_TOKEN;
  const modelName = process.env.OPENAI_MODEL;
  if (!baseURL || !apiKey || !modelName) {
    return { content: degradedTemplate(findings), ok: false };
  }
  const findingsText = findings
    .map((f) => `- ${f.metric}: ${f.value ?? 'N/A'}（${f.verdict}）`)
    .join('\n');
  try {
    const openai = createOpenAI({ baseURL, apiKey });
    const { text } = await generateText({
      model: openai(modelName),
      system:
        '你是财务顾问，为用户生成本月财务解读与建议。硬性规则：所有具体数字必须直接引用下面给定的结论，' +
        '严禁自行计算、推测或捏造任何数字；结论中未出现的数字一律不得写入。',
      prompt: `健康分：${score}/100\n\n确定性结论：\n${findingsText}\n\n请生成月报正文（markdown，300 字内）。`,
    });
    return { content: text, ok: true };
  } catch (err) {
    console.error('[report] LLM failed, fallback to template:', err);
    return { content: degradedTemplate(findings), ok: false };
  }
}

export interface GenerateResult {
  reportId: string;
  status: 'published' | 'degraded';
  score: string;
  stale: boolean;
  contentRef: string | null;
}

/** 生成月报：findings → LLM 表达 → 写 ai_reports + findings（绑 reportId）。 */
export async function generateMonthly(
  userId: string,
  period: PeriodRange,
): Promise<GenerateResult> {
  const metrics = await getPeriodMetrics(userId, period);
  const findings = computeFindingsFromData(metrics);
  const health = computeHealthScore(findings);
  const sourceDataHash = computeSourceDataHash(metrics);
  const { content, ok } = await generateReportContent(findings, health.total);

  const report = await reportRepository(userId).create({
    periodStart: period.start,
    periodEnd: period.end,
    score: health.total,
    dimensions: health.dimensions,
    status: ok ? 'published' : 'degraded',
    sourceDataHash,
    content,
  });
  await findingRepository(userId).upsertForPeriod(findings, period, report.id);

  return {
    reportId: report.id,
    status: ok ? ('published' as const) : ('degraded' as const),
    score: health.total,
    stale: false,
    contentRef: null,
  };
}

export interface ReportView {
  id: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  score: string | null;
  dimensions: unknown;
  status: string;
  stale: boolean;
  content: string | null;
  contentRef: string | null;
  generatedAt: string;
}

/** 查看报告：比对当前周期数据指纹，不一致 → stale。 */
export async function getReport(
  userId: string,
  id: string,
): Promise<ReportView | null> {
  const report = await reportRepository(userId).findById(id);
  if (!report) return null;
  const metrics = await getPeriodMetrics(userId, {
    start: report.periodStart,
    end: report.periodEnd,
  });
  const stale = computeSourceDataHash(metrics) !== report.sourceDataHash;
  return {
    id: report.id,
    type: report.type,
    periodStart: report.periodStart,
    periodEnd: report.periodEnd,
    score: report.score,
    dimensions: report.dimensions,
    status: report.status,
    stale,
    content: report.content,
    contentRef: report.contentRef,
    generatedAt: report.generatedAt.toISOString(),
  };
}

/** 以最新数据重新生成（新建一份报告）。 */
export async function regenerate(
  userId: string,
  id: string,
): Promise<GenerateResult | null> {
  const report = await reportRepository(userId).findById(id);
  if (!report) return null;
  return generateMonthly(userId, { start: report.periodStart, end: report.periodEnd });
}

/** 报告列表。 */
export async function listReports(userId: string, period?: PeriodRange) {
  const rows = await reportRepository(userId).list(period);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    periodStart: r.periodStart,
    periodEnd: r.periodEnd,
    score: r.score,
    status: r.status,
    generatedAt: r.generatedAt.toISOString(),
  }));
}
