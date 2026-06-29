'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import type { GeneratorType } from '../types';
import { getAllGenerators } from '../generators/BaseGenerator';

interface GeneratorSelectorProps {
  selectedType: GeneratorType;
  onSelect: (type: GeneratorType) => void;
}

// Category configuration with colors and icons
const categoryConfig = {
  shapes: { color: '#8B5CF6', icon: '●', label: 'Shapes' },
  waves: { color: '#06B6D4', icon: '〜', label: 'Waves' },
  scatters: { color: '#EC4899', icon: '✦', label: 'Scatters' },
  scenes: { color: '#10B981', icon: '◆', label: 'Scenes' },
};

/**
 * Generator type selector - shows all available generators
 */
export function GeneratorSelector({ selectedType, onSelect }: GeneratorSelectorProps) {
  const theme = useTheme();
  const generators = getAllGenerators();

  // Group by category
  const categories = ['shapes', 'waves', 'scatters', 'scenes'] as const;
  const groupedGenerators = categories.reduce((acc, cat) => {
    acc[cat] = generators.filter((g) => g.category === cat);
    return acc;
  }, {} as Record<string, typeof generators>);

  return (
    <Box sx={{ width: '100%' }}>
      {categories.map((category) => {
        const categoryGenerators = groupedGenerators[category];
        if (categoryGenerators.length === 0) return null;

        const config = categoryConfig[category as keyof typeof categoryConfig];

        return (
          <Box key={category} sx={{ mb: 3 }}>
            {/* Category header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: config.color,
                }}
              />
              <Typography
                variant="overline"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: config.color,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {config.label}
              </Typography>
            </Box>

            {/* Generator grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1,
              }}
            >
              {categoryGenerators.map((generator) => {
                const isSelected = selectedType === generator.type;

                return (
                  <Paper
                    key={generator.type}
                    elevation={0}
                    onClick={() => onSelect(generator.type)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isSelected
                        ? config.color
                        : alpha(theme.palette.divider, 0.5),
                      backgroundColor: isSelected
                        ? alpha(config.color, 0.08)
                        : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: config.color,
                        backgroundColor: alpha(config.color, 0.05),
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected
                          ? config.color
                          : theme.palette.text.primary,
                        fontSize: '0.8rem',
                        textAlign: 'center',
                      }}
                    >
                      {generator.name}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
