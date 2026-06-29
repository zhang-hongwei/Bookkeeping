/**
 * useGradientState Hook
 * Manage all operations logic for gradient editor
 */

'use client';

import { useState, useCallback } from 'react';
import type {
  GradientConfig,
  ColorStop,
  GradientType,
  RadialShape,
  RadialSize,
} from '../types';
import {
  createDefaultConfig,
  createDefaultStop,
  generateId,
  GRADIENT_EDITOR_PRESETS,
} from '../utils';

export interface UseGradientStateReturn {
  /** Current gradient configuration */
  config: GradientConfig;
  /** Currently selected stop ID */
  selectedStopId: string | null;
  /** Set gradient type */
  setGradientType: (type: GradientType) => void;
  /** Set angle for linear/conic */
  setAngle: (angle: number) => void;
  /** Set center position for radial/conic */
  setCenter: (x: number, y: number) => void;
  /** Set radial shape */
  setRadialShape: (shape: RadialShape) => void;
  /** Set radial size */
  setRadialSize: (size: RadialSize) => void;
  /** Add new color stop */
  addStop: (position?: number) => void;
  /** Remove color stop */
  removeStop: (id: string) => void;
  /** Update color stop */
  updateStop: (id: string, updates: Partial<ColorStop>) => void;
  /** Move color stop to new position */
  moveStop: (id: string, position: number) => void;
  /** Duplicate color stop */
  duplicateStop: (id: string) => void;
  /** Select color stop */
  selectStop: (id: string | null) => void;
  /** Apply preset */
  applyPreset: (presetName: string) => void;
  /** Reset to default */
  resetGradient: () => void;
  /** Import from JSON */
  importFromJson: (json: string) => boolean;
  /** Export to JSON */
  exportToJson: () => string;
}

/**
 * Gradient state management Hook
 */
export function useGradientState(): UseGradientStateReturn {
  const [config, setConfig] = useState<GradientConfig>(createDefaultConfig);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  /**
   * Set gradient type
   */
  const setGradientType = useCallback((type: GradientType) => {
    setConfig(prev => ({ ...prev, type }));
  }, []);

  /**
   * Set angle
   */
  const setAngle = useCallback((angle: number) => {
    setConfig(prev => ({ ...prev, angle }));
  }, []);

  /**
   * Set center position
   */
  const setCenter = useCallback((x: number, y: number) => {
    setConfig(prev => ({ ...prev, centerX: x, centerY: y }));
  }, []);

  /**
   * Set radial shape
   */
  const setRadialShape = useCallback((shape: RadialShape) => {
    setConfig(prev => ({ ...prev, radialShape: shape }));
  }, []);

  /**
   * Set radial size
   */
  const setRadialSize = useCallback((size: RadialSize) => {
    setConfig(prev => ({ ...prev, radialSize: size }));
  }, []);

  /**
   * Add new color stop
   */
  const addStop = useCallback((position?: number) => {
    setConfig(prev => {
      // Calculate position if not provided
      const newPosition =
        position ??
        (prev.stops.length === 0
          ? 50
          : prev.stops.length === 1
            ? 100
            : Math.max(...prev.stops.map(s => s.position)) + 10);

      const newStop = createDefaultStop(Math.min(newPosition, 100));

      // Get random vibrant color for new stop
      const hue = Math.floor(Math.random() * 360);
      newStop.color = `hsl(${hue}, 70%, 60%)`.replace(
        /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/,
        (_, h, s, l) => hslToHex(Number(h), Number(s), Number(l))
      );

      return {
        ...prev,
        stops: [...prev.stops, newStop],
      };
    });
  }, []);

  /**
   * Remove color stop
   */
  const removeStop = useCallback((id: string) => {
    setConfig(prev => {
      // Keep at least 2 stops
      if (prev.stops.length <= 2) return prev;

      return {
        ...prev,
        stops: prev.stops.filter(stop => stop.id !== id),
      };
    });
    setSelectedStopId(null);
  }, []);

  /**
   * Update color stop
   */
  const updateStop = useCallback((id: string, updates: Partial<ColorStop>) => {
    setConfig(prev => ({
      ...prev,
      stops: prev.stops.map(stop =>
        stop.id === id ? { ...stop, ...updates } : stop
      ),
    }));
  }, []);

  /**
   * Move color stop to new position
   */
  const moveStop = useCallback((id: string, position: number) => {
    setConfig(prev => ({
      ...prev,
      stops: prev.stops.map(stop =>
        stop.id === id ? { ...stop, position: Math.max(0, Math.min(100, position)) } : stop
      ),
    }));
  }, []);

  /**
   * Duplicate color stop
   */
  const duplicateStop = useCallback((id: string) => {
    setConfig(prev => {
      const targetStop = prev.stops.find(stop => stop.id === id);
      if (!targetStop) return prev;

      const newStop: ColorStop = {
        ...targetStop,
        id: generateId(),
        position: Math.min(targetStop.position + 5, 100),
      };

      return {
        ...prev,
        stops: [...prev.stops, newStop],
      };
    });
  }, []);

  /**
   * Select color stop
   */
  const selectStop = useCallback((id: string | null) => {
    setSelectedStopId(id);
  }, []);

  /**
   * Apply preset
   */
  const applyPreset = useCallback((presetName: string) => {
    const preset = GRADIENT_EDITOR_PRESETS.find(p => p.name === presetName);
    if (!preset) return;

    setConfig({
      ...preset.config,
      stops: preset.config.stops.map(stop => ({
        ...stop,
        id: generateId(),
      })),
    });
    setSelectedStopId(null);
  }, []);

  /**
   * Reset to default
   */
  const resetGradient = useCallback(() => {
    setConfig(createDefaultConfig());
    setSelectedStopId(null);
  }, []);

  /**
   * Import from JSON
   */
  const importFromJson = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as Partial<GradientConfig>;

      if (!parsed.stops || !Array.isArray(parsed.stops)) {
        return false;
      }

      const imported: GradientConfig = {
        ...createDefaultConfig(),
        ...parsed,
        stops: parsed.stops.map(stop => ({
          ...stop,
          id: generateId(),
        })),
      };

      setConfig(imported);
      setSelectedStopId(null);
      return true;
    } catch (error) {
      console.error('Failed to import JSON:', error);
      return false;
    }
  }, []);

  /**
   * Export to JSON
   */
  const exportToJson = useCallback((): string => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  return {
    config,
    selectedStopId,
    setGradientType,
    setAngle,
    setCenter,
    setRadialShape,
    setRadialSize,
    addStop,
    removeStop,
    updateStop,
    moveStop,
    duplicateStop,
    selectStop,
    applyPreset,
    resetGradient,
    importFromJson,
    exportToJson,
  };
}

/**
 * Convert HSL to HEX
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
