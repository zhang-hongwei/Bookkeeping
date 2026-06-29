/**
 * 家庭创建入口（Phase 4 / US1）。
 *
 * 无家庭时展示：创建家庭（创建者=self，自动生成共同 joint 成员）。
 * 「加入家庭」需要邀请链路，本阶段通过添加成员（按 userId）实现，置于成员管理。
 */
'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useCreateFamily } from '../hooks/use-finance';

export function FamilySetup() {
  const [name, setName] = useState('');
  const create = useCreateFamily();

  const submit = () => {
    if (!name.trim()) return;
    create.mutate({ name: name.trim() }, { onSuccess: () => setName('') });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">家庭财务</Typography>
            <Typography variant="body2" color="text.secondary">
              把家人加入同一家庭，看到全家合并的净资产与收支。本阶段每人加入一个家庭。
            </Typography>
          </Box>
          {create.isError && (
            <Alert severity="error">{(create.error as Error).message}</Alert>
          )}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              label="家庭名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：张家"
              sx={{ flex: 1 }}
            />
            <Button variant="contained" onClick={submit} disabled={!name.trim() || create.isPending}>
              创建家庭
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
