/**
 * Canvas Preview Component
 * Displays the generated background with aspect ratio preservation
 */

'use client';

import React, { useRef, useEffect, useCallback, forwardRef } from 'react';
import { Box, CircularProgress, Skeleton } from '@mui/material';
import { useBackgroundsStore } from '../store/backgroundsStore';
import { getBackgroundGenerator } from '../generators/BaseBackgroundGenerator';

interface CanvasPreviewProps {
  showLoading?: boolean;
}

export const CanvasPreview = forwardRef<HTMLCanvasElement, CanvasPreviewProps>(
  function CanvasPreview({ showLoading = true }, ref) {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef;
    const containerRef = useRef<HTMLDivElement>(null);

    const config = useBackgroundsStore((s) => s.config);
    const generatorType = useBackgroundsStore((s) => s.generatorType);
    const setIsLoading = useBackgroundsStore((s) => s.setIsLoading);
    const setGeneratedDataUrl = useBackgroundsStore((s) => s.setGeneratedDataUrl);
    const isLoading = useBackgroundsStore((s) => s.isLoading);

    // Generate background when config changes
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const generator = getBackgroundGenerator(generatorType);
      if (!generator) return;

      setIsLoading(true);

      // Set canvas size
      canvas.width = config.canvas.width;
      canvas.height = config.canvas.height;

      // Generate
      const result = generator.generateCanvas(config as Parameters<typeof generator.generateCanvas>[0], canvas);

      if (result instanceof Promise) {
        result
          .then(() => {
            setGeneratedDataUrl(canvas.toDataURL('image/png'));
          })
          .catch((err) => {
            console.error('Generation failed:', err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setGeneratedDataUrl(canvas.toDataURL('image/png'));
        setIsLoading(false);
      }
    }, [config, generatorType, setIsLoading, setGeneratedDataUrl, canvasRef]);

    // Calculate display size while preserving aspect ratio
    const updateDisplaySize = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const { width, height } = config.canvas;

      const aspectRatio = width / height;
      const containerAspect = containerWidth / containerHeight;

      let displayWidth: number;
      let displayHeight: number;

      if (containerAspect > aspectRatio) {
        // Container is wider - fit to height
        displayHeight = containerHeight;
        displayWidth = displayHeight * aspectRatio;
      } else {
        // Container is taller - fit to width
        displayWidth = containerWidth;
        displayHeight = displayWidth / aspectRatio;
      }

      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
    }, [config.canvas, canvasRef]);

    useEffect(() => {
      updateDisplaySize();
      window.addEventListener('resize', updateDisplaySize);
      return () => window.removeEventListener('resize', updateDisplaySize);
    }, [updateDisplaySize]);

    return (
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          ...({ applyStyles: (styles: Record<string, unknown>) => styles } as any).applyStyles(
            'dark',
            {
              bgcolor: 'grey.900',
            }
          ),
        }}
      >
        {isLoading && showLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: 4,
          }}
        />
      </Box>
    );
  }
);
