'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Stack,
  Box,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import { ImageOutlined, CodeOutlined, InfoOutlined } from '@mui/icons-material';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExportSvg: () => void;
  onExportPng: (scale: number) => void;
}

/**
 * Export dialog with format and quality options
 */
export function ExportDialog({ open, onClose, onExportSvg, onExportPng }: ExportDialogProps) {
  const theme = useTheme();
  const [format, setFormat] = useState<'svg' | 'png'>('svg');
  const [pngScale, setPngScale] = useState(2);

  const handleExport = () => {
    if (format === 'svg') {
      onExportSvg();
    } else {
      onExportPng(pngScale);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.1rem',
          fontWeight: 600,
          pb: 1,
        }}
      >
        Export Design
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Format selector */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1.5,
                fontWeight: 600,
                color: theme.palette.text.secondary,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Format
            </Typography>
            <ToggleButtonGroup
              value={format}
              exclusive
              onChange={(_, value) => value && setFormat(value)}
              fullWidth
              sx={{
                '& .MuiToggleButtonGroup-grouped': {
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.5),
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                  },
                },
              }}
            >
              <ToggleButton value="svg">
                <Stack direction="row" spacing={1} alignItems="center">
                  <CodeOutlined sx={{ fontSize: 18 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      SVG
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>
                      Vector format
                    </Typography>
                  </Box>
                </Stack>
              </ToggleButton>
              <ToggleButton value="png">
                <Stack direction="row" spacing={1} alignItems="center">
                  <ImageOutlined sx={{ fontSize: 18 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      PNG
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>
                      Raster format
                    </Typography>
                  </Box>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* PNG scale option */}
          {format === 'png' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Scale
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  {pngScale}x
                </Typography>
              </Box>
              <Slider
                value={pngScale}
                onChange={(_, value) => setPngScale(value as number)}
                min={1}
                max={4}
                step={1}
                marks={[
                  { value: 1, label: '1x' },
                  { value: 2, label: '2x' },
                  { value: 3, label: '3x' },
                  { value: 4, label: '4x' },
                ]}
                sx={{
                  mt: 1,
                  '& .MuiSlider-markLabel': {
                    fontSize: '0.7rem',
                  },
                }}
              />
            </Box>
          )}

          <Divider sx={{ opacity: 0.5 }} />

          {/* Info box */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.08),
              border: '1px solid',
              borderColor: alpha(theme.palette.info.main, 0.2),
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <InfoOutlined sx={{ fontSize: 18, color: theme.palette.info.main, mt: 0.25 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, fontSize: '0.85rem' }}>
                  {format === 'svg' ? 'SVG - Vector Format' : 'PNG - Raster Format'}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', fontSize: '0.75rem' }}>
                  {format === 'svg'
                    ? 'Scalable without quality loss. Editable in vector graphics software like Figma or Illustrator.'
                    : 'Optimized for web and social media. Higher scale means higher resolution.'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
        >
          Download {format.toUpperCase()}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
