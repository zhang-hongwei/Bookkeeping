/**
 * 家庭合并仪表盘（Phase 4 / US1）。
 *
 * 家庭净资产 = Σ 各成员共享账号净资产（SC-001/I1）；私有账号由后端硬过滤排除（SC-002）。
 * memberBreakdown 按成员拆分；曲线读 finance_family_net_worth_snapshots + 缺口回填。
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
import {
  useFamily,
  useFamilyNetWorth,
  useFamilyCurve,
} from '../hooks/use-finance';

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

export function FamilyDashboard({ familyId }: { familyId: string }) {
  const { data: fam } = useFamily(familyId);
  const { data: nw, isLoading } = useFamilyNetWorth(familyId);
  const from = daysAgo(30);
  const to = todayStr();
  const { data: curve } = useFamilyCurve(familyId, from, to);

  const chartData = (curve?.points ?? []).map((p) => ({
    date: p.date.slice(5),
    net: Number(p.netWorth),
  }));

  // memberId → displayName（便于 memberBreakdown 展示人名）
  const memberName = new Map((fam?.members ?? []).map((m) => [m.id, m.displayName]));

  if (isLoading || !nw) {
    return <Typography color="text.secondary">加载家庭净资产…</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            家庭净资产（{fam?.family.name ?? ''}）
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: Number(nw.netWorth.netWorth) < 0 ? 'error.main' : 'success.main',
            }}
          >
            {fmt(nw.netWorth.netWorth)}
          </Typography>
          <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="overline" color="text.secondary">总资产</Typography>
              <Typography variant="h6">{fmt(nw.netWorth.totalAssets)}</Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">总负债</Typography>
              <Typography variant="h6" color="error.main">
                {fmt(nw.netWorth.totalLiabilities)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>成员拆分</Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            {Object.entries(nw.netWorth.memberBreakdown ?? {}).map(([mid, v]) => (
              <Box key={mid}>
                <Typography variant="caption" color="text.secondary">
                  {memberName.get(mid) ?? '成员'}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {fmt(v)}
                </Typography>
              </Box>
            ))}
            {Object.keys(nw.netWorth.memberBreakdown ?? {}).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                暂无共享账户数据
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            家庭净资产曲线（近 30 天）
          </Typography>
          <Box sx={{ width: '100%', height: 220 }}>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={48} />
                  <Tooltip formatter={(value) => fmt(String(value))} />
                  <Line type="monotone" dataKey="net" stroke="#2563eb" strokeWidth={2} dot={false} />
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
