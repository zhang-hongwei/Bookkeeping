/**
 * 个人 / 家庭 视图切换（Phase 4 / US1）。
 *
 * 无家庭时禁用「家庭」档；切换瞬时、无数据串扰（SC-005）。
 */
'use client';

import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useMyFamilies } from '../hooks/use-finance';
import { useFamilyView } from '../store/use-family-view';

export function ViewSwitcher() {
  const { data } = useMyFamilies();
  const families = data?.families ?? [];
  const { view, familyId, setView, setFamilyId } = useFamilyView();

  // 自动绑定用户的（首个）active 家庭
  useEffect(() => {
    if (families.length > 0 && !familyId) {
      setFamilyId(families[0].id);
    }
    if (families.length === 0 && familyId) {
      setFamilyId(null);
      if (view === 'family') setView('personal');
    }
  }, [families, familyId, setFamilyId, view, setView]);

  const hasFamily = families.length > 0;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <ToggleButtonGroup
        size="small"
        exclusive
        value={view}
        onChange={(_, v) => {
          if (v) setView(v);
        }}
      >
        <ToggleButton value="personal">个人</ToggleButton>
        <ToggleButton value="family" disabled={!hasFamily}>
          家庭
        </ToggleButton>
      </ToggleButtonGroup>
      {hasFamily && view === 'family' && (
        <Typography variant="caption" color="text.secondary">
          {families[0]?.name}
        </Typography>
      )}
    </Stack>
  );
}
