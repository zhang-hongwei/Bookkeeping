/**
 * GradientExportDialog Component
 * Export dialog with multiple format support
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Typography,
  Stack,
  IconButton,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { GradientConfig, GradientExportFormat } from '../types';
import { buildGradientCSS, exportToPNG, exportGradient } from '../utils';

interface GradientExportDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Current gradient configuration */
  config: GradientConfig;
  /** Callback when dialog closes */
  onClose: () => void;
}

/**
 * Gradient export dialog with multiple format support
 */
const GradientExportDialog: React.FC<GradientExportDialogProps> = ({
  open,
  config,
  onClose,
}) => {
  const [format, setFormat] = useState<GradientExportFormat>('css');
  const [copySuccess, setCopySuccess] = useState(false);

  /**
   * Generate CSS string
   */
  const gradientCSS = useMemo(() => buildGradientCSS(config), [config]);

  /**
   * Generate export code based on format
   */
  const exportCode = useMemo(() => {
    switch (format) {
      case 'css':
        return `/* Gradient CSS */
.gradient {
  background: ${gradientCSS};
}`;

      case 'mui':
        return `/* MUI sx prop */
<Box
  sx={{
    background: '${gradientCSS}',
  }}
/>

/* Or as theme token */
const theme = createTheme({
  palette: {
    gradient: {
      main: '${gradientCSS}',
    },
  },
});`;

      case 'tailwind':
        return `<!-- Option 1: Arbitrary value -->
<div className="bg-[${gradientCSS}]"></div>

<!-- Option 2: Tailwind config -->
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': '${gradientCSS}',
      },
    },
  },
};

<!-- Then use -->
<div className="bg-custom-gradient"></div>`;

      case 'json':
        return JSON.stringify(config, null, 2);

      case 'png':
        return '[Click "Download PNG" to export as image]';

      default:
        return gradientCSS;
    }
  }, [format, gradientCSS, config]);

  /**
   * Handle format change
   */
  const handleFormatChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newFormat: GradientExportFormat | null) => {
      if (newFormat !== null) {
        setFormat(newFormat);
      }
    },
    []
  );

  /**
   * Copy to clipboard
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setCopySuccess(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [exportCode]);

  /**
   * Download as PNG
   */
  const handleDownloadPNG = useCallback(() => {
    exportToPNG(config, 'gradient.png');
  }, [config]);

  /**
   * Close snackbar
   */
  const handleCloseSnackbar = useCallback(() => {
    setCopySuccess(false);
  }, []);

  /**
   * Format options
   */
  const formatOptions: Array<{ value: GradientExportFormat; label: string }> = [
    { value: 'css', label: 'CSS' },
    { value: 'mui', label: 'MUI' },
    { value: 'tailwind', label: 'Tailwind' },
    { value: 'json', label: 'JSON' },
    { value: 'png', label: 'PNG' },
  ];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Export Gradient</Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Format selector */}
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Export Format
              </Typography>
              <ToggleButtonGroup
                value={format}
                exclusive
                onChange={handleFormatChange}
                fullWidth
              >
                {formatOptions.map((option) => (
                  <ToggleButton key={option.value} value={option.value}>
                    <Typography variant="body2" fontWeight="bold">
                      {option.label}
                    </Typography>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Preview */}
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Preview
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 80,
                  borderRadius: 2,
                  background: gradientCSS,
                  boxShadow: (theme) =>
                    `0 2px 10px ${theme.vars.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
                }}
              />
            </Box>

            {/* Code output */}
            {format !== 'png' && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: 'grey.900',
                  position: 'relative',
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                  <IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.400' }}>
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography
                  component="pre"
                  variant="body2"
                  fontFamily="monospace"
                  sx={{
                    color: 'grey.300',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '0.75rem',
                    margin: 0,
                  }}
                >
                  {exportCode}
                </Typography>
              </Paper>
            )}

            {/* PNG info */}
            {format === 'png' && (
              <Paper
                variant="outlined"
                sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Export gradient as 1920×1080 PNG image
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadPNG}
                  sx={{ mt: 1 }}
                >
                  Download PNG
                </Button>
              </Paper>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Close</Button>
          {format !== 'png' && (
            <Button
              variant="contained"
              startIcon={<CopyIcon />}
              onClick={handleCopy}
            >
              Copy to Clipboard
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Success notification */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          icon={<CheckIcon />}
          sx={{ width: '100%' }}
        >
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(GradientExportDialog);
