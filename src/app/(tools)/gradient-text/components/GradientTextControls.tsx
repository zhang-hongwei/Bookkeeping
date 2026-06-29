/**
 * Gradient Text Controls Panel
 * Left panel with gradient type, color stops, and text settings
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
} from '@mui/material';
import { ColorStopPanel } from '@/components/shared/color-stop';
import { useGradientTextStore, useGradientTextActions } from '@/store/gradient-text';
import { buildGradientCSS } from '../utils';
import type { GradientType } from '../types';

const GRADIENT_TYPES: { value: GradientType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial-circle', label: 'Radial (Circle)' },
  { value: 'radial-ellipse', label: 'Radial (Ellipse)' },
  { value: 'conic', label: 'Conic' },
];

const FONT_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

export function GradientTextControls() {
  const config = useGradientTextStore((s) => s.config);
  const selectedStopId = useGradientTextStore((s) => s.selectedStopId);
  const actions = useGradientTextActions();

  const gradientCSS = useMemo(
    () => buildGradientCSS(config.colorStops, config.gradientType, config.angle),
    [config.colorStops, config.gradientType, config.angle],
  );

  const handleUpdateSelectedStop = useCallback(
    (updates: Partial<import('@/components/shared/color-stop').ColorStop>) => {
      if (selectedStopId) {
        actions.updateColorStopPartial(selectedStopId, updates);
      }
    },
    [selectedStopId, actions.updateColorStopPartial],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Gradient Type */}
      <Box>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Gradient Style
        </Typography>
        <ToggleButtonGroup
          value={config.gradientType}
          exclusive
          onChange={(_, v) => { if (v) actions.setGradientType(v); }}
          size="small"
          fullWidth
          sx={{ flexWrap: 'wrap', gap: 0.5, '& .MuiToggleButton-root': { flex: '1 1 calc(50% - 4px)', minWidth: 0 } }}
        >
          {GRADIENT_TYPES.map((t) => (
            <ToggleButton key={t.value} value={t.value} sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}>
              {t.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Color Stops */}
      <ColorStopPanel
        title="Color Stops"
        stops={config.colorStops}
        selectedStopId={selectedStopId}
        onSelectStop={actions.selectColorStop}
        onAddStop={actions.addColorStop}
        onMoveStop={actions.moveColorStop}
        onUpdateStop={handleUpdateSelectedStop}
        onRemoveStop={actions.removeColorStop}
        onDuplicateStop={actions.duplicateColorStop}
        gradientCSS={gradientCSS}
        angle={config.gradientType === 'linear' || config.gradientType === 'conic' ? config.angle : undefined}
        onAngleChange={(a) => actions.updateConfig({ angle: a })}
      />

      <Divider />

      {/* Text Content */}
      <Box>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Text Content
        </Typography>
        <TextField
          value={config.text}
          onChange={(e) => actions.updateConfig({ text: e.target.value })}
          fullWidth
          multiline
          rows={2}
          size="small"
          placeholder="Enter your text..."
        />
      </Box>

      {/* Font Size */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight="bold">Font Size</Typography>
          <Typography variant="caption" color="text.secondary">{config.fontSize}px</Typography>
        </Stack>
        <Slider
          value={config.fontSize}
          onChange={(_, v) => actions.updateConfig({ fontSize: v as number })}
          min={12}
          max={200}
          size="small"
        />
      </Box>

      {/* Font Weight */}
      <FormControl size="small" fullWidth>
        <InputLabel>Font Weight</InputLabel>
        <Select
          value={config.fontWeight}
          onChange={(e) => actions.updateConfig({ fontWeight: e.target.value as number })}
          label="Font Weight"
        >
          {FONT_WEIGHTS.map((w) => (
            <MenuItem key={w} value={w}>{w}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Letter Spacing */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight="bold">Letter Spacing</Typography>
          <Typography variant="caption" color="text.secondary">{config.letterSpacing}px</Typography>
        </Stack>
        <Slider
          value={config.letterSpacing}
          onChange={(_, v) => actions.updateConfig({ letterSpacing: v as number })}
          min={-5}
          max={20}
          size="small"
        />
      </Box>

      {/* Line Height */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight="bold">Line Height</Typography>
          <Typography variant="caption" color="text.secondary">{config.lineHeight}</Typography>
        </Stack>
        <Slider
          value={config.lineHeight}
          onChange={(_, v) => actions.updateConfig({ lineHeight: v as number })}
          min={0.8}
          max={3}
          step={0.1}
          size="small"
        />
      </Box>

      {/* Text Align */}
      <Box>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Text Align</Typography>
        <ToggleButtonGroup
          value={config.textAlign}
          exclusive
          onChange={(_, v) => { if (v) actions.updateConfig({ textAlign: v }); }}
          size="small"
          fullWidth
        >
          <ToggleButton value="left" sx={{ textTransform: 'none' }}>Left</ToggleButton>
          <ToggleButton value="center" sx={{ textTransform: 'none' }}>Center</ToggleButton>
          <ToggleButton value="right" sx={{ textTransform: 'none' }}>Right</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider />

      {/* Preview Background */}
      <Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" fontWeight="bold">Preview Background</Typography>
          <input
            type="color"
            value={config.previewBgColor}
            onChange={(e) => actions.updateConfig({ previewBgColor: e.target.value })}
            style={{ width: 32, height: 28, border: 'none', cursor: 'pointer', borderRadius: 4 }}
          />
          <TextField
            value={config.previewBgColor}
            onChange={(e) => actions.updateConfig({ previewBgColor: e.target.value })}
            size="small"
            sx={{ width: 100 }}
          />
        </Stack>
      </Box>
    </Box>
  );
}
