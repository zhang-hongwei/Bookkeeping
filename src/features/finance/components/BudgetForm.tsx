/**
 * 预算设置表单（Phase 5，US1，FR-001）。分类（含「总支出」）+ 额度 + 周期 + 阈值。
 * 分类列表来自 useCategories('expense')（父子分类由后端子树汇总，D2）。
 */
'use client';

import { useState } from 'react';
import {
  Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography, Slider, CircularProgress,
} from '@mui/material';
import { useCategories, useCreateBudget } from '../hooks/use-finance';

const PERIOD_LABELS: Record<string, string> = { month: '月度', week: '周度', year: '年度' };

export function BudgetForm({ onCreated }: { onCreated?: () => void }) {
  const { data: catData } = useCategories('expense');
  const create = useCreateBudget();
  const categories = catData?.categories ?? [];

  const [categoryId, setCategoryId] = useState<string>('__total__');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [periodType, setPeriodType] = useState<'month' | 'week' | 'year'>('month');
  const [threshold, setThreshold] = useState(0.8);

  const submit = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return;
    await create.mutateAsync({
      categoryId: categoryId === '__total__' ? null : categoryId,
      name: name.trim() || null,
      amount: amt.toFixed(2),
      periodType,
      alertThreshold: threshold.toFixed(2),
    });
    setName('');
    setAmount('');
    onCreated?.();
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>设置预算</Typography>
        <Stack spacing={1.5}>
          <TextField
            select
            size="small"
            label="分类"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <MenuItem value="__total__">总支出（全部分类）</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="名称（可选）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：日常餐饮"
          />
          <TextField
            size="small"
            label="额度（¥）"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="2000.00"
          />
          <TextField
            select
            size="small"
            label="周期"
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as 'month' | 'week' | 'year')}
          >
            {Object.entries(PERIOD_LABELS).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
          </TextField>
          <Box>
            <Typography variant="caption" color="text.secondary">
              预警阈值：{(threshold * 100).toFixed(0)}%
            </Typography>
            <Slider
              value={threshold}
              onChange={(_, v) => setThreshold(v as number)}
              min={0.3}
              max={1}
              step={0.05}
              size="small"
            />
          </Box>
          <Button
            variant="contained"
            size="small"
            disabled={create.isPending || !amount}
            onClick={submit}
            startIcon={create.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            创建预算
          </Button>
          {create.isError && (
            <Typography variant="caption" color="error.main">
              {(create.error as Error)?.message ?? '创建失败'}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
