/**
 * 账单导入流程（T030）：上传/粘贴账单 → 预览（含 pending/duplicate 徽章）→ 选择确认。
 *
 * 流程：读取 CSV 文本 → POST /import（解析去重）→ 展示预览 → 确认落库。
 */
'use client';

import { useState } from 'react';
import {
  Box,
  Stack,
  Button,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useAccounts, useStartImport, useConfirmImport } from '../hooks/use-finance';
import type { BillImportPreviewRow } from '../api';

const STATUS_META: Record<BillImportPreviewRow['status'], { label: string; color: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  pending: { label: '待确认', color: 'info' },
  imported: { label: '已导入', color: 'success' },
  duplicate: { label: '重复', color: 'warning' },
  error: { label: '错误', color: 'error' },
};

export function ImportFlow() {
  const { data: accountsData } = useAccounts();
  const accounts = (accountsData?.accounts ?? []).filter((a) => !a.isArchived);
  const startImport = useStartImport();
  const confirmImport = useConfirmImport();

  const [preview, setPreview] = useState<BillImportPreviewRow[] | null>(null);
  const [billImportId, setBillImportId] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number; failed: number } | null>(null);

  const handleFile = async (file: File) => {
    setResult(null);
    setPreview(null);
    const rawText = await file.text();
    const res = await startImport.mutateAsync({ rawText, fileName: file.name });
    setBillImportId(res.billImportId);
    setPreview(res.preview);
  };

  const handleConfirm = async () => {
    if (!billImportId) return;
    const defaultAccountId = accounts[0]?.id;
    const res = await confirmImport.mutateAsync({ id: billImportId, payload: { defaultAccountId } });
    setResult(res);
    setPreview(null);
    setBillImportId(null);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        上传支付宝/微信导出的账单 CSV，系统解析、去重并预览，确认后落库。
      </Typography>

      <Box>
        <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={startImport.isPending}>
          选择账单文件
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f).catch(() => undefined);
            }}
          />
        </Button>
        {startImport.isPending && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </Box>

      {startImport.isError && (
        <Alert severity="error">{(startImport.error as Error)?.message ?? '解析失败'}</Alert>
      )}

      {preview && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">预览（{preview.length} 行）</Typography>
            <Button variant="contained" size="small" onClick={handleConfirm} disabled={confirmImport.isPending || accounts.length === 0}>
              {confirmImport.isPending ? <CircularProgress size={18} /> : '确认导入'}
            </Button>
          </Stack>
          {accounts.length === 0 && (
            <Alert severity="warning" sx={{ mb: 1 }}>请先创建账户再导入。</Alert>
          )}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>状态</TableCell>
                  <TableCell>时间</TableCell>
                  <TableCell>对方/备注</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell align="right">金额</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Chip size="small" label={STATUS_META[row.status].label} color={STATUS_META[row.status].color} variant="outlined" />
                    </TableCell>
                    <TableCell>{row.parsed.occurredAt ? new Date(row.parsed.occurredAt).toLocaleString('zh-CN') : '-'}</TableCell>
                    <TableCell>{[row.parsed.counterparty, row.parsed.note].filter(Boolean).join(' · ') || '-'}</TableCell>
                    <TableCell>{row.parsed.type === 'income' ? '收入' : '支出'}</TableCell>
                    <TableCell align="right">¥{Number(row.parsed.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {result && (
        <Alert severity="success">
          导入完成：成功 {result.imported} 笔，跳过/重复 {result.skipped} 笔，失败 {result.failed} 笔。
        </Alert>
      )}
    </Stack>
  );
}
