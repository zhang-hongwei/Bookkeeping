/**
 * AngleWheel Component
 * Minimal SVG circular angle selector inspired by cssgenie.
 *
 * Structure: background circle + direction line + center dot + handle dot
 * Drag the handle dot or click anywhere on the circle to set the angle.
 *
 * Features:
 * - Drag to set angle with optional snap
 * - Keyboard support (Arrow keys, Shift for 15° step)
 * - Direct input via editable angle display
 * - onChangeStart / onChangeEnd for composable workflows
 *
 * Shared component — used by ColorStopPanel and gradientEditor.
 */

'use client';

import React, { useCallback, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { InputBase, Paper, useTheme } from '@mui/material';

interface AngleWheelProps {
  /** Current angle value (0-360) */
  value: number;
  /** Fires on every intermediate change (drag, keyboard, input) */
  onChange: (angle: number) => void;
  /** Fires when a drag / keyboard adjustment starts */
  onChangeStart?: (angle: number) => void;
  /** Fires when a drag / keyboard adjustment ends */
  onChangeEnd?: (angle: number) => void;
  /** Size of the wheel in pixels */
  size?: number;
  /** Snap angle in degrees (e.g. 15 → 0, 15, 30…). 0 = no snap */
  snap?: number;
  /** Display mode: degrees or percentage */
  mode?: 'angle' | 'percent';
  /** Whether the wheel is disabled */
  disabled?: boolean;
}

/** Snap to nearest step; no-op when step is 0 */
const snapAngle = (angle: number, step: number) =>
  step > 0 ? Math.round(angle / step) * step : angle;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const AngleWheel: React.FC<AngleWheelProps> = ({
  value,
  onChange,
  onChangeStart,
  onChangeEnd,
  size = 80,
  snap = 0,
  mode = 'angle',
  disabled = false,
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const handleRef = useRef<SVGCircleElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);

  // Refs for stable callbacks — avoid recreating on every value change
  const valueRef = useRef(value);
  valueRef.current = value;
  const isDraggingRef = useRef(false);

  // Sync local text when external value changes and we're not editing
  useEffect(() => {
    if (!isEditing) setInputValue(mode === 'percent' ? String(Math.round((value / 360) * 100)) : String(value));
  }, [value, isEditing, mode]);

  /** Convert display value → degrees for onChange */
  const toAngle = useCallback(
    (raw: number): number => {
      if (mode === 'percent') {
        return Math.round((clamp(raw, 0, 100) / 100) * 360);
      }
      return ((Math.round(raw) % 360) + 360) % 360;
    },
    [mode],
  );

  /** Format angle for display */
  const displayValue = mode === 'percent'
    ? `${Math.round((value / 360) * 100)}%`
    : `${value}°`;

  // ── Theme colors ────────────────────────────────────────────
  const primary = theme.palette.primary.main;
  const divider = theme.palette.divider;
  const paper = theme.palette.background.paper;

  // ── Geometry ────────────────────────────────────────────────
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 6; // room for handle dot
  const dotR = Math.max(4, size / 18);

  // ── Handle position from angle ──────────────────────────────
  // CSS gradient convention: 0° = to top, clockwise
  const getHandlePos = useCallback(
    (angle: number) => {
      const rad = (angle * Math.PI) / 180;
      return {
        x: cx + outerR * Math.sin(rad),
        y: cy - outerR * Math.cos(rad),
      };
    },
    [cx, cy, outerR],
  );

  // ── Direct DOM update — bypass React for buttery smooth drag ─
  const updateHandleDOM = useCallback(
    (angle: number) => {
      const pos = getHandlePos(angle);
      lineRef.current?.setAttribute('x2', String(pos.x));
      lineRef.current?.setAttribute('y2', String(pos.y));
      handleRef.current?.setAttribute('cx', String(pos.x));
      handleRef.current?.setAttribute('cy', String(pos.y));
    },
    [getHandlePos],
  );

  // ── Angle calculation ───────────────────────────────────────

  const calculateAngle = useCallback(
    (clientX: number, clientY: number): number => {
      if (!svgRef.current) return valueRef.current;
      const rect = svgRef.current.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      // 0° = top, clockwise positive
      let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      return Math.round(snapAngle(angle, snap));
    },
    [snap],
  );

  // ── Pointer handlers ────────────────────────────────────────

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
      isDraggingRef.current = true;

      const angle = calculateAngle(e.clientX, e.clientY);
      updateHandleDOM(angle);

      onChangeStart?.(angle);
      onChange(angle);
      (e.target as Element).setPointerCapture(e.pointerId);
    },
    [disabled, calculateAngle, updateHandleDOM, onChange, onChangeStart],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current || disabled) return;
      const angle = calculateAngle(e.clientX, e.clientY);
      updateHandleDOM(angle);
      onChange(angle);
    },
    [disabled, calculateAngle, updateHandleDOM, onChange],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      setIsDragging(false);
      isDraggingRef.current = false;
      onChangeEnd?.(valueRef.current);
      (e.target as Element).releasePointerCapture(e.pointerId);
    },
    [onChangeEnd],
  );

  // ── Keyboard handler ────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      let delta = 0;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          delta = e.shiftKey ? 15 : 1;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          delta = -(e.shiftKey ? 15 : 1);
          break;
        default:
          return;
      }
      e.preventDefault();
      const next = ((value + delta) % 360 + 360) % 360;
      const snapped = Math.round(snapAngle(next, snap));
      onChangeStart?.(value);
      onChange(snapped);
      onChangeEnd?.(snapped);
    },
    [disabled, value, snap, onChange, onChangeStart, onChangeEnd],
  );

  // ── Direct input ────────────────────────────────────────────

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value),
    [],
  );

  const commitInput = useCallback(() => {
    setIsEditing(false);
    const parsed = parseInt(inputValue, 10);
    if (!Number.isNaN(parsed)) {
      const angle = toAngle(parsed);
      onChangeStart?.(value);
      onChange(angle);
      onChangeEnd?.(angle);
    } else {
      setInputValue(mode === 'percent' ? String(Math.round((value / 360) * 100)) : String(value));
    }
  }, [inputValue, value, mode, toAngle, onChange, onChangeStart, onChangeEnd]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitInput();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setInputValue(String(value));
      }
    },
    [commitInput, value],
  );

  // ── Sync SVG from React (skipped during drag) ──────────────
  useLayoutEffect(() => {
    if (!isDraggingRef.current) {
      updateHandleDOM(value);
    }
  }, [value, updateHandleDOM]);

  // ── Initial handle position ─────────────────────────────────
  const handlePos = getHandlePos(value);

  // ── Render ──────────────────────────────────────────────────

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      tabIndex={disabled ? -1 : 0}
      role="slider"
      aria-label="Angle"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={value}
      aria-valuetext={`${value} degrees`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onKeyDown={handleKeyDown}
      style={{
        cursor: disabled ? 'not-allowed' : 'crosshair',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        borderRadius: '50%',
        userSelect: 'none',
      }}
    >
      {/* Background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        fill={paper}
        stroke={divider}
        strokeWidth={2}
      />

      {/* Direction line from center to handle */}
      <line
        ref={lineRef}
        x1={cx}
        y1={cy}
        x2={handlePos.x}
        y2={handlePos.y}
        stroke={primary}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Center dot (semi-transparent) */}
      <circle
        cx={cx}
        cy={cy}
        r={dotR}
        fill={primary}
        opacity={0.7}
      />

      {/* Handle dot (draggable) */}
      <circle
        ref={handleRef}
        cx={handlePos.x}
        cy={handlePos.y}
        r={dotR}
        fill={primary}
        style={{ cursor: disabled ? 'not-allowed' : 'grab' }}
      />
    </svg>
  );
};

export default React.memo(AngleWheel);
