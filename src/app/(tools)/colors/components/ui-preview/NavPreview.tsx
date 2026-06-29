/**
 * NavPreview Component
 * Preview navigation elements using extracted colors
 */

'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { UIPreviewTheme } from '../../types';

interface NavPreviewProps {
  previewTheme: UIPreviewTheme;
}

export function NavPreview({ previewTheme }: NavPreviewProps) {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <Stack spacing={2}>
      {/* App Bar */}
      <AppBar
        position="static"
        sx={{
          bgcolor: previewTheme.surface,
          color: previewTheme.text,
          boxShadow: 'none',
          border: `1px solid ${previewTheme.border}`,
        }}
      >
        <Toolbar variant="dense">
          <IconButton edge="start" sx={{ color: previewTheme.text }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ ml: 1, flexGrow: 1, fontWeight: 600 }}>
            App Name
          </Typography>
          <IconButton sx={{ color: previewTheme.primary }}>
            <SearchIcon />
          </IconButton>
          <IconButton sx={{ color: previewTheme.text }}>
            <PersonIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Tab Navigation */}
      <Box sx={{ bgcolor: previewTheme.surface, borderRadius: 1, border: `1px solid ${previewTheme.border}` }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            '& .MuiTab-root': { color: previewTheme.textSecondary },
            '& .Mui-selected': { color: previewTheme.primary },
            '& .MuiTabs-indicator': { backgroundColor: previewTheme.primary },
          }}
        >
          <Tab label="Home" />
          <Tab label="Products" />
          <Tab label="About" />
          <Tab label="Contact" />
        </Tabs>
      </Box>

      {/* Pill Navigation */}
      <Stack direction="row" spacing={1}>
        {['Home', 'Features', 'Pricing', 'Contact'].map((label, index) => (
          <Button
            key={label}
            variant={index === 0 ? 'contained' : 'text'}
            sx={{
              borderRadius: 20,
              px: 2,
              ...(index === 0
                ? {
                    bgcolor: previewTheme.primary,
                    color: getContrastText(previewTheme.primary),
                    '&:hover': { bgcolor: previewTheme.primary },
                  }
                : {
                    color: previewTheme.textSecondary,
                    '&:hover': { bgcolor: `${previewTheme.primary}15` },
                  }),
            }}
          >
            {label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}

/**
 * Get contrast text color
 */
function getContrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
