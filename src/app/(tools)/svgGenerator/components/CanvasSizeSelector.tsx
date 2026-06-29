'use client';

import React from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Stack,
  Grid,
} from '@mui/material';
import type { CanvasSize } from '../types';
import { CANVAS_PRESETS } from '../types';

interface CanvasSizeSelectorProps {
  value: CanvasSize;
  onChange: (size: CanvasSize) => void;
}

/**
 * Canvas size selector with presets and custom option
 */
export function CanvasSizeSelector({ value, onChange }: CanvasSizeSelectorProps) {
  const [isCustom, setIsCustom] = React.useState(false);

  const handlePresetChange = (_: React.MouseEvent<HTMLElement>, newPreset: string | null) => {
    if (newPreset === 'custom') {
      setIsCustom(true);
    } else if (newPreset) {
      setIsCustom(false);
      const preset = CANVAS_PRESETS.find((p) => `${p.width}x${p.height}` === newPreset);
      if (preset) {
        onChange(preset);
      }
    }
  };

  const handleCustomWidthChange = (width: string) => {
    const numWidth = parseInt(width, 10);
    if (!isNaN(numWidth) && numWidth > 0) {
      onChange({ ...value, width: numWidth, label: 'Custom' });
    }
  };

  const handleCustomHeightChange = (height: string) => {
    const numHeight = parseInt(height, 10);
    if (!isNaN(numHeight) && numHeight > 0) {
      onChange({ ...value, height: numHeight, label: 'Custom' });
    }
  };

  const currentPreset = isCustom
    ? 'custom'
    : `${value.width}x${value.height}`;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Canvas Size
      </Typography>

      <Stack spacing={2}>
        {/* Preset sizes */}
        <ToggleButtonGroup
          value={currentPreset}
          exclusive
          onChange={handlePresetChange}
          size="small"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            '& .MuiToggleButtonGroup-grouped': {
              margin: 0.25,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              fontSize: '0.75rem',
              py: 0.5,
              px: 1,
            },
          }}
        >
          {CANVAS_PRESETS.map((preset) => (
            <ToggleButton
              key={`${preset.width}x${preset.height}`}
              value={`${preset.width}x${preset.height}`}
            >
              {preset.label.split(' ')[0]}
            </ToggleButton>
          ))}
          <ToggleButton value="custom">
            Custom
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Custom size inputs */}
        {isCustom && (
          <Grid container spacing={1}>
            <Grid size={6}>
              <TextField
                size="small"
                fullWidth
                label="Width"
                type="number"
                value={value.width}
                onChange={(e) => handleCustomWidthChange(e.target.value)}
                inputProps={{ min: 100, max: 4000 }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                size="small"
                fullWidth
                label="Height"
                type="number"
                value={value.height}
                onChange={(e) => handleCustomHeightChange(e.target.value)}
                inputProps={{ min: 100, max: 4000 }}
              />
            </Grid>
          </Grid>
        )}

        {/* Current size display */}
        <Typography variant="caption" color="text.secondary">
          {value.width} × {value.height} px
        </Typography>
      </Stack>
    </Box>
  );
}
