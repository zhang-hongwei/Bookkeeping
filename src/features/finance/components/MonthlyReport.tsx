/**
 * 月度 AI 报告（US3）：生成 → 查看（markdown 正文 + findings）+ stale/degraded 标注 + 重新生成。
 *
 * 数字结论零幻觉：正文由 LLM 引用 findings 生成，失败降级模板（数字仍来自 findings）。
 */
'use client';

import { Box, Button, Card, CardContent, Stack, Typography, Chip, Alert, CircularProgress, Divider } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { useReports, useReport, useGenerateReport, useRegenerateReport } from '../hooks/use-finance';

function currentMonthPeriod() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return {
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: now.toISOString().slice(0, 10),
  };
}

export function MonthlyReport() {
  const { periodStart, periodEnd } = currentMonthPeriod();
  const { data: list } = useReports(periodStart, periodEnd);
  const latestId = list?.items[0]?.id ?? null;
  const { data: report } = useReport(latestId);
  const generate = useGenerateReport();
  const regenerate = useRegenerateReport();

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">月度 AI 报告（{periodStart.slice(0, 7)}）</Typography>
          <Stack direction="row" spacing={1}>
            {report && (
              <Button
                size="small"
                variant="outlined"
                disabled={regenerate.isPending}
                onClick={() => regenerate.mutate(report.id)}
              >
                {regenerate.isPending ? <CircularProgress size={16} /> : '重新生成'}
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              disabled={generate.isPending}
              onClick={() => generate.mutate({ periodStart, periodEnd })}
            >
              {generate.isPending ? <CircularProgress size={16} /> : '生成本月报告'}
            </Button>
          </Stack>
        </Stack>

        {generate.isError && (
          <Alert severity="error" sx={{ mb: 1 }}>{(generate.error as Error)?.message ?? '生成失败'}</Alert>
        )}

        {!report && !generate.isPending && (
          <Typography variant="body2" color="text.secondary">
            点击「生成本月报告」，AI 将基于规则结论（储蓄率/负债率/应急金）生成解读。
          </Typography>
        )}

        {report && (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {report.score && <Chip size="small" label={`健康分 ${Number(report.score).toFixed(0)}`} color="primary" variant="outlined" />}
              {report.status === 'degraded' && (
                <Chip size="small" label="规则模板（LLM 不可用）" color="warning" variant="outlined" />
              )}
              {report.stale && (
                <Chip size="small" label="数据已变化" color="info" variant="outlined" />
              )}
            </Stack>
            {report.stale && (
              <Alert severity="info">报告生成后底层数据已变化，建议「重新生成」以反映最新结论。</Alert>
            )}
            <Divider />
            <Box>
              {report.content ? (
                <ReactMarkdown>{report.content}</ReactMarkdown>
              ) : (
                <Typography variant="body2" color="text.secondary">（无正文）</Typography>
              )}
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
