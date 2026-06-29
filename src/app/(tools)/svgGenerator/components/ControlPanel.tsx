'use client';

import React from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Select,
  MenuItem,
  Stack,
  Divider,
  Chip,
  useTheme,
  alpha,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Palette, Checkroom } from '@mui/icons-material';
import type { GeneratorType, GeneratorControl } from '../types';
import { getGenerator } from '../generators/BaseGenerator';

interface ControlPanelProps {
  generatorType: GeneratorType;
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

/**
 * Dynamic control panel based on generator definition
 */
export function ControlPanel({ generatorType, config, onChange }: ControlPanelProps) {
  const theme = useTheme();
  const generator = getGenerator(generatorType);

  if (!generator) {
    return (
      <Typography color="error">
        Generator not found: {generatorType}
      </Typography>
    );
  }

  const { controls, presets } = generator;

  const handlePresetClick = (preset: typeof presets[0]) => {
    Object.entries(preset.config).forEach(([key, value]) => {
      onChange(key, value);
    });
  };

  const renderControl = (control: GeneratorControl) => {
    const value = config[control.key] ?? control.defaultValue;

    switch (control.type) {
      case 'slider':
        return (
          <Box key={control.key}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {control.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  fontSize: '0.75rem',
                }}
              >
                {value as number}
              </Typography>
            </Box>
            <Slider
              value={value as number}
              onChange={(_, newValue) => onChange(control.key, newValue)}
              min={control.min ?? 0}
              max={control.max ?? 100}
              step={control.step ?? 1}
              size="small"
              sx={{
                '& .MuiSlider-thumb': {
                  width: 14,
                  height: 14,
                  transition: '0.2s',
                  '&:hover': {
                    boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                  },
                },
                '& .MuiSlider-track': {
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  opacity: 0.3,
                },
              }}
            />
          </Box>
        );

      case 'number':
        return (
          <TextField
            key={control.key}
            label={control.label}
            type="number"
            value={value as number}
            onChange={(e) => onChange(control.key, Number(e.target.value))}
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
              '& .MuiInputBase-input': {
                fontSize: '0.85rem',
              },
            }}
          />
        );

      case 'select':
        return (
          <TextField
            key={control.key}
            select
            label={control.label}
            value={value as string}
            onChange={(e) => onChange(control.key, e.target.value)}
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          >
            {control.options?.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case 'color':
        return (
          <Box key={control.key}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1,
                fontWeight: 500,
                color: theme.palette.text.secondary,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {control.label}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.5),
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  backgroundColor: value as string,
                  border: '2px solid',
                  borderColor: alpha(theme.palette.divider, 0.8),
                }}
              />
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {(value as string).toUpperCase()}
              </Typography>
              <input
                type="color"
                value={value as string}
                onChange={(e) => onChange(control.key, e.target.value)}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                }}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Stack spacing={3}>
      {/* Presets section */}
      {presets.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1.5,
              fontWeight: 600,
              color: theme.palette.text.secondary,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Presets
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {presets.map((preset) => (
              <Chip
                key={preset.name}
                label={preset.name}
                size="small"
                onClick={() => handlePresetClick(preset)}
                sx={{
                  borderRadius: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.5),
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ opacity: 0.5 }} />

      {/* Canvas size selector */}
      <Box>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 1.5,
            fontWeight: 600,
            color: theme.palette.text.secondary,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Canvas Size
        </Typography>
        <Select
          value={`${config.canvas?.width}x${config.canvas?.height}`}
          onChange={(e) => {
            const [width, height] = e.target.value.split('x').map(Number);
            onChange('canvas', { width, height, label: e.target.value });
          }}
          size="small"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: 1.5,
            },
            '& .MuiSelect-select': {
              fontSize: '0.85rem',
            },
          }}
        >
          <MenuItem value="1920x1080">16:9 (1920×1080)</MenuItem>
          <MenuItem value="1200x630">OG Image (1200×630)</MenuItem>
          <MenuItem value="900x600">3:2 (900×600)</MenuItem>
          <MenuItem value="800x600">4:3 (800×600)</MenuItem>
          <MenuItem value="600x600">1:1 (600×600)</MenuItem>
          <MenuItem value="400x800">Mobile (400×800)</MenuItem>
          <MenuItem value="1080x1920">Story (1080×1920)</MenuItem>
        </Select>
      </Box>

      {/* Generator-specific controls */}
      {controls.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1.5,
              fontWeight: 600,
              color: theme.palette.text.secondary,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Parameters
          </Typography>
          <Stack spacing={2.5}>
            {controls.map(renderControl)}
          </Stack>
        </Box>
      )}

      <Divider sx={{ opacity: 0.5 }} />

      {/* Colors section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Palette sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Colors
          </Typography>
        </Box>
        <Stack spacing={1.5}>
          <Box sx={{ position: 'relative' }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 0.75,
                fontWeight: 500,
                color: theme.palette.text.secondary,
                fontSize: '0.7rem',
              }}
            >
              Background
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.5),
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 0.75,
                  backgroundColor: config.colors?.background || '#ffffff',
                  border: '2px solid',
                  borderColor: alpha(theme.palette.divider, 0.8),
                }}
              />
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {(config.colors?.background || '#ffffff').toUpperCase()}
              </Typography>
              <input
                type="color"
                value={config.colors?.background || '#ffffff'}
                onChange={(e) =>
                  onChange('colors', {
                    ...config.colors,
                    background: e.target.value,
                  })
                }
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  left: 0,
                  top: 0,
                }}
              />
            </Box>
          </Box>

          {(config.colors?.fills || []).map((fill: string, index: number) => (
            <Box key={`fill-${index}`} sx={{ position: 'relative' }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 0.75,
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  fontSize: '0.7rem',
                }}
              >
                Color {index + 1}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.5),
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0.75,
                    backgroundColor: fill,
                    border: '2px solid',
                    borderColor: alpha(theme.palette.divider, 0.8),
                  }}
                />
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {fill.toUpperCase()}
                </Typography>
                <input
                  type="color"
                  value={fill}
                  onChange={(e) => {
                    const newFills = [...(config.colors?.fills || [])];
                    newFills[index] = e.target.value;
                    onChange('colors', {
                      ...config.colors,
                      fills: newFills,
                    });
                  }}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    left: 0,
                    top: 0,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ opacity: 0.5 }} />

      {/* Variant selector */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Checkroom sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Style
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={config.variant || 'solid'}
          exclusive
          onChange={(_, value) => value && onChange('variant', value)}
          size="small"
          fullWidth
          sx={{
            '& .MuiToggleButtonGroup-grouped': {
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.5),
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                },
              },
            },
          }}
        >
          <ToggleButton value="solid" sx={{ py: 1, fontSize: '0.8rem', fontWeight: 500 }}>
            Solid
          </ToggleButton>
          <ToggleButton value="outline" sx={{ py: 1, fontSize: '0.8rem', fontWeight: 500 }}>
            Outline
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Stack>
  );
}
