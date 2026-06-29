/**
 * 资产配置仪表盘（Phase 3，US4）：按品种类型占比饼图 + 集中度预警。
 *
 * 占比由后端 `getAllocation` 聚合（确定性纯函数，非 LLM）；单一持仓超阈值 → 集中度预警条
 *（仅提示，不代为操作，设计 §9 / SC-005）。
 */
'use client';

import {
  Stack,
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAllocation } from '../hooks/use-finance';

const TYPE_COLORS: Record<string, string> = {
  stock: '#1976d2',
  fund: '#2e7d32',
  bond: '#ed6c02',
  gold: '#fbc02d',
  etf: '#9c27b0',
  reits: '#00897b',
  crypto: '#e53935',
  cash: '#9e9e9e',
};

const TYPE_LABEL: Record<string, string> = {
  stock: '股票',
  fund: '基金',
  bond: '债券',
  gold: '黄金',
  etf: 'ETF',
  reits: 'REITs',
  crypto: '加密货币',
  cash: '现金',
};

function fmt(value: string | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  return Number.isFinite(n)
    ? `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
}

export function AllocationDashboard() {
  const { data, isLoading } = useAllocation('by_type');

  if (isLoading) {
    return <CircularProgress size={24} />;
  }

  const items = data?.items ?? [];
  const total = data?.total ?? '0';
  const alerts = data?.alerts ?? [];

  const chartData = items.map((it) => ({
    name: TYPE_LABEL[it.instrumentType] ?? it.instrumentType,
    value: Number(it.marketValue),
    ratio: Number(it.ratio),
    color: TYPE_COLORS[it.instrumentType] ?? '#888',
  }));

  return (
    <Stack spacing={2}>
      {alerts.map((a, i) => (
        <Alert key={i} severity="warning">
          {a.message}
        </Alert>
      ))}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            资产配置（总市值 {fmt(total)}）
          </Typography>
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              暂无持仓
            </Typography>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
              <Box sx={{ width: 220, height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                    >
                      {chartData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => fmt(String(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack spacing={0.5}>
                {chartData.map((entry, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: entry.color }}
                    />
                    <Typography variant="body2">
                      {entry.name} {(entry.ratio * 100).toFixed(1)}%（{fmt(String(entry.value))}）
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
