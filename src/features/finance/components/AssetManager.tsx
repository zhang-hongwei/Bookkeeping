/**
 * 资产管理（Phase 2，US1）：登记 real_asset/investment + 列表（估值置信度标记）+ 估值更新/处置。
 *
 * 估值置信度高/中/低 用 Chip 颜色区分（诚实估值，P6）；当前价值 = 账户 balance（后端推导）。
 * 估值更新/处置走专用 API（复式 revaluation/disposal，不改 balance 绕过分录）。
 */
'use client';

import { useState } from 'react';
import {
  Stack,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Typography,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  useAssets,
  useCreateAsset,
  useRevalueAsset,
  useDisposeAsset,
  useAccounts,
} from '../hooks/use-finance';
import type { AssetDTO, EstimateConfidence } from '../api';

const CONFIDENCE_COLOR: Record<EstimateConfidence, 'success' | 'warning' | 'error'> = {
  high: 'success',
  medium: 'warning',
  low: 'error',
};
const CONFIDENCE_LABEL: Record<EstimateConfidence, string> = {
  high: '高置信',
  medium: '中置信',
  low: '低置信',
};

function fmt(value: string): string {
  const n = Number(value);
  return Number.isFinite(n)
    ? `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
}

export function AssetManager() {
  const { data, isLoading } = useAssets();
  const { data: accountsData } = useAccounts();
  const createAsset = useCreateAsset();
  const revalueAsset = useRevalueAsset();
  const disposeAsset = useDisposeAsset();

  const cashAccounts = (accountsData?.accounts ?? []).filter((a) =>
    ['cash', 'savings'].includes(a.type),
  );

  const [form, setForm] = useState({
    name: '',
    type: 'real_asset' as 'real_asset' | 'investment',
    currentValue: '',
    costBasis: '',
    confidence: 'medium' as EstimateConfidence,
  });
  const [revalue, setRevalue] = useState<Record<string, string>>({});
  const [dispose, setDispose] = useState<Record<string, { cash: string; proceeds: string }>>({});

  const assets = data?.items ?? [];

  async function handleCreate() {
    if (!form.name || !form.currentValue) return;
    await createAsset.mutateAsync({
      name: form.name,
      type: form.type,
      currentValue: form.currentValue,
      costBasis: form.costBasis || undefined,
      estimateConfidence: form.confidence,
    });
    setForm({ name: '', type: 'real_asset', currentValue: '', costBasis: '', confidence: 'medium' });
  }

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>登记资产</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              label="名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={{ minWidth: 160 }}
            />
            <TextField
              size="small"
              select
              label="类型"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'real_asset' | 'investment' })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="real_asset">实物资产</MenuItem>
              <MenuItem value="investment">投资</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="当前估值"
              value={form.currentValue}
              onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
              sx={{ minWidth: 140 }}
            />
            <TextField
              size="small"
              label="成本（可选）"
              value={form.costBasis}
              onChange={(e) => setForm({ ...form, costBasis: e.target.value })}
              sx={{ minWidth: 140 }}
            />
            <TextField
              size="small"
              select
              label="置信度"
              value={form.confidence}
              onChange={(e) => setForm({ ...form, confidence: e.target.value as EstimateConfidence })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="high">高</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="low">低</MenuItem>
            </TextField>
            <Button variant="contained" size="small" onClick={handleCreate} disabled={createAsset.isPending}>
              登记
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {isLoading ? (
        <CircularProgress size={24} />
      ) : assets.length === 0 ? (
        <Typography variant="body2" color="text.secondary">暂无资产</Typography>
      ) : (
        assets.map((a) => (
          <AssetCard
            key={a.id}
            asset={a}
            cashAccounts={cashAccounts.map((c) => ({ id: c.id, name: c.name }))}
            revalueValue={revalue[a.id] ?? ''}
            onRevalueValue={(v) => setRevalue({ ...revalue, [a.id]: v })}
            onRevalue={() =>
              revalueAsset.mutateAsync({
                id: a.id,
                payload: { newValue: revalue[a.id] ?? a.currentValue },
              })
            }
            dispose={dispose[a.id] ?? { cash: cashAccounts[0]?.id ?? '', proceeds: '' }}
            onDisposeChange={(d) => setDispose({ ...dispose, [a.id]: d })}
            onDispose={() =>
              disposeAsset.mutateAsync({
                id: a.id,
                payload: {
                  cashAccountId: dispose[a.id]?.cash ?? cashAccounts[0]?.id ?? '',
                  proceeds: dispose[a.id]?.proceeds ?? a.currentValue,
                },
              })
            }
            busy={revalueAsset.isPending || disposeAsset.isPending}
          />
        ))
      )}
    </Stack>
  );
}

function AssetCard(props: {
  asset: AssetDTO;
  cashAccounts: { id: string; name: string }[];
  revalueValue: string;
  onRevalueValue: (v: string) => void;
  onRevalue: () => void;
  dispose: { cash: string; proceeds: string };
  onDisposeChange: (d: { cash: string; proceeds: string }) => void;
  onDispose: () => void;
  busy: boolean;
}) {
  const { asset: a, busy } = props;
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1">{a.name}</Typography>
              <Chip size="small" label={a.type === 'real_asset' ? '实物' : '投资'} variant="outlined" />
              <Chip
                size="small"
                label={CONFIDENCE_LABEL[a.estimateConfidence]}
                color={CONFIDENCE_COLOR[a.estimateConfidence]}
              />
              {a.isDisposed && <Chip size="small" label="已处置" color="default" />}
            </Stack>
            <Typography variant="h6" sx={{ mt: 0.5 }}>{fmt(a.currentValue)}</Typography>
            <Typography variant="caption" color="text.secondary">
              成本 {fmt(a.costBasis)} · 估值日 {a.valuationDate ?? '—'} · 估值历史 {a.valuationHistory.length} 条
            </Typography>
          </Box>
        </Stack>

        {!a.isDisposed && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              label="新估值"
              value={props.revalueValue}
              onChange={(e) => props.onRevalueValue(e.target.value)}
              sx={{ minWidth: 130 }}
            />
            <Button size="small" variant="outlined" onClick={props.onRevalue} disabled={busy}>
              更新估值
            </Button>
            <TextField
              size="small"
              select
              label="收款账户"
              value={props.dispose.cash}
              onChange={(e) => props.onDisposeChange({ ...props.dispose, cash: e.target.value })}
              sx={{ minWidth: 130 }}
            >
              {props.cashAccounts.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="出售款"
              value={props.dispose.proceeds}
              onChange={(e) => props.onDisposeChange({ ...props.dispose, proceeds: e.target.value })}
              sx={{ minWidth: 130 }}
            />
            <Button size="small" color="error" variant="outlined" onClick={props.onDispose} disabled={busy}>
              处置
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
