/**
 * 截图记账入口（US2）：上传/拍照支付截图 → 多模态识别候选 → 逐笔确认落库（source=ocr）。
 *
 * requireManualConfirm（多笔/低置信）→ 提示人工核对；无法识别 → reason 引导手动补全。
 */
'use client';

import { useState } from 'react';
import {
  Stack,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { useParseOcr, useCreateTransaction } from '../hooks/use-finance';
import type { OcrCandidateDTO } from '../api';
import type { TransactionType } from '@/database/schema/finance';

const TYPE_LABELS: Record<TransactionType, string> = {
  expense: '支出',
  income: '收入',
  transfer: '转账',
};

export function OcrRecordInput() {
  const parseOcr = useParseOcr();
  const createTxn = useCreateTransaction();
  const [result, setResult] = useState<{
    candidates: OcrCandidateDTO[];
    requireManualConfirm: boolean;
    reason?: string;
  } | null>(null);

  const handleFile = async (file: File) => {
    setResult(null);
    const res = await parseOcr.mutateAsync(file);
    setResult({
      candidates: res.candidates,
      requireManualConfirm: res.requireManualConfirm,
      reason: res.reason,
    });
  };

  const confirm = (c: OcrCandidateDTO) =>
    createTxn.mutate({
      type: c.type,
      amount: c.amount,
      fromAccountId: c.type === 'income' ? null : c.accountId ?? null,
      toAccountId: c.type === 'income' ? c.accountId ?? null : null,
      categoryId: c.categoryId ?? null,
      occurredAt: c.occurredAt,
      note: c.note,
      source: 'ocr',
    });

  return (
    <Stack spacing={1.5}>
      <Button component="label" variant="outlined" size="small" startIcon={<AddAPhotoIcon />} disabled={parseOcr.isPending}>
        拍照/上传截图
        <input
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f).catch(() => undefined);
          }}
        />
      </Button>
      {parseOcr.isPending && <CircularProgress size={18} />}
      {parseOcr.isError && (
        <Alert severity="error">{(parseOcr.error as Error)?.message ?? '识别失败'}</Alert>
      )}

      {result?.reason && (
        <Alert severity="info">{result.reason}，请手动在记账表单补全。</Alert>
      )}

      {result && result.candidates.length > 0 && (
        <Box>
          {result.requireManualConfirm && (
            <Alert severity="warning" sx={{ mb: 1 }}>识别为多笔或置信度较低，请逐笔核对后确认。</Alert>
          )}
          <Stack spacing={1}>
            {result.candidates.map((c, i) => (
              <Card key={i} variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={TYPE_LABELS[c.type]} variant="outlined" />
                      <Typography variant="subtitle2">¥{Number(c.amount).toFixed(2)}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {[c.counterparty, c.note].filter(Boolean).join(' · ') || '截图记账'}
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={createTxn.isPending}
                    onClick={() => confirm(c)}
                  >
                    确认
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
