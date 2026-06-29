/**
 * 新建账户对话框（US1 可用性最小版；US2 AccountManager 会扩展归档/额度等）。
 *
 * react-hook-form + Zod；成功后失效账户查询。
 */
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useCreateAccount } from '../hooks/use-finance';
import type { AccountType } from '@/database/schema/finance';

const schema = z.object({
  name: z.string().min(1, { message: '请输入名称' }).max(100),
  type: z.enum(['cash', 'savings', 'credit', 'investment', 'real_asset']),
  openingBalance: z.string().refine((v) => v.trim() !== '' && Number.isFinite(Number(v)), {
    message: '请输入合法金额',
  }),
  creditLimit: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const TYPE_OPTIONS: Array<{ value: AccountType; label: string }> = [
  { value: 'cash', label: '现金' },
  { value: 'savings', label: '储蓄' },
  { value: 'credit', label: '信用（信用卡）' },
  { value: 'investment', label: '投资' },
  { value: 'real_asset', label: '实物资产' },
];

export function CreateAccountDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createAccount = useCreateAccount();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'cash', openingBalance: '0', creditLimit: '' },
  });
  const type = watch('type');

  const onSubmit = (values: FormValues) => {
    createAccount.mutate(
      {
        name: values.name,
        type: values.type,
        openingBalance: values.openingBalance,
        creditLimit: values.type === 'credit' ? values.creditLimit || null : null,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>新建账户</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="账户名称" error={Boolean(errors.name)} helperText={errors.name?.message} />
              )}
            />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="类型">
                  {TYPE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="openingBalance"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={type === 'credit' ? '当前欠款' : '初始余额'}
                  type="number"
                  inputMode="decimal"
                  error={Boolean(errors.openingBalance)}
                  helperText={errors.openingBalance?.message ?? (type === 'credit' ? '信用账户按欠款方向记录' : undefined)}
                />
              )}
            />
            {type === 'credit' && (
              <Controller
                name="creditLimit"
                control={control}
                render={({ field }) => <TextField {...field} label="信用额度（可选）" type="number" inputMode="decimal" />}
              />
            )}
            {createAccount.isError && (
              <Alert severity="error">{(createAccount.error as Error)?.message ?? '创建失败'}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button type="submit" variant="contained" disabled={createAccount.isPending}>
            {createAccount.isPending ? <CircularProgress size={20} /> : '创建'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
