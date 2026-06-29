/**
 * useShadowLayers Hook
 * Manage all operations logic for shadow layers
 */

'use client';

import { useState, useCallback } from 'react';
import { ShadowLayer, ShadowPreset } from '../types';
import { createDefaultLayer, duplicateLayer, generateId } from '../utils';

export interface UseShadowLayersReturn {
  /** List of shadow layers */
  layers: ShadowLayer[];
  /** Currently selected layer ID */
  selectedLayerId: string | null;
  /** Add new layer */
  addLayer: () => void;
  /** Remove specified layer */
  removeLayer: (id: string) => void;
  /** Update specified layer */
  updateLayer: (id: string, updates: Partial<ShadowLayer>) => void;
  /** Duplicate specified layer */
  duplicateLayerById: (id: string) => void;
  /** Toggle layer enabled state */
  toggleLayerEnabled: (id: string) => void;
  /** Move layer position */
  moveLayer: (fromIndex: number, toIndex: number) => void;
  /** Select specified layer */
  selectLayer: (id: string | null) => void;
  /** Reset all layers */
  resetLayers: () => void;
  /** Apply preset */
  applyPreset: (preset: ShadowPreset) => void;
  /** Import from JSON */
  importFromJson: (json: string) => boolean;
}

/**
 * Shadow layer management Hook
 */
export function useShadowLayers(): UseShadowLayersReturn {
  // Initialize with one default layer
  const [layers, setLayers] = useState<ShadowLayer[]>([createDefaultLayer()]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  /**
   * Add new layer
   */
  const addLayer = useCallback(() => {
    const newLayer = createDefaultLayer();
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, []);

  /**
   * Remove specified layer
   */
  const removeLayer = useCallback((id: string) => {
    setLayers(prev => {
      const filtered = prev.filter(layer => layer.id !== id);
      // Keep at least one layer
      return filtered.length > 0 ? filtered : [createDefaultLayer()];
    });
    setSelectedLayerId(null);
  }, []);

  /**
   * Update specified layer
   */
  const updateLayer = useCallback((id: string, updates: Partial<ShadowLayer>) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id ? { ...layer, ...updates } : layer
      )
    );
  }, []);

  /**
   * Duplicate specified layer
   */
  const duplicateLayerById = useCallback((id: string) => {
    setLayers(prev => {
      const targetLayer = prev.find(layer => layer.id === id);
      if (!targetLayer) return prev;

      const newLayer = duplicateLayer(targetLayer);
      const targetIndex = prev.findIndex(layer => layer.id === id);

      // Insert new layer after target layer
      const newLayers = [...prev];
      newLayers.splice(targetIndex + 1, 0, newLayer);
      return newLayers;
    });
  }, []);

  /**
   * Toggle layer enabled state
   */
  const toggleLayerEnabled = useCallback((id: string) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id ? { ...layer, enabled: !layer.enabled } : layer
      )
    );
  }, []);

  /**
   * Move layer position (drag to reorder)
   */
  const moveLayer = useCallback((fromIndex: number, toIndex: number) => {
    setLayers(prev => {
      const newLayers = [...prev];
      const [movedLayer] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, movedLayer);
      return newLayers;
    });
  }, []);

  /**
   * Select specified layer
   */
  const selectLayer = useCallback((id: string | null) => {
    setSelectedLayerId(id);
  }, []);

  /**
   * Reset all layers
   */
  const resetLayers = useCallback(() => {
    setLayers([createDefaultLayer()]);
    setSelectedLayerId(null);
  }, []);

  /**
   * Apply preset
   */
  const applyPreset = useCallback((preset: ShadowPreset) => {
    if (preset.layers.length === 0) {
      // Empty preset (no shadow)
      setLayers([createDefaultLayer()]);
      setSelectedLayerId(null);
      return;
    }

    const newLayers: ShadowLayer[] = preset.layers.map(layer => ({
      ...layer,
      id: generateId(),
      enabled: true,
    }));

    setLayers(newLayers);
    setSelectedLayerId(null);
  }, []);

  /**
   * Import configuration from JSON
   */
  const importFromJson = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);

      if (!Array.isArray(parsed)) {
        return false;
      }

      const importedLayers: ShadowLayer[] = parsed.map(layer => ({
        ...layer,
        id: generateId(),
        enabled: true,
      }));

      if (importedLayers.length === 0) {
        return false;
      }

      setLayers(importedLayers);
      setSelectedLayerId(null);
      return true;
    } catch (error) {
      console.error('Failed to import JSON:', error);
      return false;
    }
  }, []);

  return {
    layers,
    selectedLayerId,
    addLayer,
    removeLayer,
    updateLayer,
    duplicateLayerById,
    toggleLayerEnabled,
    moveLayer,
    selectLayer,
    resetLayers,
    applyPreset,
    importFromJson,
  };
}
