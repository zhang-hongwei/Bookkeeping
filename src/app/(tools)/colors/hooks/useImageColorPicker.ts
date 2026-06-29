/**
 * useImageColorPicker Hook
 * Handles image-based color picking with magnifier functionality
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PickedLocation } from '../types';

interface UseImageColorPickerOptions {
  onColorPicked?: (location: Omit<PickedLocation, 'id'>) => void;
  magnifierSize?: number;
  magnifierZoom?: number;
}

interface UseImageColorPickerReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  magnifierPosition: { x: number; y: number } | null;
  magnifierColor: string | null;
  magnifierPixels: string[][];
  activate: () => void;
  deactivate: () => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  handleClick: (e: React.MouseEvent) => void;
  loadImage: (imageSrc: string) => Promise<void>;
}

const MAGNIFIER_SIZE = 11; // Odd number for center pixel
const PIXEL_SIZE = 10;

export function useImageColorPicker(
  options: UseImageColorPickerOptions = {}
): UseImageColorPickerReturn {
  const { onColorPicked, magnifierSize = MAGNIFIER_SIZE, magnifierZoom = PIXEL_SIZE } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState<{ x: number; y: number } | null>(null);
  const [magnifierColor, setMagnifierColor] = useState<string | null>(null);
  const [magnifierPixels, setMagnifierPixels] = useState<string[][]>([]);

  // Load image onto canvas
  const loadImage = useCallback(async (imageSrc: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        imageRef.current = img;
        resolve();
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  }, []);

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

  // Get magnifier pixel grid
  const getMagnifierPixels = useCallback((centerX: number, centerY: number): string[][] => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];

    const halfSize = Math.floor(magnifierSize / 2);
    const pixels: string[][] = [];

    for (let dy = -halfSize; dy <= halfSize; dy++) {
      const row: string[] = [];
      for (let dx = -halfSize; dx <= halfSize; dx++) {
        const x = Math.max(0, Math.min(canvas.width - 1, centerX + dx));
        const y = Math.max(0, Math.min(canvas.height - 1, centerY + dy));
        row.push(getPixelColor(x, y));
      }
      pixels.push(row);
    }

    return pixels;
  }, [magnifierSize, getPixelColor]);

  // Activate color picker
  const activate = useCallback(() => {
    setIsActive(true);
  }, []);

  // Deactivate color picker
  const deactivate = useCallback(() => {
    setIsActive(false);
    setMagnifierPosition(null);
    setMagnifierColor(null);
    setMagnifierPixels([]);
  }, []);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    // Clamp to canvas bounds
    const clampedX = Math.max(0, Math.min(canvas.width - 1, x));
    const clampedY = Math.max(0, Math.min(canvas.height - 1, y));

    setMagnifierPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setMagnifierColor(getPixelColor(clampedX, clampedY));
    setMagnifierPixels(getMagnifierPixels(clampedX, clampedY));
  }, [isActive, getPixelColor, getMagnifierPixels]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setMagnifierPosition(null);
    setMagnifierColor(null);
    setMagnifierPixels([]);
  }, []);

  // Handle click to pick color
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    // Clamp to canvas bounds
    const clampedX = Math.max(0, Math.min(canvas.width - 1, x));
    const clampedY = Math.max(0, Math.min(canvas.height - 1, y));

    const hex = getPixelColor(clampedX, clampedY);

    onColorPicked?.({
      x: clampedX,
      y: clampedY,
      hex,
    });
  }, [isActive, getPixelColor, onColorPicked]);

  // Cleanup
  useEffect(() => {
    return () => {
      imageRef.current = null;
    };
  }, []);

  return {
    canvasRef,
    isActive,
    magnifierPosition,
    magnifierColor,
    magnifierPixels,
    activate,
    deactivate,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    loadImage,
  };
}
