/**
 * HarmonyWheel Component
 * Visual color wheel with harmony indicators
 */

'use client';

import React, { useMemo } from 'react';
import { Box, Paper, Tooltip } from '@mui/material';
import type { HarmonyType, HarmonyColor } from '../../types';

interface HarmonyWheelProps {
  baseColor: string;
  harmonyColors: HarmonyColor[];
  harmonyType: HarmonyType;
  onColorClick?: (color: HarmonyColor) => void;
  size?: number;
}

export function HarmonyWheel({
  baseColor,
  harmonyColors,
  harmonyType,
  onColorClick,
  size = 200,
}: HarmonyWheelProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20;

  // Generate wheel segments
  const wheelSegments = useMemo(() => {
    const segments = [];
    for (let i = 0; i < 360; i += 10) {
      const angle = (i - 90) * (Math.PI / 180);
      const nextAngle = (i + 10 - 90) * (Math.PI / 180);

      const x1 = centerX + radius * Math.cos(angle);
      const y1 = centerY + radius * Math.sin(angle);
      const x2 = centerX + radius * Math.cos(nextAngle);
      const y2 = centerY + radius * Math.sin(nextAngle);

      // Use HSL to get color for this segment
      const hue = i;
      const color = `hsl(${hue}, 80%, 50%)`;

      segments.push({
        path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`,
        color,
        angle: i,
      });
    }
    return segments;
  }, [centerX, centerY, radius]);

  // Get angle from hex color
  const getAngleFromHex = (hex: string): number => {
    // Simple approximation using RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    let h = 0;
    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return h * 360;
  };

  // Calculate marker positions
  const getMarkerPosition = (angle: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad),
    };
  };

  // Get harmony marker positions
  const markers = useMemo(() => {
    return harmonyColors.map((color) => ({
      ...color,
      position: getMarkerPosition(color.angle),
    }));
  }, [harmonyColors, centerX, centerY, radius]);

  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          position: 'relative',
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Wheel segments */}
          {wheelSegments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth="0.5"
            />
          ))}

          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.3}
            fill="white"
            stroke="#ddd"
            strokeWidth="1"
          />

          {/* Harmony lines */}
          {markers.length > 1 && (
            <path
              d={`M ${markers[0].position.x} ${markers[0].position.y} ${markers
                .slice(1)
                .map((m) => `L ${m.position.x} ${m.position.y}`)
                .join(' ')} Z`}
              fill="none"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {/* Color markers */}
        {markers.map((marker, index) => (
          <Tooltip
            key={index}
            title={
              <Box>
                <Box sx={{ fontWeight: 600 }}>{marker.hex}</Box>
                <Box sx={{ fontSize: 12 }}>{marker.relationship}</Box>
              </Box>
            }
          >
            <Box
              onClick={() => onColorClick?.(marker)}
              sx={{
                position: 'absolute',
                left: marker.position.x - 12,
                top: marker.position.y - 12,
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: marker.hex,
                border: index === 0 ? '3px solid white' : '2px solid',
                borderColor: index === 0 ? 'primary.main' : 'divider',
                boxShadow: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.2)',
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
}
