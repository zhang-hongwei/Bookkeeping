/**
 * 审批中心（Phase 6，US2 / FR-004 / SC-003）。
 * - 待审/历史提议列表 + 批准/拒绝 + 落库（幂等）+ 结果/过期展示。
 * - 未审批绝不落库；改账目动作走既有 ledger（I2/I8）。
 */
'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  useApprovals,
  useDecideApproval,
  useApplyApproval,
} from '../hooks/use-finance';
import type { ApprovalDTO } from '../api';

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'> = {
  proposed: 'default',
  pending: 'warning',
  approved: 'info',
  rejected: 'error',
  applied: 'success',
  expired: 'default',
};

const KIND_LABEL: Record<string, string> = {
  flag_transaction_anomaly: '标记异常交易',
  rebalance_suggestion: '调仓建议',
  amend_finding_override: '改写结论',
  create_transaction: '补录记账',
};

export function ApprovalCenter() {
  const { data, isLoading } = useApprovals('all');
  const decide = useDecideApproval();
  const apply = useApplyApproval();
  const approvals = data?.approvals ?? [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>审批中心</Typography>

        {isLoading && (
          <Typography variant="body2" color="text.secondary">加载…</Typography>
        )}

        {(decide.isError || apply.isError) && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {(decide.error as Error)?.message ?? (apply.error as Error)?.message ?? '操作失败'}
          </Alert>
        )}

        {!isLoading && approvals.length === 0 && (
          <Typography variant="body2" color="text.secondary">暂无提议。</Typography>
        )}

        <Stack spacing={1}>
          {approvals.map((a) => (
            <ApprovalRow key={a.id} approval={a} decide={decide} apply={apply} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ApprovalRow({
  approval: a,
  decide,
  apply,
}: {
  approval: ApprovalDTO;
  decide: ReturnType<typeof useDecideApproval>;
  apply: ReturnType<typeof useApplyApproval>;
}) {
  const expired = a.status !== 'applied' && new Date(a.expiresAt).getTime() < Date.now();
  const canDecide = a.status === 'proposed' || a.status === 'pending';
  const canApply = a.status === 'approved';

  return (
    <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip size="small" label={KIND_LABEL[a.kind] ?? a.kind} variant="outlined" />
            <Chip
              size="small"
              label={a.status}
              color={STATUS_COLOR[a.status] ?? 'default'}
            />
            {expired && <Chip size="small" label="已过期" color="error" variant="outlined" />}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            规则校验：{a.ruleValidation.passed ? '通过' : `未通过（${a.ruleValidation.reason ?? ''}）`}
          </Typography>
          {a.appliedResult != null && (
            <Typography variant="caption" color="text.secondary">
              落库结果：{JSON.stringify(a.appliedResult)}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={0.5}>
          {canDecide && (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={decide.isPending}
                onClick={() => decide.mutate({ id: a.id, decision: 'approve' })}
              >
                批准
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={decide.isPending}
                onClick={() => decide.mutate({ id: a.id, decision: 'reject' })}
              >
                拒绝
              </Button>
            </>
          )}
          {canApply && (
            <Button
              size="small"
              variant="contained"
              disabled={apply.isPending}
              onClick={() => apply.mutate(a.id)}
            >
              {apply.isPending ? <CircularProgress size={16} /> : '落库'}
            </Button>
          )}
        </Stack>
      </Stack>

      <Accordion elevation={0} sx={{ mt: 0.5 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="caption" color="text.secondary">
            依据（{a.ruleValidation.refs.length}）· 详情
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">payload：</Typography>
            <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(a.payload, null, 2)}
            </Typography>
          </Box>
          <Stack spacing={0.5}>
            {a.ruleValidation.refs.map((r, i) => (
              <Typography key={i} variant="caption">
                · {r.period} · {r.metric}：{r.value ?? 'N/A'}（{r.verdict}）
              </Typography>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
