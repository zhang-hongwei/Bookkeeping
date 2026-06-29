/**
 * ColorMarker Component
 * Visual indicator for picked color locations on image
 */

'use client';

import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ColorMarkerProps {
  color: string;
  x: number;
  y: number;
  onRemove: () => void;
  size?: number;
}

export function ColorMarker({
  color,
  x,
  y,
  onRemove,
  size = 20,
}: ColorMarkerProps) {
  const isLight = isLightColor(color);

  return (
    <Tooltip
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: color,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <Typography variant="caption">{color}</Typography>
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        sx={{
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: color,
          border: '2px solid',
          borderColor: isLight ? 'common.black' : 'common.white',
          boxShadow: 2,
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
          '&:hover': {
            transform: 'scale(1.2)',
            '& .remove-btn': {
              opacity: 1,
            },
          },
        }}
      >
        {/* Remove button */}
        <IconButton
          className="remove-btn"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 16,
            height: 16,
            bgcolor: 'error.main',
            color: 'error.contrastText',
            opacity: 0,
            transition: 'opacity 0.15s ease',
            '&:hover': {
              bgcolor: 'error.dark',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 10,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Tooltip>
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
