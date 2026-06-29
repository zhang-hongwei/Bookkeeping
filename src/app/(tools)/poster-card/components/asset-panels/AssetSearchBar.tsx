'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Box, InputBase, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { debounce } from 'lodash-es';

interface AssetSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function AssetSearchBar({ onSearch, placeholder = 'Search...' }: AssetSearchBarProps) {
  const [query, setQuery] = useState('');
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  const debouncedSearch = useMemo(
    () => debounce((val: string) => onSearchRef.current(val), 300),
    [],
  );

  useEffect(() => {
    return () => { debouncedSearch.cancel(); };
  }, [debouncedSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      debouncedSearch(val);
    },
    [debouncedSearch],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    debouncedSearch.cancel();
    onSearch('');
  }, [debouncedSearch, onSearch]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1.5,
      }}
    >
      <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
      <InputBase
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        sx={{ flex: 1, fontSize: 12, '& input': { py: 0.3 } }}
      />
      {query && (
        <IconButton size="small" onClick={handleClear} sx={{ p: 0.25 }}>
          <ClearIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}
    </Box>
  );
}
