/**
 * Palette Storage Utilities
 * Manage saving, loading, and exporting color palettes to local storage
 */

import type { SavedPalette, PaletteStorageData, PaletteSettings } from '../types';

// ==================== Constants ====================

const STORAGE_KEY = 'color-extractor-palettes';
const STORAGE_VERSION = 1;
const MAX_PALETTES = 50;

const DEFAULT_SETTINGS: PaletteSettings = {
  defaultHarmonyType: 'complementary',
  defaultBlindnessType: null,
  autoSave: false,
};

// ==================== Storage Operations ====================

/**
 * Get all stored data
 */
function getStorageData(): PaletteStorageData {
  if (typeof window === 'undefined') {
    return { version: STORAGE_VERSION, palettes: [], settings: DEFAULT_SETTINGS };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { version: STORAGE_VERSION, palettes: [], settings: DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(data) as PaletteStorageData;

    // Handle version migration if needed
    if (parsed.version !== STORAGE_VERSION) {
      return migrateData(parsed);
    }

    return parsed;
  } catch {
    return { version: STORAGE_VERSION, palettes: [], settings: DEFAULT_SETTINGS };
  }
}

/**
 * Save data to storage
 */
function setStorageData(data: PaletteStorageData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save palettes to storage:', error);
  }
}

/**
 * Migrate data from older versions
 */
function migrateData(data: PaletteStorageData): PaletteStorageData {
  // Currently at version 1, no migration needed yet
  return {
    ...data,
    version: STORAGE_VERSION,
    settings: { ...DEFAULT_SETTINGS, ...data.settings },
  };
}

// ==================== Palette Operations ====================

/**
 * Load all saved palettes
 */
export function loadPalettes(): SavedPalette[] {
  const data = getStorageData();
  return data.palettes;
}

/**
 * Save a new palette
 */
export function savePalette(palette: SavedPalette): void {
  const data = getStorageData();

  // Check if palette with same ID exists
  const existingIndex = data.palettes.findIndex((p) => p.id === palette.id);

  if (existingIndex >= 0) {
    // Update existing palette
    data.palettes[existingIndex] = {
      ...palette,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Add new palette at the beginning
    data.palettes.unshift({
      ...palette,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Limit the number of saved palettes
    if (data.palettes.length > MAX_PALETTES) {
      data.palettes = data.palettes.slice(0, MAX_PALETTES);
    }
  }

  setStorageData(data);
}

/**
 * Delete a palette by ID
 */
export function deletePalette(id: string): void {
  const data = getStorageData();
  data.palettes = data.palettes.filter((p) => p.id !== id);
  setStorageData(data);
}

/**
 * Toggle favorite status of a palette
 */
export function toggleFavorite(id: string): void {
  const data = getStorageData();
  const palette = data.palettes.find((p) => p.id === id);
  if (palette) {
    palette.favorite = !palette.favorite;
    palette.updatedAt = new Date().toISOString();
    setStorageData(data);
  }
}

/**
 * Update palette name
 */
export function renamePalette(id: string, name: string): void {
  const data = getStorageData();
  const palette = data.palettes.find((p) => p.id === id);
  if (palette) {
    palette.name = name;
    palette.updatedAt = new Date().toISOString();
    setStorageData(data);
  }
}

/**
 * Get palette by ID
 */
export function getPalette(id: string): SavedPalette | undefined {
  const data = getStorageData();
  return data.palettes.find((p) => p.id === id);
}

/**
 * Get favorite palettes
 */
export function getFavoritePalettes(): SavedPalette[] {
  const data = getStorageData();
  return data.palettes.filter((p) => p.favorite);
}

/**
 * Get recent palettes (sorted by date)
 */
export function getRecentPalettes(limit = 10): SavedPalette[] {
  const data = getStorageData();
  return data.palettes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

// ==================== Settings Operations ====================

/**
 * Load settings
 */
export function loadSettings(): PaletteSettings {
  const data = getStorageData();
  return data.settings;
}

/**
 * Save settings
 */
export function saveSettings(settings: Partial<PaletteSettings>): void {
  const data = getStorageData();
  data.settings = { ...data.settings, ...settings };
  setStorageData(data);
}

// ==================== Export/Import ====================

/**
 * Export palettes as JSON string
 */
export function exportPalettesAsJSON(palettes: SavedPalette[]): string {
  return JSON.stringify(palettes, null, 2);
}

/**
 * Export single palette as JSON string
 */
export function exportPaletteAsJSON(palette: SavedPalette): string {
  return JSON.stringify(palette, null, 2);
}

/**
 * Import palettes from JSON string
 */
export function importPalettesFromJSON(json: string): SavedPalette[] {
  try {
    const data = JSON.parse(json);

    // Handle both single palette and array of palettes
    if (Array.isArray(data)) {
      return data.map(validatePalette);
    } else if (data.id && data.name && data.theme) {
      return [validatePalette(data)];
    }

    throw new Error('Invalid palette format');
  } catch (error) {
    console.error('Failed to import palettes:', error);
    return [];
  }
}

/**
 * Validate and normalize imported palette data
 */
function validatePalette(data: Record<string, unknown>): SavedPalette {
  const now = new Date().toISOString();

  return {
    id: (data.id as string) || generateId(),
    name: (data.name as string) || 'Imported Palette',
    theme: data.theme as SavedPalette['theme'],
    customColors: (data.customColors as SavedPalette['customColors']) || [],
    pickedLocations: (data.pickedLocations as SavedPalette['pickedLocations']) || [],
    createdAt: (data.createdAt as string) || now,
    updatedAt: (data.updatedAt as string) || now,
    tags: (data.tags as string[]) || [],
    favorite: (data.favorite as boolean) || false,
  };
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `palette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== Download Utilities ====================

/**
 * Download palette as JSON file
 */
export function downloadPaletteAsJSON(palette: SavedPalette): void {
  const json = exportPaletteAsJSON(palette);
  downloadFile(json, `${palette.name}.json`, 'application/json');
}

/**
 * Download multiple palettes as JSON file
 */
export function downloadPalettesAsJSON(palettes: SavedPalette[], filename = 'palettes'): void {
  const json = exportPalettesAsJSON(palettes);
  downloadFile(json, `${filename}.json`, 'application/json');
}

/**
 * Helper to download a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ==================== Clear Operations ====================

/**
 * Clear all palettes
 */
export function clearAllPalettes(): void {
  setStorageData({ version: STORAGE_VERSION, palettes: [], settings: DEFAULT_SETTINGS });
}

/**
 * Clear only non-favorite palettes
 */
export function clearNonFavoritePalettes(): void {
  const data = getStorageData();
  data.palettes = data.palettes.filter((p) => p.favorite);
  setStorageData(data);
}
