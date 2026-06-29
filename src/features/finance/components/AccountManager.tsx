/**
 * 账户管理（T024）：净资产汇总 + 账户列表（含余额/欠款方向）+ 归档/恢复/删除。
 *
 * - 归档：保留历史与余额，仅不进新交易默认选项（FR-002）。
 * - 删除：无关联交易才允许；后端 409 时提示「建议归档」。
 * - 信用账户按欠款方向显示余额，并展示信用额度。
 */
'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAccounts, useUpdateAccount, useDeleteAccount } from '../hooks/use-finance';
import type { AccountDTO } from '../api';
import type { AccountType } from '@/database/schema/finance';

const TYPE_LABELS: Record<AccountType, string> = {
  cash: '现金',
  savings: '储蓄',
  credit: '信用',
  investment: '投资',
  real_asset: '实物资产',
  equity: '权益',
  mortgage: '房贷',
  car_loan: '车贷',
  consumer_loan: '消费贷',
  borrowing: '借款',
};

function formatCNY(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function computeNetWorth(accounts: AccountDTO[]): number {
  return accounts
    .filter((a) => a.includeInNetWorth && !a.systemKey)
    .reduce((sum, a) => sum + (a.type === 'credit' ? -Number(a.balance) : Number(a.balance)), 0);
}

export function AccountManager() {
  const [showArchived, setShowArchived] = useState(false);
  const { data, isLoading } = useAccounts({ includeArchived: true });
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const [toast, setToast] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AccountDTO | null>(null);

  const all = (data?.accounts ?? []).filter((a) => !a.systemKey);
  const accounts = showArchived ? all : all.filter((a) => !a.isArchived);
  const netWorth = computeNetWorth(all);

  if (isLoading) {
    return <Typography color="text.secondary">加载账户中…</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            净资产
          </Typography>
          <Typography variant="h4" sx={{ color: netWorth < 0 ? 'error.main' : 'success.main', fontWeight: 700 }}>
            {formatCNY(String(netWorth))}
          </Typography>
        </CardContent>
      </Card>

      <FormControlLabel
        control={<Switch size="small" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />}
        label={<Typography variant="body2">显示已归档</Typography>}
      />

      {accounts.length === 0 ? (
        <Typography color="text.secondary">还没有账户，先创建一个吧。</Typography>
      ) : (
        <Stack spacing={1}>
          {accounts.map((a) => (
            <Card key={a.id} variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip size="small" label={TYPE_LABELS[a.type]} variant="outlined" />
                    <Box>
                      <Typography variant="subtitle2">
                        {a.name}
                        {a.isArchived && (
                          <Chip size="small" label="已归档" sx={{ ml: 1 }} color="default" />
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {a.type === 'credit' ? `欠款 ${formatCNY(a.balance)}` : formatCNY(a.balance)}
                        {a.type === 'credit' && a.creditLimit ? ` · 额度 ${formatCNY(a.creditLimit)}` : ''}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title={a.isArchived ? '恢复' : '归档'}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateAccount.mutate({ id: a.id, payload: { isArchived: !a.isArchived } })
                        }
                      >
                        {a.isArchived ? <UnarchiveOutlinedIcon fontSize="small" /> : <ArchiveOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                      <IconButton size="small" onClick={() => setPendingDelete(a)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Snackbar open={toast !== null} autoHideDuration={4000} onClose={() => setToast(null)}>
        <Alert severity="warning" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>

      <Box>
        {pendingDelete && (
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              删除「{pendingDelete.name}」？
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              仅无关联交易时可硬删；有交易建议归档。
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={() => setPendingDelete(null)}>取消</Button>
              <Button
                size="small"
                color="error"
                variant="contained"
                disabled={deleteAccount.isPending}
                onClick={() =>
                  deleteAccount.mutate(pendingDelete.id, {
                    onSuccess: () => setPendingDelete(null),
                    onError: (err) => setToast((err as Error)?.message ?? '删除失败，建议归档'),
                  })
                }
              >
                删除
              </Button>
            </Stack>
          </Card>
        )}
      </Box>
    </Stack>
  );
}
