/**
 * WorkspaceHeader Component
 * Search bar, sort dropdown, and create button
 */

'use client';

import React, { useState } from 'react';
import {
  Stack,
  TextField,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Sort as SortIcon,
} from '@mui/icons-material';

interface WorkspaceHeaderProps {
  onCreate: () => void;
  onSearch: (query: string) => void;
  onSortChange: (sortBy: 'updated' | 'created' | 'name') => void;
}

export function WorkspaceHeader({ onCreate, onSearch, onSortChange }: WorkspaceHeaderProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'updated' | 'created' | 'name'>('updated');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearch(value);
  };

  const handleSortChange = (e: SelectChangeEvent) => {
    const value = e.target.value as 'updated' | 'created' | 'name';
    setSort(value);
    onSortChange(value);
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <TextField
        size="small"
        placeholder="Search palettes..."
        value={search}
        onChange={handleSearchChange}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ flex: 1, maxWidth: 400 }}
      />

      <Select
        size="small"
        value={sort}
        onChange={handleSortChange}
        startAdornment={
          <InputAdornment position="start">
            <SortIcon fontSize="small" />
          </InputAdornment>
        }
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="updated">Recently Updated</MenuItem>
        <MenuItem value="created">Recently Created</MenuItem>
        <MenuItem value="name">Name A-Z</MenuItem>
      </Select>

      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
        New Palette
      </Button>
    </Stack>
  );
}
