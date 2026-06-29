/**
 * CardPreview Component
 * Preview cards using extracted colors
 */

'use client';

import React from 'react';
import { Card, CardContent, CardActions, Button, Typography, Stack, Box } from '@mui/material';
import type { UIPreviewTheme } from '../../types';

interface CardPreviewProps {
  previewTheme: UIPreviewTheme;
}

export function CardPreview({ previewTheme }: CardPreviewProps) {
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap">
      {/* Simple Card */}
      <Card
        sx={{
          width: 200,
          bgcolor: previewTheme.surface,
          border: `1px solid ${previewTheme.border}`,
          boxShadow: 'none',
        }}
      >
        <CardContent>
          <Typography
            variant="subtitle1"
            sx={{ color: previewTheme.text, fontWeight: 600 }}
          >
            Card Title
          </Typography>
          <Typography variant="body2" sx={{ color: previewTheme.textSecondary, mt: 0.5 }}>
            This is a sample card with extracted theme colors.
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            sx={{ color: previewTheme.primary }}
          >
            Action
          </Button>
        </CardActions>
      </Card>

      {/* Featured Card */}
      <Card
        sx={{
          width: 200,
          bgcolor: previewTheme.primary,
          color: getContrastText(previewTheme.primary),
          boxShadow: 'none',
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Featured Card
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: getContrastText(previewTheme.primary), opacity: 0.8, mt: 0.5 }}
          >
            A highlighted card using primary color.
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            sx={{
              color: getContrastText(previewTheme.primary),
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Learn More
          </Button>
        </CardActions>
      </Card>

      {/* Bordered Card */}
      <Card
        sx={{
          width: 200,
          bgcolor: previewTheme.surface,
          border: `2px solid ${previewTheme.primary}`,
          boxShadow: 'none',
        }}
      >
        <CardContent>
          <Typography
            variant="subtitle1"
            sx={{ color: previewTheme.primary, fontWeight: 600 }}
          >
            Bordered Card
          </Typography>
          <Typography variant="body2" sx={{ color: previewTheme.textSecondary, mt: 0.5 }}>
            Card with primary color border accent.
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            sx={{ color: previewTheme.primary }}
          >
            View
          </Button>
        </CardActions>
      </Card>
    </Stack>
  );
}

/**
 * Get contrast text color
 */
function getContrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
