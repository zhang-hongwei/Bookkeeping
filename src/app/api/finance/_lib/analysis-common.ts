/**
 * Phase 7 高级分析：共享溯源 / 降级 / 免责工具（research.md NC5/NC6/NC7 / contracts/api.md §0.3）。
 *
 * 所有四个确定性引擎与其 service 共用：
 * - 免责常量（按分析类别，前端必渲染，合规免责 edge）。
 * - 溯源四元组构造：engineVersion + assumptions + disclaimers (+ ruleVintage / targetBandsVersion)。
 * - 降级助手：status='degraded' + missing[]，不产出编造结论（NC6）。
 *
 * 红线：数字一律来自确定性引擎；本模块仅产出文本免责与溯源元数据，不产生任何金额。
 */

/** 分析状态（contracts §0.3）。 */
export type AnalysisStatus = 'ok' | 'degraded';

/** 溯源元组（NC7），所有结果 DTO 共享（contracts EngineMeta）。 */
export interface EngineMeta {
  /** 如 "projection@1.0.0"。 */
  engineVersion: string;
  /** 个税规则版本，如 "PRC-IIT-2026"。 */
  ruleVintage?: string;
  /** 组合目标区间配置版本。 */
  targetBandsVersion?: string;
  /** 本次全部假设/参数。 */
  assumptions: Record<string, unknown>;
  /** 强制免责（前端必渲染）。 */
  disclaimers: string[];
}

/** 降级结果（NC6）。 */
export interface DegradedResult {
  status: 'degraded';
  missing: string[];
}

/**
 * 免责文案（按分析类别）。服务层按分析类型取用并强制注入对应 DTO 的 disclaimers。
 * 易变文案集中于此，便于法务/合规统一调整。
 */
export const DISCLAIMER_TEXT = {
  generic: '本结果由确定性规则引擎计算，仅供个人财务参考，不构成专业建议。',
  tax: '非税务建议；需以当期法规/专业人士为准。',
  retirement:
    '长期模拟含强假设，区间仅供方向参考，非确定预测。',
  portfolio: '非投资建议，仅方向参考；不构成具体买卖指令。',
} as const;

/** 取某分析类别的免责文案（始终含 generic + 该类别专属）。 */
export function disclaimersFor(
  category: 'generic' | 'tax' | 'retirement' | 'portfolio',
): string[] {
  if (category === 'generic') return [DISCLAIMER_TEXT.generic];
  return [DISCLAIMER_TEXT.generic, DISCLAIMER_TEXT[category]];
}

/** 构造引擎版本字符串（如 `projection@1.0.0`）。 */
export function engineVersion(name: string, version: string): string {
  return `${name}@${version}`;
}

/** 构造溯源元组（NC7）。 */
export function buildProvenance(args: {
  engineVersion: string;
  ruleVintage?: string;
  targetBandsVersion?: string;
  assumptions: Record<string, unknown>;
  disclaimers: string[];
}): EngineMeta {
  const meta: EngineMeta = {
    engineVersion: args.engineVersion,
    assumptions: args.assumptions,
    disclaimers: args.disclaimers,
  };
  if (args.ruleVintage !== undefined) meta.ruleVintage = args.ruleVintage;
  if (args.targetBandsVersion !== undefined)
    meta.targetBandsVersion = args.targetBandsVersion;
  return meta;
}

/** 降级结果助手（NC6）：status='degraded' + missing[]。 */
export function degraded(missing: string[]): DegradedResult {
  return { status: 'degraded', missing };
}

// ============ LLM 解读层（NC5：仅解读结构化结果，零编造）============

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * LLM 解读：消费结构化结果文本，强约束「不得新增/修改/推断数字」，失败/未配置 → 空文本。
 * 复用 report.service 的 OpenAI 兼容配置（OPENAI_BASE_URL/AUTH_TOKEN/MODEL）。
 *
 * @returns 解读文本；LLM 不可用或异常 → ''（contracts LLM_UNAVAILABLE，HTTP 200，不阻断结构化结果）。
 */
export async function interpretStructured(args: {
  /** 强约束系统提示（含「严禁编造数字」红线）。 */
  systemPrompt: string;
  /** 含全部结构化结果（数字/假设/免责）的用户提示。 */
  userPrompt: string;
}): Promise<string> {
  const baseURL = process.env.OPENAI_BASE_URL;
  const apiKey = process.env.OPENAI_AUTH_TOKEN;
  const modelName = process.env.OPENAI_MODEL;
  if (!baseURL || !apiKey || !modelName) return '';
  try {
    const openai = createOpenAI({ baseURL, apiKey });
    const { text } = await generateText({
      model: openai(modelName),
      system: args.systemPrompt,
      prompt: args.userPrompt,
    });
    return text;
  } catch (err) {
    console.error('[analysis] LLM interpret failed, return empty:', err);
    return '';
  }
}

/** 通用零编造系统提示（各 /interpret 复用，再叠加领域专属约束）。 */
export const ZERO_FABRICATION_SYSTEM =
  '你是财务分析助手。硬性规则：以下所有数字均为确定性引擎结果，你的任务仅是用自然语言解读/排序/强调风险，' +
  '严禁新增、修改、推断或捏造任何数字；结论中未出现的数字一律不得写入；必须保留免责声明原意。';

