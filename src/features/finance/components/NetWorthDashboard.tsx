/**
 * 净资产仪表盘（US1）：总资产/总负债/净资产 + 今日变化 + 净资产曲线。
 *
 * 曲线读 net_worth_snapshots（物化，O(1)）；数字由后端余额推导，转账不改净资产。
 */
'use client';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useNetWorth, useNetWorthSnapshots } from '../hooks/use-finance';

function fmt(value: string): string {
  const n = Number(value);
  return Number.isFinite(n)
    ? `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export function NetWorthDashboard() {
  const { data: nw, isLoading } = useNetWorth();
  const from = daysAgo(30);
  const to = todayStr();
  const { data: snap } = useNetWorthSnapshots(from, to);
  const chartData = (snap?.items ?? []).map((s) => ({
    date: s.date.slice(5),
    net: Number(s.netWorth),
  }));

  if (isLoading || !nw) {
    return <Typography color="text.secondary">加载净资产…</Typography>;
  }

  const todayChange = Number(nw.todayChange);
  const breakdownEntries = Object.entries(nw.breakdown ?? {});

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            净资产
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: Number(nw.netWorth) < 0 ? 'error.main' : 'success.main' }}>
            {fmt(nw.netWorth)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: todayChange > 0 ? 'success.main' : todayChange < 0 ? 'error.main' : 'text.secondary' }}
          >
            今日 {todayChange > 0 ? '+' : ''}{fmt(nw.todayChange)}
          </Typography>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={2}>
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">总资产</Typography>
            <Typography variant="h6">{fmt(nw.totalAssets)}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">总负债</Typography>
            <Typography variant="h6" color="error.main">{fmt(nw.totalLiabilities)}</Typography>
          </CardContent>
        </Card>
      </Stack>

      {breakdownEntries.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>分项</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {breakdownEntries.map(([k, v]) => (
                <Typography key={k} variant="body2" color="text.secondary">
                  {k}: {fmt(v)}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>净资产曲线（近 30 天）</Typography>
          <Box sx={{ width: '100%', height: 220 }}>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={48} />
                  <Tooltip formatter={(value) => fmt(String(value))} />
                  <Line type="monotone" dataKey="net" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                曲线数据积累中…
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
