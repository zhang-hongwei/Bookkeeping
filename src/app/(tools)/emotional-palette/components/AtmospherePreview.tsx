'use client';

import { Box, Typography, Skeleton } from '@mui/material';

import type { EmotionalPalette } from '@/types/emotional-palette';

interface AtmospherePreviewProps {
  palette: EmotionalPalette | null;
  gradientIndex: number;
  isLoading: boolean;
}

export function AtmospherePreview({ palette, gradientIndex, isLoading }: AtmospherePreviewProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rounded" width={48} height={48} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!palette) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          borderRadius: 3,
          border: '2px dashed',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
          Enter a mood keyword and click generate
          <br />
          <Typography component="span" variant="body2" sx={{ opacity: 0.6 }}>
            AI will create a complete emotional atmosphere
          </Typography>
        </Typography>
      </Box>
    );
  }

  const gradient = palette.gradients[gradientIndex] || palette.gradients[0];
  const primaryColor = palette.colors[0]?.hex || '#667eea';
  const textColor = palette.colors[3]?.hex || '#ffffff';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Main Atmosphere Preview */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          minHeight: 320,
          background: gradient?.css || primaryColor,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Mood Label */}
        <Box>
          <Typography
            variant="overline"
            sx={{
              color: textColor,
              opacity: 0.7,
              letterSpacing: 2,
              fontWeight: 500,
            }}
          >
            {palette.moodEn}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: textColor,
              fontWeight: palette.typography.headingWeight,
              fontFamily: palette.typography.headingFont,
              letterSpacing: `${palette.typography.letterSpacing}em`,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {palette.mood}
          </Typography>
        </Box>

        {/* Description */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: textColor,
              opacity: 0.85,
              lineHeight: palette.typography.lineHeight,
              fontFamily: palette.typography.bodyFont,
              maxWidth: 400,
              textShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}
          >
            {palette.description}
          </Typography>
        </Box>

        {/* Gradient name badge */}
        {gradient && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.4)',
              color: '#fff',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: 11,
              backdropFilter: 'blur(4px)',
            }}
          >
            {gradient.name}
          </Box>
        )}
      </Box>

      {/* Color Swatches Bar */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {palette.colors.map((color, i) => (
          <Box
            key={`${color.hex}-${i}`}
            onClick={() => navigator.clipboard.writeText(color.hex)}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: color.hex,
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              position: 'relative',
              '&:hover': {
                transform: 'scale(1.1)',
                '& .color-label': { opacity: 1 },
              },
            }}
          >
            <Box
              className="color-label"
              sx={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 9,
                color: 'text.secondary',
                opacity: 0,
                transition: 'opacity 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {color.name}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Tags */}
      {palette.tags.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {palette.tags.map((tag) => (
            <Box
              key={tag}
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 0.5,
                bgcolor: 'action.hover',
                fontSize: 11,
                color: 'text.secondary',
              }}
            >
              {tag}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
