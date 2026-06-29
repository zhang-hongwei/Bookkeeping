/**
 * Palette Workspace Store
 * API-backed Zustand store for managing palettes with versioning
 */

import { create } from 'zustand';
import type {
  DbPalette,
  DbPaletteVersion,
  CreatePaletteInput,
  UpdatePaletteInput,
  ListPalettesFilters,
  PaletteCategory,
} from '@/types/palette';

// ==================== Types ====================

interface PaletteWorkspaceState {
  // Palette list
  palettes: DbPalette[];
  loading: boolean;
  error: string | null;

  // Filters
  filters: ListPalettesFilters;

  // Comparison
  compareIds: string[];
  comparePalettes: DbPalette[];

  // Version viewer
  selectedPaletteId: string | null;
  versions: DbPaletteVersion[];
  versionsLoading: boolean;
}

interface PaletteWorkspaceActions {
  // Palette CRUD
  fetchPalettes: (filters?: Partial<ListPalettesFilters>) => Promise<void>;
  createPalette: (data: CreatePaletteInput) => Promise<DbPalette | null>;
  updatePalette: (id: string, data: UpdatePaletteInput) => Promise<DbPalette | null>;
  deletePalette: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<void>;

  // Versions
  fetchVersions: (paletteId: string) => Promise<void>;
  restoreVersion: (paletteId: string, versionNumber: number) => Promise<boolean>;

  // Comparison
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  fetchCompareData: () => Promise<void>;

  // Filters
  setFilters: (filters: Partial<ListPalettesFilters>) => void;
  setCategoryFilter: (category: PaletteCategory | undefined) => void;

  // Utility
  clearError: () => void;
}

// ==================== API Helpers ====================

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const json = await res.json();
    if (json.success) return json.data as T;
    return null;
  } catch {
    return null;
  }
}

// ==================== Store ====================

export const usePaletteWorkspaceStore = create<PaletteWorkspaceState & PaletteWorkspaceActions>(
  (set, get) => ({
    // Initial state
    palettes: [],
    loading: false,
    error: null,
    filters: { sortBy: 'updated', limit: 50, offset: 0 },
    compareIds: [],
    comparePalettes: [],
    selectedPaletteId: null,
    versions: [],
    versionsLoading: false,

    // ==================== CRUD ====================

    fetchPalettes: async (filters?: Partial<ListPalettesFilters>) => {
      set({ loading: true, error: null });
      try {
        const mergedFilters = { ...get().filters, ...filters };
        set({ filters: mergedFilters });

        const params = new URLSearchParams();
        if (mergedFilters.category) params.set('category', mergedFilters.category);
        if (mergedFilters.favorite !== undefined)
          params.set('favorite', String(mergedFilters.favorite));
        if (mergedFilters.search) params.set('search', mergedFilters.search);
        if (mergedFilters.sortBy) params.set('sortBy', mergedFilters.sortBy);
        if (mergedFilters.limit) params.set('limit', String(mergedFilters.limit));
        if (mergedFilters.offset) params.set('offset', String(mergedFilters.offset));

        const res = await fetch(`/api/palettes?${params.toString()}`);
        const json = await res.json();

        if (json.success) {
          set({ palettes: json.data, loading: false });
        } else {
          set({ error: json.error, loading: false });
        }
      } catch (error) {
        set({ error: 'Failed to fetch palettes', loading: false });
      }
    },

    createPalette: async (data: CreatePaletteInput) => {
      try {
        const res = await fetch('/api/palettes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (json.success) {
          set((state) => ({ palettes: [json.data, ...state.palettes] }));
          return json.data as DbPalette;
        }
        set({ error: json.error });
        return null;
      } catch {
        set({ error: 'Failed to create palette' });
        return null;
      }
    },

    updatePalette: async (id: string, data: UpdatePaletteInput) => {
      try {
        const res = await fetch(`/api/palettes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (json.success) {
          set((state) => ({
            palettes: state.palettes.map((p) => (p.id === id ? json.data : p)),
          }));
          return json.data as DbPalette;
        }
        set({ error: json.error });
        return null;
      } catch {
        set({ error: 'Failed to update palette' });
        return null;
      }
    },

    deletePalette: async (id: string) => {
      try {
        const res = await fetch(`/api/palettes/${id}`, { method: 'DELETE' });
        const json = await res.json();

        if (json.success) {
          set((state) => ({
            palettes: state.palettes.filter((p) => p.id !== id),
            compareIds: state.compareIds.filter((cid) => cid !== id),
          }));
          return true;
        }
        set({ error: json.error });
        return false;
      } catch {
        set({ error: 'Failed to delete palette' });
        return false;
      }
    },

    toggleFavorite: async (id: string) => {
      try {
        const res = await fetch(`/api/palettes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favorite: null }), // signal to toggle
        });
        // Use the dedicated toggle endpoint via direct service call pattern
        // Actually, let's just toggle locally and send the opposite value
        const palette = get().palettes.find((p) => p.id === id);
        if (!palette) return;

        const newFav = !palette.favorite;
        const res2 = await fetch(`/api/palettes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favorite: newFav }),
        });
        const json = await res2.json();

        if (json.success) {
          set((state) => ({
            palettes: state.palettes.map((p) => (p.id === id ? json.data : p)),
          }));
        }
      } catch {
        set({ error: 'Failed to toggle favorite' });
      }
    },

    // ==================== Versions ====================

    fetchVersions: async (paletteId: string) => {
      set({ versionsLoading: true, selectedPaletteId: paletteId });
      try {
        const data = await apiFetch<DbPaletteVersion[]>(
          `/api/palettes/${paletteId}/versions`
        );
        set({ versions: data ?? [], versionsLoading: false });
      } catch {
        set({ versions: [], versionsLoading: false });
      }
    },

    restoreVersion: async (paletteId: string, versionNumber: number) => {
      try {
        const res = await fetch(
          `/api/palettes/${paletteId}/restore?version=${versionNumber}`,
          { method: 'POST' }
        );
        const json = await res.json();

        if (json.success) {
          set((state) => ({
            palettes: state.palettes.map((p) =>
              p.id === paletteId ? json.data : p
            ),
          }));
          // Refresh versions list
          get().fetchVersions(paletteId);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },

    // ==================== Comparison ====================

    addToCompare: (id: string) => {
      const { compareIds } = get();
      if (compareIds.length >= 3 || compareIds.includes(id)) return;
      set({ compareIds: [...compareIds, id] });
    },

    removeFromCompare: (id: string) => {
      set((state) => ({
        compareIds: state.compareIds.filter((cid) => cid !== id),
        comparePalettes: state.comparePalettes.filter((p) => p.id !== id),
      }));
    },

    clearCompare: () => set({ compareIds: [], comparePalettes: [] }),

    fetchCompareData: async () => {
      const { compareIds } = get();
      const results: DbPalette[] = [];

      for (const id of compareIds) {
        const data = await apiFetch<DbPalette>(`/api/palettes/${id}`);
        if (data) results.push(data);
      }

      set({ comparePalettes: results });
    },

    // ==================== Filters ====================

    setFilters: (filters: Partial<ListPalettesFilters>) => {
      set((state) => ({ filters: { ...state.filters, ...filters } }));
      get().fetchPalettes(filters);
    },

    setCategoryFilter: (category: PaletteCategory | undefined) => {
      get().setFilters({ category, offset: 0 });
    },

    // ==================== Utility ====================

    clearError: () => set({ error: null }),
  })
);
