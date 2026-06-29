'use client';

import { Box, Button, ToggleButtonGroup, ToggleButton, Typography, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RepoBranchSelector from './RepoBranchSelector';
import { useGithubStore } from '../store/github-store';
import { useCommitQuery } from '../hooks/useCommitQuery';
import type { DateRangePreset } from '../types';

interface CommitQueryFormProps {
  isConfigured: boolean;
}

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: '1d', label: '1 Day' },
  { value: '3d', label: '3 Days' },
  { value: '1w', label: '1 Week' },
  { value: '2w', label: '2 Weeks' },
  { value: '1m', label: '1 Month' },
];

export default function CommitQueryForm({ isConfigured }: CommitQueryFormProps) {
  const { selectedRepo, selectedBranch, dateRangePreset, setDateRange, setRepo, setBranch } =
    useGithubStore();
  const { loading, fetchCommits } = useCommitQuery();

  const handleQuery = () => {
    fetchCommits();
  };

  return (
    <Stack spacing={2}>
      <RepoBranchSelector
        selectedRepo={selectedRepo}
        selectedBranch={selectedBranch}
        onRepoChange={setRepo}
        onBranchChange={setBranch}
        disabled={!isConfigured}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          Date range:
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={dateRangePreset}
          exclusive
          onChange={(_, val: DateRangePreset | null) => {
            if (val) setDateRange(val);
          }}
        >
          {PRESETS.map((p) => (
            <ToggleButton key={p.value} value={p.value} sx={{ textTransform: 'none' }}>
              {p.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Button
          variant="contained"
          onClick={handleQuery}
          disabled={!isConfigured || !selectedRepo || loading}
          startIcon={<SearchIcon />}
          sx={{ ml: 'auto' }}
        >
          {loading ? 'Querying...' : 'Query'}
        </Button>
      </Box>
    </Stack>
  );
}
