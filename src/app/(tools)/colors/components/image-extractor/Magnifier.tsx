/**
 * Magnifier Component
 * Zoom preview for color picking
 */

'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface MagnifierProps {
  x: number;
  y: number;
  color: string;
  size?: number;
  zoom?: number;
}

export function Magnifier({
  x,
  y,
  color,
  size = 100,
  zoom = 8,
}: MagnifierProps) {
  // Position the magnifier offset from cursor
  const offsetX = 20;
  const offsetY = 20;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        left: x + offsetX,
        top: y + offsetY,
        width: size,
        height: size + 24, // Extra space for color display
        borderRadius: '50%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1000,
        border: '2px solid',
        borderColor: 'divider',
      }}
    >
      {/* Pixel Grid */}
      <Box
        sx={{
          width: size,
          height: size - 16,
          display: 'grid',
          gridTemplateColumns: `repeat(${zoom}, 1fr)`,
          gridTemplateRows: `repeat(${zoom}, 1fr)`,
          bgcolor: 'background.default',
        }}
      >
        {Array.from({ length: zoom * zoom }).map((_, index) => {
          const isCenter = index === Math.floor((zoom * zoom) / 2);
          return (
            <Box
              key={index}
              sx={{
                bgcolor: isCenter ? color : 'transparent',
                border: isCenter ? '2px solid' : '1px solid',
                borderColor: isCenter ? 'primary.main' : 'divider',
                opacity: isCenter ? 1 : 0.3,
              }}
            />
          );
        })}
      </Box>

      {/* Color Display */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 24,
          bgcolor: color,
          color: (theme) =>
            isLightColor(color) ? theme.palette.common.black : theme.palette.common.white,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: 10,
            textShadow: '0 0 2px rgba(0,0,0,0.5)',
          }}
        >
          {color}
        </Typography>
      </Box>
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
