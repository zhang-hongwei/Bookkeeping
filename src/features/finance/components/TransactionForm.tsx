/**
 * 记账表单（T019）。
 *
 * react-hook-form + Zod 校验（amount > 0）。支持支出/收入/转账三种类型：
 * - expense：选「支付账户」（fromAccountId）
 * - income ：选「收入账户」（toAccountId）
 * - transfer：选「转出/转入」两账户
 * 提交 → POST /api/finance/transactions，成功后失效余额与明细查询。
 */
'use client';

import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAccounts } from '../hooks/use-finance';
import { useCategories } from '../hooks/use-finance';
import { useCreateTransaction } from '../hooks/use-finance';
import { useMyFamilies, useFamily } from '../hooks/use-finance';
import type { TransactionType } from '@/database/schema/finance';

const TYPE_LABELS: Record<TransactionType, string> = {
  expense: '支出',
  income: '收入',
  transfer: '转账',
  // Phase 2：专用入口产生，此处仅满足类型完备性
  repayment: '还款',
  revaluation: '估值调整',
  disposal: '处置',
};

const schema = z
  .object({
    type: z.enum(['expense', 'income', 'transfer']),
    amount: z.string().refine((v) => Number(v) > 0, { message: '金额必须为正' }),
    accountId: z.string().min(1, { message: '请选择账户' }),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    occurredAt: z.string().min(1, { message: '请选择时间' }),
    note: z.string().max(500).optional(),
    memberId: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.type === 'transfer' && !val.toAccountId) {
      ctx.addIssue({ code: 'custom', message: '请选择转入账户', path: ['toAccountId'] });
    }
  });

type FormValues = z.infer<typeof schema>;

function nowLocalInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TransactionForm() {
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const { data: categoriesData } = useCategories();
  const createTxn = useCreateTransaction();
  const { data: familiesData } = useMyFamilies();
  const myFamilyId = familiesData?.families[0]?.id ?? null;
  const { data: familyData } = useFamily(myFamilyId);
  const members = (familyData?.members ?? []).filter((m) => m.role !== 'joint');

  const accounts = (accountsData?.accounts ?? []).filter((a) => !a.isArchived);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      amount: '',
      accountId: '',
      toAccountId: '',
      categoryId: '',
      occurredAt: nowLocalInput(),
      note: '',
      memberId: '',
    },
  });

  const type = watch('type');

  const categories = useMemo(() => {
    const kind = type === 'income' ? 'income' : type === 'expense' ? 'expense' : 'transfer';
    return (categoriesData?.categories ?? []).filter((c) => c.kind === kind);
  }, [categoriesData, type]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      type: values.type,
      amount: values.amount,
      fromAccountId: values.type === 'income' ? null : values.accountId,
      toAccountId: values.type === 'transfer' ? values.toAccountId : values.type === 'income' ? values.accountId : null,
      categoryId: values.categoryId || null,
      occurredAt: values.occurredAt,
      note: values.note || undefined,
      source: 'manual' as const,
      memberId: values.memberId || undefined,
    };
    createTxn.mutate(payload, {
      onSuccess: () =>
        reset({ type: values.type, amount: '', accountId: '', toAccountId: '', categoryId: '', occurredAt: nowLocalInput(), note: '', memberId: '' }),
    });
  };

  const accountLabel = type === 'income' ? '收入账户' : type === 'transfer' ? '转出账户' : '支付账户';

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
              exclusive
              value={field.value}
              onChange={(_, v) => v && field.onChange(v)}
              color="primary"
              size="small"
            >
              {(Object.keys(TYPE_LABELS) as TransactionType[]).map((t) => (
                <ToggleButton key={t} value={t}>
                  {TYPE_LABELS[t]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        />

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="金额"
              type="number"
              inputMode="decimal"
              slotProps={{
                htmlInput: { step: '0.01', min: '0' },
                input: {
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                },
              }}
              error={Boolean(errors.amount)}
              helperText={errors.amount?.message}
            />
          )}
        />

        <Controller
          name="accountId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label={accountLabel}
              error={Boolean(errors.accountId)}
              helperText={errors.accountId?.message}
              disabled={accountsLoading}
            >
              {accounts.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}（¥{a.balance}）
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {type === 'transfer' && (
          <Controller
            name="toAccountId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="转入账户"
                error={Boolean(errors.toAccountId)}
                helperText={errors.toAccountId?.message}
              >
                {accounts.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}（¥{a.balance}）
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        )}

        {type !== 'transfer' && categories.length > 0 && (
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="分类" defaultValue="">
                <MenuItem value="">不选择</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        )}

        {members.length > 0 && (
          <Controller
            name="memberId"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="归属成员（家庭）" defaultValue="">
                <MenuItem value="">不选择</MenuItem>
                {members.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.displayName}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        )}

        <Controller
          name="occurredAt"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="发生时间"
              type="datetime-local"
              slotProps={{ htmlInput: { step: 60 } }}
              error={Boolean(errors.occurredAt)}
              helperText={errors.occurredAt?.message}
            />
          )}
        />

        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="备注"
              multiline
              maxRows={2}
              error={Boolean(errors.note)}
              helperText={errors.note?.message}
            />
          )}
        />

        {createTxn.isError && (
          <Alert severity="error">{(createTxn.error as Error)?.message ?? '记账失败'}</Alert>
        )}

        <Button type="submit" variant="contained" disabled={createTxn.isPending}>
          {createTxn.isPending ? <CircularProgress size={20} /> : '记一笔'}
        </Button>
      </Stack>
    </Box>
  );
}
