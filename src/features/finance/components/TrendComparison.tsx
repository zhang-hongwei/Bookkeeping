/**
 * 多期趋势对比面板（Phase 6，US3 / FR-005 / SC-004）。
 * - 储蓄率 / 负债率 / 应急金 / 健康分的按期时序 + 方向（↑/↓/平稳）。
 * - 显著恶化（deteriorating）高亮提示（复用决策 10 趋势规则）。
 * - 值与各期报告/finding 结论一致（SC-004）；「为什么是这个数」展开 sourceRefs；底部免责（FR-009）。
 */
'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { useTrends } from '../hooks/use-finance';
import type { TrendMetricDTO, TrendSeriesDTO } from '../api';

const ALL_METRICS: { key: TrendMetricDTO; label: string; kind: 'rate' | 'months' | 'score' }[] = [
  { key: 'savings_rate', label: '储蓄率', kind: 'rate' },
  { key: 'debt_ratio', label: '负债率', kind: 'rate' },
  { key: 'emergency_months', label: '应急金', kind: 'months' },
  { key: 'score', label: '健康分', kind: 'score' },
];

/** 按指标口径格式化 decimal 字符串。 */
function formatValue(metric: TrendMetricDTO, raw: string): string {
  const v = Number(raw);
  const def = ALL_METRICS.find((m) => m.key === metric);
  if (def?.kind === 'rate') return `${(v * 100).toFixed(1)}%`;
  if (def?.kind === 'months') return `${v.toFixed(1)} 个月`;
  return v.toFixed(1); // score
}

function DirectionChip({ series }: { series: TrendSeriesDTO }) {
  const icon =
    series.direction === 'up' ? (
      <TrendingUpIcon fontSize="small" />
    ) : series.direction === 'down' ? (
      <TrendingDownIcon fontSize="small" />
    ) : (
      <TrendingFlatIcon fontSize="small" />
    );
  const label =
    series.direction === 'up' ? '上升' : series.direction === 'down' ? '下降' : '平稳';
  // 恶化=红；否则储蓄/健康/应急上升=绿、下降=灰；负债率反之
  const deteriorating = series.deteriorating;
  const positive = series.direction === 'up';
  const color: 'error' | 'success' | 'default' = deteriorating
    ? 'error'
    : positive
      ? 'success'
      : 'default';
  return (
    <Chip size="small" icon={icon} label={label} color={color} variant="outlined" />
  );
}

function MetricChart({ series }: { series: TrendSeriesDTO }) {
  const data = series.points.map((p) => ({ period: p.period, value: Number(p.value) }));
  return (
    <Box sx={{ width: '100%', height: 160 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={48} />
          <Tooltip
            formatter={(value) => formatValue(series.metric as TrendMetricDTO, String(value))}
            labelFormatter={(label) => `${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={series.deteriorating ? '#d32f2f' : '#1976d2'}
            strokeWidth={2}
            dot={{ r: 3 }}
            name={ALL_METRICS.find((m) => m.key === series.metric)?.label ?? series.metric}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export function TrendComparison() {
  const [selected, setSelected] = useState<TrendMetricDTO[]>(
    ALL_METRICS.map((m) => m.key),
  );
  const [showSources, setShowSources] = useState(false);

  const { data, isLoading } = useTrends({ metrics: selected, periods: 12 });

  const seriesByMetric = useMemo(() => {
    const map = new Map<string, TrendSeriesDTO>();
    for (const s of data?.data.series ?? []) map.set(s.metric, s);
    return map;
  }, [data]);

  const sourceRefs = data?.sourceRefs ?? [];
  const anyDeteriorating = (data?.data.series ?? []).some((s) => s.deteriorating);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">多期趋势对比（近 12 期）</Typography>
        </Stack>

        <ToggleButtonGroup
          size="small"
          value={selected}
          onChange={(_, next) => {
            if (next.length > 0) setSelected(next);
          }}
          sx={{ mb: 1.5, flexWrap: 'wrap' }}
        >
          {ALL_METRICS.map((m) => (
            <ToggleButton key={m.key} value={m.key}>
              {m.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {isLoading && (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <CircularProgress size={20} />
          </Stack>
        )}

        {!isLoading && (data?.data.series.length ?? 0) === 0 && (
          <Alert severity="info">暂无多期报告数据，生成几个月报后即可查看趋势。</Alert>
        )}

        {anyDeteriorating && (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            检测到部分指标连续多期恶化，建议关注财务状况走向。
          </Alert>
        )}

        <Stack spacing={2}>
          {selected.map((metric) => {
            const series = seriesByMetric.get(metric);
            if (!series || series.points.length === 0) return null;
            const def = ALL_METRICS.find((m) => m.key === metric)!;
            return (
              <Box key={metric}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">{def.label}</Typography>
                  <DirectionChip series={series} />
                </Stack>
                <MetricChart series={series} />
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 0.5 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>期次</TableCell>
                        <TableCell align="right">{def.label}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {series.points.map((p) => (
                        <TableRow key={p.period} hover>
                          <TableCell>{p.period}</TableCell>
                          <TableCell align="right">
                            {formatValue(metric, p.value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          })}
        </Stack>

        <Accordion
          expanded={showSources}
          onChange={(_, e) => setShowSources(e)}
          elevation={0}
          sx={{ mt: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">
              为什么是这个数？（来源依据）
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {sourceRefs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                无多期数据
              </Typography>
            ) : (
              <Stack spacing={0.5}>
                {sourceRefs.map((r, i) => (
                  <Typography key={i} variant="body2">
                    · {r.period} · {r.metric}：{r.value ?? 'N/A'}（{r.verdict}）
                  </Typography>
                ))}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {data?.disclaimer}
        </Typography>
      </CardContent>
    </Card>
  );
}
