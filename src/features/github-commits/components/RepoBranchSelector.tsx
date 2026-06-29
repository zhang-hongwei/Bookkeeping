'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import type { Repository, Branch } from '../types';

interface RepoBranchSelectorProps {
  selectedRepo: string;
  selectedBranch: string;
  onRepoChange: (repo: string) => void;
  onBranchChange: (branch: string) => void;
  disabled?: boolean;
}

export default function RepoBranchSelector({
  selectedRepo,
  selectedBranch,
  onRepoChange,
  onBranchChange,
  disabled,
}: RepoBranchSelectorProps) {
  const [repoInput, setRepoInput] = useState(selectedRepo);
  const [repoOptions, setRepoOptions] = useState<Repository[]>([]);
  const [repoLoading, setRepoLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadUserRepos = useCallback(async () => {
    setRepoLoading(true);
    try {
      const res = await fetch('/api/github/repos');
      const data = await res.json();
      if (data.success) {
        setRepoOptions(data.data.items);
      }
    } catch {
      // ignore
    } finally {
      setRepoLoading(false);
    }
  }, []);

  const searchRepos = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      return;
    }
    setRepoLoading(true);
    try {
      const res = await fetch(`/api/github/repos?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setRepoOptions(data.data.items);
      }
    } catch {
      // ignore
    } finally {
      setRepoLoading(false);
    }
  }, []);

  // Auto-load user repos when enabled
  useEffect(() => {
    if (!disabled) {
      loadUserRepos();
    }
  }, [disabled, loadUserRepos]);

  // Debounced search when user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!repoInput || repoInput === selectedRepo) return;

    debounceRef.current = setTimeout(() => {
      searchRepos(repoInput);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [repoInput, searchRepos, selectedRepo]);

  // Load branches when repo is selected
  useEffect(() => {
    if (!selectedRepo) {
      setBranches([]);
      return;
    }
    setBranchLoading(true);
    fetch(`/api/github/branches?repo=${encodeURIComponent(selectedRepo)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBranches(data.data.items);
      })
      .catch(() => {})
      .finally(() => setBranchLoading(false));
  }, [selectedRepo]);

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
      <Autocomplete
        fullWidth
        size="small"
        freeSolo
        disabled={disabled}
        options={repoOptions}
        getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.fullName)}
        inputValue={repoInput}
        onInputChange={(_, val) => setRepoInput(val)}
        onChange={(_, val) => {
          const repo = typeof val === 'string' ? val : val?.fullName ?? '';
          onRepoChange(repo);
          setRepoInput(repo);
          onBranchChange('');
        }}
        loading={repoLoading}
        renderOption={(props, option) => (
          <li {...props} key={option.fullName}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {option.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.description?.slice(0, 80)}
              </Typography>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Repository"
            placeholder="Select or search..."
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {repoLoading ? <CircularProgress size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />

      <Autocomplete
        size="small"
        sx={{ minWidth: 200 }}
        disabled={disabled || !selectedRepo}
        options={[
          { name: '', isDefault: false },
          ...branches,
        ]}
        getOptionLabel={(opt) => (opt.name === '' ? 'All branches' : opt.name)}
        value={
          selectedBranch
            ? branches.find((b) => b.name === selectedBranch) ?? null
            : { name: '', isDefault: false }
        }
        onChange={(_, val) => onBranchChange(val?.name ?? '')}
        loading={branchLoading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Branch"
            placeholder="All branches"
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {branchLoading ? <CircularProgress size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
    </Box>
  );
}
