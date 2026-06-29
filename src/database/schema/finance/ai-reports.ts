/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  date,
  decimal,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

/** 报告类型（Phase 1 仅 monthly） */
export const REPORT_TYPES = ['monthly'] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

/** 报告状态（degraded = LLM 失败已模板降级） */
export const REPORT_STATUSES = ['draft', 'published', 'stale', 'degraded'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/** 单个维度得分（缺失维度 value=null + reason 标注，不编造） */
export interface DimensionScore {
  value: string | null;
  score?: number | null;
  reason?: string;
}

/** 报告各维度（健康分雷达图数据源） */
export type ReportDimensions = {
  savingsRate?: DimensionScore;
  debtRatio?: DimensionScore;
  emergency?: DimensionScore;
  investmentRate?: DimensionScore;
  cashflow?: DimensionScore;
};

/**
 * AI 月报元数据。
 *
 * 数字结论零幻觉：正文（content）中的具体数字均引用 rule_findings，
 * LLM 只表达、失败降级为 findings 模板（research R4/R5）。
 * source_data_hash 用于检测底层数据变化 → stale（research R6）。
 *
 * 实现增强：除 data-model 的 content_ref 外，新增 content text 列直接承载
 * markdown 正文（务实可用）；content_ref 留作未来文档/Block 引用。
 */
export const aiReports = pgTable('finance_ai_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  type: varchar('type', { length: 16 })
    .$type<ReportType>()
    .default('monthly')
    .notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  /** 财务健康分 0–100 */
  score: decimal('score', { precision: 5, scale: 2 }),
  dimensions: jsonb('dimensions').$type<ReportDimensions>(),
  status: varchar('status', { length: 16 })
    .$type<ReportStatus>()
    .default('draft')
    .notNull(),
  sourceDataHash: text('source_data_hash').notNull(),
  /** 报告正文（markdown）—— LLM 表达层产物或降级模板 */
  content: text('content'),
  /** 指向文档/Block 产物（未来扩展） */
  contentRef: text('content_ref'),
  approvedBy: text('approved_by'),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AiReportItem = typeof aiReports.$inferSelect;
export type NewAiReport = typeof aiReports.$inferInsert;
