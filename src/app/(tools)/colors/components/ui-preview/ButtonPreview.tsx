/**
 * ButtonPreview Component
 * Preview buttons using extracted colors
 */

'use client';

import React from 'react';
import { Button, Stack, Box } from '@mui/material';
import type { UIPreviewTheme } from '../../types';

interface ButtonPreviewProps {
  previewTheme: UIPreviewTheme;
}

export function ButtonPreview({ previewTheme }: ButtonPreviewProps) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {/* Primary Contained */}
      <Button
        variant="contained"
        sx={{
          bgcolor: previewTheme.primary,
          color: getContrastText(previewTheme.primary),
          '&:hover': {
            bgcolor: darkenColor(previewTheme.primary, 0.2),
          },
        }}
      >
        Primary
      </Button>

      {/* Secondary Contained */}
      <Button
        variant="contained"
        sx={{
          bgcolor: previewTheme.secondary,
          color: getContrastText(previewTheme.secondary),
          '&:hover': {
            bgcolor: darkenColor(previewTheme.secondary, 0.2),
          },
        }}
      >
        Secondary
      </Button>

      {/* Accent Contained */}
      <Button
        variant="contained"
        sx={{
          bgcolor: previewTheme.accent,
          color: getContrastText(previewTheme.accent),
          '&:hover': {
            bgcolor: darkenColor(previewTheme.accent, 0.2),
          },
        }}
      >
        Accent
      </Button>

      {/* Primary Outlined */}
      <Button
        variant="outlined"
        sx={{
          color: previewTheme.primary,
          borderColor: previewTheme.primary,
          '&:hover': {
            borderColor: previewTheme.primary,
            bgcolor: `${previewTheme.primary}20`,
          },
        }}
      >
        Outline
      </Button>

      {/* Primary Text */}
      <Button
        sx={{
          color: previewTheme.primary,
          '&:hover': {
            bgcolor: `${previewTheme.primary}10`,
          },
        }}
      >
        Text Button
      </Button>
    </Stack>
  );
}

/**
 * Get contrast text color (black or white)
 */
function getContrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Darken a hex color
 */
function darkenColor(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) * (1 - amount));
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) * (1 - amount));
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) * (1 - amount));
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}
