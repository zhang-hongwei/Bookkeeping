/**
 * Gradient Editor Hook
 * Manages editing state for inline gradient editing
 */

import { useState, useCallback } from 'react';
import type { GradientPreset, GradientStop, GradientType } from '../types';
import { generateCSSFromStops } from '../utils';

interface UseGradientEditorReturn {
  /** Currently editing gradient preset */
  editingGradient: GradientPreset | null;
  /** Local copy of stops being edited */
  localStops: GradientStop[];
  /** Local angle being edited */
  localAngle: number;
  /** Local gradient type */
  localType: GradientType;
  /** Preview CSS based on local edits */
  previewCss: string;
  /** Start editing a gradient */
  startEdit: (gradient: GradientPreset) => void;
  /** Update a color stop */
  updateStop: (index: number, updates: Partial<GradientStop>) => void;
  /** Add a new color stop */
  addStop: () => void;
  /** Remove a color stop */
  removeStop: (index: number) => void;
  /** Update gradient angle */
  updateAngle: (angle: number) => void;
  /** Update gradient type */
  updateType: (type: GradientType) => void;
  /** Reset to original values */
  resetEdit: () => void;
  /** Cancel editing */
  cancelEdit: () => void;
  /** Apply changes and get result */
  applyChanges: () => { stops: GradientStop[]; angle: number; type: GradientType; css: string } | null;
}

export function useGradientEditor(): UseGradientEditorReturn {
  const [editingGradient, setEditingGradient] = useState<GradientPreset | null>(null);
  const [localStops, setLocalStops] = useState<GradientStop[]>([]);
  const [localAngle, setLocalAngle] = useState(135);
  const [localType, setLocalType] = useState<GradientType>('linear');

  const previewCss = generateCSSFromStops(localStops, localType, localAngle);

  const startEdit = useCallback((gradient: GradientPreset) => {
    setEditingGradient(gradient);
    setLocalStops([...gradient.stops]);
    setLocalAngle(gradient.angle ?? 135);
    setLocalType(gradient.type);
  }, []);

  const updateStop = useCallback((index: number, updates: Partial<GradientStop>) => {
    setLocalStops((prev) =>
      prev.map((stop, i) => (i === index ? { ...stop, ...updates } : stop))
    );
  }, []);

  const addStop = useCallback(() => {
    // Find the middle position between existing stops
    const sortedStops = [...localStops].sort((a, b) => a.position - b.position);
    let newPosition = 50;

    if (sortedStops.length >= 2) {
      // Find the largest gap and add in the middle
      let maxGap = 0;
      let gapStart = 0;

      for (let i = 0; i < sortedStops.length - 1; i++) {
        const gap = sortedStops[i + 1].position - sortedStops[i].position;
        if (gap > maxGap) {
          maxGap = gap;
          gapStart = i;
        }
      }

      newPosition = sortedStops[gapStart].position + maxGap / 2;
    }

    // Generate a random color for the new stop
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

    setLocalStops((prev) => [
      ...prev,
      { color: randomColor, position: newPosition },
    ]);
  }, [localStops]);

  const removeStop = useCallback((index: number) => {
    if (localStops.length <= 2) {
      // Don't allow removing if only 2 stops
      return;
    }
    setLocalStops((prev) => prev.filter((_, i) => i !== index));
  }, [localStops]);

  const updateAngle = useCallback((angle: number) => {
    setLocalAngle(angle);
  }, []);

  const updateType = useCallback((type: GradientType) => {
    setLocalType(type);
  }, []);

  const resetEdit = useCallback(() => {
    if (editingGradient) {
      setLocalStops([...editingGradient.stops]);
      setLocalAngle(editingGradient.angle ?? 135);
      setLocalType(editingGradient.type);
    }
  }, [editingGradient]);

  const cancelEdit = useCallback(() => {
    setEditingGradient(null);
    setLocalStops([]);
    setLocalAngle(135);
    setLocalType('linear');
  }, []);

  const applyChanges = useCallback(() => {
    if (!editingGradient) return null;

    return {
      stops: localStops,
      angle: localAngle,
      type: localType,
      css: previewCss,
    };
  }, [editingGradient, localStops, localAngle, localType, previewCss]);

  return {
    editingGradient,
    localStops,
    localAngle,
    localType,
    previewCss,
    startEdit,
    updateStop,
    addStop,
    removeStop,
    updateAngle,
    updateType,
    resetEdit,
    cancelEdit,
    applyChanges,
  };
}
