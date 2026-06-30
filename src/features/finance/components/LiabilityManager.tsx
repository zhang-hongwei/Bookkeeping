/**
 * 负债管理（Phase 2，US1/US2/US3）：登记 credit/贷款 + 列表（剩余本金/已还）+ 还款（本金/利息）+ 信用卡账单。
 *
 * 剩余本金 = 账户 balance（后端推导）；还款走复式 recordRepayment（本金减负债、利息计支出）。
 * 信用卡显示账单周期（本期账单/已还/待还 + 还款日倒计时），临近还款日提示。
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
  Alert,
} from '@mui/material';
import {
  useLiabilities,
  useCreateLiability,
  useRepayLiability,
  useCreditCardBilling,
  useAccounts,
} from '../hooks/use-finance';
import type { LiabilityDTO, LiabilityKind } from '../api';

const KIND_LABEL: Record<LiabilityKind, string> = {
  credit: '信用卡',
  mortgage: '房贷',
  car_loan: '车贷',
  consumer_loan: '消费贷',
  borrowing: '借款',
};

function fmt(value: string): string {
  const n = Number(value);
  return Number.isFinite(n)
    ? `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
}

export function LiabilityManager() {
  const { data, isLoading } = useLiabilities();
  const { data: accountsData } = useAccounts();
  const createLiability = useCreateLiability();
  const repayLiability = useRepayLiability();
  const cashAccounts = (accountsData?.accounts ?? []).filter((a) =>
    ['cash', 'savings'].includes(a.type),
  );

  const [form, setForm] = useState({
    name: '',
    kind: 'mortgage' as LiabilityKind,
    openingBalance: '',
    interestRate: '',
    monthlyPayment: '',
    dueDate: '',
    statementDay: '',
    repaymentDay: '',
  });
  const [repay, setRepay] = useState<Record<string, { cash: string; principal: string; interest: string }>>({});

  const liabilities = data?.items ?? [];

  async function handleCreate() {
    if (!form.name || !form.openingBalance) return;
    const isCredit = form.kind === 'credit';
    await createLiability.mutateAsync({
      name: form.name,
      type: form.kind,
      openingBalance: form.openingBalance,
      interestRate: form.interestRate || null,
      monthlyPayment: form.monthlyPayment || null,
      dueDate: form.dueDate || null,
      statementDay: isCredit ? Number(form.statementDay) || null : null,
      repaymentDay: isCredit ? Number(form.repaymentDay) || null : null,
    });
    setForm({
      name: '', kind: 'mortgage', openingBalance: '', interestRate: '',
      monthlyPayment: '', dueDate: '', statementDay: '', repaymentDay: '',
    });
  }

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>登记负债</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <TextField size="small" label="名称" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ minWidth: 140 }} />
            <TextField size="small" select label="种类" value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as LiabilityKind })} sx={{ minWidth: 120 }}>
              {(Object.keys(KIND_LABEL) as LiabilityKind[]).map((k) => (
                <MenuItem key={k} value={k}>{KIND_LABEL[k]}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" label="本金/初始欠款" value={form.openingBalance}
              onChange={(e) => setForm({ ...form, openingBalance: e.target.value })} sx={{ minWidth: 150 }} />
            <TextField size="small" label="年利率(如0.045)" value={form.interestRate}
              onChange={(e) => setForm({ ...form, interestRate: e.target.value })} sx={{ minWidth: 140 }} />
            <TextField size="small" label="月供" value={form.monthlyPayment}
              onChange={(e) => setForm({ ...form, monthlyPayment: e.target.value })} sx={{ minWidth: 120 }} />
            <TextField size="small" label="到期日" type="date" value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
            {form.kind === 'credit' && (
              <>
                <TextField size="small" label="账单日(1-31)" value={form.statementDay}
                  onChange={(e) => setForm({ ...form, statementDay: e.target.value })} sx={{ minWidth: 120 }} />
                <TextField size="small" label="还款日(1-31)" value={form.repaymentDay}
                  onChange={(e) => setForm({ ...form, repaymentDay: e.target.value })} sx={{ minWidth: 120 }} />
              </>
            )}
            <Button variant="contained" size="small" onClick={handleCreate} disabled={createLiability.isPending}>
              登记
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {isLoading ? (
        <CircularProgress size={24} />
      ) : liabilities.length === 0 ? (
        <Typography variant="body2" color="text.secondary">暂无负债</Typography>
      ) : (
        liabilities.map((l) => (
          <LiabilityCard
            key={l.id}
            liability={l}
            cashAccounts={cashAccounts.map((c) => ({ id: c.id, name: c.name }))}
            repay={repay[l.id] ?? { cash: cashAccounts[0]?.id ?? '', principal: '', interest: '' }}
            onRepayChange={(r) => setRepay({ ...repay, [l.id]: r })}
            onRepay={() =>
              repayLiability.mutateAsync({
                id: l.id,
                payload: {
                  cashAccountId: repay[l.id]?.cash ?? cashAccounts[0]?.id ?? '',
                  principal: repay[l.id]?.principal ?? '0',
                  interest: repay[l.id]?.interest ?? '0',
                },
              })
            }
            busy={repayLiability.isPending}
          />
        ))
      )}
    </Stack>
  );
}

function LiabilityCard(props: {
  liability: LiabilityDTO;
  cashAccounts: { id: string; name: string }[];
  repay: { cash: string; principal: string; interest: string };
  onRepayChange: (r: { cash: string; principal: string; interest: string }) => void;
  onRepay: () => void;
  busy: boolean;
}) {
  const { liability: l, busy } = props;
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="subtitle1">{l.name}</Typography>
          <Chip size="small" label={KIND_LABEL[l.kind]} variant="outlined" />
          {l.dueDate && <Chip size="small" label={`到期 ${l.dueDate}`} variant="outlined" />}
        </Stack>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="h6" color="error.main">{fmt(l.remainingPrincipal)}</Typography>
          <Typography variant="caption" color="text.secondary">
            本金 {fmt(l.principal)} · 已还 {fmt(l.paidAmount)}
            {l.interestRate ? ` · 利率 ${(Number(l.interestRate) * 100).toFixed(2)}%` : ''}
            {l.monthlyPayment ? ` · 月供 ${fmt(l.monthlyPayment)}` : ''}
          </Typography>
        </Box>

        {l.kind === 'credit' && <CreditBillingSection id={l.id} />}

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          <TextField size="small" select label="还款账户" value={props.repay.cash}
            onChange={(e) => props.onRepayChange({ ...props.repay, cash: e.target.value })} sx={{ minWidth: 140 }}>
            {props.cashAccounts.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField size="small" label="本金" value={props.repay.principal}
            onChange={(e) => props.onRepayChange({ ...props.repay, principal: e.target.value })} sx={{ minWidth: 120 }} />
          <TextField size="small" label="利息" value={props.repay.interest}
            onChange={(e) => props.onRepayChange({ ...props.repay, interest: e.target.value })} sx={{ minWidth: 120 }} />
          <Button size="small" variant="contained" onClick={props.onRepay} disabled={busy}>
            还款
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CreditBillingSection({ id }: { id: string }) {
  const { data, isLoading } = useCreditCardBilling(id);
  if (isLoading) return <Typography variant="caption" sx={{ mt: 1 }}>加载账单…</Typography>;
  if (!data) return null;
  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Typography variant="body2">
          账单周期 {data.periodStart} ~ {data.periodEnd}
        </Typography>
        <Typography variant="body2">本期账单 {fmt(data.statementAmount)}</Typography>
        <Typography variant="body2">已还 {fmt(data.paidAmount)}</Typography>
        <Typography variant="body2" color={Number(data.remaining) > 0 ? 'error.main' : 'success.main'}>
          待还 {fmt(data.remaining)}
        </Typography>
      </Stack>
      {data.dueSoon && (
        <Alert severity="warning" sx={{ mt: 1 }} icon={false}>
          临近还款日（还款日 {data.repaymentDay}，剩 {data.daysUntilDue} 天），请及时还款
        </Alert>
      )}
    </Box>
  );
}
