/**
 * 交易明细列表（T020）。
 *
 * - 列出交易（时间/类型/金额/分类/备注）；金额按类型着色。
 * - 可删除交易（带确认）；删除后余额由后端在事务内回滚并使查询失效。
 * - entries 不在此处逐条展示（MVP 聚焦「余额正确 + 平衡」），仅展示业务语义。
 */
'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTransactions, useDeleteTransaction } from '../hooks/use-finance';
import type { TransactionDTO } from '../api';
import type { TransactionType } from '@/database/schema/finance';

const TYPE_META: Record<TransactionType, { label: string; color: string; sign: string }> = {
  expense: { label: '支出', color: 'error.main', sign: '-' },
  income: { label: '收入', color: 'success.main', sign: '+' },
  transfer: { label: '转账', color: 'text.secondary', sign: '' },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function TransactionList({ accountId }: { accountId?: string }) {
  const { data, isLoading } = useTransactions({ accountId, pageSize: 50 });
  const deleteTxn = useDeleteTransaction();
  const [pendingDelete, setPendingDelete] = useState<TransactionDTO | null>(null);

  const items = data?.items ?? [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">交易明细</Typography>
        {data && (
          <Typography variant="caption" color="text.secondary">
            共 {data.total} 笔
          </Typography>
        )}
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">加载中…</Typography>
      ) : items.length === 0 ? (
        <Typography color="text.secondary">暂无交易。</Typography>
      ) : (
        <Stack spacing={1}>
          {items.map((t) => {
            const meta = TYPE_META[t.type];
            return (
              <Card key={t.id} variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={meta.label} variant="outlined" />
                      <Typography variant="subtitle2">
                        ¥{Number(t.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </Typography>
                      {t.source !== 'manual' && (
                        <Chip size="small" label={t.source === 'import' ? '导入' : '语音'} color="info" variant="outlined" />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(t.occurredAt)}
                      {t.note ? ` · ${t.note}` : ''}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: meta.color }}>
                      {meta.sign}¥{Number(t.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="删除"
                      onClick={() => setPendingDelete(t)}
                      disabled={deleteTxn.isPending}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>删除这笔交易？</DialogTitle>
        <DialogContent>
          <Typography>
            删除后相关账户余额会在一次操作内同步回滚，账目保持平衡。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>取消</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (!pendingDelete) return;
              deleteTxn.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
            }}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
