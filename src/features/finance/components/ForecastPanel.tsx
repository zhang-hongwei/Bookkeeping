/**
 * 现金流预测面板（Phase 6，US1 / FR-001）。
 * - 预测结余曲线 + 不确定性区间 + 应急金不足点标注。
 * - 历史不足降级（insufficientHistory）展示提示，不渲染伪预测。
 * - 「为什么是这个数」展开 sourceRefs（SC-002）；底部固定免责（FR-009）。
 */
'use client';

import { useState } from 'react';
import {
  Box,
  Button,
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
} from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useForecast, useRegenerateForecast } from '../hooks/use-finance';

/** decimal 字符串 → 展示金额（¥）。 */
function yuan(v: string): string {
  return `¥${Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
}

export function ForecastPanel() {
  const { data, isLoading } = useForecast({ months: 3 });
  const regenerate = useRegenerateForecast();
  const [showSources, setShowSources] = useState(false);

  const forecast = data?.data;
  const sourceRefs = data?.sourceRefs ?? [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">现金流预测（未来 3 个月）</Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={regenerate.isPending}
            onClick={() => regenerate.mutate({ months: 3 })}
          >
            {regenerate.isPending ? <CircularProgress size={16} /> : '重新预测'}
          </Button>
        </Stack>

        {isLoading && (
          <Typography variant="body2" color="text.secondary">加载预测…</Typography>
        )}

        {regenerate.isError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {(regenerate.error as Error)?.message ?? '预测失败'}
          </Alert>
        )}

        {forecast?.insufficientHistory && (
          <Alert severity="info">
            历史数据不足（少于 3 个月），暂无法可靠预测。建议积累更多月份的收支记录后再查看。
          </Alert>
        )}

        {forecast && !forecast.insufficientHistory && forecast.points.length > 0 && (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={`模型 ${forecast.modelVersion}`}
                color="default"
                variant="outlined"
              />
              {forecast.emergencyShortfallMonth && (
                <Chip
                  size="small"
                  label={`预测 ${forecast.emergencyShortfallMonth} 应急金不足`}
                  color="error"
                  variant="outlined"
                />
              )}
            </Stack>

            <Box sx={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <AreaChart data={forecast.points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={64} />
                  <Tooltip
                    formatter={(value) => yuan(String(value))}
                    labelFormatter={(label) => `${label} 预测结余`}
                  />
                  <defs>
                    <linearGradient id="forecastSurplus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="surplus"
                    stroke="#1976d2"
                    fill="url(#forecastSurplus)"
                    name="预测结余"
                  />
                  {forecast.emergencyShortfallMonth && (
                    <ReferenceLine
                      x={forecast.emergencyShortfallMonth}
                      stroke="#d32f2f"
                      strokeDasharray="4 4"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>月份</TableCell>
                    <TableCell align="right">预测结余</TableCell>
                    <TableCell align="right">期末现金</TableCell>
                    <TableCell align="right">区间（低–高）</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forecast.points.map((p) => (
                    <TableRow
                      key={p.month}
                      hover
                      sx={
                        p.month === forecast.emergencyShortfallMonth
                          ? { backgroundColor: 'error.light' }
                          : undefined
                      }
                    >
                      <TableCell>{p.month}</TableCell>
                      <TableCell align="right">{yuan(p.surplus)}</TableCell>
                      <TableCell align="right">{yuan(p.cashBalance)}</TableCell>
                      <TableCell align="right">
                        {yuan(p.lower)} – {yuan(p.upper)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}

        <Accordion expanded={showSources} onChange={(_, e) => setShowSources(e)} elevation={0} sx={{ mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">为什么是这个数？（来源依据）</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {sourceRefs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">无历史输入</Typography>
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
