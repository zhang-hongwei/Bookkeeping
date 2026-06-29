/**
 * Gradient Text Presets Panel
 * Right panel with preset gradient text styles
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { useGradientTextStore } from '@/store/gradient-text';
import { gradientTextPresets } from '../presets';
import { buildGradientCSS } from '../utils';

export function GradientTextPresets() {
  const config = useGradientTextStore((s) => s.config);
  const applyPreset = useGradientTextStore((s) => s.applyPreset);

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
        Presets
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {gradientTextPresets.map((preset) => {
          const presetConfig = { ...config, ...preset.config };
          const gradient = buildGradientCSS(
            presetConfig.colorStops,
            presetConfig.gradientType,
            presetConfig.angle,
          );

          return (
            <Paper
              key={preset.name}
              variant="outlined"
              onClick={() => applyPreset(preset.name)}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-1px)',
                  boxShadow: 2,
                },
              }}
            >
              <Box
                sx={{
                  background: gradient,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  mb: 0.5,
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {preset.name}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                {preset.description}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
