'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  Square as SquareIcon,
  Smartphone as PhoneIcon,
  Tablet as TabletIcon,
  Monitor as DesktopIcon,
  CameraAlt as StoryIcon,
} from '@mui/icons-material';
import { useGradientStore } from '../../store/gradient-store';

const COMMON_PRESETS = [
  { label: '642', icon: <SquareIcon fontSize="inherit" />, w: 642, h: 642, desc: 'Square' },
  { label: '1080', icon: <SquareIcon fontSize="inherit" />, w: 1080, h: 1080, desc: 'Square HD' },
] as const;

const MOBILE_PRESETS = [
  { label: '1080×1920', icon: <PhoneIcon fontSize="inherit" />, w: 1080, h: 1920, desc: 'Phone Wallpaper' },
  { label: '1170×2532', icon: <PhoneIcon fontSize="inherit" />, w: 1170, h: 2532, desc: 'iPhone 14 Pro' },
  { label: '1440×3200', icon: <PhoneIcon fontSize="inherit" />, w: 1440, h: 3200, desc: 'Android HD' },
] as const;

const TABLET_PRESETS = [
  { label: '2048×2732', icon: <TabletIcon fontSize="inherit" />, w: 2048, h: 2732, desc: 'iPad Pro 12.9"' },
  { label: '1640×2360', icon: <TabletIcon fontSize="inherit" />, w: 1640, h: 2360, desc: 'iPad Air' },
] as const;

const DESKTOP_PRESETS = [
  { label: '1920×1080', icon: <DesktopIcon fontSize="inherit" />, w: 1920, h: 1080, desc: 'Full HD' },
  { label: '2560×1440', icon: <DesktopIcon fontSize="inherit" />, w: 2560, h: 1440, desc: '2K/QHD' },
  { label: '3840×2160', icon: <DesktopIcon fontSize="inherit" />, w: 3840, h: 2160, desc: '4K UHD' },
] as const;

const SOCIAL_PRESETS = [
  { label: '1080×1920', icon: <StoryIcon fontSize="inherit" />, w: 1080, h: 1920, desc: 'Instagram Story' },
  { label: '1080×1080', icon: <StoryIcon fontSize="inherit" />, w: 1080, h: 1080, desc: 'Instagram Post' },
  { label: '1200×630', icon: <StoryIcon fontSize="inherit" />, w: 1200, h: 630, desc: 'Facebook/Twitter' },
] as const;

const PRESET_CATEGORIES = [
  { id: 'common', label: 'Common', presets: COMMON_PRESETS },
  { id: 'mobile', label: 'Mobile', presets: MOBILE_PRESETS },
  { id: 'tablet', label: 'Tablet', presets: TABLET_PRESETS },
  { id: 'desktop', label: 'Desktop', presets: DESKTOP_PRESETS },
  { id: 'social', label: 'Social', presets: SOCIAL_PRESETS },
] as const;

function clampDim(v: number) {
  return Math.max(100, Math.min(4096, Math.round(v)));
}

interface DimInputProps {
  value: number;
  onCommit: (v: number) => void;
}

function DimInput({ value, onCommit }: DimInputProps) {
  const [local, setLocal] = useState(String(value));

  // Sync from store when value changes externally (e.g. preset click)
  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  const commit = () => {
    const num = parseInt(local, 10);
    if (!Number.isNaN(num)) {
      const clamped = clampDim(num);
      onCommit(clamped);
      setLocal(String(clamped));
    } else {
      setLocal(String(value));
    }
  };

  return (
    <TextField
      type="text"
      inputMode="numeric"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
      }}
      size="small"
      fullWidth
      sx={{
        '& .MuiInputBase-input': {
          fontSize: '0.875rem',
          py: 1,
        },
      }}
    />
  );
}

export function DimensionInputs() {
  const width = useGradientStore((s) => s.width);
  const height = useGradientStore((s) => s.height);
  const setDimensions = useGradientStore((s) => s.setDimensions);
  const [category, setCategory] = useState('common');

  // Get presets for current category
  const currentPresets = PRESET_CATEGORIES.find((c) => c.id === category)?.presets || COMMON_PRESETS;

  return (
    <Stack spacing={2}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.7rem',
          color: 'text.secondary',
        }}
      >
        Dimensions
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DimInput value={width} onCommit={(w) => setDimensions(w, height)} />
        <CloseIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
        <DimInput value={height} onCommit={(h) => setDimensions(width, h)} />
      </Box>

      {/* Category Toggle */}
      <ToggleButtonGroup
        value={category}
        exclusive
        onChange={(_, newCategory) => newCategory && setCategory(newCategory)}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            fontSize: '0.7rem',
            py: 0.5,
            px: 1,
            textTransform: 'none',
          },
        }}
      >
        {PRESET_CATEGORIES.map((cat) => (
          <ToggleButton key={cat.id} value={cat.id}>
            {cat.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Preset Chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        {currentPresets.map((p) => (
          <Tooltip key={p.label} title={p.desc} arrow>
            <Chip
              label={p.label}
              icon={p.icon}
              size="small"
              onClick={() => setDimensions(p.w, p.h)}
              variant={width === p.w && height === p.h ? 'filled' : 'outlined'}
              sx={{
                fontSize: '0.7rem',
                height: 26,
                '& .MuiChip-icon': {
                  fontSize: '0.875rem',
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Stack>
  );
}
