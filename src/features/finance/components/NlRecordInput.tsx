/**
 * 自然语言记账入口（T034）：输入一句话 → 候选预览 → 确认落库（走 POST /transactions）。
 *
 * 解析失败（candidate:null）→ 显示原因并提示手动补全。
 */
'use client';

import { useState } from 'react';
import {
  Stack,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useParseNl, useCreateTransaction } from '../hooks/use-finance';
import type { NlCandidateDTO } from '../api';
import type { TransactionType } from '@/database/schema/finance';

const TYPE_LABELS: Record<TransactionType, string> = {
  expense: '支出',
  income: '收入',
  transfer: '转账',
  repayment: '还款',
  revaluation: '估值调整',
  disposal: '处置',
};

export function NlRecordInput() {
  const parseNl = useParseNl();
  const createTxn = useCreateTransaction();
  const [text, setText] = useState('');
  const [candidate, setCandidate] = useState<NlCandidateDTO | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  const handleParse = async () => {
    setCandidate(null);
    setReason(null);
    const res = await parseNl.mutateAsync(text);
    if (res.candidate) setCandidate(res.candidate);
    else setReason(res.reason ?? '无法解析');
  };

  const handleConfirm = async () => {
    if (!candidate) return;
    await createTxn.mutateAsync({
      type: candidate.type,
      amount: candidate.amount,
      fromAccountId: candidate.type === 'income' ? null : candidate.accountId ?? null,
      toAccountId: candidate.type === 'income' ? candidate.accountId ?? null : null,
      categoryId: candidate.categoryId ?? null,
      occurredAt: candidate.occurredAt,
      note: candidate.note,
      source: 'nl',
    });
    setCandidate(null);
    setText('');
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='试试「午饭 35」或「打车 18 去公司」'
        size="small"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleParse().catch(() => undefined);
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Button size="small" onClick={handleParse} disabled={parseNl.isPending || !text.trim()}>
                  {parseNl.isPending ? <CircularProgress size={18} /> : '解析'}
                </Button>
              </InputAdornment>
            ),
          },
        }}
      />

      {parseNl.isError && (
        <Alert severity="error">{(parseNl.error as Error)?.message ?? '解析失败'}</Alert>
      )}

      {reason && (
        <Alert severity="info">
          {reason}。可手动在「记一笔」表单中补全。
        </Alert>
      )}

      {candidate && (
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip size="small" label={TYPE_LABELS[candidate.type]} color="primary" variant="outlined" />
              <Typography variant="h6">¥{Number(candidate.amount).toFixed(2)}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {candidate.note ?? ''}
              {candidate.occurredAt ? ` · ${new Date(candidate.occurredAt).toLocaleString('zh-CN')}` : ''}
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              <Button variant="contained" size="small" onClick={handleConfirm} disabled={createTxn.isPending}>
                {createTxn.isPending ? <CircularProgress size={18} /> : '确认记账'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
