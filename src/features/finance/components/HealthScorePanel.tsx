/**
 * 财务健康分（US4）：0–100 总分 + 各维度雷达图。
 *
 * 维度：储蓄率/负债率/应急金/投资率/现金流；缺失维度（投资率 Phase1）降权标注，不编造。
 */
'use client';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { useHealthScore } from '../hooks/use-finance';
import type { HealthScoreDTO } from '../api';

const DIM_LABELS: Array<[keyof HealthScoreDTO['dimensions'], string]> = [
  ['savingsRate', '储蓄率'],
  ['debtRatio', '负债率'],
  ['emergency', '应急金'],
  ['investmentRate', '投资率'],
  ['cashflow', '现金流'],
];

function currentMonthPeriod() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return {
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: now.toISOString().slice(0, 10),
  };
}

export function HealthScorePanel() {
  const { periodStart, periodEnd } = currentMonthPeriod();
  const { data, isLoading } = useHealthScore(periodStart, periodEnd);

  if (isLoading || !data) {
    return <Typography color="text.secondary">加载健康分…</Typography>;
  }

  const health = data.data;
  const total = Number(health.total);
  const radarData = DIM_LABELS.map(([key, label]) => ({
    dim: label,
    score: health.dimensions[key]?.score ?? 0,
    missing: health.dimensions[key]?.score == null,
  }));

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>财务健康分</Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: total >= 70 ? 'success.main' : total >= 40 ? 'warning.main' : 'error.main' }}>
              {total.toFixed(0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">/ 100</Typography>
          </Box>
          <Box sx={{ width: 240, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="rgba(128,128,128,0.3)" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          投资率维度已接入 Phase 3 持仓；缺数据维度降权不计入总分。
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {data.disclaimer}
        </Typography>
      </CardContent>
    </Card>
  );
}
