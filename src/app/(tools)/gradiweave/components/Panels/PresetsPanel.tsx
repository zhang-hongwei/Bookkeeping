'use client';

import { Paper, Box, Stack, Typography } from '@mui/material';
import { PresetCards } from './PresetCards';
import { StylePresetCards } from './StylePresetCards';
import { ExportButton } from '../ExportButton';
import { ImageUploader } from '../ImageUploader';

export function PresetsPanel() {
  return (
    <Paper
      elevation={2}
      sx={{
        height: { lg: 'calc(100vh - 140px)' },
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          textTransform="uppercase"
          fontSize="0.75rem"
          letterSpacing="0.1em"
        >
          Presets & Export
        </Typography>
      </Box>
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Style Presets */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.7rem',
                mb: 1.5,
                display: 'block',
              }}
            >
              Style Presets
            </Typography>
            <StylePresetCards />
          </Box>

          {/* Preset Cards */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.7rem',
                mb: 1.5,
                display: 'block',
              }}
            >
              Color Presets
            </Typography>
            <PresetCards />
          </Box>

          {/* Export */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.7rem',
                mb: 1.5,
                display: 'block',
              }}
            >
              Export
            </Typography>
            <ExportButton />
          </Box>

          {/* Image Upload */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.7rem',
                mb: 1.5,
                display: 'block',
              }}
            >
              Import from Image
            </Typography>
            <ImageUploader />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
