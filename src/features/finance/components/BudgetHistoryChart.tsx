/**
 * 预算历史周期图（Phase 5，US1，FR-003/SC-005）。
 * 读 finance_budget_periods 不可变快照（amountSnapshot 锁定，I3）；柱状对比额度/已用。
 */
'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer,
} from 'recharts';
import { useBudgetPeriods } from '../hooks/use-finance';

function yuan(v: string): string {
  return `¥${Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function BudgetHistoryChart({ budgetId, name }: { budgetId: string; name?: string }) {
  const { data, isLoading } = useBudgetPeriods(budgetId);
  const periods = (data?.periods ?? [])
    .slice()
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
    .map((p) => ({
      period: p.periodStart.slice(0, 7),
      额度: Number(p.amountSnapshot),
      已用: Number(p.spentSnapshot),
      status: p.status,
    }));

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{name ?? '预算'} 历史周期</Typography>
        {isLoading && <Typography variant="body2" color="text.secondary">加载…</Typography>}
        {!isLoading && periods.length === 0 && (
          <Typography variant="body2" color="text.secondary">暂无已关闭的历史周期。</Typography>
        )}
        {periods.length > 0 && (
          <Box sx={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={periods} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={56} tickFormatter={(v) => yuan(String(v))} />
                <Tooltip formatter={(value) => yuan(String(value))} />
                <Bar dataKey="额度" fill="#1976d2" />
                <Bar dataKey="已用" fill="#d32f2f" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          历史周期额度锁定，改当前额度不影响历史（I3）。
        </Typography>
      </CardContent>
    </Card>
  );
}
