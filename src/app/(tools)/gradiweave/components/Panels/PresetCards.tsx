'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Collapse,
  Chip,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useGradientStore } from '../../store/gradient-store';
import { oklchToHex } from '../../lib/colours/conversion';
import { COLOR_PRESETS, CATEGORY_LABELS, type ColorPreset } from '../../lib/presets/color-presets';

const CATEGORY_COLORS: Record<ColorPreset['category'], string> = {
  warm: '#ff6b35',
  cool: '#4dabf7',
  nature: '#51cf66',
  vibrant: '#cc5de8',
  monochrome: '#868e96',
  sunset: '#ff922b',
  ocean: '#15aabf',
};

// Generate random position for mesh mode
function randomPosition(index: number, total: number): { x: number; y: number } {
  // Distribute colors in a circle pattern with some randomness
  const baseAngle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const randomOffset = (Math.random() - 0.5) * 0.5; // Add randomness
  const angle = baseAngle + randomOffset;
  const radius = 0.25 + Math.random() * 0.15; // Random radius between 0.25-0.4
  const x = 0.5 + Math.cos(angle) * radius;
  const y = 0.5 + Math.sin(angle) * radius;
  return { x: Math.max(0.1, Math.min(0.9, x)), y: Math.max(0.1, Math.min(0.9, y)) };
}

function PresetCard({ preset }: { preset: ColorPreset }) {
  const setColours = useGradientStore((s) => s.setColours);

  const applyPreset = () => {
    // Get current type at click time, not at render time
    const type = useGradientStore.getState().type;
    const isMeshMode = type === 'mesh-static' || type === 'mesh-grid';

    const colours = preset.colors.map((oklch, index) => ({
      id: crypto.randomUUID(),
      oklch,
      hex: oklchToHex(oklch),
      displayFormat: 'oklch' as const,
      locked: false,
      position: isMeshMode ? randomPosition(index, preset.colors.length) : undefined,
    }));
    setColours(colours);
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          borderColor: 'primary.main',
        },
        bgcolor: 'background.paper',
      }}
      onClick={applyPreset}
    >
      {/* Gradient Preview */}
      <Box
        sx={{
          height: 80,
          width: '100%',
          background: `linear-gradient(135deg, ${preset.colors.map(c => oklchToHex(c)).join(', ')})`,
          position: 'relative',
        }}
      >
        {/* Category badge */}
        <Chip
          label={CATEGORY_LABELS[preset.category]}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: CATEGORY_COLORS[preset.category],
            color: 'white',
            fontSize: '0.65rem',
            height: 20,
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Preset Info */}
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="caption" fontWeight="bold" display="block">
          {preset.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mt: 0.5 }}>
          {preset.description}
        </Typography>

        {/* Color Swatches */}
        <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
          {preset.colors.map((color, i) => (
            <Box
              key={i}
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: oklchToHex(color),
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function CategorySection({
  category,
  presets,
  defaultExpanded,
}: {
  category: ColorPreset['category'];
  presets: ColorPreset[];
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);

  return (
    <Box sx={{ mb: 2 }}>
      {/* Category Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          py: 1,
          px: 1,
          borderRadius: 1,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
        ) : (
          <ChevronRightIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
        )}
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: CATEGORY_COLORS[category],
            mr: 1,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.7rem',
            flex: 1,
          }}
        >
          {CATEGORY_LABELS[category]} ({presets.length})
        </Typography>
      </Box>

      {/* Preset Cards Grid */}
      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.5 }}>
          {presets.map((preset) => (
            <Box key={preset.id} sx={{ width: 'calc(50% - 6px)' }}>
              <PresetCard preset={preset} />
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export function PresetCards() {
  // Group presets by category
  const presetsByCategory = COLOR_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<ColorPreset['category'], ColorPreset[]>);

  return (
    <Box>
      {(Object.entries(presetsByCategory) as [ColorPreset['category'], ColorPreset[]][]).map(
        ([category, presets], index) => (
          <CategorySection
            key={category}
            category={category}
            presets={presets}
            defaultExpanded={index === 0}
          />
        ),
      )}
    </Box>
  );
}
