/**
 * 目标卡片（Phase 5，US2，FR-005/006）。进度环 + ETA + unreachable 文案。
 * - unreachable：明确「无法达成」，不显假日期（I5/SC-003）。
 * - 开放式（无 targetDate）：仅显进度，不估 ETA（edge）。
 */
'use client';

import { Box, Card, CardContent, Chip, Stack, Typography, CircularProgress } from '@mui/material';
import type { GoalDTO } from '../api';

function yuan(v: string): string {
  return `¥${Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function etaText(goal: GoalDTO): { label: string; color: 'success' | 'warning' | 'error' | 'default' } {
  const eta = goal.eta;
  if (goal.completed) return { label: '🎉 已达成目标', color: 'success' };
  if (eta.etaStatus === 'unreachable')
    return { label: '按近期结余节奏无法达成，需调整收入/支出', color: 'error' };
  if (eta.etaStatus === 'at_risk')
    return { label: `预计 ${eta.etaDate} 达成，已晚于目标日（约 ${eta.monthsToGoal} 个月）`, color: 'warning' };
  if (eta.etaDate)
    return { label: `预计 ${eta.etaDate} 达成（约 ${eta.monthsToGoal} 个月，月均结余 ${yuan(eta.avgMonthlySurplus)}）`, color: 'success' };
  // 开放式目标（无截止日）：仅进度
  return { label: '开放式目标，仅显示进度', color: 'default' };
}

export function GoalCard({ goal }: { goal: GoalDTO }) {
  const pct = Math.min(100, Math.max(0, Number(goal.progressRate) * 100));
  const eta = etaText(goal);
  const basisLabel =
    goal.progressBasis === 'manual' ? '手动' :
    goal.progressBasis === 'linked' ? '关联账户' : '总净资产';

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="subtitle2">{goal.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              目标 {yuan(goal.targetAmount)}{goal.targetDate ? ` · 截止 ${goal.targetDate}` : ' · 开放式'} · 口径 {basisLabel}
            </Typography>
          </Box>
          {goal.completed && <Chip size="small" color="success" label="已达成" />}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" value={pct} size={56} thickness={6} />
            <Box sx={{
              top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{Math.round(pct)}%</Typography>
            </Box>
          </Box>
          <Stack spacing={0.25}>
            <Typography variant="body2" color="text.secondary">
              当前 <Typography component="span" sx={{ fontWeight: 600 }}>{yuan(goal.currentAmount)}</Typography>
              {' '}/ 剩余 {yuan(String(Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount))))}
            </Typography>
            <Typography variant="caption" color={`${eta.color}.main`}>{eta.label}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
