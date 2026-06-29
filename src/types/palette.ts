/**
 * Shared Palette Types
 * Database/API-level types for the Palette Workspace feature.
 * Local UI types remain in colors/types.ts for backward compatibility.
 */

import type { DesignTokenTheme } from './ai';

// ==================== Palette Category ====================

export type PaletteCategory = 'brand' | 'project' | 'inspiration';

// ==================== Database Palette Record ====================

export interface DbPalette {
  id: string;
  name: string;
  description: string | null;
  category: PaletteCategory;
  tags: string[];
  favorite: boolean;
  sourceImageName: string | null;
  themeData: DesignTokenTheme;
  customColors: DbCustomColor[];
  pickedLocations: DbPickedLocation[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** Simplified color for DB storage (no circular location ref) */
export interface DbCustomColor {
  id: string;
  hex: string;
  name: string;
  source: 'extracted' | 'picked' | 'harmony' | 'manual';
  harmonyType?: string;
}

/** Simplified picked location for DB storage */
export interface DbPickedLocation {
  id: string;
  x: number;
  y: number;
  hex: string;
}

// ==================== Palette Version ====================

export interface DbPaletteVersion {
  id: string;
  paletteId: string;
  versionNumber: number;
  themeData: DesignTokenTheme;
  customColors: DbCustomColor[];
  pickedLocations: DbPickedLocation[];
  changeNote: string | null;
  createdAt: string;
}

// ==================== API Input Types ====================

export interface CreatePaletteInput {
  name: string;
  description?: string;
  category?: PaletteCategory;
  tags?: string[];
  favorite?: boolean;
  sourceImageName?: string;
  themeData: DesignTokenTheme;
  customColors?: DbCustomColor[];
  pickedLocations?: DbPickedLocation[];
}

export interface UpdatePaletteInput {
  name?: string;
  description?: string;
  category?: PaletteCategory;
  tags?: string[];
  favorite?: boolean;
  themeData?: DesignTokenTheme;
  customColors?: DbCustomColor[];
  pickedLocations?: DbPickedLocation[];
  changeNote?: string;
}

export interface ListPalettesFilters {
  category?: PaletteCategory;
  favorite?: boolean;
  search?: string;
  sortBy?: 'updated' | 'created' | 'name';
  limit?: number;
  offset?: number;
}

// ==================== Service Response ====================

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}
