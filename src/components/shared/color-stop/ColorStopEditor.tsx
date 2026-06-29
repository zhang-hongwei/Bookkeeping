/**
 * ColorStopEditor Component
 * Color picker and controls for selected stop (uses react-colorful)
 */

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Popover,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { RgbaColorPicker } from 'react-colorful';
import type { RgbaColor } from 'react-colorful';
import type { ColorStop } from './types';

// ── Helpers ──────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(full.slice(0, 2), 16) || 0,
    g: parseInt(full.slice(2, 4), 16) || 0,
    b: parseInt(full.slice(4, 6), 16) || 0,
  };
}

function rgbaToHex(rgba: RgbaColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.min(255, Math.max(0, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
}

// ── Props ────────────────────────────────────────────────

interface ColorStopEditorProps {
  stop: ColorStop | null;
  onUpdateStop: (updates: Partial<ColorStop>) => void;
  onRemoveStop: () => void;
  onDuplicateStop: () => void;
  canRemove: boolean;
}

// ── Component ────────────────────────────────────────────

const ColorStopEditor: React.FC<ColorStopEditorProps> = ({
  stop,
  onUpdateStop,
  onRemoveStop,
  onDuplicateStop,
  canRemove,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgba'>('hex');
  const [editingValue, setEditingValue] = useState<string | null>(null);

  const rgba = useMemo(() => {
    if (!stop) return { r: 0, g: 0, b: 0, a: 1 };
    const { r, g, b } = hexToRgb(stop.color);
    return { r, g, b, a: stop.opacity / 100 };
  }, [stop]);

  const handlePickerChange = useCallback(
    (newRgba: RgbaColor) => {
      onUpdateStop({
        color: rgbaToHex(newRgba),
        opacity: Math.round(newRgba.a * 100),
      });
    },
    [onUpdateStop],
  );

  const displayValue = useMemo(() => {
    if (!stop) return '';
    if (editingValue !== null) return editingValue;
    if (colorFormat === 'rgba') {
      const { r, g, b } = hexToRgb(stop.color);
      return `rgba(${r}, ${g}, ${b}, ${(stop.opacity / 100).toFixed(2)})`;
    }
    return stop.color.toUpperCase();
  }, [stop, colorFormat, editingValue]);

  const handleColorInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEditingValue(value);

      const trimmed = value.trim();

      // Auto-detect rgba(r, g, b, a) format
      const rgbaMatch = trimmed.match(
        /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/i,
      );
      if (rgbaMatch) {
        const r = Math.min(255, parseInt(rgbaMatch[1], 10));
        const g = Math.min(255, parseInt(rgbaMatch[2], 10));
        const b = Math.min(255, parseInt(rgbaMatch[3], 10));
        const a = rgbaMatch[4] !== undefined ? Math.min(1, parseFloat(rgbaMatch[4])) : 1;
        onUpdateStop({
          color: rgbaToHex({ r, g, b, a }),
          opacity: Math.round(a * 100),
        });
        return;
      }

      // Auto-detect hex format
      let hex = trimmed;
      if (hex && !hex.startsWith('#')) hex = '#' + hex;
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        onUpdateStop({ color: hex });
      }
    },
    [onUpdateStop],
  );

  const handleColorInputBlur = useCallback(() => {
    setEditingValue(null);
  }, []);

  const handlePositionChange = useCallback(
    (_: Event, value: number | number[]) => {
      onUpdateStop({ position: value as number });
    },
    [onUpdateStop],
  );

  const handlePositionInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        onUpdateStop({ position: value });
      }
    },
    [onUpdateStop],
  );

  const handleOpacityChange = useCallback(
    (_: Event, value: number | number[]) => {
      onUpdateStop({ opacity: value as number });
    },
    [onUpdateStop],
  );

  if (!stop) {
    return (
      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          color: 'text.secondary',
          bgcolor: 'action.hover',
          borderRadius: 1,
        }}
      >
        <Typography variant="body2">
          Click a color stop to edit it
        </Typography>
      </Box>
    );
  }

  const swatchBg = `rgba(${hexToRgb(stop.color).r}, ${hexToRgb(stop.color).g}, ${hexToRgb(stop.color).b}, ${stop.opacity / 100})`;

  return (
    <Box>
      {/* Header with actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          Edit Color Stop
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Duplicate stop">
            <span>
              <IconButton size="small" onClick={onDuplicateStop}>
                <DuplicateIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={canRemove ? 'Delete stop' : 'Minimum 2 stops required'}>
            <span>
              <IconButton size="small" onClick={onRemoveStop} disabled={!canRemove}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Color picker row */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title="Pick color">
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              border: '2px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              flexShrink: 0,
            }}
          >
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: swatchBg }} />
          </Box>
        </Tooltip>

        <TextField
          label={
            <Typography
              variant="caption"
              sx={{ cursor: 'pointer', fontWeight: 600, letterSpacing: 0.5 }}
              onClick={() => setColorFormat((f) => (f === 'hex' ? 'rgba' : 'hex'))}
            >
              {colorFormat === 'hex' ? 'HEX' : 'RGBA'}
            </Typography>
          }
          value={displayValue}
          onChange={handleColorInputChange}
          onBlur={handleColorInputBlur}
          size="small"
          sx={{ flex: 1 }}
          inputProps={{
            sx: { fontFamily: 'monospace' },
          }}
        />
      </Stack>

      {/* react-colorful popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 1.5, mt: 0.5 } } }}
      >
        <Box
          sx={{
            '& .react-colorful': { width: 220, height: 180 },
            '& .react-colorful__saturation': { borderRadius: '6px 6px 0 0' },
            '& .react-colorful__hue': { height: 16, borderRadius: 3, mt: 0.5 },
            '& .react-colorful__alpha': { height: 16, borderRadius: 3, mt: 0.5 },
            '& .react-colorful__pointer': { width: 16, height: 16 },
          }}
        >
          <RgbaColorPicker color={rgba} onChange={handlePickerChange} />
        </Box>
      </Popover>

      {/* Position */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Position {stop.positionEnd !== undefined && `— ${stop.positionEnd}%`}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TextField
              value={Math.round(stop.position)}
              onChange={handlePositionInputChange}
              size="small"
              type="number"
              inputProps={{ min: 0, max: 100, sx: { width: 48, textAlign: 'center' } }}
              sx={{ width: 58 }}
            />
            {stop.positionEnd !== undefined && (
              <>
                <Typography variant="caption" color="text.secondary">—</Typography>
                <TextField
                  value={Math.round(stop.positionEnd)}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 0 && v <= 100) {
                      onUpdateStop({ positionEnd: v });
                    }
                  }}
                  size="small"
                  type="number"
                  inputProps={{ min: 0, max: 100, sx: { width: 48, textAlign: 'center' } }}
                  sx={{ width: 58 }}
                />
                <Tooltip title="Remove end position">
                  <IconButton size="small" onClick={() => onUpdateStop({ positionEnd: undefined })}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {stop.positionEnd === undefined && (
              <Tooltip title="Add end position (dual position: color pos% posEnd%)">
                <IconButton size="small" onClick={() => onUpdateStop({ positionEnd: Math.min(stop.position + 20, 100) })}>
                  <AddIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        <Slider
          value={stop.positionEnd !== undefined ? [stop.position, stop.positionEnd] : stop.position}
          onChange={(_, v) => {
            if (Array.isArray(v)) {
              onUpdateStop({ position: v[0], positionEnd: v[1] });
            } else {
              onUpdateStop({ position: v });
            }
          }}
          min={0}
          max={100}
          step={1}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${v}%`}
        />
      </Box>

      {/* Opacity slider */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Opacity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {stop.opacity}%
          </Typography>
        </Stack>
        <Slider
          value={stop.opacity}
          onChange={handleOpacityChange}
          min={0}
          max={100}
          step={1}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${v}%`}
        />
      </Box>
    </Box>
  );
};

export default React.memo(ColorStopEditor);
