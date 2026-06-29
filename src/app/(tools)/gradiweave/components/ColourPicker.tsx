'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Popover,
  Stack,
  Chip,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useGradientStore } from '../store/gradient-store';
import { isInGamut, oklchToCssString, hexToOklch } from '../lib/colours/conversion';
import type { ColourStop, OklchColour } from '../types/gradient';

interface OklchSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}

function OklchSlider({ label, value, onChange, min, max, step }: OklchSliderProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontFamily: 'monospace', color: 'text.disabled' }}
        >
          {max > 1 ? Math.round(value) : value.toFixed(3)}
        </Typography>
      </Box>
      <Slider
        value={value}
        onChange={(_, v) => onChange(v as number)}
        min={min}
        max={max}
        step={step}
        size="small"
        sx={{
          height: 4,
          '& .MuiSlider-thumb': {
            width: 14,
            height: 14,
          },
        }}
      />
    </Box>
  );
}

export function ColourPicker({
  colour,
  canRemove,
  onRemove,
}: {
  colour: ColourStop;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const updateColour = useGradientStore((s) => s.updateColour);
  const setColourFormat = useGradientStore((s) => s.setColourFormat);
  const toggleColourLock = useGradientStore((s) => s.toggleColourLock);
  const [hexInput, setHexInput] = useState(colour.hex);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const format = colour.displayFormat;
  const inGamut = isInGamut(colour.oklch);
  const cssColour = inGamut ? oklchToCssString(colour.oklch) : colour.hex;

  const handleOklchChange = (field: keyof OklchColour, value: number) => {
    const newOklch = { ...colour.oklch, [field]: value };
    updateColour(colour.id, newOklch);
  };

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      updateColour(colour.id, hexToOklch(hex));
    }
  };

  const handleFormatChange = (_: unknown, value: string) => {
    if (value === 'oklch' || value === 'hex') {
      setColourFormat(colour.id, value);
      if (value === 'hex') setHexInput(colour.hex);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          boxShadow: 1,
          border: '1px solid',
          borderColor: colour.locked ? 'warning.main' : 'divider',
          bgcolor: cssColour,
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
        title={colour.locked ? `${colour.hex} (locked)` : colour.hex}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 256,
              p: 2,
            },
          },
        }}
      >
        <Stack spacing={2}>
          {/* Format toggle */}
          <ToggleButtonGroup
            value={format}
            onChange={handleFormatChange}
            exclusive
            size="small"
            sx={{
              border: 1,
              borderColor: 'divider',
              '& .MuiToggleButtonGroup-grouped': {
                border: 'none',
                flex: 1,
                py: 0.5,
              },
            }}
          >
            <ToggleButton value="oklch" sx={{ fontSize: '0.7rem' }}>
              OKLCH
            </ToggleButton>
            <ToggleButton value="hex" sx={{ fontSize: '0.7rem' }}>
              HEX
            </ToggleButton>
          </ToggleButtonGroup>

          {format === 'oklch' ? (
            <Stack spacing={2}>
              <OklchSlider
                label="Lightness"
                value={colour.oklch.l}
                onChange={(v) => handleOklchChange('l', v)}
                min={0}
                max={1}
                step={0.005}
              />
              <OklchSlider
                label="Chroma"
                value={colour.oklch.c}
                onChange={(v) => handleOklchChange('c', v)}
                min={0}
                max={0.4}
                step={0.001}
              />
              <OklchSlider
                label="Hue"
                value={colour.oklch.h}
                onChange={(v) => handleOklchChange('h', v)}
                min={0}
                max={360}
                step={1}
              />
            </Stack>
          ) : (
            <TextField
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              spellCheck={false}
              size="small"
              fullWidth
              inputProps={{
                sx: {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          )}

          {/* Preview swatch */}
          <Box
            sx={{
              height: 32,
              width: '100%',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: cssColour,
            }}
          />

          {/* Gamut warning */}
          {!inGamut && (
            <Typography
              variant="caption"
              sx={{ color: 'warning.main', fontSize: '0.7rem' }}
            >
              Outside sRGB gamut — will be clamped on export
            </Typography>
          )}

          {/* Lock toggle */}
          <Button
            variant="outlined"
            size="small"
            startIcon={colour.locked ? <LockIcon /> : <LockOpenIcon />}
            onClick={() => toggleColourLock(colour.id)}
            sx={{
              borderColor: colour.locked ? 'warning.main' : 'divider',
              color: colour.locked ? 'warning.main' : 'text.secondary',
            }}
          >
            {colour.locked ? 'Locked' : 'Lock colour'}
          </Button>

          {/* Remove button */}
          {canRemove && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={onRemove}
            >
              Remove
            </Button>
          )}
        </Stack>
      </Popover>
    </>
  );
}
