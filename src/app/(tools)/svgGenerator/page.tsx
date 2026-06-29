'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Replay as RedoIcon,
  Undo as UndoIcon,
  Shuffle as ShuffleIcon,
  RestartAlt as ResetIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Keyboard as KeyboardIcon,
} from '@mui/icons-material';
import { GeneratorPreview } from './components/GeneratorPreview';
import { GeneratorSelector } from './components/GeneratorSelector';
import { ControlPanel } from './components/ControlPanel';
import { ExportDialog } from './components/ExportDialog';
import { useSvgGeneratorStore, useCanUndo, useCanRedo } from './store/svgGeneratorStore';
import type { GeneratorType } from './types';

export default function SvgGeneratorPage() {
  const {
    generatorType,
    config,
    generatedSvg,
    setGeneratorType,
    updateConfig,
    randomize,
    resetToDefaults,
    undo,
    redo,
    exportSvg,
    exportPng,
  } = useSvgGeneratorStore();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const handleGeneratorChange = (type: GeneratorType) => {
    setGeneratorType(type);
  };

  const handleConfigChange = (key: string, value: unknown) => {
    updateConfig({ [key]: value });
  };

  const handleCopySeed = async () => {
    const seed = config.seed?.toString() || '';
    await navigator.clipboard.writeText(seed);
    setSnackbar({ open: true, message: 'Seed copied to clipboard!' });
  };

  const handleExportSvg = async () => {
    const svgString = exportSvg();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svg-${generatorType}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
    setSnackbar({ open: true, message: 'SVG exported successfully!' });
  };

  const handleExportPng = async (scale: number) => {
    const blob = await exportPng(scale);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svg-${generatorType}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
    setSnackbar({ open: true, message: 'PNG exported successfully!' });
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space' || e.code === 'KeyR') {
        e.preventDefault();
        randomize();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === 'KeyZ') ||
        ((e.metaKey || e.ctrlKey) && e.code === 'KeyY')
      ) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      if (e.code === 'KeyE') {
        e.preventDefault();
        setExportDialogOpen(true);
        return;
      }
    },
    [randomize, undo, redo, canUndo, canRedo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
            <Typography variant="h3" component="h1" gutterBottom>
              SVG Generator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create unique design assets with customizable generators
            </Typography>
          </Box>

          <Divider />

          {/* Main editing area - Three column layout */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '240px 1fr 320px',
              },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Left: Generator selector */}
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
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Generator Types
              </Typography>
              <GeneratorSelector
                selectedType={generatorType}
                onSelect={handleGeneratorChange}
              />
            </Paper>

            {/* Center: SVG Preview */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                position: {
                  xs: 'relative',
                  md: 'sticky',
                },
                top: {
                  xs: 0,
                  md: 24,
                },
              }}
            >
              <GeneratorPreview svgString={generatedSvg} canvasSize={config.canvas} />
            </Paper>

            {/* Right: Editing controls */}
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
              {/* Action toolbar */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Tooltip title="Randomize (Space)">
                  <IconButton onClick={randomize} size="small">
                    <ShuffleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Undo (⌘Z)">
                  <span>
                    <IconButton onClick={undo} disabled={!canUndo} size="small">
                      <UndoIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Redo (⌘⇧Z)">
                  <span>
                    <IconButton onClick={redo} disabled={!canRedo} size="small">
                      <RedoIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Reset to defaults">
                  <IconButton onClick={resetToDefaults} size="small">
                    <ResetIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Box sx={{ flex: 1 }} />

                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                        Keyboard Shortcuts
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                        <strong>Space / R</strong> - Randomize
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                        <strong>⌘Z</strong> - Undo
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                        <strong>⌘⇧Z</strong> - Redo
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                        <strong>E</strong> - Export
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <IconButton size="small">
                    <KeyboardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {/* Seed input */}
              <TextField
                size="small"
                label="Seed"
                value={config.seed?.toString() || ''}
                onChange={(e) => {
                  const seed = parseInt(e.target.value, 10);
                  if (!isNaN(seed)) {
                    updateConfig({ seed });
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copy seed">
                        <IconButton size="small" onClick={handleCopySeed} edge="end">
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                  sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
                }}
                sx={{
                  width: '100%',
                  mb: 2,
                }}
              />

              <Divider sx={{ mb: 2 }} />

              {/* Parameter controls */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <ControlPanel
                  generatorType={generatorType}
                  config={config}
                  onChange={handleConfigChange}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Export button */}
              <Button
                variant="contained"
                fullWidth
                onClick={() => setExportDialogOpen(true)}
                startIcon={<DownloadIcon />}
                size="large"
              >
                Export SVG
              </Button>
            </Paper>
          </Box>
        </Stack>
      </Container>

      {/* Export dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
      />

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
