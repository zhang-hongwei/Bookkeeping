/**
 * OffsetControl Component
 * SVG-based visual coordinate axis controller with X/Y sliders.
 * Blur is handled separately — this component only manages 2D offset.
 */

'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { Box, Typography, Stack, Slider, useTheme } from '@mui/material';
import { useThemeMode } from '@/hooks/useThemeMode';

interface OffsetControlProps {
  offsetX: number;
  offsetY: number;
  min?: number;
  max?: number;
  onChange: (offsetX: number, offsetY: number) => void;
}

const SIZE = 160;
const CENTER = SIZE / 2;

const OffsetControl: React.FC<OffsetControlProps> = ({
  offsetX,
  offsetY,
  min = -100,
  max = 100,
  onChange,
}) => {
  const theme = useTheme();
  const { isDark } = useThemeMode();
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const range = max - min;

  // --- Coordinate conversion ---
  const valueToPos = useCallback(
    (v: number) => ((v - min) / range) * SIZE,
    [min, range],
  );
  const posToValue = useCallback(
    (p: number) =>
      Math.max(min, Math.min(max, Math.round((p / SIZE) * range + min))),
    [min, max, range],
  );

  const dotX = valueToPos(offsetX);
  const dotY = valueToPos(-offsetY);

  // --- SVG pointer handlers ---
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scale = SIZE / rect.width;
      const x = Math.max(0, Math.min(SIZE, (clientX - rect.left) * scale));
      const y = Math.max(0, Math.min(SIZE, (clientY - rect.top) * scale));
      onChange(posToValue(x), -posToValue(y));
    },
    [posToValue, onChange],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      if (e.cancelable) e.preventDefault();
      const pt = 'touches' in e ? e.touches[0] : e;
      handleMove(pt.clientX, pt.clientY);
    };
    const onUp = () => { isDragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, [handleMove]);

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const pt = 'touches' in e ? e.touches[0] : e;
      handleMove(pt.clientX, pt.clientY);
    },
    [handleMove],
  );

  // --- Slider handlers ---
  const handleXSlider = useCallback(
    (_: Event, v: number | number[]) => onChange(v as number, offsetY),
    [onChange, offsetY],
  );
  const handleYSlider = useCallback(
    (_: Event, v: number | number[]) => onChange(offsetX, v as number),
    [onChange, offsetX],
  );

  // --- Grid lines ---
  const step = range <= 50 ? 10 : 20;
  const gridPositions: number[] = [];
  for (let v = min + step; v < max; v += step) {
    const p = valueToPos(v);
    if (Math.abs(p - CENTER) > 2) gridPositions.push(p);
  }

  // --- Theme-aware palette ---
  const c = {
    bg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
    border: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
    grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    axis: isDark ? 'rgba(249,248,248,0.4)' : 'rgba(0,0,0,0.2)',
    label: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)',
    centerDot: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.15)',
    line: isDark ? 'rgba(144,202,249,0.7)' : 'rgba(25,118,210,0.4)',
    dot: theme.palette.primary.main,
    dotStroke: theme.palette.primary.dark,
  };

  // --- Offset slider (no text input, just label + slider) ---
  const offsetSlider = (
    label: string,
    value: number,
    sliderMin: number,
    sliderMax: number,
    onSlider: (_: Event, v: number | number[]) => void,
  ) => (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: '12px' }} variant="caption" color="text.secondary">{label}</Typography>
        <Typography sx={{ fontSize: '12px' }} variant="caption" color="text.secondary">{value}px</Typography>
      </Stack>
      <Slider
        value={value}
        onChange={onSlider}
        min={sliderMin}
        max={sliderMax}
        size="small"
      />
    </Box>
  );

  return (

    <Stack direction="row" spacing={2} alignItems="flex-start">
      {/* Left: SVG drag pad */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        style={{
          display: 'block',
          borderRadius: 4,
          border: `1px solid ${c.border}`,
          backgroundColor: c.bg,
          cursor: 'crosshair',
          userSelect: 'none',
          touchAction: 'none',
          flexShrink: 0,
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {gridPositions.map((p) => (
          <g key={p} pointerEvents="none">
            <line x1={p} y1={0} x2={p} y2={SIZE} stroke={c.grid} />
            <line x1={0} y1={p} x2={SIZE} y2={p} stroke={c.grid} />
          </g>
        ))}
        <line x1={0} y1={CENTER} x2={SIZE} y2={CENTER} stroke={c.axis} strokeWidth={1.5} pointerEvents="none" />
        <line x1={CENTER} y1={0} x2={CENTER} y2={SIZE} stroke={c.axis} strokeWidth={1.5} pointerEvents="none" />
        <text x={SIZE - 4} y={CENTER - 4} textAnchor="end" fill={c.label} fontSize="9" fontWeight="bold" fontFamily="inherit" pointerEvents="none">x</text>
        <text x={CENTER + 4} y={11} fill={c.label} fontSize="9" fontWeight="bold" fontFamily="inherit" pointerEvents="none">y</text>
        <circle cx={CENTER} cy={CENTER} r={1.5} fill={c.centerDot} pointerEvents="none" />
        <line x1={CENTER} y1={CENTER} x2={dotX} y2={dotY} stroke={c.line} strokeWidth={1.5} strokeDasharray="4 2" pointerEvents="none" />
        <circle cx={dotX} cy={dotY} r={6} fill={c.dot} stroke={c.dotStroke} strokeWidth={2} style={{ cursor: 'grab', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }} />
      </svg>

      {/* Right: X/Y sliders */}
      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        {offsetSlider('X Offset', offsetX, min, max, handleXSlider)}
        {offsetSlider('Y Offset', offsetY, min, max, handleYSlider)}
      </Stack>
    </Stack>


  );
};

export default React.memo(OffsetControl);
