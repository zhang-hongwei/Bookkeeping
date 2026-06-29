/**
 * CategoryTabs Component
 * Filter palettes by category
 */

'use client';

import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import {
  Palette as AllIcon,
  Business as BrandIcon,
  Folder as ProjectIcon,
  Lightbulb as InspirationIcon,
  Star as FavoriteIcon,
} from '@mui/icons-material';
import type { PaletteCategory } from '@/types/palette';

export type CategoryFilter = PaletteCategory | 'all' | 'favorites';

interface CategoryTabsProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  totalCount: number;
  favoriteCount: number;
  categoryCounts: Record<PaletteCategory, number>;
}

const TABS: { value: CategoryFilter; label: string; icon: React.ReactElement }[] = [
  { value: 'all', label: 'All', icon: <AllIcon /> },
  { value: 'brand', label: 'Brand', icon: <BrandIcon /> },
  { value: 'project', label: 'Project', icon: <ProjectIcon /> },
  { value: 'inspiration', label: 'Inspiration', icon: <InspirationIcon /> },
  { value: 'favorites', label: 'Favorites', icon: <FavoriteIcon /> },
];

export function CategoryTabs({
  value,
  onChange,
  totalCount,
  favoriteCount,
  categoryCounts,
}: CategoryTabsProps) {
  const getCount = (tab: CategoryFilter): number => {
    if (tab === 'all') return totalCount;
    if (tab === 'favorites') return favoriteCount;
    return categoryCounts[tab] ?? 0;
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={value}
        onChange={(_, v: CategoryFilter) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            iconPosition="start"
            label={`${tab.label} (${getCount(tab.value)})`}
            sx={{ minHeight: 48 }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
