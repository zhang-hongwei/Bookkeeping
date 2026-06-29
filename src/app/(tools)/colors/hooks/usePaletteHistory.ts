/**
 * usePaletteHistory Hook
 * Manage palette history with local storage
 */

import { useState, useEffect, useCallback } from 'react';
import type { SavedPalette } from '../types';
import {
  loadPalettes,
  savePalette,
  deletePalette as deletePaletteFromStorage,
  toggleFavorite as toggleFavoriteInStorage,
  exportPalettesAsJSON,
  importPalettesFromJSON,
  downloadPaletteAsJSON,
} from '../utils/paletteStorage';

interface UsePaletteHistoryReturn {
  palettes: SavedPalette[];
  favorites: SavedPalette[];
  recent: SavedPalette[];
  loaded: boolean;
  save: (palette: Omit<SavedPalette, 'id' | 'createdAt' | 'updatedAt'>) => SavedPalette;
  del: (id: string) => void;
  toggleFavorite: (id: string) => void;
  load: (palette: SavedPalette) => void;
  exportJSON: (palettes: SavedPalette[]) => string;
  importJSON: (json: string) => SavedPalette[];
  download: (palette: SavedPalette) => void;
  refresh: () => void;
}

export function usePaletteHistory(): UsePaletteHistoryReturn {
  const [palettes, setPalettes] = useState<SavedPalette[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load palettes on mount
  useEffect(() => {
    const loadedPalettes = loadPalettes();
    setPalettes(loadedPalettes);
    setLoaded(true);
  }, []);

  // Save a new palette
  const save = useCallback((paletteData: Omit<SavedPalette, 'id' | 'createdAt' | 'updatedAt'>): SavedPalette => {
    const now = new Date().toISOString();
    const palette: SavedPalette = {
      ...paletteData,
      id: `palette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    savePalette(palette);
    setPalettes((prev) => [palette, ...prev]);

    return palette;
  }, []);

  // Delete a palette
  const del = useCallback((id: string) => {
    deletePaletteFromStorage(id);
    setPalettes((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    toggleFavoriteInStorage(id);
    setPalettes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))
    );
  }, []);

  // Load a palette (just return it, parent handles state)
  const load = useCallback((palette: SavedPalette) => {
    // Parent component will handle loading the palette data
    console.log('Loading palette:', palette.name);
  }, []);

  // Export to JSON
  const exportJSON = useCallback((paletteList: SavedPalette[]): string => {
    return exportPalettesAsJSON(paletteList);
  }, []);

  // Import from JSON
  const importJSON = useCallback((json: string): SavedPalette[] => {
    const imported = importPalettesFromJSON(json);
    // Add imported palettes to state
    setPalettes((prev) => [...imported, ...prev]);
    return imported;
  }, []);

  // Download as file
  const download = useCallback((palette: SavedPalette) => {
    downloadPaletteAsJSON(palette);
  }, []);

  // Refresh from storage
  const refresh = useCallback(() => {
    const loadedPalettes = loadPalettes();
    setPalettes(loadedPalettes);
  }, []);

  // Get favorites
  const favorites = palettes.filter((p) => p.favorite);

  // Get recent (sorted by updated date)
  const recent = [...palettes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return {
    palettes,
    favorites,
    recent,
    loaded,
    save,
    del,
    toggleFavorite,
    load,
    exportJSON,
    importJSON,
    download,
    refresh,
  };
}
