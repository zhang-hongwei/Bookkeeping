/**
 * 定投概览（Phase 3，US3）：累计投入 / 当前市值 / 累计盈亏 / 年化收益（XIRR）。
 *
 * IRR 由后端 `getPerformance` 计算（现金流 = 历次买入 + 终端市值），与主流基金计算器对齐；
 * 不收敛时显式提示（绝不展示错误数字，SC-002）。定投计划仅作配置展示（IRR 真相源是实际买入）。
 */
'use client';

import {
  Stack,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { usePositions, usePositionPerformance, useDcaPlans } from '../hooks/use-finance';
import type { PositionDTO } from '../api';

function fmt(value: string | null): string {
  if (value === null) return '—';
  const n = Number(value);
  return Number.isFinite(n)
    ? `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
}

function fmtRate(rate: string | null): string {
  if (rate === null) return '—';
  const n = Number(rate);
  if (!Number.isFinite(n)) return '—';
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(2)}%`;
}

export function DcaOverview() {
  const { data, isLoading } = usePositions();
  const { data: plansData } = useDcaPlans();
  const positions = data?.items ?? [];
  const plans = plansData?.items ?? [];

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            持仓年化收益（XIRR，考虑资金时间价值）
          </Typography>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : positions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              暂无持仓
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>持仓</TableCell>
                    <TableCell align="right">累计投入</TableCell>
                    <TableCell align="right">当前市值</TableCell>
                    <TableCell align="right">累计盈亏</TableCell>
                    <TableCell align="right">年化收益(XIRR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {positions.map((p) => (
                    <PerformanceRow key={p.id} position={p} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            定投计划（仅配置；IRR 基于实际买入时点）
          </Typography>
          {plans.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              暂无定投计划
            </Typography>
          ) : (
            <Stack spacing={1}>
              {plans.map((plan) => (
                <Stack key={plan.id} direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="body2">{plan.instrumentCode}</Typography>
                  <Chip size="small" label={plan.frequency} variant="outlined" />
                  <Chip size="small" label={plan.active ? '进行中' : '已暂停'} color={plan.active ? 'success' : 'default'} />
                  <Typography variant="caption" color="text.secondary">
                    每期 {fmt(plan.amount)} · {plan.dayOfPeriod ? `每月 ${plan.dayOfPeriod} 日` : ''}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

function PerformanceRow({ position }: { position: PositionDTO }) {
  const { data, isLoading } = usePositionPerformance(position.id);
  return (
    <TableRow>
      <TableCell>{position.name}</TableCell>
      <TableCell align="right">{isLoading ? '…' : fmt(data?.totalInvested ?? null)}</TableCell>
      <TableCell align="right">{isLoading ? '…' : fmt(data?.marketValue ?? null)}</TableCell>
      <TableCell align="right" sx={{ color: Number(data?.pnl ?? 0) < 0 ? 'error.main' : 'success.main' }}>
        {isLoading ? '…' : fmt(data?.pnl ?? null)}
      </TableCell>
      <TableCell align="right">
        {isLoading ? (
          '…'
        ) : data?.irr.converged ? (
          fmtRate(data.irr.annualizedRate)
        ) : (
          <Chip size="small" label={data?.irr.reason ?? 'IRR 无法收敛'} color="warning" />
        )}
      </TableCell>
    </TableRow>
  );
}
