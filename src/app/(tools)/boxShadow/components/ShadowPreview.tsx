/**
 * ShadowPreview Component
 * Real-time shadow preview
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Snackbar,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import ColorizeIcon from '@mui/icons-material/Colorize';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { buildBoxShadow } from '../utils';
import { ShadowLayer } from '../types';
import { useThemeMode } from '@/hooks/useThemeMode';

interface ShadowPreviewProps {
  /** Shadow layer list */
  layers: ShadowLayer[];
}

/**
 * Shadow preview component
 */
const ShadowPreview: React.FC<ShadowPreviewProps> = ({ layers }) => {
  const { isDark } = useThemeMode();
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Performance: Cache CSS string calculation with useMemo
  const boxShadow = useMemo(() => buildBoxShadow(layers), [layers]);

  /**
   * Copy CSS code to clipboard
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`box-shadow: ${boxShadow};`);
      setCopySuccess(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [boxShadow]);

  const handleCloseSnackbar = useCallback(() => {
    setCopySuccess(false);
  }, []);

  const handleBackgroundChange = useCallback((_: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue !== null) {
      setBackgroundColor(newValue);
    }
  }, []);

  const handleCustomColor = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(e.target.value);
  }, []);

  return (
    <Stack spacing={3}>
      {/* Title */}
      <Typography variant="h6">Preview</Typography>

      {/* Background color selector */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Background Color
        </Typography>
        <ToggleButtonGroup
          value={backgroundColor}
          exclusive
          onChange={handleBackgroundChange}
          size="small"
        >
          <ToggleButton value="#f5f5f5">
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 0.5,
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
              }}
            />
          </ToggleButton>
          <ToggleButton value="#ffffff">
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 0.5,
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
              }}
            />
          </ToggleButton>
          <ToggleButton value="#333333">
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 0.5,
                backgroundColor: '#333333',
                border: '1px solid #ddd',
              }}
            />
          </ToggleButton>
          <ToggleButton value="#1976d2">
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 0.5,
                backgroundColor: '#1976d2',
                border: '1px solid #ddd',
              }}
            />
          </ToggleButton>
          <ToggleButton
            value="custom"
            selected={!['#f5f5f5', '#ffffff', '#333333', '#1976d2'].includes(backgroundColor)}
            onClick={() => {
              // Trigger the hidden color input
              const input = document.getElementById('custom-bg-color-input') as HTMLInputElement;
              input?.click();
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ColorizeIcon sx={{ fontSize: 16 }} />
              {!['#f5f5f5', '#ffffff', '#333333', '#1976d2'].includes(backgroundColor) && (
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 0.5,
                    backgroundColor: backgroundColor,
                    border: '1px solid #ddd',
                  }}
                />
              )}
            </Stack>
            <input
              id="custom-bg-color-input"
              type="color"
              value={backgroundColor}
              onChange={handleCustomColor}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
            />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Preview area */}
      <Box
        sx={{
          width: '100%',
          minHeight: 280,
          backgroundColor: backgroundColor || (isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f5'),
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          transition: 'background-color 0.3s ease',
        }}
      >
        <Box
          sx={{
            width: 160,
            height: 160,
            borderRadius: 2,
            backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : '#ffffff',
            boxShadow: boxShadow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Preview Box
          </Typography>
        </Box>
      </Box>

      {/* CSS code display */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'grey.50',
          position: 'relative',
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              CSS Code
            </Typography>
            <IconButton size="small" onClick={handleCopy} title="Copy to clipboard">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Typography
            variant="body2"
            fontFamily="monospace"
            sx={{
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
              fontSize: '0.75rem',
            }}
          >
            box-shadow: {boxShadow};
          </Typography>
        </Stack>
      </Paper>

      {/* Success notification */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          CSS copied to clipboard!
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default React.memo(ShadowPreview);
