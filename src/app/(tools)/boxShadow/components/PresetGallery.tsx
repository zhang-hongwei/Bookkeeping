/**
 * PresetGallery Component
 * Displays shadow preset examples in a grid
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useThemeMode } from '@/hooks/useThemeMode';
import { shadowPresets } from '../presets';
import { buildBoxShadow } from '../utils';
import { ShadowLayer } from '../types';

interface PresetGalleryProps {
  /** Current active layers */
  currentLayers: ShadowLayer[];
  /** Callback when a preset is selected */
  onSelectPreset: (presetName: string) => void;
}

/**
 * Preset gallery component displaying shadow examples
 */
const PresetGallery: React.FC<PresetGalleryProps> = ({
  currentLayers,
  onSelectPreset,
}) => {
  const { isDark } = useThemeMode();

  // Build current shadow string for comparison
  const currentShadow = useMemo(
    () => buildBoxShadow(currentLayers),
    [currentLayers]
  );

  // Check if a preset matches current layers
  const isPresetActive = useCallback(
    (presetLayers: ShadowLayer[]) => {
      const presetShadow = buildBoxShadow(presetLayers);
      return currentShadow === presetShadow;
    },
    [currentShadow]
  );

  return (
    <Stack spacing={2} >
      <Typography variant="h6">Presets</Typography>
      <Typography variant="caption" color="text.secondary">
        Click to apply a preset shadow effect
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          // maxHeight: 400,
          overflow: 'auto',
          // Hide scrollbar
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none', // Firefox
        }}
      >
        {shadowPresets.map((preset) => {
          const shadowCSS = buildBoxShadow(preset.layers);
          const isActive = isPresetActive(preset.layers);

          return (
            <Tooltip
              key={preset.name}
              title={preset.description}
              arrow
              placement="top"
            >
              <Paper
                elevation={0}
                onClick={() => onSelectPreset(preset.name)}
                sx={{
                  // border: '1px solid red',
                  cursor: 'pointer',
                  p: '4px',
                  border: '2px solid',
                  borderColor: isActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    borderColor: 'primary.light',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <CheckCircleIcon
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      fontSize: 18,
                      color: 'primary.main',
                    }}
                  />
                )}

                {/* Preview box */}
                <Box
                  sx={{
                    width: '100%',
                    height: 60,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f8f9fa',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : '#fff',
                      boxShadow: shadowCSS || 'none',
                    }}
                  />
                </Box>

                {/* Preset info */}
                <Typography
                  variant="caption"
                  fontWeight={isActive ? 'bold' : 'medium'}
                  noWrap
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                  }}
                >
                  {preset.name}
                </Typography>
              </Paper>
            </Tooltip>
          );
        })}
      </Box>
    </Stack>
  );
};

export default React.memo(PresetGallery);
