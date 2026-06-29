/**
 * Control Panel Component
 * Dynamic control panel based on current generator
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { useBackgroundsStore } from '../store/backgroundsStore';
import { getBackgroundGenerator } from '../generators/BaseBackgroundGenerator';
import type { GeneratorControl } from '../types';
import { ColorPickerSection } from './ColorPickerSection';

export function ControlPanel() {
  const generatorType = useBackgroundsStore((s) => s.generatorType);
  const config = useBackgroundsStore((s) => s.config);
  const updateConfig = useBackgroundsStore((s) => s.updateConfig);

  const generator = getBackgroundGenerator(generatorType);
  if (!generator) return null;

  const controls = generator.controls;

  const handleSliderChange = (key: string, value: number) => {
    updateConfig({ [key]: value });
  };

  const handleTextChange = (key: string, value: string) => {
    updateConfig({ [key]: value });
  };

  const handleSelectChange = (key: string, value: string | number) => {
    updateConfig({ [key]: value });
  };

  const handleToggleChange = (key: string, value: boolean) => {
    updateConfig({ [key]: value });
  };

  const renderControl = (control: GeneratorControl) => {
    const currentValue = (config as Record<string, unknown>)[control.key] ?? control.defaultValue;

    switch (control.type) {
      case 'slider':
        return (
          <Box key={control.key}>
            <Typography variant="body2" gutterBottom>
              {control.label}: {currentValue as number}
              {control.key.toLowerCase().includes('opacity') ||
              control.key.toLowerCase().includes('size')
                ? ''
                : control.key.toLowerCase().includes('angle')
                  ? '°'
                  : control.key.toLowerCase().includes('width')
                    ? 'px'
                    : ''}
            </Typography>
            <Slider
              value={currentValue as number}
              onChange={(_, value) => handleSliderChange(control.key, value as number)}
              min={control.min}
              max={control.max}
              step={control.step}
              size="small"
              valueLabelDisplay="auto"
            />
          </Box>
        );

      case 'number':
        return (
          <TextField
            key={control.key}
            label={control.label}
            type="number"
            value={currentValue as number}
            onChange={(e) => handleSliderChange(control.key, Number(e.target.value))}
            size="small"
            fullWidth
            inputProps={{
              min: control.min,
              max: control.max,
              step: control.step,
            }}
          />
        );

      case 'text':
        return (
          <TextField
            key={control.key}
            label={control.label}
            value={currentValue as string}
            onChange={(e) => handleTextChange(control.key, e.target.value)}
            size="small"
            fullWidth
          />
        );

      case 'select':
        return (
          <FormControl key={control.key} fullWidth size="small">
            <InputLabel>{control.label}</InputLabel>
            <Select
              value={currentValue as string | number}
              label={control.label}
              onChange={(e) => handleSelectChange(control.key, e.target.value)}
            >
              {control.options?.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'toggle':
        return (
          <FormControlLabel
            key={control.key}
            control={
              <Switch
                checked={currentValue as boolean}
                onChange={(e) => handleToggleChange(control.key, e.target.checked)}
              />
            }
            label={control.label}
          />
        );

      case 'color':
        return (
          <Box key={control.key}>
            <Typography variant="body2" gutterBottom>
              {control.label}
            </Typography>
            <input
              type="color"
              value={currentValue as string}
              onChange={(e) => handleTextChange(control.key, e.target.value)}
              style={{
                width: '100%',
                height: 40,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Generator-specific controls */}
      {controls.map((control) => renderControl(control))}

      <Divider />

      {/* Color palette controls */}
      <ColorPickerSection />
    </Box>
  );
}
