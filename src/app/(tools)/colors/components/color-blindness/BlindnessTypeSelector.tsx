/**
 * BlindnessTypeSelector Component
 * Select color blindness type for simulation
 */

'use client';

import React from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Typography,
  Stack,
} from '@mui/material';
import { BLINDNESS_TYPES } from '../../utils/colorBlindness';
import type { ColorBlindnessType } from '../../types';

interface BlindnessTypeSelectorProps {
  value: ColorBlindnessType | null;
  onChange: (type: ColorBlindnessType | null) => void;
  showNone?: boolean;
}

export function BlindnessTypeSelector({
  value,
  onChange,
  showNone = true,
}: BlindnessTypeSelectorProps) {
  return (
    <Box>
      <ToggleButtonGroup
        value={value || 'none'}
        exclusive
        onChange={(_, newValue) => {
          if (newValue !== null) {
            onChange(newValue === 'none' ? null : newValue);
          }
        }}
        size="small"
        sx={{
          flexWrap: 'wrap',
          gap: 0.5,
          '& .MuiToggleButtonGroup-grouped': {
            margin: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            '&.Mui-selected': {
              borderColor: 'primary.main',
            },
          },
        }}
      >
        {showNone && (
          <ToggleButton value="none">
            <Tooltip title="Normal color vision">
              <Typography variant="body2">Normal</Typography>
            </Tooltip>
          </ToggleButton>
        )}

        {BLINDNESS_TYPES.map((type) => (
          <ToggleButton key={type.type} value={type.type}>
            <Tooltip
              title={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {type.label}
                  </Typography>
                  <Typography variant="caption">{type.description}</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Prevalence: {type.prevalence}
                  </Typography>
                </Box>
              }
            >
              <Typography variant="body2">{type.label}</Typography>
            </Tooltip>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
