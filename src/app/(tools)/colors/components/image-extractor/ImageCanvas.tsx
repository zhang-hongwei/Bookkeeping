/**
 * ImageCanvas Component
 * Canvas-based image display with eyedropper functionality
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Close as CloseIcon, Colorize as ColorizeIcon } from '@mui/icons-material';
import { Magnifier } from './Magnifier';
import { ColorMarker } from './ColorMarker';
import type { PickedLocation } from '../../types';

interface ImageCanvasProps {
  image: string;
  pickedLocations: PickedLocation[];
  eyedropperActive: boolean;
  onColorPick: (location: Omit<PickedLocation, 'id'>) => void;
  onRemoveLocation: (id: string) => void;
  onToggleEyedropper: () => void;
  magnifierPosition: { x: number; y: number } | null;
  magnifierColor: string | null;
  onMagnifierMove: (e: React.MouseEvent) => void;
  onMagnifierLeave: () => void;
}

export function ImageCanvas({
  image,
  pickedLocations,
  eyedropperActive,
  onColorPick,
  onRemoveLocation,
  onToggleEyedropper,
  magnifierPosition,
  magnifierColor,
  onMagnifierMove,
  onMagnifierLeave,
}: ImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Load image onto canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });

      // Calculate display size (max 600px width, maintain aspect ratio)
      const maxWidth = 600;
      const scale = Math.min(1, maxWidth / img.width);
      const displayWidth = img.width * scale;
      const displayHeight = img.height * scale;

      canvas.width = img.width;
      canvas.height = img.height;
      setCanvasSize({ width: displayWidth, height: displayHeight });

      ctx.drawImage(img, 0, 0);
    };

    img.src = image;
  }, [image]);

  // Get pixel color at position
  const getPixelColor = useCallback((x: number, y: number): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '#000000';

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '#000000';

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' +
      pixel[0].toString(16).padStart(2, '0') +
      pixel[1].toString(16).padStart(2, '0') +
      pixel[2].toString(16).padStart(2, '0');

    return hex.toUpperCase();
  }, []);

  // Handle click to pick color
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!eyedropperActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    // Clamp to canvas bounds
    const clampedX = Math.max(0, Math.min(canvas.width - 1, x));
    const clampedY = Math.max(0, Math.min(canvas.height - 1, y));

    const hex = getPixelColor(clampedX, clampedY);

    onColorPick({
      x: clampedX,
      y: clampedY,
      hex,
    });
  }, [eyedropperActive, getPixelColor, onColorPick]);

  // Calculate marker display position
  const getMarkerDisplayPosition = useCallback((location: PickedLocation) => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    return {
      x: location.x * scaleX,
      y: location.y * scaleY,
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        display: 'inline-block',
        borderRadius: 1,
        overflow: 'hidden',
        cursor: eyedropperActive ? 'crosshair' : 'default',
      }}
      onMouseMove={eyedropperActive ? onMagnifierMove : undefined}
      onMouseLeave={eyedropperActive ? onMagnifierLeave : undefined}
      onClick={handleClick}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          display: 'block',
        }}
      />

      {/* Eyedropper Toggle Button */}
      <Tooltip title={eyedropperActive ? 'Disable Color Picker' : 'Enable Color Picker'}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggleEyedropper();
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: eyedropperActive ? 'primary.main' : 'background.paper',
            color: eyedropperActive ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              bgcolor: eyedropperActive ? 'primary.dark' : 'action.hover',
            },
            boxShadow: 1,
          }}
        >
          <ColorizeIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Color Markers */}
      {pickedLocations.map((location) => {
        const pos = getMarkerDisplayPosition(location);
        return (
          <ColorMarker
            key={location.id}
            color={location.hex}
            x={pos.x}
            y={pos.y}
            onRemove={() => onRemoveLocation(location.id)}
          />
        );
      })}

      {/* Magnifier */}
      {eyedropperActive && magnifierPosition && magnifierColor && (
        <Magnifier
          x={magnifierPosition.x}
          y={magnifierPosition.y}
          color={magnifierColor}
        />
      )}
    </Box>
  );
}
