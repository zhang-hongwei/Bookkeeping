/**
 * 投资持仓管理（Phase 3，US1/US2）：登记持仓 + 列表（市值/成本/盈亏/收益率）+ 买卖 + 估值同步。
 *
 * 当前市值 = 账户 balance（后端推导）；盈亏 = 市值 − 成本、盈亏率 = 盈亏 / 成本（SC-003）。
 * 行情来源/时间用 Chip 标注（manual/market/estimate），陈旧或缺失时允许手动改价（SC-004）。
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
  usePositions,
  useCreatePosition,
  useRevaluePosition,
  useAccounts,
} from '../hooks/use-finance';
import { TradeForm } from './TradeForm';
import type { PositionDTO, InstrumentType, EstimateConfidence, PriceSource } from '../api';

const INSTRUMENT_OPTIONS: { value: InstrumentType; label: string }[] = [
  { value: 'fund', label: '基金' },
  { value: 'stock', label: '股票' },
  { value: 'bond', label: '债券' },
  { value: 'gold', label: '黄金' },
  { value: 'etf', label: 'ETF' },
  { value: 'reits', label: 'REITs' },
  { value: 'crypto', label: '加密货币' },
];

const PRICE_SOURCE_COLOR: Record<PriceSource, 'default' | 'success' | 'warning'> = {
  manual: 'default',
  market: 'success',
  estimate: 'warning',
};

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
  const pct = (n * 100).toFixed(2);
  return `${n >= 0 ? '+' : ''}${pct}%`;
}

export function PositionManager() {
  const { data, isLoading } = usePositions();
  const { data: accountsData } = useAccounts();
  const createPosition = useCreatePosition();
  const revaluePosition = useRevaluePosition();

  const cashAccounts = (accountsData?.accounts ?? []).filter((a) =>
    ['cash', 'savings'].includes(a.type),
  );

  const [form, setForm] = useState({
    name: '',
    instrumentCode: '',
    instrumentType: 'fund' as InstrumentType,
    confidence: 'medium' as EstimateConfidence,
  });
  const [revaluePrice, setRevaluePrice] = useState<Record<string, string>>({});

  const positions = data?.items ?? [];

  async function handleCreate() {
    if (!form.name || !form.instrumentCode) return;
    await createPosition.mutateAsync({
      name: form.name,
      instrumentCode: form.instrumentCode,
      instrumentType: form.instrumentType,
    });
    setForm({ name: '', instrumentCode: '', instrumentType: 'fund', confidence: 'medium' });
  }

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            登记持仓
          </Typography>
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
              label="品种代码"
              value={form.instrumentCode}
              onChange={(e) => setForm({ ...form, instrumentCode: e.target.value })}
              sx={{ minWidth: 140 }}
            />
            <TextField
              size="small"
              select
              label="类型"
              value={form.instrumentType}
              onChange={(e) => setForm({ ...form, instrumentType: e.target.value as InstrumentType })}
              sx={{ minWidth: 120 }}
            >
              {INSTRUMENT_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" size="small" onClick={handleCreate} disabled={createPosition.isPending}>
              登记
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {isLoading ? (
        <CircularProgress size={24} />
      ) : positions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          暂无持仓
        </Typography>
      ) : (
        positions.map((p) => (
          <PositionCard
            key={p.id}
            position={p}
            cashAccounts={cashAccounts.map((c) => ({ id: c.id, name: c.name }))}
            revalueValue={revaluePrice[p.id] ?? ''}
            onRevalueValue={(v) => setRevaluePrice({ ...revaluePrice, [p.id]: v })}
            onRevalue={() =>
              revaluePosition.mutateAsync({
                id: p.id,
                payload: { currentPrice: revaluePrice[p.id] ?? p.position.currentPrice, source: 'manual' },
              })
            }
            busy={revaluePosition.isPending}
          />
        ))
      )}
    </Stack>
  );
}

function PositionCard(props: {
  position: PositionDTO;
  cashAccounts: { id: string; name: string }[];
  revalueValue: string;
  onRevalueValue: (v: string) => void;
  onRevalue: () => void;
  busy: boolean;
}) {
  const { position: p } = props;
  const pnlNegative = Number(p.position.pnl) < 0;
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" useFlexGap>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1">{p.name}</Typography>
              <Chip size="small" label={p.position.instrumentCode} variant="outlined" />
              <Chip
                size="small"
                label={p.position.priceSource}
                color={PRICE_SOURCE_COLOR[p.position.priceSource]}
              />
              {p.position.isClosed && <Chip size="small" label="已平仓" color="default" />}
            </Stack>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {fmt(p.position.marketValue)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              成本 {fmt(p.position.cost)} · 持有 {p.position.quantity} 份 @ ¥{p.position.costPrice}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: pnlNegative ? 'error.main' : 'success.main', mt: 0.25 }}
            >
              盈亏 {fmt(p.position.pnl)}（{fmtRate(p.position.pnlRate)}）
            </Typography>
          </Box>
        </Stack>

        {!p.position.isClosed && (
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            <TradeForm
              positionId={p.id}
              cashAccounts={props.cashAccounts}
              holdingQuantity={p.position.quantity}
              isClosed={p.position.isClosed}
            />
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <TextField
                size="small"
                label="现价（手动改价）"
                value={props.revalueValue}
                onChange={(e) => props.onRevalueValue(e.target.value)}
                sx={{ minWidth: 150 }}
              />
              <Button size="small" variant="outlined" onClick={props.onRevalue} disabled={props.busy}>
                估值同步
              </Button>
              <Typography variant="caption" color="text.secondary">
                行情缺失/陈旧时手动改价（SC-004），绝不伪造价格
              </Typography>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
