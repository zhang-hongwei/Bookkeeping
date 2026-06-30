/**
 * 智能预警面板（Phase 6，US1 / FR-002 / FR-008）。
 * - 活跃预警列表（已过滤静默 kind）+ 确认（acknowledge）/ 按 kind 静默。
 * - 展开依据 ruleFindingRefs（SC-002 / I1）；底部固定免责（FR-009）。
 */
'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Alert,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useAlerts, usePatchAlert, useAlertPreferences, usePatchAlertPreference } from '../hooks/use-finance';
import type { AlertDTO } from '../api';

const SEVERITY_COLOR: Record<string, 'error' | 'warning' | 'info'> = {
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const KIND_LABEL: Record<string, string> = {
  emergency_shortfall: '应急金不足',
  savings_rate_decline: '储蓄率下降',
  debt_ratio_high: '负债率过高',
  trend_deterioration: '趋势恶化',
  concentration: '集中度偏高',
};

export function AlertsPanel() {
  const { data, isLoading } = useAlerts('active');
  const patchAlert = usePatchAlert();
  const { data: prefs } = useAlertPreferences();
  const patchPref = usePatchAlertPreference();

  const alerts = data?.data.alerts ?? [];
  const mutedKinds = new Set((prefs?.preferences ?? []).filter((p) => p.muted).map((p) => p.kind));

  const toggleMute = (kind: AlertDTO['kind']) => {
    patchPref.mutate({ kind, muted: !mutedKinds.has(kind) });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>智能预警</Typography>

        {isLoading && (
          <Typography variant="body2" color="text.secondary">加载预警…</Typography>
        )}

        {!isLoading && alerts.length === 0 && (
          <Alert severity="success">暂无活跃预警，财务状况平稳。</Alert>
        )}

        {patchAlert.isError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {(patchAlert.error as Error)?.message ?? '操作失败'}
          </Alert>
        )}

        <Stack spacing={1}>
          {alerts.map((a) => (
            <Box
              key={a.id}
              sx={{
                p: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={KIND_LABEL[a.kind] ?? a.kind}
                      color={SEVERITY_COLOR[a.severity] ?? 'default'}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">{a.period}</Typography>
                  </Stack>
                  <Typography variant="body2">{a.message}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={patchAlert.isPending}
                    onClick={() => patchAlert.mutate({ id: a.id, status: 'acknowledged' })}
                  >
                    确认
                  </Button>
                  <IconButton
                    size="small"
                    title={mutedKinds.has(a.kind) ? '取消静默' : '静默此类'}
                    onClick={() => toggleMute(a.kind)}
                  >
                    <VolumeOffIcon
                      fontSize="small"
                      color={mutedKinds.has(a.kind) ? 'disabled' : 'action'}
                    />
                  </IconButton>
                </Stack>
              </Stack>

              {a.ruleFindingRefs.length > 0 && (
                <Accordion elevation={0} sx={{ mt: 0.5 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="caption" color="text.secondary">依据（{a.ruleFindingRefs.length}）</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={0.5}>
                      {a.ruleFindingRefs.map((r, i) => (
                        <Typography key={i} variant="caption">
                          · {r.period} · {r.metric}：{r.value ?? 'N/A'}（{r.verdict}）
                        </Typography>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          ))}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {data?.disclaimer}
        </Typography>
      </CardContent>
    </Card>
  );
}
