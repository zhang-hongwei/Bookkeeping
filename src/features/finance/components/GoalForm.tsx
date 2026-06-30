/**
 * 目标设置表单（Phase 5，US2，FR-005）。名称/金额/截止日/口径/关联账户。
 * - progressBasis=linked：选关联账户（余额求和为当前金额，D4）。
 * - progressBasis=manual：手维护 manualAmount。
 */
'use client';

import { useState } from 'react';
import {
  Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography, CircularProgress,
} from '@mui/material';
import { useAccounts, useCreateGoal } from '../hooks/use-finance';

type Basis = 'manual' | 'linked' | 'net_worth';
const BASIS_LABELS: Record<Basis, string> = { manual: '手动', linked: '关联账户', net_worth: '总净资产' };

export function GoalForm({ onCreated }: { onCreated?: () => void }) {
  const { data: accData } = useAccounts();
  const create = useCreateGoal();
  const accounts = (accData?.accounts ?? []).filter((a) => !a.isArchived);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [basis, setBasis] = useState<Basis>('manual');
  const [linkedAccountIds, setLinkedAccountIds] = useState<string[]>([]);
  const [manualAmount, setManualAmount] = useState('');
  const [notes, setNotes] = useState('');

  const submit = async () => {
    const target = Number(targetAmount);
    if (!name.trim() || !Number.isFinite(target) || target <= 0) return;
    if (basis === 'linked' && linkedAccountIds.length === 0) return;
    await create.mutateAsync({
      name: name.trim(),
      targetAmount: target.toFixed(2),
      targetDate: targetDate || null,
      progressBasis: basis,
      linkedAccountIds: basis === 'linked' ? linkedAccountIds : [],
      manualAmount: basis === 'manual' && manualAmount ? Number(manualAmount).toFixed(2) : undefined,
      notes: notes.trim() || null,
    });
    setName(''); setTargetAmount(''); setTargetDate(''); setManualAmount(''); setNotes('');
    setLinkedAccountIds([]);
    onCreated?.();
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>设置目标</Typography>
        <Stack spacing={1.5}>
          <TextField size="small" label="目标名称" value={name} onChange={(e) => setName(e.target.value)} placeholder="如：旅游基金" />
          <TextField size="small" label="目标金额（¥）" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="30000.00" />
          <TextField size="small" label="截止日（可选，留空=开放式）" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField select size="small" label="进度口径" value={basis} onChange={(e) => setBasis(e.target.value as Basis)}>
            {(Object.entries(BASIS_LABELS) as [Basis, string][]).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
          </TextField>
          {basis === 'linked' && (
            <TextField
              select
              size="small"
              label="关联账户（可多选）"
              SelectProps={{ multiple: true, value: linkedAccountIds, onChange: (e) => setLinkedAccountIds(e.target.value as string[]) }}
            >
              {accounts.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.name}（{a.type}）</MenuItem>
              ))}
            </TextField>
          )}
          {basis === 'manual' && (
            <TextField size="small" label="当前已存金额（¥）" type="number" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} placeholder="0.00" />
          )}
          <TextField size="small" label="备注（可选）" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button
            variant="contained" size="small"
            disabled={create.isPending || !name || !targetAmount || (basis === 'linked' && linkedAccountIds.length === 0)}
            onClick={submit}
            startIcon={create.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            创建目标
          </Button>
          {create.isError && (
            <Typography variant="caption" color="error.main">{(create.error as Error)?.message ?? '创建失败'}</Typography>
          )}
        </Stack>
        <Box />
      </CardContent>
    </Card>
  );
}
