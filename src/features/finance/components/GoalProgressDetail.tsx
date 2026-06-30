/**
 * 目标进度明细（Phase 5，US2/US3，FR-006/SC-003/SC-004）。
 * 展示 surplusSeries（近 N 月收入/支出/结余）+ ETA 推导，让「预计达成时间」可解释、可追溯。
 */
'use client';

import { Card, CardContent, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from '@mui/material';
import { useGoalProgress } from '../hooks/use-finance';

function yuan(v: string): string {
  return `¥${Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function GoalProgressDetail({ goalId, windowMonths = 3 }: { goalId: string; windowMonths?: number }) {
  const { data, isLoading } = useGoalProgress(goalId, windowMonths);
  if (isLoading || !data) return <Typography color="text.secondary">加载进度…</Typography>;
  const { progress } = data;
  const eta = progress.eta;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">进度与 ETA 明细</Typography>
          <Typography variant="caption" color="text.secondary">窗口 {eta.windowMonths} 个月</Typography>
        </Stack>

        {eta.etaStatus === 'unreachable' && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            近 {eta.windowMonths} 月平均结余 {yuan(eta.avgMonthlySurplus)} ≤ 0，按当前节奏无法达成，需调整收入/支出（不产出虚假达成日期）。
          </Alert>
        )}

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>月份</TableCell>
                <TableCell align="right">收入</TableCell>
                <TableCell align="right">支出</TableCell>
                <TableCell align="right">结余</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {progress.surplusSeries.map((s) => (
                <TableRow key={s.month} hover>
                  <TableCell>{s.month}</TableCell>
                  <TableCell align="right">{yuan(s.income)}</TableCell>
                  <TableCell align="right">{yuan(s.expense)}</TableCell>
                  <TableCell align="right" sx={{ color: Number(s.surplus) < 0 ? 'error.main' : undefined }}>{yuan(s.surplus)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          平均月结余 {yuan(eta.avgMonthlySurplus)}；剩余 {yuan(progress.remaining)}；
          {eta.monthsToGoal != null ? `预计约 ${eta.monthsToGoal} 个月达成` : '暂不估算达成月数'}。
        </Typography>
      </CardContent>
    </Card>
  );
}
