/**
 * 成员支出画像（Phase 4 / US2）。
 *
 * 按 memberId 聚合收支/结余/支出分类 Top5（归属口径，与账号 owner 正交）。
 * joint 成员返回「家庭共同」合计语义（不计入任何个人，I6）。
 */
'use client';

import { Card, CardContent, Stack, Typography, Box } from '@mui/material';
import { useMemberProfile } from '../hooks/use-finance';

function fmt(value: string): string {
  const n = Number(value);
  return Number.isFinite(n)
    ? `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
}

function monthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function MemberProfile({
  familyId,
  memberId,
}: {
  familyId: string;
  memberId: string;
}) {
  const range = monthRange();
  const { data, isLoading } = useMemberProfile(familyId, memberId, range);

  if (isLoading || !data) {
    return <Typography color="text.secondary">加载成员画像…</Typography>;
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          成员画像（本月）
        </Typography>
        <Typography variant="h6">{data.profile.displayName}</Typography>
        <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">收入</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {fmt(data.profile.income)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">支出</Typography>
            <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
              {fmt(data.profile.expense)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">结余</Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: Number(data.profile.surplus) < 0 ? 'error.main' : 'success.main' }}
            >
              {fmt(data.profile.surplus)}
            </Typography>
          </Box>
        </Stack>

        {data.profile.topCategories.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>主要支出</Typography>
            <Stack spacing={0.5}>
              {data.profile.topCategories.map((c) => (
                <Stack key={c.categoryId ?? 'none'} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{c.name}</Typography>
                  <Typography variant="body2">{fmt(c.amount)}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
