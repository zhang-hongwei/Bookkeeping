/**
 * 预算进度环（Phase 5，US1）。已用/剩余/状态可视化（D3 状态着色）。
 */
'use client';

import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import type { BudgetDTO } from '../api';

function yuan(v: string): string {
  return `¥${Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error'> = {
  normal: 'success',
  warning: 'warning',
  overrun: 'error',
};

export function BudgetProgressRing({ budget }: { budget: BudgetDTO }) {
  const ratio = Math.min(100, Math.max(0, Number(budget.ratio) * 100));
  const color = STATUS_COLOR[budget.status] ?? 'success';
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={ratio}
          size={64}
          thickness={6}
          color={color}
        />
        <Box
          sx={{
            top: 0, left: 0, bottom: 0, right: 0,
            position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {Math.round(ratio)}%
          </Typography>
        </Box>
      </Box>
      <Stack spacing={0.25}>
        <Typography variant="body2" color="text.secondary">
          已用 <Typography component="span" sx={{ fontWeight: 600 }}>{yuan(budget.spent)}</Typography>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          剩余{' '}
          <Typography
            component="span"
            sx={{ fontWeight: 600, color: Number(budget.remaining) < 0 ? 'error.main' : undefined }}
          >
            {yuan(budget.remaining)}
          </Typography>
          {' '}/ 额度 {yuan(budget.amount)}
        </Typography>
        <Typography variant="caption" color={`${color}.main`}>{budget.verdict}</Typography>
      </Stack>
    </Stack>
  );
}
