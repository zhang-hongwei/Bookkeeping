/**
 * 投资交易表单（Phase 3，US1）—— 买入/卖出共用。
 *
 * 金额/份额/单价一律字符串（避免 JS number 精度问题）；卖出额外有印花税字段。
 * 复式正确性由后端保证（buy=transfer 净资产不变；sell=disposal 实现盈亏）。
 */
'use client';

import { useState } from 'react';
import { Stack, TextField, Button, MenuItem, Box, Typography } from '@mui/material';
import { useBuyPosition, useSellPosition } from '../hooks/use-finance';
import type { BuyPayload, SellPayload } from '../api';

export interface TradeFormProps {
  positionId: string;
  /** 可用现金账户（id/name）。 */
  cashAccounts: { id: string; name: string }[];
  /** 当前持有份额（卖出上限校验提示用）。 */
  holdingQuantity: string;
  /** 卖出后是否已平仓。 */
  isClosed: boolean;
  onDone?: () => void;
}

export function TradeForm({
  positionId,
  cashAccounts,
  holdingQuantity,
  isClosed,
  onDone,
}: TradeFormProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [fee, setFee] = useState('');
  const [tax, setTax] = useState('');
  const [cash, setCash] = useState(cashAccounts[0]?.id ?? '');

  const buyPos = useBuyPosition();
  const sellPos = useSellPosition();
  const pending = buyPos.isPending || sellPos.isPending;

  async function submit() {
    if (!shares || !price || !cash) return;
    if (mode === 'buy') {
      const payload: BuyPayload = {
        cashAccountId: cash,
        shares,
        price,
        fee: fee || undefined,
      };
      await buyPos.mutateAsync({ id: positionId, payload });
    } else {
      const payload: SellPayload = {
        cashAccountId: cash,
        shares,
        price,
        fee: fee || undefined,
        tax: tax || undefined,
      };
      await sellPos.mutateAsync({ id: positionId, payload });
    }
    setShares('');
    setPrice('');
    setFee('');
    setTax('');
    onDone?.();
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          variant={mode === 'buy' ? 'contained' : 'outlined'}
          onClick={() => setMode('buy')}
        >
          买入
        </Button>
        <Button
          size="small"
          color="error"
          variant={mode === 'sell' ? 'contained' : 'outlined'}
          onClick={() => setMode('sell')}
          disabled={isClosed}
        >
          卖出
        </Button>
        {mode === 'sell' && (
          <Typography variant="caption" color="text.secondary">
            持有 {holdingQuantity} 份
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          label="份额"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          sx={{ minWidth: 120 }}
        />
        <TextField
          size="small"
          label="单价"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          sx={{ minWidth: 120 }}
        />
        <TextField
          size="small"
          label="费用"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          sx={{ minWidth: 100 }}
        />
        {mode === 'sell' && (
          <TextField
            size="small"
            label="印花税"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            sx={{ minWidth: 100 }}
          />
        )}
        <TextField
          size="small"
          select
          label={mode === 'buy' ? '付款账户' : '收款账户'}
          value={cash}
          onChange={(e) => setCash(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          {cashAccounts.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <Button size="small" variant="contained" onClick={submit} disabled={pending}>
          确认{mode === 'buy' ? '买入' : '卖出'}
        </Button>
      </Stack>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {mode === 'buy'
            ? '买入：资金从现金转入持仓，净资产不变（SC-001）；费用计入成本。'
            : '卖出：按 proportion 市值结转，实现盈亏如实计入。'}
        </Typography>
      </Box>
    </Stack>
  );
}
