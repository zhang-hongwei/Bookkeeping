/**
 * ContrastSwatch Component
 * Color swatch with contrast information
 */

'use client';

import React from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';
import { ContrastBadge } from './ContrastBadge';
import { useContrastChecker } from '../../hooks';
import type { WCAGLevel } from '../../types';

interface ContrastSwatchProps {
  color: string;
  backgroundColor: string;
  name?: string;
  onClick?: () => void;
  showDetails?: boolean;
}

export function ContrastSwatch({
  color,
  backgroundColor,
  name,
  onClick,
  showDetails = false,
}: ContrastSwatchProps) {
  const { ratio, level, passing, aaNormal, aaLarge, aaaNormal, aaaLarge } = useContrastChecker({
    foreground: color,
    background: backgroundColor,
  });

  const textColor = isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';

  return (
    <Paper
      onClick={onClick}
      sx={{
        position: 'relative',
        height: 80,
        backgroundColor,
        borderRadius: 2,
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        '&:hover': onClick ? { transform: 'scale(1.02)' } : {},
      }}
    >
      {/* Color Name & Hex */}
      <Box sx={{ p: 1.5 }}>
        {name && (
          <Typography
            variant="caption"
            sx={{
              color: textColor,
              display: 'block',
              fontWeight: 600,
              opacity: 0.9,
            }}
          >
            {name}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{
            color: textColor,
            opacity: 0.7,
            fontFamily: 'monospace',
          }}
        >
          {color}
        </Typography>
      </Box>

      {/* Contrast Badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
        }}
      >
        <ContrastBadge ratio={ratio} level={level} size="small" showRatio={false} />
      </Box>

      {/* Details Panel */}
      {showDetails && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0,0,0,0.6)',
            p: 1,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ fontSize: 10 }}>
            <Typography variant="caption" sx={{ color: aaNormal ? 'success.main' : 'error.main' }}>
              AA: {aaNormal ? '✓' : '✗'}
            </Typography>
            <Typography variant="caption" sx={{ color: aaaNormal ? 'success.main' : 'error.main' }}>
              AAA: {aaaNormal ? '✓' : '✗'}
            </Typography>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

/**
 * Check if a color is light
 */
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
