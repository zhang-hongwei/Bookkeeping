/**
 * 记账主面板（US1 MVP 宿主）。
 *
 * 布局：左侧账户与净资产 + 建账入口；中间记账表单；右侧交易明细。
 * 核心验证点：记账后各账户余额正确、账目永远平衡、转账不改净资产。
 */
'use client';

import { useState } from 'react';
import { Box, Stack, Typography, Button, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AccountManager } from './AccountManager';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { ImportFlow } from './ImportFlow';
import { NlRecordInput } from './NlRecordInput';
import { OcrRecordInput } from './OcrRecordInput';
import { NetWorthDashboard } from './NetWorthDashboard';
import { HealthScorePanel } from './HealthScorePanel';
import { MonthlyReport } from './MonthlyReport';
import { CreateAccountDialog } from './CreateAccountDialog';

export function FinanceDashboard() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          记账
        </Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          新建账户
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <NetWorthDashboard />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AccountManager />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                一句话记账
              </Typography>
              <NlRecordInput />
            </Box>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                截图记账
              </Typography>
              <OcrRecordInput />
            </Box>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                记一笔
              </Typography>
              <TransactionForm />
            </Box>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TransactionList />
        </Grid>
      </Grid>

      <CreateAccountDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          批量导入账单
        </Typography>
        <ImportFlow />
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <HealthScorePanel />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <MonthlyReport />
        </Grid>
      </Grid>
    </Box>
  );
}
