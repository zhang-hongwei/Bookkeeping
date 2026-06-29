/**
 * Ruler - Horizontal/vertical measurement ruler using HTML Canvas
 */

"use client";

import { useRef, useEffect } from 'react';

export const RULER_SIZE = 24;

interface RulerProps {
  direction: 'horizontal' | 'vertical';
  length: number;
  offset: number;
  zoom: number;
  canvasSize: number;
}

function getTickStep(zoom: number): number {
  const steps = [10, 20, 50, 100, 200, 500, 1000];
  for (const step of steps) {
    if (step * zoom >= 30) return step;
  }
  return 1000;
}

export function Ruler({ direction, length, offset, zoom, canvasSize }: RulerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHorizontal = direction === 'horizontal';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Size the canvas buffer
    canvas.width = (isHorizontal ? length : RULER_SIZE) * dpr;
    canvas.height = (isHorizontal ? RULER_SIZE : length) * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(0, 0, isHorizontal ? length : RULER_SIZE, isHorizontal ? RULER_SIZE : length);

    // Border
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    if (isHorizontal) {
      ctx.beginPath();
      ctx.moveTo(0, RULER_SIZE - 0.5);
      ctx.lineTo(length, RULER_SIZE - 0.5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(RULER_SIZE - 0.5, 0);
      ctx.lineTo(RULER_SIZE - 0.5, length);
      ctx.stroke();
    }

    const step = getTickStep(zoom);
    const startCanvasPx = Math.floor((offset / zoom) / step) * step;
    const endCanvasPx = Math.min(
      Math.ceil(((offset + length) / zoom) / step) * step,
      canvasSize
    );

    ctx.fillStyle = '#555';
    ctx.strokeStyle = '#888';
    ctx.font = '9px -apple-system, sans-serif';
    ctx.textBaseline = 'top';

    for (let px = startCanvasPx; px <= endCanvasPx; px += step) {
      const viewportPos = px * zoom - offset;

      if (isHorizontal) {
        // Major tick
        ctx.beginPath();
        ctx.moveTo(viewportPos, RULER_SIZE);
        ctx.lineTo(viewportPos, RULER_SIZE - 10);
        ctx.stroke();
        // Label
        if (px >= 0) {
          ctx.save();
          ctx.fillText(String(Math.round(px)), viewportPos + 2, 1);
          ctx.restore();
        }
      } else {
        // Major tick
        ctx.beginPath();
        ctx.moveTo(RULER_SIZE, viewportPos);
        ctx.lineTo(RULER_SIZE - 10, viewportPos);
        ctx.stroke();
        // Label (rotated)
        if (px >= 0) {
          ctx.save();
          ctx.translate(4, viewportPos + 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(String(Math.round(px)), 0, 0);
          ctx.restore();
        }
      }

      // Minor ticks (5 subdivisions)
      const minorStep = step / 5;
      for (let m = 1; m < 5; m++) {
        const minorPx = px + m * minorStep;
        const minorViewport = minorPx * zoom - offset;
        const minorLen = m === 0 ? 10 : 5;

        if (isHorizontal) {
          ctx.beginPath();
          ctx.moveTo(minorViewport, RULER_SIZE);
          ctx.lineTo(minorViewport, RULER_SIZE - minorLen);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(RULER_SIZE, minorViewport);
          ctx.lineTo(RULER_SIZE - minorLen, minorViewport);
          ctx.stroke();
        }
      }
    }
  }, [direction, length, offset, zoom, canvasSize, isHorizontal]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: isHorizontal ? length : RULER_SIZE,
        height: isHorizontal ? RULER_SIZE : length,
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}
