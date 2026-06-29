/**
 * TextPreview Component
 * Preview text with different sizes and weights for contrast testing
 */

'use client';

import React from 'react';
import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton, Stack } from '@mui/material';
import { ContrastBadge } from './ContrastBadge';
import { useContrastChecker } from '../../hooks';

interface TextPreviewProps {
  foreground: string;
  background: string;
}

type TextSize = 'small' | 'normal' | 'large';

const TEXT_SIZES: Record<TextSize, { fontSize: number; fontWeight: number; label: string }> = {
  small: { fontSize: 14, fontWeight: 400, label: '14px Normal' },
  normal: { fontSize: 16, fontWeight: 400, label: '16px Normal' },
  large: { fontSize: 18.66, fontWeight: 700, label: '18.66px Bold' },
};

const SAMPLE_TEXTS = [
  'The quick brown fox jumps over the lazy dog',
  'Pack my box with five dozen liquor jugs',
  'How vexingly quick daft zebras jump',
];

export function TextPreview({ foreground, background }: TextPreviewProps) {
  const [selectedSize, setSelectedSize] = React.useState<TextSize>('normal');

  const { ratio, level, aaNormal, aaLarge, aaaNormal, aaaLarge } = useContrastChecker({
    foreground,
    background,
  });

  const sizeConfig = TEXT_SIZES[selectedSize];

  // Determine which WCAG criteria apply
  const isLargeText = selectedSize === 'large';
  const passesAA = isLargeText ? aaLarge : aaNormal;
  const passesAAA = isLargeText ? aaaLarge : aaaNormal;

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Text Preview</Typography>
        <ContrastBadge ratio={ratio} level={level} />
      </Stack>

      {/* Size Selector */}
      <ToggleButtonGroup
        value={selectedSize}
        exclusive
        onChange={(_, value) => value && setSelectedSize(value)}
        size="small"
        sx={{ mb: 2 }}
      >
        {Object.entries(TEXT_SIZES).map(([key, config]) => (
          <ToggleButton key={key} value={key}>
            {config.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Preview Box */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1,
          backgroundColor: background,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          sx={{
            color: foreground,
            fontSize: sizeConfig.fontSize,
            fontWeight: sizeConfig.fontWeight,
            lineHeight: 1.5,
          }}
        >
          {SAMPLE_TEXTS[0]}
        </Typography>
      </Box>

      {/* WCAG Status */}
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            AA ({isLargeText ? '3:1' : '4.5:1'})
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: passesAA ? 'success.main' : 'error.main', fontWeight: 600 }}
          >
            {passesAA ? 'Pass ✓' : 'Fail ✗'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            AAA ({isLargeText ? '4.5:1' : '7:1'})
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: passesAAA ? 'success.main' : 'error.main', fontWeight: 600 }}
          >
            {passesAAA ? 'Pass ✓' : 'Fail ✗'}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
