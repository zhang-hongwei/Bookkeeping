/**
 * 组合优化方向面板（Phase 7，US4 / FR-004）。
 * - 当前各资产类别占比 vs 目标区间（band），方向卡 under/over/ok。
 * - hint 仅方向，不含品种/买卖数量（I11）；无持仓 → 空态。
 * - 「非投资建议」免责强渲染（SC-004）；AI 解读仅文本旁注（NC5 零编造）。
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
  Skeleton,
} from '@mui/material';
import { usePortfolioHints, useInterpretPortfolioHints } from '../hooks/use-finance';

const DIRECTION_LABEL: Record<string, string> = {
  under: '偏低',
  over: '偏高',
  ok: '合理',
};
const DIRECTION_COLOR: Record<string, 'warning' | 'error' | 'success'> = {
  under: 'warning',
  over: 'error',
  ok: 'success',
};
const CLASS_LABEL: Record<string, string> = {
  cash: '现金',
  fixed_income: '固收',
  equity: '权益',
  alternative: '另类',
};

function yuan(v: string): string {
  return `¥${Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
}
function pct(v: string): string {
  return `${(Number(v) * 100).toFixed(1)}%`;
}

export function PortfolioOptimization({ familyId }: { familyId?: string } = {}) {
  const { data, isLoading } = usePortfolioHints(familyId);
  const interpret = useInterpretPortfolioHints();
  const [text, setText] = useState('');

  const hints = data?.portfolioHints;

  const runInterpret = async () => {
    setText('');
    const r = await interpret.mutateAsync(familyId);
    setText(r.text);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle2">组合优化方向</Typography>
          {hints && (
            <Chip size="small" variant="outlined" label={`band ${hints.targetBandsVersion}`} />
          )}
        </Stack>

        {isLoading && <Skeleton variant="rectangular" height={120} />}

        {hints && hints.hints.length === 0 && (
          <Alert severity="info">
            暂无投资持仓，无法给出配置方向建议。添加持仓后自动重算（不编造，SC-005）。
          </Alert>
        )}

        {hints && hints.hints.length > 0 && (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              持仓总市值 {yuan(hints.totalMarketValue)} · 以下为各资产类别相对目标区间的方向（仅方向参考）：
            </Typography>
            <Stack spacing={1}>
              {hints.hints.map((h) => (
                <Box
                  key={h.assetClass}
                  sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1 }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {CLASS_LABEL[h.assetClass] ?? h.assetClass}
                      </Typography>
                      <Chip
                        size="small"
                        color={DIRECTION_COLOR[h.direction]}
                        label={DIRECTION_LABEL[h.direction]}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      当前 {pct(h.currentRatio)} · 目标 {(h.targetBand.min * 100).toFixed(0)}
                      %–{(h.targetBand.max * 100).toFixed(0)}%
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {h.reason}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Box>
              <Button
                size="small"
                variant="outlined"
                disabled={interpret.isPending}
                onClick={runInterpret}
                startIcon={
                  interpret.isPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                AI 解读方向
              </Button>
              {text && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {text}
                </Alert>
              )}
            </Box>
          </Stack>
        )}

        {hints?.disclaimers.map((d, i) => (
          <Typography
            key={i}
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
          >
            · {d}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
}
