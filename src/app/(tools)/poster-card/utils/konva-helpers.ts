/**
 * Konva Helpers - Image loading and background rendering
 */

"use client";

import { useEffect, useState } from 'react';
import type Konva from 'konva';
import type { Background } from '../types';

// === Image Loading ===

export function useKonvaImage(src: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return image;
}

// === Background Rendering (canvas2D sceneFunc) ===

export function drawBackground(
  ctx: Konva.Context,
  bg: Background,
  width: number,
  height: number,
) {
  switch (bg.type) {
    case 'solid':
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'gradient': {
      const angle = (bg.angle * Math.PI) / 180;
      const cx = width / 2;
      const cy = height / 2;
      const len = Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
      const x0 = cx - (len / 2) * Math.cos(angle);
      const y0 = cy - (len / 2) * Math.sin(angle);
      const x1 = cx + (len / 2) * Math.cos(angle);
      const y1 = cy + (len / 2) * Math.sin(angle);

      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      for (const stop of bg.stops) {
        grad.addColorStop(stop.position / 100, stop.color);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'pattern': {
      ctx.fillStyle = bg.backgroundColor;
      ctx.fillRect(0, 0, width, height);
      drawPattern(ctx, bg.patternId, bg.color, bg.scale, width, height);
      break;
    }
  }
}

// === Image Crop (cover mode) ===

export type CropPosition =
  | 'left-top' | 'center-top' | 'right-top'
  | 'left-middle' | 'center-middle' | 'right-middle'
  | 'left-bottom' | 'center-bottom' | 'right-bottom';

/**
 * Calculate crop values to fill the display area without distortion.
 * Similar to CSS `object-fit: cover` — the image is scaled to cover
 * the entire area and the overflow is cropped based on clipPosition.
 */
export function getCrop(
  image: HTMLImageElement,
  size: { width: number; height: number },
  clipPosition: CropPosition = 'center-middle',
) {
  const { width, height } = size;
  const aspectRatio = width / height;
  const imageRatio = image.width / image.height;

  let newWidth: number;
  let newHeight: number;

  if (aspectRatio >= imageRatio) {
    newWidth = image.width;
    newHeight = image.width / aspectRatio;
  } else {
    newWidth = image.height * aspectRatio;
    newHeight = image.height;
  }

  let x = 0;
  let y = 0;

  if (clipPosition === 'left-top') { x = 0; y = 0; }
  else if (clipPosition === 'left-middle') { x = 0; y = (image.height - newHeight) / 2; }
  else if (clipPosition === 'left-bottom') { x = 0; y = image.height - newHeight; }
  else if (clipPosition === 'center-top') { x = (image.width - newWidth) / 2; y = 0; }
  else if (clipPosition === 'center-middle') { x = (image.width - newWidth) / 2; y = (image.height - newHeight) / 2; }
  else if (clipPosition === 'center-bottom') { x = (image.width - newWidth) / 2; y = image.height - newHeight; }
  else if (clipPosition === 'right-top') { x = image.width - newWidth; y = 0; }
  else if (clipPosition === 'right-middle') { x = image.width - newWidth; y = (image.height - newHeight) / 2; }
  else if (clipPosition === 'right-bottom') { x = image.width - newWidth; y = image.height - newHeight; }

  return { cropX: x, cropY: y, cropWidth: newWidth, cropHeight: newHeight };
}

function drawPattern(
  ctx: Konva.Context,
  patternId: string,
  color: string,
  scale: number,
  width: number,
  height: number,
) {
  switch (patternId) {
    case 'dots': {
      const spacing = 20 * scale;
      ctx.fillStyle = color;
      for (let y = spacing; y < height; y += spacing) {
        for (let x = spacing; x < width; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'grid': {
      const gridSpacing = 40 * scale;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let x = gridSpacing; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = gridSpacing; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;
    }

    case 'lines': {
      const lineSpacing = 20 * scale;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let d = -height; d < width + height; d += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(d, 0);
        ctx.lineTo(d + height, height);
        ctx.stroke();
      }
      break;
    }
  }
}

