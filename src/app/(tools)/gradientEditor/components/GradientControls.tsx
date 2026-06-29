/**
 * GradientControls Component
 * Main control panel for gradient editing
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Stack,
  Chip,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tooltip,
} from '@mui/material';
import { RotateLeft as RotateIcon } from '@mui/icons-material';
import {
  Add as AddIcon,
  Refresh as ResetIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import type {
  GradientConfig,
  ColorStop,
  GradientType,
  RadialShape,
  RadialSize,
} from '../types';
import { DIRECTION_PRESETS, GRADIENT_EDITOR_PRESETS, PRESET_CSS_MAP } from '../utils';
import { ColorStopPanel } from '@/components/shared/color-stop';
import type { ColorStop as SharedColorStop } from '@/components/shared/color-stop';
import AngleWheel from './AngleWheel';

interface GradientControlsProps {
  /** Current gradient configuration */
  config: GradientConfig;
  /** Currently selected stop ID */
  selectedStopId: string | null;
  /** Callback to set gradient type */
  onSetGradientType: (type: GradientType) => void;
  /** Callback to set angle */
  onSetAngle: (angle: number) => void;
  /** Callback to set center position */
  onSetCenter: (x: number, y: number) => void;
  /** Callback to set radial shape */
  onSetRadialShape: (shape: RadialShape) => void;
  /** Callback to set radial size */
  onSetRadialSize: (size: RadialSize) => void;
  /** Callback to add stop */
  onAddStop: (position?: number) => void;
  /** Callback to remove stop */
  onRemoveStop: (id: string) => void;
  /** Callback to update stop */
  onUpdateStop: (id: string, updates: Partial<ColorStop>) => void;
  /** Callback to move stop */
  onMoveStop: (id: string, position: number) => void;
  /** Callback to duplicate stop */
  onDuplicateStop: (id: string) => void;
  /** Callback to select stop */
  onSelectStop: (id: string | null) => void;
  /** Callback to apply preset */
  onApplyPreset: (presetName: string) => void;
  /** Callback to reset gradient */
  onResetGradient: () => void;
  /** Callback to open export dialog */
  onOpenExport: () => void;
  /** Generated CSS for preview */
  gradientCSS: string;
}

/**
 * Memoized preset grid — static content, never re-renders during drag.
 * CSS strings are pre-computed at module level in utils.ts.
 */
const PresetGrid = React.memo(({ onApplyPreset }: { onApplyPreset: (name: string) => void }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 1,
    }}
  >
    {GRADIENT_EDITOR_PRESETS.map((preset) => (
      <Box
        key={preset.name}
        onClick={() => onApplyPreset(preset.name)}
        sx={{
          aspectRatio: '1',
          borderRadius: 1,
          background: PRESET_CSS_MAP.get(preset.name),
          cursor: 'pointer',
          border: '2px solid transparent',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.05)',
            borderColor: 'primary.main',
          },
        }}
        title={preset.name}
      />
    ))}
  </Box>
));

/**
 * Main gradient controls panel
 */
const GradientControls: React.FC<GradientControlsProps> = ({
  config,
  selectedStopId,
  onSetGradientType,
  onSetAngle,
  onSetCenter,
  onSetRadialShape,
  onSetRadialSize,
  onAddStop,
  onRemoveStop,
  onUpdateStop,
  onMoveStop,
  onDuplicateStop,
  onSelectStop,
  onApplyPreset,
  onResetGradient,
  onOpenExport,
  gradientCSS,
}) => {
  /**
   * Handle gradient type change
   */
  const handleTypeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newType: GradientType | null) => {
      if (newType !== null) {
        onSetGradientType(newType);
      }
    },
    [onSetGradientType]
  );

  /**
   * Handle angle slider change
   */
  const handleAngleChange = useCallback(
    (_: Event, value: number | number[]) => {
      onSetAngle(value as number);
    },
    [onSetAngle]
  );

  /**
   * Handle angle text input change
   */
  const handleAngleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 0 && value <= 360) {
        onSetAngle(value);
      }
    },
    [onSetAngle]
  );

  /**
   * Handle angle wheel change
   */
  const handleAngleWheelChange = useCallback(
    (angle: number) => {
      onSetAngle(angle);
    },
    [onSetAngle]
  );

  /**
   * Handle center X change
   */
  const handleCenterXChange = useCallback(
    (_: Event, value: number | number[]) => {
      onSetCenter(value as number, config.centerY);
    },
    [onSetCenter, config.centerY]
  );

  /**
   * Handle center Y change
   */
  const handleCenterYChange = useCallback(
    (_: Event, value: number | number[]) => {
      onSetCenter(config.centerX, value as number);
    },
    [onSetCenter, config.centerX]
  );

  /**
   * Handle radial shape change
   */
  const handleRadialShapeChange = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      onSetRadialShape(e.target.value as RadialShape);
    },
    [onSetRadialShape]
  );

  /**
   * Handle radial size change
   */
  const handleRadialSizeChange = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      onSetRadialSize(e.target.value as RadialSize);
    },
    [onSetRadialSize]
  );

  /**
   * Handle direction preset click
   */
  const handleDirectionClick = useCallback(
    (angle: number) => {
      onSetAngle(angle);
    },
    [onSetAngle]
  );

  /**
   * Handle preset click
   */
  const handlePresetClick = useCallback(
    (presetName: string) => {
      onApplyPreset(presetName);
    },
    [onApplyPreset]
  );

  /**
   * Get selected stop
   */
  const selectedStop = config.stops.find((s) => s.id === selectedStopId) || null;

  /**
   * Check if can remove stop
   */
  const canRemoveStop = config.stops.length > 2;

  /**
   * Convert stops from 0-1 opacity (internal) to 0-100 (shared components)
   */
  const sharedStops: SharedColorStop[] = useMemo(
    () => config.stops.map((s) => ({ ...s, opacity: Math.round(s.opacity * 100) })),
    [config.stops],
  );

  const selectedSharedStop = useMemo(
    () => sharedStops.find((s) => s.id === selectedStopId) || null,
    [sharedStops, selectedStopId],
  );

  /**
   * Handle shared editor update: convert opacity 0-100 → 0-1
   */
  const handleSharedUpdateStop = useCallback(
    (updates: Partial<SharedColorStop>) => {
      if (!selectedStopId) return;
      const converted: Partial<ColorStop> = { ...updates };
      if (updates.opacity !== undefined) converted.opacity = updates.opacity / 100;
      onUpdateStop(selectedStopId, converted);
    },
    [selectedStopId, onUpdateStop],
  );

  /**
   * Handle shared bar add stop: delegate to hook with position
   */
  const handleSharedAddStop = useCallback(
    (position: number) => onAddStop(position),
    [onAddStop],
  );

  /**
   * Show center controls for radial/conic
   */
  const showCenterControls = config.type === 'radial' || config.type === 'conic';

  return (
    <Stack spacing={3}>
      {/* Gradient Type Selector */}
      <Box>
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
          Gradient Type
        </Typography>
        <ToggleButtonGroup
          value={config.type}
          exclusive
          onChange={handleTypeChange}
          fullWidth
          size="small"
        >
          <ToggleButton value="linear">Linear</ToggleButton>
          <ToggleButton value="radial">Radial</ToggleButton>
          <ToggleButton value="conic">Conic</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Angle Control (for linear and conic) */}
      {config.type !== 'radial' && (
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Angle Control
          </Typography>

          {/* Angle Wheel + Input Row */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            {/* Circular Angle Wheel */}
            <AngleWheel
              value={config.angle}
              onChange={handleAngleWheelChange}
              size={100}
            />

            {/* Angle Input + Slider */}
            <Box sx={{ flex: 1 }}>
              {/* Direct Input */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Tooltip title="Enter angle value (0-360)" arrow>
                  <TextField
                    value={config.angle}
                    onChange={handleAngleInputChange}
                    type="number"
                    size="small"
                    inputProps={{
                      min: 0,
                      max: 360,
                      step: 1,
                      style: { width: 70, textAlign: 'center' },
                    }}
                    InputProps={{
                      endAdornment: <Typography variant="body2">°</Typography>,
                    }}
                  />
                </Tooltip>
              </Stack>

              {/* Slider */}
              <Slider
                value={config.angle}
                onChange={handleAngleChange}
                min={0}
                max={360}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}°`}
                size="small"
              />
            </Box>
          </Stack>

          {/* Direction presets */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Quick Directions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {DIRECTION_PRESETS.map((preset) => (
              <Chip
                key={preset.angle}
                label={preset.label}
                size="small"
                onClick={() => handleDirectionClick(preset.angle)}
                variant={config.angle === preset.angle ? 'filled' : 'outlined'}
                color={config.angle === preset.angle ? 'primary' : 'default'}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Center Controls (for radial and conic) */}
      {showCenterControls && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Center Position
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                X: {config.centerX}%
              </Typography>
              <Slider
                value={config.centerX}
                onChange={handleCenterXChange}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Y: {config.centerY}%
              </Typography>
              <Slider
                value={config.centerY}
                onChange={handleCenterYChange}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
              />
            </Box>
          </Stack>
        </Box>
      )}

      {/* Radial specific controls */}
      {config.type === 'radial' && (
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Shape</InputLabel>
            <Select
              value={config.radialShape}
              label="Shape"
              onChange={handleRadialShapeChange}
            >
              <MenuItem value="circle">Circle</MenuItem>
              <MenuItem value="ellipse">Ellipse</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Size</InputLabel>
            <Select
              value={config.radialSize}
              label="Size"
              onChange={handleRadialSizeChange}
            >
              <MenuItem value="closest-side">Closest Side</MenuItem>
              <MenuItem value="closest-corner">Closest Corner</MenuItem>
              <MenuItem value="farthest-side">Farthest Side</MenuItem>
              <MenuItem value="farthest-corner">Farthest Corner</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      )}

      <Divider />

      {/* Presets */}
      <Box>
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
          Presets
        </Typography>
        <PresetGrid onApplyPreset={handlePresetClick} />
      </Box>

      <Divider />

      {/* Color Stops Section */}
      <ColorStopPanel
        title="Color Stops"
        stops={sharedStops}
        selectedStopId={selectedStopId}
        onSelectStop={onSelectStop}
        onAddStop={handleSharedAddStop}
        onMoveStop={onMoveStop}
        onUpdateStop={handleSharedUpdateStop}
        onRemoveStop={(id) => {
          if (id) onRemoveStop(id);
        }}
        onDuplicateStop={(id) => {
          if (id) onDuplicateStop(id);
        }}
        minStops={2}
        gradientCSS={gradientCSS}
      />

      <Divider />

      {/* Action Buttons */}
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<ResetIcon />}
          onClick={onResetGradient}
          fullWidth
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<ExportIcon />}
          onClick={onOpenExport}
          fullWidth
        >
          Export
        </Button>
      </Stack>
    </Stack>
  );
};

export default React.memo(GradientControls);
