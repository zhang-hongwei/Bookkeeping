/**
 * Gradient Text Editor Page
 * Three-column layout: controls | preview | presets
 */

'use client';

import React from 'react';
import { Box, Container, Typography, IconButton, Tooltip, Paper } from '@mui/material';
import { TextFieldsOutlined, RestartAlt } from '@mui/icons-material';
import { GradientTextControls } from './components/GradientTextControls';
import { GradientTextPreview } from './components/GradientTextPreview';
import { GradientTextPresets } from './components/GradientTextPresets';
import { useGradientTextStore } from '@/store/gradient-text';

export default function GradientTextEditorPage() {
  const reset = useGradientTextStore((s) => s.reset);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 3 }}>
      <Container maxWidth="xl">
        {/* Page header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <TextFieldsOutlined sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1">Gradient Text</Typography>
            <Typography variant="body2" color="text.secondary">
              Create and customize gradient text effects with real-time preview
            </Typography>
          </Box>
          <Tooltip title="Reset to defaults">
            <IconButton onClick={reset} color="default">
              <RestartAlt />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Three-column layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '300px 1fr 280px' }, gap: 2.5, alignItems: 'start' }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, maxHeight: 'calc(100vh - 140px)', overflow: 'auto' }}>
            <GradientTextControls />
          </Paper>
          <GradientTextPreview />
          <Box sx={{ maxHeight: 'calc(100vh - 140px)', overflow: 'auto' }}>
            <GradientTextPresets />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
