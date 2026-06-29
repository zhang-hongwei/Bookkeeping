/**
 * Export Dialog Component
 * Dialog for exporting background as PNG/SVG
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Alert,
  Snackbar,
  Stack,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useBackgroundsStore } from '../store/backgroundsStore';
import { getBackgroundGenerator } from '../generators/BaseBackgroundGenerator';
import type { ExportFormat } from '../types';
import { CANVAS_PRESETS } from '../types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [filename, setFilename] = useState('background');
  const [scale, setScale] = useState(1);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const generatorType = useBackgroundsStore((s) => s.generatorType);
  const config = useBackgroundsStore((s) => s.config);
  const exportPng = useBackgroundsStore((s) => s.exportPng);
  const exportSvg = useBackgroundsStore((s) => s.exportSvg);
  const exportCss = useBackgroundsStore((s) => s.exportCss);

  const generator = getBackgroundGenerator(generatorType);

  const supportsSVG = generator?.supportsSVG ?? false;
  const isGradient = generatorType === 'gradient';

  const handleExport = useCallback(async () => {
    try {
      let blob: Blob | null = null;
      let mimeType = 'image/png';
      let extension = 'png';

      switch (format) {
        case 'png': {
          blob = await exportPng(scale);
          mimeType = 'image/png';
          extension = 'png';
          break;
        }
        case 'svg': {
          const svgString = exportSvg();
          if (svgString) {
            blob = new Blob([svgString], { type: 'image/svg+xml' });
            mimeType = 'image/svg+xml';
            extension = 'svg';
          }
          break;
        }
        case 'css': {
          const cssString = exportCss();
          if (cssString) {
            blob = new Blob([cssString], { type: 'text/css' });
            mimeType = 'text/css';
            extension = 'css';
          }
          break;
        }
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSnackbar({ open: true, message: 'Background exported successfully!' });
        onClose();
      } else {
        setSnackbar({ open: true, message: 'Export format not supported for this generator' });
      }
    } catch (error) {
      console.error('Export failed:', error);
      setSnackbar({ open: true, message: 'Failed to export background' });
    }
  }, [format, filename, scale, exportPng, exportSvg, exportCss, onClose]);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      if (format === 'css') {
        const cssString = exportCss();
        if (cssString) {
          await navigator.clipboard.writeText(cssString);
          setSnackbar({ open: true, message: 'CSS copied to clipboard!' });
        }
      } else {
        const blob = await exportPng(scale);
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setSnackbar({ open: true, message: 'Image copied to clipboard!' });
      }
    } catch (error) {
      console.error('Copy failed:', error);
      setSnackbar({ open: true, message: 'Failed to copy to clipboard' });
    }
  }, [format, scale, exportPng, exportCss]);

  const getExportSize = () => {
    const { width, height } = config.canvas;
    if (format === 'png') {
      return `${Math.round(width * scale)} × ${Math.round(height * scale)} px`;
    }
    return `${width} × ${height} px`;
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Export Background</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Format Selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Format
              </Typography>
              <Tabs
                value={format}
                onChange={(_, v) => setFormat(v)}
                variant="fullWidth"
              >
                <Tab label="PNG" value="png" />
                <Tab
                  label="SVG"
                  value="svg"
                  disabled={!supportsSVG}
                />
                <Tab
                  label="CSS"
                  value="css"
                  disabled={!isGradient}
                />
              </Tabs>
            </Box>

            {/* PNG Options */}
            {format === 'png' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Scale: {scale}x
                </Typography>
                <Slider
                  value={scale}
                  onChange={(_, v) => setScale(v as number)}
                  min={0.5}
                  max={4}
                  step={0.5}
                  marks={[
                    { value: 0.5, label: '0.5x' },
                    { value: 1, label: '1x' },
                    { value: 2, label: '2x' },
                    { value: 4, label: '4x' },
                  ]}
                />
                <Typography variant="body2" color="text.secondary">
                  Higher scale = higher resolution
                </Typography>
              </Box>
            )}

            <Divider />

            {/* File Info */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Output Size
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getExportSize()}
              </Typography>
            </Box>

            {/* Filename */}
            <TextField
              label="Filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              fullWidth
              size="small"
            />

            {/* CSS Preview for gradient */}
            {format === 'css' && isGradient && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  CSS Code
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.900',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: 'grey.300',
                    overflow: 'auto',
                  }}
                >
                  {exportCss()}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleCopyToClipboard}
            startIcon={<CopyIcon />}
          >
            Copy
          </Button>
          <Button
            variant="contained"
            onClick={handleExport}
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
