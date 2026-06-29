'use client';

import { Paper, Box, Typography, Select, MenuItem, OutlinedInput, Stack, IconButton } from '@mui/material';
import { GradientCanvas } from '../GradientCanvas';
import { useGradientStore } from '../../store/gradient-store';
import { PREVIEW_DEVICES } from '../../types/gradient';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export function PreviewPanel() {
  const previewDevice = useGradientStore((s) => s.previewDevice);
  const previewZoom = useGradientStore((s) => s.previewZoom);
  const setPreviewDevice = useGradientStore((s) => s.setPreviewDevice);
  const setPreviewZoom = useGradientStore((s) => s.setPreviewZoom);
  const width = useGradientStore((s) => s.width);
  const height = useGradientStore((s) => s.height);

  // Get device config
  const deviceConfig = PREVIEW_DEVICES.find((d) => d.id === previewDevice) || PREVIEW_DEVICES[0];

  // Calculate zoom percentage text
  const zoomPercent = Math.round(previewZoom * 100);

  return (
    <Paper
      elevation={2}
      sx={{
        height: { lg: 'calc(100vh - 140px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="subtitle2" fontWeight="bold" textTransform="uppercase" fontSize="0.75rem" letterSpacing="0.1em">
            Preview
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Device Selector */}
            <Select
              value={previewDevice}
              onChange={(e) => setPreviewDevice(e.target.value as any)}
              input={
                <OutlinedInput
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    minWidth: 100,
                    '& .MuiSelect-select': {
                      py: 0.75,
                    },
                  }}
                />
              }
            >
              {PREVIEW_DEVICES.map((device) => (
                <MenuItem
                  key={device.id}
                  value={device.id}
                  sx={{
                    fontSize: '0.75rem',
                    py: 0.75,
                  }}
                >
                  {device.label}
                </MenuItem>
              ))}
            </Select>

            {/* Zoom Controls */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                size="small"
                onClick={() => setPreviewZoom(Math.max(0.1, previewZoom - 0.1))}
                disabled={previewZoom <= 0.1}
                sx={{ width: 28, height: 28 }}
              >
                <ZoomOutIcon fontSize="inherit" />
              </IconButton>
              <Box
                onClick={() => setPreviewZoom(1)}
                sx={{
                  minWidth: 48,
                  fontSize: '0.7rem',
                  py: 0.5,
                  px: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {zoomPercent}%
              </Box>
              <IconButton
                size="small"
                onClick={() => setPreviewZoom(Math.min(3, previewZoom + 0.1))}
                disabled={previewZoom >= 3}
                sx={{ width: 28, height: 28 }}
              >
                <ZoomInIcon fontSize="inherit" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setPreviewZoom(1)}
                title="Reset Zoom"
                sx={{ width: 28, height: 28 }}
              >
                <RestartAltIcon fontSize="inherit" />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          overflow: 'auto',
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            transform: `scale(${previewZoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Device Frame */}
          <Box
            sx={{
              position: 'relative',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: previewDevice === 'actual' ? 0 : 2,
              overflow: 'hidden',
              bgcolor: '#000',
              boxShadow: previewDevice === 'actual'
                ? 'none'
                : '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Apply device frame constraints using CSS */}
            {previewDevice === 'actual' ? (
              // Actual size - show full canvas
              <GradientCanvas />
            ) : (
              // Device frame - canvas fills the entire frame
              <Box
                sx={{
                  width: deviceConfig.width,
                  height: deviceConfig.height,
                  display: 'flex',
                  alignItems: 'stretch',
                  '& > div': {
                    width: '100%',
                    height: '100%',
                    display: 'block',
                  },
                  '& canvas': {
                    width: '100% !important',
                    height: '100% !important',
                    maxWidth: 'none !important',
                    maxHeight: 'none !important',
                    objectFit: 'cover',
                    display: 'block',
                  },
                }}
              >
                <GradientCanvas />
              </Box>
            )}
          </Box>
        </Box>

        {/* Size indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'text.secondary',
            fontSize: '0.7rem',
            pointerEvents: 'none',
          }}
        >
          {width} × {height}
          {previewDevice !== 'actual' && (
            <Box component="span" sx={{ ml: 0.5, opacity: 0.7 }}>
              → {deviceConfig.width}×{deviceConfig.height}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
