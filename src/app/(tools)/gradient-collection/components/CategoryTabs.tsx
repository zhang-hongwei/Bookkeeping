'use client';

import { Box, Tab, Tabs, Badge, useTheme } from '@mui/material';
import type { GradientCategory } from '../types';

interface CategoryTab {
  id: GradientCategory | 'all';
  label: string;
  count: number;
}

interface CategoryTabsProps {
  categories: CategoryTab[];
  activeCategory: GradientCategory | 'all';
  onChange: (category: GradientCategory | 'all') => void;
}

export function CategoryTabs({ categories, activeCategory, onChange }: CategoryTabsProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: 4,
        '& .MuiTabs-root': {
          minHeight: 44,
          borderBottom: 1,
          borderColor: 'divider',
        },
        '& .MuiTab-root': {
          minHeight: 44,
          py: 1,
          px: 2.5,
          minWidth: 'auto',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          color: 'text.secondary',
          '&.Mui-selected': {
            color: 'primary.main',
            fontWeight: 600,
          },
        },
        '& .MuiBadge-badge': {
          fontSize: '0.7rem',
          height: 20,
          minWidth: 20,
          fontWeight: 600,
        },
      }}
    >
      <Tabs
        value={activeCategory}
        onChange={(_, newValue) => onChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {categories.map((category) => (
          <Tab
            key={category.id}
            value={category.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {category.label}
                <Badge
                  badgeContent={category.count}
                  color={activeCategory === category.id ? 'primary' : 'default'}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor:
                        activeCategory === category.id
                          ? theme.vars.palette.primary.main
                          : theme.vars.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.12)'
                            : 'rgba(0,0,0,0.12)',
                      color:
                        activeCategory === category.id
                          ? theme.vars.palette.primary.contrastText
                          : theme.vars.palette.text.secondary,
                    },
                  }}
                />
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}
