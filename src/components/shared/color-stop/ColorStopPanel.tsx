/**
 * ColorStopPanel Component
 * Combines ColorStopBar + ColorStopEditor into a cohesive unit.
 * Optionally shows an AngleWheel for the gradient direction.
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Stack,
  Slider,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ColorStopBar from './ColorStopBar';
import ColorStopEditor from './ColorStopEditor';
import AngleWheel from './AngleWheel';
import type { ColorStop } from './types';

// ── Direction presets ──────────────────────────────────────────────

const DIRECTION_PRESETS: { label: string; angle: number; icon: string }[] = [
  { label: 'to top', angle: 0, icon: '↑' },
  { label: 'to top right', angle: 45, icon: '↗' },
  { label: 'to right', angle: 90, icon: '→' },
  { label: 'to bottom right', angle: 135, icon: '↘' },
  { label: 'to bottom', angle: 180, icon: '↓' },
  { label: 'to bottom left', angle: 225, icon: '↙' },
  { label: 'to left', angle: 270, icon: '←' },
  { label: 'to top left', angle: 315, icon: '↖' },
];

export interface ColorStopPanelProps {
  /** Section title (e.g. "Color Stops", "Inner Background") */
  title: string;
  /** Color stops array */
  stops: ColorStop[];
  /** Currently selected stop ID */
  selectedStopId: string | null;
  /** Callback to select a stop */
  onSelectStop: (id: string | null) => void;
  /** Callback to add a stop at position */
  onAddStop: (position: number) => void;
  /** Callback to move a stop */
  onMoveStop: (id: string, position: number) => void;
  /** Callback to update the selected stop */
  onUpdateStop: (updates: Partial<ColorStop>) => void;
  /** Callback to remove the selected stop */
  onRemoveStop: (id: string) => void;
  /** Callback to duplicate the selected stop */
  onDuplicateStop: (id: string) => void;
  /** Minimum number of stops (default 2) */
  minStops?: number;
  /** Gradient CSS for the bar preview */
  gradientCSS: string;
  /** Optional angle value (0-360). When provided, an AngleWheel is shown. */
  angle?: number;
  /** Callback when angle changes */
  onAngleChange?: (angle: number) => void;
}

const ColorStopPanel: React.FC<ColorStopPanelProps> = ({
  title,
  stops,
  selectedStopId,
  onSelectStop,
  onAddStop,
  onMoveStop,
  onUpdateStop,
  onRemoveStop,
  onDuplicateStop,
  minStops = 2,
  gradientCSS,
  angle,
  onAngleChange,
}) => {
  const selectedStop = useMemo(
    () => stops.find((s) => s.id === selectedStopId) || null,
    [stops, selectedStopId],
  );

  const canRemove = stops.length > minStops;

  const handleUpdateSelected = useCallback(
    (updates: Partial<ColorStop>) => {
      onUpdateStop(updates);
    },
    [onUpdateStop],
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
        <Tooltip title="Add color stop">
          <IconButton onClick={() => onAddStop(50)} size="small" color="primary">
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Gradient bar with markers */}
      <Box sx={{ mb: 3, pt: 2, px: 0.5 }}>
        <ColorStopBar
          stops={stops}
          selectedStopId={selectedStopId}
          onSelectStop={onSelectStop}
          onAddStop={onAddStop}
          onMoveStop={onMoveStop}
          gradientCSS={gradientCSS}
        />
      </Box>

      {/* Direction preset arrows */}
      {angle !== undefined && onAngleChange && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
            {DIRECTION_PRESETS.map((preset) => {
              const isActive = angle === preset.angle;
              return (
                <Tooltip key={preset.angle} title={preset.label} arrow>
                  <IconButton
                    size="small"
                    onClick={() => onAngleChange(preset.angle)}
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: '1.1rem',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: isActive ? 'primary.main' : 'divider',
                      bgcolor: isActive ? 'primary.main' : 'transparent',
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                      '&:hover': {
                        bgcolor: isActive ? 'primary.dark' : 'action.hover',
                      },
                    }}
                  >
                    {preset.icon}
                  </IconButton>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Optional angle control — AngleWheel + slider */}
      {angle !== undefined && onAngleChange && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <AngleWheel value={angle} onChange={onAngleChange} size={80} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Direction: {angle}°
              </Typography>
              <Slider
                value={angle}
                onChange={(_, v) => onAngleChange(v as number)}
                min={0}
                max={360}
                size="small"
              />
            </Box>
          </Stack>
        </Box>
      )}

      {/* Editor for selected stop */}
      <ColorStopEditor
        stop={selectedStop}
        onUpdateStop={handleUpdateSelected}
        onRemoveStop={() => {
          if (selectedStopId) onRemoveStop(selectedStopId);
        }}
        onDuplicateStop={() => {
          if (selectedStopId) onDuplicateStop(selectedStopId);
        }}
        canRemove={canRemove}
      />
    </Box>
  );
};

export default React.memo(ColorStopPanel);
