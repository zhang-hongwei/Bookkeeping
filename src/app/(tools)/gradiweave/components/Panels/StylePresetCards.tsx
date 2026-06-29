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
import { STYLE_PRESETS, CATEGORY_LABELS, type StylePreset } from '../../lib/presets/style-presets';

const CATEGORY_COLORS: Record<StylePreset['category'], string> = {
  apple: '#000000',
  stripe: '#635BFF',
  custom: '#868e96',
};

function StylePresetCard({ preset }: { preset: StylePreset }) {
  const applyStylePreset = useGradientStore((s) => s.applyStylePreset);

  const handleApply = () => {
    applyStylePreset(preset.config);
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
      onClick={handleApply}
    >
      {/* Preview Header */}
      <Box
        sx={{
          height: 60,
          width: '100%',
          background: `linear-gradient(135deg, ${preset.config.colors
            .slice(0, 4)
            .map((c) => {
              // Convert OKLCH to hex for preview (simplified)
              const { l, h } = c;
              return `hsl(${h}, ${l * 50}%, ${l * 100}%)`;
            })
            .join(', ')})`,
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
            color: preset.category === 'apple' ? 'white' : 'white',
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
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: '0.65rem', display: 'block', mt: 0.5 }}
        >
          {preset.description}
        </Typography>

        {/* Settings badges */}
        <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
          <Chip
            label={preset.config.type}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              bgcolor: 'action.hover',
            }}
          />
          <Chip
            label={`${Math.round(preset.config.noise * 100)}% noise`}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              bgcolor: 'action.hover',
            }}
          />
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
  category: StylePreset['category'];
  presets: StylePreset[];
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
              <StylePresetCard preset={preset} />
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export function StylePresetCards() {
  // Group presets by category
  const presetsByCategory = STYLE_PRESETS.reduce(
    (acc, preset) => {
      if (!acc[preset.category]) {
        acc[preset.category] = [];
      }
      acc[preset.category].push(preset);
      return acc;
    },
    {} as Record<StylePreset['category'], StylePreset[]>,
  );

  return (
    <Box>
      {(Object.entries(presetsByCategory) as [
        StylePreset['category'],
        StylePreset[],
      ][]).map(([category, presets], index) => (
        <CategorySection
          key={category}
          category={category}
          presets={presets}
          defaultExpanded={index === 0}
        />
      ))}
    </Box>
  );
}
