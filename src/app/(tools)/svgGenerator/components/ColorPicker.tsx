'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { ColorConfig } from '../types';

interface ColorPickerProps {
  colors: ColorConfig;
  onChange: (colors: ColorConfig) => void;
}

/**
 * Color picker for background and fill colors
 */
export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  const handleBackgroundChange = (value: string) => {
    onChange({ ...colors, background: value });
  };

  const handleFillChange = (index: number, value: string) => {
    const newFills = [...colors.fills];
    newFills[index] = value;
    onChange({ ...colors, fills: newFills });
  };

  const handleAddFill = () => {
    if (colors.fills.length < 6) {
      onChange({ ...colors, fills: [...colors.fills, '#643DFF'] });
    }
  };

  const handleRemoveFill = (index: number) => {
    if (colors.fills.length > 1) {
      const newFills = colors.fills.filter((_, i) => i !== index);
      onChange({ ...colors, fills: newFills });
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Colors
      </Typography>

      <Stack spacing={2}>
        {/* Background color */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Background
          </Typography>
          <TextField
            size="small"
            fullWidth
            type="color"
            value={colors.background}
            onChange={(e) => handleBackgroundChange(e.target.value)}
            InputProps={{
              sx: { height: 40 },
            }}
          />
        </Box>

        {/* Fill colors */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Fill Colors
            </Typography>
            <IconButton
              size="small"
              onClick={handleAddFill}
              disabled={colors.fills.length >= 6}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Stack spacing={1}>
            {colors.fills.map((fill, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  fullWidth
                  type="color"
                  value={fill}
                  onChange={(e) => handleFillChange(index, e.target.value)}
                  InputProps={{
                    sx: { height: 40 },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFill(index)}
                  disabled={colors.fills.length <= 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
