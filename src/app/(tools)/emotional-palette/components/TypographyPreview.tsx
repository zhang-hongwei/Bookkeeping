'use client';

import { Box, Typography, Paper } from '@mui/material';

import type { TypographyProfile } from '@/types/emotional-palette';

interface TypographyPreviewProps {
  typography: TypographyProfile;
  accentColor: string;
}

export function TypographyPreview({ typography, accentColor }: TypographyPreviewProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        Typography
      </Typography>

      {/* Sample Heading */}
      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: typography.headingFont,
            fontWeight: typography.headingWeight,
            letterSpacing: `${typography.letterSpacing}em`,
            lineHeight: typography.lineHeight,
            color: accentColor,
          }}
        >
          Heading Sample
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: typography.bodyFont,
            fontWeight: typography.bodyWeight,
            lineHeight: typography.lineHeight,
            letterSpacing: `${typography.letterSpacing}em`,
            color: 'text.secondary',
          }}
        >
          Body text sample with the recommended line height, letter spacing, and font pairing. This is how your content will look and feel.
        </Typography>
      </Box>

      {/* Scale Demo */}
      <Box sx={{ mb: 1.5 }}>
        {[1, 2, 3, 4].map((level) => {
          const fontSize = Math.round(14 * typography.scaleRatio ** (4 - level));
          return (
            <Typography
              key={level}
              sx={{
                fontFamily: typography.headingFont,
                fontWeight: typography.headingWeight,
                fontSize,
                lineHeight: typography.lineHeight,
                color: 'text.primary',
              }}
            >
              Level {level} — {fontSize}px
            </Typography>
          );
        })}
      </Box>

      {/* Typography Parameters */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <ParamRow label="Heading" value={typography.headingFont} />
        <ParamRow label="Body" value={typography.bodyFont} />
        <ParamRow label="Weight" value={`${typography.headingWeight} / ${typography.bodyWeight}`} />
        <ParamRow label="Tracking" value={`${typography.letterSpacing}em`} />
        <ParamRow label="Leading" value={`${typography.lineHeight}`} />
        <ParamRow label="Scale" value={`${typography.scaleRatio}`} />
      </Box>
    </Paper>
  );
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontFamily: 'monospace', fontSize: 10 }}
      >
        {value}
      </Typography>
    </Box>
  );
}
