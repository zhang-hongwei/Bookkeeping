/**
 * 预算预警横幅（Phase 5，US1，FR-002/SC-002）。消费 useBudgetAlerts，
 * 显示当前周期「即将超支 / 已超支」提示（事中预警）。
 */
'use client';

import { Alert, AlertTitle, Stack } from '@mui/material';
import { useBudgetAlerts } from '../hooks/use-finance';

function yuan(v: string): string {
  return `¥${Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BudgetAlertsBanner() {
  const { data, isLoading } = useBudgetAlerts();
  const alerts = data?.alerts ?? [];
  if (isLoading || alerts.length === 0) return null;

  const overruns = alerts.filter((a) => a.status === 'overrun');
  const warnings = alerts.filter((a) => a.status === 'warning');

  return (
    <Stack spacing={1}>
      {overruns.map((a) => (
        <Alert key={`o-${a.budgetId}`} severity="error">
          <AlertTitle>已超支</AlertTitle>
          {a.verdict}（已用 {yuan(a.spent)} / 额度 {yuan(a.budgetAmount)}，超支 {yuan(String(-Number(a.remaining)))}）
        </Alert>
      ))}
      {warnings.map((a) => (
        <Alert key={`w-${a.budgetId}`} severity="warning">
          <AlertTitle>即将超支</AlertTitle>
          {a.verdict}（已用 {yuan(a.spent)} / 额度 {yuan(a.budgetAmount)}）
        </Alert>
      ))}
    </Stack>
  );
}
