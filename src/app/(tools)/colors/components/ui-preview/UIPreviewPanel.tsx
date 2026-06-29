/**
 * UIPreviewPanel Component
 * Main preview panel showing UI components with extracted colors
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Divider,
} from '@mui/material';
import { LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material';
import { ButtonPreview } from './ButtonPreview';
import { CardPreview } from './CardPreview';
import { FormPreview } from './FormPreview';
import { NavPreview } from './NavPreview';
import type { DesignTokenTheme } from '@/types/ai';
import type { PreviewMode, UIPreviewTheme } from '../../types';

interface UIPreviewPanelProps {
  theme: DesignTokenTheme;
  customColors?: Array<{ hex: string; name: string }>;
}

export function UIPreviewPanel({ theme, customColors = [] }: UIPreviewPanelProps) {
  const [mode, setMode] = useState<PreviewMode>('light');

  // Convert design theme to preview theme
  const previewTheme = useMemo<UIPreviewTheme>(() => {
    const baseColors = {
      primary: theme.semantic.primary,
      secondary: theme.semantic.secondary,
      accent: theme.semantic.accent,
      surface: theme.semantic.surface,
      text: theme.semantic.text,
    };

    if (mode === 'light') {
      return {
        ...baseColors,
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: theme.semantic.text,
        textSecondary: '#666666',
        border: '#E0E0E0',
      };
    }

    return {
      ...baseColors,
      background: theme.semantic.background || '#1A1A1A',
      surface: '#2D2D2D',
      text: '#FFFFFF',
      textSecondary: '#AAAAAA',
      border: '#404040',
    };
  }, [theme, mode]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">UI Preview</Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => value && setMode(value)}
          size="small"
        >
          <ToggleButton value="light">
            <LightModeIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="dark">
            <DarkModeIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Preview Container */}
      <Box
        sx={{
          backgroundColor: previewTheme.background,
          borderRadius: 2,
          p: 2,
          minHeight: 400,
          color: previewTheme.text,
          transition: 'background-color 0.3s',
        }}
      >
        <Stack spacing={3}>
          {/* Buttons */}
          <Box>
            <Typography
              variant="caption"
              sx={{ color: previewTheme.textSecondary, mb: 1, display: 'block' }}
            >
              Buttons
            </Typography>
            <ButtonPreview previewTheme={previewTheme} />
          </Box>

          <Divider sx={{ borderColor: previewTheme.border }} />

          {/* Cards */}
          <Box>
            <Typography
              variant="caption"
              sx={{ color: previewTheme.textSecondary, mb: 1, display: 'block' }}
            >
              Cards
            </Typography>
            <CardPreview previewTheme={previewTheme} />
          </Box>

          <Divider sx={{ borderColor: previewTheme.border }} />

          {/* Forms */}
          <Box>
            <Typography
              variant="caption"
              sx={{ color: previewTheme.textSecondary, mb: 1, display: 'block' }}
            >
              Form Elements
            </Typography>
            <FormPreview previewTheme={previewTheme} />
          </Box>

          <Divider sx={{ borderColor: previewTheme.border }} />

          {/* Navigation */}
          <Box>
            <Typography
              variant="caption"
              sx={{ color: previewTheme.textSecondary, mb: 1, display: 'block' }}
            >
              Navigation
            </Typography>
            <NavPreview previewTheme={previewTheme} />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
