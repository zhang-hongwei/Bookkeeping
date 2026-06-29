/**
 * BlindnessSimulator Component
 * Simulate how colors appear to users with color vision deficiency
 */

'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { BlindnessTypeSelector } from './BlindnessTypeSelector';
import { useColorBlindness } from '../../hooks';
import { BLINDNESS_TYPES } from '../../utils/colorBlindness';
import type { ColorBlindnessType, CustomColor } from '../../types';

interface BlindnessSimulatorProps {
  colors: CustomColor[];
  activeType: ColorBlindnessType | null;
  onTypeChange: (type: ColorBlindnessType | null) => void;
}

export function BlindnessSimulator({
  colors,
  activeType,
  onTypeChange,
}: BlindnessSimulatorProps) {
  // Extract hex colors from custom colors
  const hexColors = useMemo(() => colors.map((c) => c.hex), [colors]);

  // Use the color blindness hook
  const { simulatedColors, confusablePairs, hasIssues } = useColorBlindness({
    colors: hexColors,
    activeType,
    threshold: 30,
  });

  if (colors.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <VisibilityIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography color="text.secondary">
          Add colors to see color blindness simulation
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Color Blindness Simulator</Typography>
        <ToggleButtonGroup
          value={activeType || ''}
          exclusive
          onChange={(_, value) => onTypeChange(value || null)}
          size="small"
        >
          <ToggleButton value="">
            Normal
          </ToggleButton>
          {BLINDNESS_TYPES.map((type) => (
            <ToggleButton key={type.type} value={type.type}>
              {type.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {/* Warning for confusable pairs */}
      {activeType && hasIssues && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
          <Typography variant="body2" fontWeight={600}>
            Potential color confusion detected!
          </Typography>
          <Typography variant="caption">
            {confusablePairs.length} pair(s) of colors may be difficult to distinguish.
          </Typography>
        </Alert>
      )}

      {/* Color comparison */}
      <Box>
        <Grid container spacing={2}>
          {/* Original colors */}
          <Grid size={{ xs: 12, md: activeType ? 6 : 12 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Original Colors
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {colors.map((color, index) => (
                <Box
                  key={color.id || index}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    bgcolor: color.hex,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    p: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      px: 0.5,
                      borderRadius: 0.5,
                      fontSize: 9,
                    }}
                  >
                    {color.hex}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Simulated colors */}
          {activeType && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Simulated ({BLINDNESS_TYPES.find((t) => t.type === activeType)?.label})
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {simulatedColors.map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 1,
                      bgcolor: color,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      p: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        px: 0.5,
                        borderRadius: 0.5,
                        fontSize: 9,
                      }}
                    >
                      {color}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Confusable pairs detail */}
      {activeType && confusablePairs.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Confusable Pairs
          </Typography>
          <Stack spacing={1}>
            {confusablePairs.map((pair, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0.5,
                    bgcolor: pair.color1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                <Typography variant="caption">≈</Typography>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0.5,
                    bgcolor: pair.color2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  These colors may appear similar
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
