/**
 * Cool Backgrounds Page
 * 3-column layout: Type selector | Preview | Property editor
 */

'use client';

import React, { useRef, useCallback, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Wallpaper as WallpaperIcon,
} from '@mui/icons-material';
import { GeneratorTabs } from './components/GeneratorTabs';
import { ControlPanel } from './components/ControlPanel';
import { CanvasPreview } from './components/CanvasPreview';
import { PresetSelector } from './components/PresetSelector';
import { ExportDialog } from './components/ExportDialog';
import { useBackgroundsStore, useCanUndo, useCanRedo } from './store/backgroundsStore';
import { CANVAS_PRESETS } from './types';

// Import all generators to trigger registration
import './generators';

export default function BackgroundsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const randomize = useBackgroundsStore((s) => s.randomize);
  const undo = useBackgroundsStore((s) => s.undo);
  const redo = useBackgroundsStore((s) => s.redo);
  const updateCanvas = useBackgroundsStore((s) => s.updateCanvas);
  const config = useBackgroundsStore((s) => s.config);

  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const handleRandomize = useCallback(() => {
    randomize();
  }, [randomize]);

  const handleExport = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  const handleCopyToClipboard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setSnackbar({ open: true, message: 'Image copied to clipboard!' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to copy image' });
    }
  }, []);

  const handleCanvasSizeChange = useCallback(
    (event: { target: { value: string } }) => {
      const preset = CANVAS_PRESETS.find((p) => p.label === event.target.value);
      if (preset) {
        updateCanvas(preset);
      }
    },
    [updateCanvas]
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WallpaperIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h3" component="h1">
                Cool Backgrounds
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Create beautiful backgrounds with trianglify, particles, topography, photos, and
              gradients
            </Typography>
          </Box>

          <Divider />

          {/* 3-Column Layout */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '220px 1fr 320px',
              },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Left: Background Type Selector */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                position: { lg: 'sticky' },
                top: 24,
              }}
            >
              <GeneratorTabs />

              <Divider sx={{ my: 2 }} />

              {/* Presets */}
              <PresetSelector />
            </Paper>

            {/* Center: Preview */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper elevation={2} sx={{ p: 3, minHeight: 500, width: '100%', maxWidth: 720 }}>
              <CanvasPreview ref={canvasRef} />
              </Paper>
            </Box>

            {/* Right: Property Editor */}
            <Paper
              elevation={2}
              sx={{
                p: 2.5,
                position: { lg: 'sticky' },
                top: 24,
                maxHeight: 'calc(100vh - 100px)',
                overflow: 'auto',
              }}
            >
              <Stack spacing={3}>
                {/* Canvas Size */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Canvas Size
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Size</InputLabel>
                    <Select
                      value={config.canvas.label}
                      label="Size"
                      onChange={handleCanvasSizeChange}
                    >
                      {CANVAS_PRESETS.map((preset) => (
                        <MenuItem key={preset.label} value={preset.label}>
                          {preset.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Divider />

                {/* Dynamic Controls + Color Picker */}
                <ControlPanel />

                <Divider />

                {/* Action Buttons */}
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Tooltip title="Undo">
                    <span>
                      <IconButton onClick={undo} disabled={!canUndo} size="small">
                        <UndoIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Redo">
                    <span>
                      <IconButton onClick={redo} disabled={!canRedo} size="small">
                        <RedoIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Randomize">
                    <IconButton onClick={handleRandomize} size="small">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleExport}
                  startIcon={<DownloadIcon />}
                  size="large"
                >
                  Export Background
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>

      {/* Export Dialog */}
      <ExportDialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity="success">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
