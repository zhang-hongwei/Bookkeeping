/**
 * Gradient Editor Page
 * Visual CSS gradient editor with real-time preview
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import { useGradientState } from './hooks/useGradientState';
import { buildGradientCSS } from './utils';
import GradientControls from './components/GradientControls';
import GradientPreview from './components/GradientPreview';
import GradientExportDialog from './components/GradientExportDialog';

/**
 * Gradient Editor main page
 */
export default function GradientEditorPage() {
  const {
    config,
    selectedStopId,
    setGradientType,
    setAngle,
    setCenter,
    setRadialShape,
    setRadialSize,
    addStop,
    removeStop,
    updateStop,
    moveStop,
    duplicateStop,
    selectStop,
    applyPreset,
    resetGradient,
  } = useGradientState();

  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  /**
   * Generate CSS for preview
   */
  const gradientCSS = useMemo(() => buildGradientCSS(config), [config]);

  /**
   * Open export dialog
   */
  const handleOpenExport = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  /**
   * Close export dialog
   */
  const handleCloseExport = useCallback(() => {
    setExportDialogOpen(false);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Page header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Gradient Editor
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and customize CSS gradients with real-time preview
            </Typography>
          </Box>

          <Divider />

          {/* Main editing area */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '400px 1fr',
              },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Left: Control panel */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: {
                  xs: 'auto',
                  md: 'calc(100vh - 200px)',
                },
                display: 'flex',
                flexDirection: 'column',
                position: {
                  xs: 'relative',
                  md: 'sticky',
                },
                top: {
                  xs: 0,
                  md: 24,
                },
                overflow: 'auto',
              }}
            >
              <GradientControls
                config={config}
                selectedStopId={selectedStopId}
                onSetGradientType={setGradientType}
                onSetAngle={setAngle}
                onSetCenter={setCenter}
                onSetRadialShape={setRadialShape}
                onSetRadialSize={setRadialSize}
                onAddStop={addStop}
                onRemoveStop={removeStop}
                onUpdateStop={updateStop}
                onMoveStop={moveStop}
                onDuplicateStop={duplicateStop}
                onSelectStop={selectStop}
                onApplyPreset={applyPreset}
                onResetGradient={resetGradient}
                onOpenExport={handleOpenExport}
                gradientCSS={gradientCSS}
              />
            </Paper>

            {/* Right: Preview */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <GradientPreview
                gradientCSS={gradientCSS}
                angle={config.angle}
                type={config.type}
                onAngleChange={config.type !== 'radial' ? setAngle : undefined}
              />
            </Paper>
          </Box>

          {/* Bottom tips */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: 'info.light',
              color: 'info.contrastText',
            }}
          >
            <Typography variant="body2" gutterBottom fontWeight="bold">
              Tips:
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="caption">
                Click on the gradient bar to add new color stops
              </Typography>
              <Typography component="li" variant="caption">
                Drag color stops to adjust their position
              </Typography>
              <Typography component="li" variant="caption">
                Use presets for quick start, then customize
              </Typography>
              <Typography component="li" variant="caption">
                Export to CSS, MUI, Tailwind, or PNG
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Export dialog */}
      <GradientExportDialog
        open={exportDialogOpen}
        config={config}
        onClose={handleCloseExport}
      />
    </Box>
  );
}
