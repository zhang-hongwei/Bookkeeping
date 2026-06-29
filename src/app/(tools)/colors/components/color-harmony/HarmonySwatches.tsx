/**
 * HarmonySwatches Component
 * Display generated harmony colors as swatches
 */

'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import type { HarmonyColor } from '../../types';

interface HarmonySwatchesProps {
  colors: HarmonyColor[];
  onAddToPalette: (color: HarmonyColor) => void;
}

export function HarmonySwatches({ colors, onAddToPalette }: HarmonySwatchesProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  if (colors.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Select a base color to generate harmony colors
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Generated Colors
      </Typography>
      <Stack spacing={1}>
        {colors.map((color, index) => (
          <Paper
            key={`${color.hex}-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateX(4px)',
              },
            }}
          >
            {/* Color swatch */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: color.hex,
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            />

            {/* Info */}
            <Box sx={{ ml: 2, flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                {color.hex}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {color.relationship} ({color.angle}°)
              </Typography>
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Copy hex">
                <IconButton
                  size="small"
                  onClick={() => handleCopy(color.hex)}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add to palette">
                <IconButton
                  size="small"
                  onClick={() => onAddToPalette(color)}
                  color="primary"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Copy snackbar */}
      <Snackbar open={!!copied} autoHideDuration={2000}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Copied {copied}
        </Alert>
      </Snackbar>
    </Box>
  );
}
