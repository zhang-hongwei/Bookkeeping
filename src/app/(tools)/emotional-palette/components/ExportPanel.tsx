'use client';

import { useCallback } from 'react';
import { Box, Typography, Paper, Button, Stack, Divider } from '@mui/material';
import { Download as DownloadIcon, ContentCopy as CopyIcon } from '@mui/icons-material';

import type { EmotionalPalette } from '@/types/emotional-palette';

interface ExportPanelProps {
  palette: EmotionalPalette;
}

export function ExportPanel({ palette }: ExportPanelProps) {
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const generateCSSVars = useCallback(() => {
    const lines = [`/* Emotional Palette: ${palette.mood} (${palette.moodEn}) */`];
    lines.push('/* Colors */');
    palette.colors.forEach((c, i) => {
      const role = i === 0 ? 'primary' : i === 1 ? 'secondary' : i === 2 ? 'bg' : i === 3 ? 'text' : `accent-${i - 3}`;
      lines.push(`--emotion-${role}: ${c.hex};`);
    });

    if (palette.gradients[0]) {
      lines.push('', '/* Gradients */');
      lines.push(`--emotion-gradient: ${palette.gradients[0].css};`);
    }

    lines.push('', '/* Motion */');
    lines.push(`--emotion-duration-fast: ${palette.motion.duration.fast}ms;`);
    lines.push(`--emotion-duration-normal: ${palette.motion.duration.normal}ms;`);
    lines.push(`--emotion-duration-slow: ${palette.motion.duration.slow}ms;`);
    lines.push(`--emotion-easing: ${palette.motion.easing};`);

    lines.push('', '/* Typography */');
    lines.push(`--emotion-font-heading: '${palette.typography.headingFont}';`);
    lines.push(`--emotion-font-body: '${palette.typography.bodyFont}';`);
    lines.push(`--emotion-weight-heading: ${palette.typography.headingWeight};`);
    lines.push(`--emotion-weight-body: ${palette.typography.bodyWeight};`);
    lines.push(`--emotion-letter-spacing: ${palette.typography.letterSpacing}em;`);
    lines.push(`--emotion-line-height: ${palette.typography.lineHeight};`);

    return lines.join('\n');
  }, [palette]);

  const generateTailwindConfig = useCallback(() => {
    const colors: Record<string, string> = {};
    palette.colors.forEach((c, i) => {
      const role = i === 0 ? 'primary' : i === 1 ? 'secondary' : i === 2 ? 'background' : i === 3 ? 'foreground' : `accent${i - 3}`;
      colors[role] = c.hex;
    });

    return JSON.stringify(
      {
        theme: {
          extend: {
            colors: { emotion: colors },
            fontFamily: {
              heading: [`'${palette.typography.headingFont}'`],
              body: [`'${palette.typography.bodyFont}'`],
            },
            transitionDuration: {
              'emotion-fast': `${palette.motion.duration.fast}ms`,
              'emotion-normal': `${palette.motion.duration.normal}ms`,
              'emotion-slow': `${palette.motion.duration.slow}ms`,
            },
          },
        },
      },
      null,
      2
    );
  }, [palette]);

  const generateJSON = useCallback(() => {
    return JSON.stringify(palette, null, 2);
  }, [palette]);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        Export
      </Typography>

      <Stack spacing={1}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<CopyIcon sx={{ fontSize: 16 }} />}
          onClick={() => copyToClipboard(generateCSSVars())}
        >
          CSS Variables
        </Button>

        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<CopyIcon sx={{ fontSize: 16 }} />}
          onClick={() => copyToClipboard(generateTailwindConfig())}
        >
          Tailwind Config
        </Button>

        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<CopyIcon sx={{ fontSize: 16 }} />}
          onClick={() => copyToClipboard(generateJSON())}
        >
          JSON
        </Button>

        <Divider sx={{ my: 0.5 }} />

        <Button
          variant="contained"
          size="small"
          fullWidth
          startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
          onClick={() => {
            const blob = new Blob([generateJSON()], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `emotional-palette-${palette.moodEn.toLowerCase().replace(/\s+/g, '-')}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download JSON
        </Button>
      </Stack>
    </Paper>
  );
}
