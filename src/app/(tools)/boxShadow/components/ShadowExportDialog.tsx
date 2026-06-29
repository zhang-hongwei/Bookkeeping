/**
 * ShadowExportDialog Component
 * Export shadow configuration dialog
 */

'use client';

import React, { useState } from 'react';
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { ShadowLayer, ExportFormat } from '../types';
import { exportShadow } from '../utils';

interface ShadowExportDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Shadow layer list */
  layers: ShadowLayer[];
  /** Close dialog */
  onClose: () => void;
}

/**
 * Export dialog component
 */
const ShadowExportDialog: React.FC<ShadowExportDialogProps> = ({
  open,
  layers,
  onClose,
}) => {
  const [format, setFormat] = useState<ExportFormat>('css');
  const [copySuccess, setCopySuccess] = useState(false);

  const exportCode = exportShadow(layers, format);

  const handleFormatChange = (_: React.MouseEvent<HTMLElement>, newFormat: ExportFormat | null) => {
    if (newFormat !== null) {
      setFormat(newFormat);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setCopySuccess(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setCopySuccess(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Export Shadow</Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Format selection */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select Export Format
              </Typography>
              <ToggleButtonGroup
                value={format}
                exclusive
                onChange={handleFormatChange}
                fullWidth
              >
                <ToggleButton value="css">
                  <Stack alignItems="center">
                    <Typography variant="body2" fontWeight="bold">CSS</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Standard CSS
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="mui">
                  <Stack alignItems="center">
                    <Typography variant="body2" fontWeight="bold">MUI</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Material-UI
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="tailwind">
                  <Stack alignItems="center">
                    <Typography variant="body2" fontWeight="bold">Tailwind</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tailwind CSS
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="json">
                  <Stack alignItems="center">
                    <Typography variant="body2" fontWeight="bold">JSON</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Configuration
                    </Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Code display */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: 'grey.900',
                color: 'common.white',
                position: 'relative',
                maxHeight: 400,
                overflowY: 'auto',
              }}
            >
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'common.white',
                }}
                title="Copy to clipboard"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
              <Typography
                component="pre"
                variant="body2"
                fontFamily="monospace"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontSize: '0.85rem',
                  m: 0,
                }}
              >
                {exportCode}
              </Typography>
            </Paper>

            {/* Usage instructions */}
            <Paper
              variant="outlined"
              sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}
            >
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Usage Instructions
              </Typography>
              {format === 'css' && (
                <Typography variant="caption">
                  Copy the CSS code and paste it into your stylesheet or inline styles.
                </Typography>
              )}
              {format === 'mui' && (
                <Typography variant="caption">
                  Use this in MUI's sx prop or styled components:
                  <br />
                  <code>{'<Box sx={{ boxShadow: \'...\' }} />'}</code>
                </Typography>
              )}
              {format === 'tailwind' && (
                <Typography variant="caption">
                  Add this to your tailwind.config.js file under theme.extend.boxShadow
                </Typography>
              )}
              {format === 'json' && (
                <Typography variant="caption">
                  Import this JSON configuration to restore your shadow layers
                </Typography>
              )}
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button variant="contained" onClick={handleCopy} startIcon={<ContentCopyIcon />}>
            Copy Code
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy success notification */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Code copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(ShadowExportDialog);
