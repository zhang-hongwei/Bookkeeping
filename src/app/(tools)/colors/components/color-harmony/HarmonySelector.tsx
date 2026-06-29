/**
 * HarmonySelector Component
 * Select color harmony type
 */

'use client';

import React from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Box,
  Paper,
  Stack,
} from '@mui/material';
import { HARMONY_OPTIONS } from '../../utils/colorHarmony';
import type { HarmonyType } from '../../types';

interface HarmonySelectorProps {
  value: HarmonyType;
  onChange: (type: HarmonyType) => void;
}

export function HarmonySelector({ value, onChange }: HarmonySelectorProps) {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Harmony Type
      </Typography>
      <Paper variant="outlined" sx={{ p: 1 }}>
        <ToggleButtonGroup
          value={value}
          exclusive
          onChange={(_, newValue) => newValue && onChange(newValue)}
          orientation="vertical"
          sx={{
            width: '100%',
            '& .MuiToggleButton-root': {
              justifyContent: 'flex-start',
              py: 1,
              px: 2,
              textTransform: 'none',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            },
          }}
        >
          {HARMONY_OPTIONS.map((option) => (
            <ToggleButton key={option.type} value={option.type}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    borderRadius: '50%',
                    bgcolor: 'action.hover',
                  }}
                >
                  {option.icon}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>
    </Box>
  );
}
