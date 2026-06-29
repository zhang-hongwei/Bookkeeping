/**
 * GradientPreview Component
 * Real-time gradient preview with CSS output and angle rotation control.
 *
 * Performance: during drag-to-rotate, the preview background is updated via
 * direct DOM manipulation to bypass React's render cycle.
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  RotateLeft as RotateIcon,
} from '@mui/icons-material';
import type { GradientType } from '../types';
import { buildGradientCSS, exportToPNG } from '../utils';
import type { GradientConfig } from '../types';

interface GradientPreviewProps {
  /** Pre-built gradient CSS string */
  gradientCSS: string;
  /** Current angle in degrees */
  angle: number;
  /** Gradient type */
  type: GradientType;
  /** Callback to change angle (optional — enables rotation control) */
  onAngleChange?: (angle: number) => void;
}

type BackgroundType = 'light' | 'dark' | 'checker';

const backgrounds: Record<BackgroundType, string> = {
  light: '#ffffff',
  dark: '#1a1a2e',
  checker: `
    linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
    linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
  `,
};

/**
 * Gradient preview component with CSS output
 */
const GradientPreview: React.FC<GradientPreviewProps> = ({
  gradientCSS,
  angle,
  type,
  onAngleChange,
}) => {
  const [background, setBackground] = useState<BackgroundType>('light');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const isRotatingRef = useRef(false);
  const angleRef = useRef(angle);
  angleRef.current = angle;

  const canRotate = type !== 'radial' && !!onAngleChange;

  // ── Sync preview background from React (skipped during drag) ──
  useLayoutEffect(() => {
    if (!isRotatingRef.current && previewRef.current) {
      previewRef.current.style.background = gradientCSS;
    }
  }, [gradientCSS]);

  /**
   * Full CSS property
   */
  const fullCSS = useMemo(() => `background: ${gradientCSS};`, [gradientCSS]);

  // ── Angle calculation ────────────────────────────────────────

  const calculateAngleFromPointer = useCallback(
    (clientX: number, clientY: number): number => {
      if (!previewRef.current) return angleRef.current;

      const rect = previewRef.current.getBoundingClientRect();
      const deltaX = clientX - (rect.left + rect.width / 2);
      const deltaY = clientY - (rect.top + rect.height / 2);

      let angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
      if (angle < 0) angle += 360;

      return Math.round(angle);
    },
    [],
  );

  // ── Pointer handlers (drag-to-rotate) ────────────────────────

  const handleRotateStart = useCallback(
    (e: React.PointerEvent) => {
      if (!canRotate) return;
      e.preventDefault();
      setIsRotating(true);
      isRotatingRef.current = true;

      const newAngle = calculateAngleFromPointer(e.clientX, e.clientY);
      onAngleChange(newAngle);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [canRotate, calculateAngleFromPointer, onAngleChange],
  );

  const handleRotateMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isRotatingRef.current || !onAngleChange) return;
      const newAngle = calculateAngleFromPointer(e.clientX, e.clientY);
      // Direct DOM — instant visual update, bypass React
      // The parent's gradientCSS will catch up via useLayoutEffect after drag ends
      if (previewRef.current) {
        previewRef.current.style.background =
          `linear-gradient(${newAngle}deg${gradientCSS.slice(gradientCSS.indexOf(','))}`;
      }
      onAngleChange(newAngle);
    },
    [onAngleChange, calculateAngleFromPointer, gradientCSS],
  );

  const handleRotateEnd = useCallback((e: React.PointerEvent) => {
    setIsRotating(false);
    isRotatingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // ── Other handlers ───────────────────────────────────────────

  const handleBackgroundChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newValue: BackgroundType | null) => {
      if (newValue !== null) setBackground(newValue);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullCSS);
      setCopySuccess(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [fullCSS]);

  const handleExportPNG = useCallback(() => {
    // Build a minimal config for PNG export
    const config: GradientConfig = {
      type,
      angle,
      centerX: 50,
      centerY: 50,
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      stops: [],
    };
    exportToPNG(config, 'gradient.png');
  }, [type, angle]);

  const handleCloseSnackbar = useCallback(() => setCopySuccess(false), []);

  const getBackgroundStyle = useCallback(() => {
    if (background === 'checker') {
      return {
        backgroundImage: backgrounds.checker,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      };
    }
    return { backgroundColor: backgrounds[background] };
  }, [background]);

  return (
    <Stack spacing={3}>
      {/* Title */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Preview</Typography>
        {canRotate && (
          <Tooltip title="Drag on the preview to rotate gradient angle" arrow>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <RotateIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Drag to rotate
              </Typography>
            </Stack>
          </Tooltip>
        )}
      </Stack>

      {/* Background selector */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Preview Background
        </Typography>
        <ToggleButtonGroup
          value={background}
          exclusive
          onChange={handleBackgroundChange}
          size="small"
        >
          <ToggleButton value="light">
            <Box
              sx={{
                width: 24, height: 24, borderRadius: 0.5,
                backgroundColor: '#ffffff', border: '1px solid #ddd',
              }}
            />
          </ToggleButton>
          <ToggleButton value="dark">
            <Box
              sx={{
                width: 24, height: 24, borderRadius: 0.5,
                backgroundColor: '#1a1a2e', border: '1px solid #ddd',
              }}
            />
          </ToggleButton>
          <ToggleButton value="checker">
            <Box
              sx={{
                width: 24, height: 24, borderRadius: 0.5,
                backgroundImage: backgrounds.checker,
                backgroundSize: '6px 6px',
                backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
                border: '1px solid #ddd',
              }}
            />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Gradient preview area */}
      <Box
        sx={{
          width: '100%', minHeight: 300, borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4,
          transition: 'background-color 0.3s ease',
          ...getBackgroundStyle(),
        }}
      >
        <Box
          ref={previewRef}
          onPointerDown={canRotate ? handleRotateStart : undefined}
          onPointerMove={canRotate ? handleRotateMove : undefined}
          onPointerUp={canRotate ? handleRotateEnd : undefined}
          onPointerLeave={canRotate ? handleRotateEnd : undefined}
          sx={{
            width: '100%', height: 200, borderRadius: 3,
            background: gradientCSS,
            boxShadow: (theme) =>
              `0 4px 20px ${theme.vars.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)'}`,
            position: 'relative',
            cursor: canRotate ? (isRotating ? 'grabbing' : 'grab') : 'default',
            ...(canRotate && {
              '&::before': {
                content: '""', position: 'absolute',
                top: '50%', left: '50%', width: '60%', height: 2,
                backgroundColor: 'rgba(255,255,255,0.6)',
                transformOrigin: 'center center',
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                pointerEvents: 'none',
                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                transition: isRotating ? 'none' : 'transform 0.1s ease-out',
              },
              '&::after': {
                content: '""', position: 'absolute',
                top: '50%', left: '50%', width: 12, height: 12,
                borderRadius: '50%', backgroundColor: 'white',
                border: '2px solid rgba(0,0,0,0.2)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              },
            }),
          }}
        />
      </Box>

      {/* Current angle display (when rotating) */}
      {canRotate && isRotating && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {angle}°
          </Typography>
        </Box>
      )}

      {/* CSS code display */}
      <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.900', position: 'relative' }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" fontWeight="bold" sx={{ color: 'grey.400' }}>
              CSS Code
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={handleExportPNG} title="Export as PNG" sx={{ color: 'grey.400' }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCopy} title="Copy to clipboard" sx={{ color: 'grey.400' }}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          <Typography
            variant="body2"
            fontFamily="monospace"
            sx={{ color: 'grey.300', wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}
          >
            {fullCSS}
          </Typography>
        </Stack>
      </Paper>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" icon={<CheckIcon />} sx={{ width: '100%' }}>
          CSS copied to clipboard!
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default React.memo(GradientPreview);
