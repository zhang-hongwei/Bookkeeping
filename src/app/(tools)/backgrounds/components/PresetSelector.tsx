/**
 * Preset Selector Component
 * Grid of preset thumbnails for quick selection
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import { useBackgroundsStore } from '../store/backgroundsStore';
import { getBackgroundGenerator } from '../generators/BaseBackgroundGenerator';
import type { GeneratorPreset } from '../types';

export function PresetSelector() {
  const generatorType = useBackgroundsStore((s) => s.generatorType);
  const applyPreset = useBackgroundsStore((s) => s.applyPreset);

  const generator = getBackgroundGenerator(generatorType);
  if (!generator) return null;

  const presets = generator.presets;

  const handlePresetClick = (preset: GeneratorPreset) => {
    applyPreset(preset.name);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Presets
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ gap: 1 }}
      >
        {presets.map((preset) => (
          <Chip
            key={preset.name}
            label={preset.name}
            onClick={() => handlePresetClick(preset)}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
