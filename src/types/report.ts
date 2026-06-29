import { z } from 'zod';
import { GitHubCommitSchema } from './github';

export const TimeRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  type: z.enum(['this_week', 'last_week', 'custom']),
});

export const ReportConfigSchema = z.object({
  repositories: z.array(z.string()),
  timeRange: TimeRangeSchema,
  includeAuthor: z.boolean().default(true),
  includeMergeCommits: z.boolean().default(false),
  groupByAuthor: z.boolean().default(true),
  groupByDate: z.boolean().default(true),
});

export const WeeklyReportSchema = z.object({
  id: z.string(),
  title: z.string(),
  week: z.string(), // Format: 2025-W36
  timeRange: TimeRangeSchema,
  repositories: z.array(z.string()),
  commits: z.array(GitHubCommitSchema),
  content: z.string(), // Generated markdown content
  config: ReportConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  summary: z.object({
    totalCommits: z.number(),
    totalAuthors: z.number(),
    totalRepositories: z.number(),
  }),
});

export const ReportExportFormatSchema = z.enum(['markdown', 'pdf', 'docx']);

export const ReportTemplateSchema = z.object({
  title: z.string(),
  headerTemplate: z.string(),
  authorTemplate: z.string(),
  commitTemplate: z.string(),
  footerTemplate: z.string(),
});

// Inferred types
export type TimeRange = z.infer<typeof TimeRangeSchema>;
export type ReportConfig = z.infer<typeof ReportConfigSchema>;
export type WeeklyReport = z.infer<typeof WeeklyReportSchema>;
export type ReportExportFormat = z.infer<typeof ReportExportFormatSchema>;
export type ReportTemplate = z.infer<typeof ReportTemplateSchema>;

// Default templates
export const DEFAULT_TEMPLATE: ReportTemplate = {
  title: '# 周报 - {{week}}',
  headerTemplate: `## 时间范围
**开始日期**: {{startDate}}
**结束日期**: {{endDate}}
**仓库**: {{repositories}}

## 提交汇总
`,
  authorTemplate: `### {{author}}
`,
  commitTemplate: `- **{{date}}** {{message}} ([{{sha}}]({{url}}))
`,
  footerTemplate: `
---
*报告生成时间: {{generatedAt}}*
*总提交数: {{totalCommits}}*
`
};

// Query parameters for fetching commits
export interface CommitQueryParams {
  repos: string[];
  since: string;
  until: string;
  author?: string;
  per_page?: number;
}

// Individual commit data for processing
export interface CommitData {
  date: string;
  message: string;
  sha: string;
  url: string;
  repository: string;
}

// Processed commit data for report generation
export interface ProcessedCommitData {
  totalCommits: number;
  authorGroups: Array<{
    author: string;
    email: string;
    commits: CommitData[];
  }>;
  repositoryGroups: Array<{
    repository: string;
    commits: number;
  }>;
}