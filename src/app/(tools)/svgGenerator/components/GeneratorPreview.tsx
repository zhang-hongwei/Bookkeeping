'use client';

import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import { ZoomIn, ZoomOut, AspectRatio } from '@mui/icons-material';
import type { CanvasSize } from '../types';

interface GeneratorPreviewProps {
  svgString: string;
  canvasSize: CanvasSize;
}

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

/**
 * Live SVG preview with zoom controls
 */
export function GeneratorPreview({ svgString, canvasSize }: GeneratorPreviewProps) {
  const theme = useTheme();
  const [zoom, setZoom] = React.useState(100);

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handleFitToView = () => {
    setZoom(100);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        {/* Canvas size info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AspectRatio sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          >
            {canvasSize.width} × {canvasSize.height}
          </Typography>
        </Box>

        {/* Zoom controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Zoom out">
            <IconButton
              size="small"
              onClick={handleZoomOut}
              disabled={zoom <= ZOOM_LEVELS[0]}
              sx={{
                padding: 0.5,
                '&.Mui-disabled': { opacity: 0.3 },
              }}
            >
              <ZoomOut fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              width: 100,
              px: 1,
            }}
          >
            <Slider
              value={zoom}
              onChange={(_, value) => setZoom(value as number)}
              min={25}
              max={200}
              step={25}
              size="small"
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
              sx={{
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
                '& .MuiSlider-track': {
                  height: 2,
                },
                '& .MuiSlider-rail': {
                  height: 2,
                  opacity: 0.2,
                },
                '& .MuiSlider-valueLabel': {
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Tooltip title="Zoom in">
            <IconButton
              size="small"
              onClick={handleZoomIn}
              disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              sx={{
                padding: 0.5,
                '&.Mui-disabled': { opacity: 0.3 },
              }}
            >
              <ZoomIn fontSize="small" />
            </IconButton>
          </Tooltip>

          <Typography
            variant="caption"
            sx={{
              minWidth: 40,
              textAlign: 'center',
              fontWeight: 600,
              color: theme.palette.primary.main,
              fontSize: '0.75rem',
            }}
          >
            {zoom}%
          </Typography>

          <Tooltip title="Fit to view">
            <IconButton
              size="small"
              onClick={handleFitToView}
              sx={{
                padding: 0.5,
                ml: 0.5,
              }}
            >
              <AspectRatio fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Preview container */}
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          overflow: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.grey[900], 0.5)
              : alpha(theme.palette.grey[100], 0.5),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          // Checkerboard pattern for transparency
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(45deg, ${alpha('#fff', 0.02)} 25%, transparent 25%),
                 linear-gradient(-45deg, ${alpha('#fff', 0.02)} 25%, transparent 25%),
                 linear-gradient(45deg, transparent 75%, ${alpha('#fff', 0.02)} 75%),
                 linear-gradient(-45deg, transparent 75%, ${alpha('#fff', 0.02)} 75%)`
              : `linear-gradient(45deg, ${alpha('#000', 0.02)} 25%, transparent 25%),
                 linear-gradient(-45deg, ${alpha('#000', 0.02)} 25%, transparent 25%),
                 linear-gradient(45deg, transparent 75%, ${alpha('#000', 0.02)} 75%),
                 linear-gradient(-45deg, transparent 75%, ${alpha('#000', 0.02)} 75%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <Box
          sx={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.15)',
            backgroundColor: 'white',
            borderRadius: 1,
            transition: 'transform 0.2s ease',
          }}
          dangerouslySetInnerHTML={{ __html: svgString }}
        />
      </Box>
    </Box>
  );
}
