/**
 * Poster Card Editor - Asset Store
 *
 * Based on: 10-asset-system.md
 * Independent Zustand store for managing assets (images, fonts, shapes, templates, style tokens).
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type {
  Asset,
  AssetType,
  AssetRuntimeState,
} from './types';

// ═══════════════════════════════════════
// Store Types
// ═══════════════════════════════════════

export interface AssetStoreState {
  assets: Record<string, Asset>;
  assetIdsByType: Record<AssetType, string[]>;
  assetRuntime: Record<string, AssetRuntimeState>;
  loadedFonts: string[];
  searchQuery: string;
  filterTags: string[];
  filterCategory: string | null;
}

export interface AssetStoreActions {
  addAsset: (asset: Asset) => string;
  addAssets: (assets: Asset[]) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  getAsset: (id: string) => Asset | undefined;
  getAssetsByType: (type: AssetType) => Asset[];
  searchAssets: (query: string, type?: AssetType) => Asset[];
  loadFont: (assetId: string) => Promise<void>;
  ensureFontLoaded: (fontAssetId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterTags: (tags: string[]) => void;
  setFilterCategory: (category: string | null) => void;
  setRuntimeStatus: (id: string, status: AssetRuntimeState) => void;
  markFontLoaded: (fontFamily: string) => void;
}

export type AssetStoreApi = AssetStoreState & AssetStoreActions;

// ═══════════════════════════════════════
// Store Implementation
// ═══════════════════════════════════════

export const useAssetStore = create<AssetStoreApi>()(
  devtools(
    immer((set, get) => ({
      // ── State ──
      assets: {} as Record<string, Asset>,
      assetIdsByType: {
        image: [],
        font: [],
        shape: [],
        template: [],
        'style-token': [],
      } as Record<AssetType, string[]>,
      assetRuntime: {} as Record<string, AssetRuntimeState>,
      loadedFonts: [] as string[],
      searchQuery: '',
      filterTags: [] as string[],
      filterCategory: null as string | null,

      // ── Actions ──

      addAsset: (asset: Asset) => {
        const id = asset.id || nanoid(10);
        set((state) => {
          const newAsset = { ...asset, id } as Asset;
          state.assets[id] = newAsset;
          if (!state.assetIdsByType[newAsset.type]) {
            state.assetIdsByType[newAsset.type] = [];
          }
          state.assetIdsByType[newAsset.type].push(id);
          state.assetRuntime[id] = { status: 'idle', retryCount: 0 };
        });
        return id;
      },

      addAssets: (assets: Asset[]) => {
        set((state) => {
          for (const asset of assets) {
            const id = asset.id || nanoid(10);
            const newAsset = { ...asset, id } as Asset;
            state.assets[id] = newAsset;
            if (!state.assetIdsByType[newAsset.type]) {
              state.assetIdsByType[newAsset.type] = [];
            }
            state.assetIdsByType[newAsset.type].push(id);
            state.assetRuntime[id] = { status: 'idle', retryCount: 0 };
          }
        });
      },

      removeAsset: (id: string) => {
        set((state) => {
          const asset = state.assets[id];
          if (!asset) return;
          delete state.assets[id];
          delete state.assetRuntime[id];
          const typeList = state.assetIdsByType[asset.type];
          if (typeList) {
            const idx = typeList.indexOf(id);
            if (idx !== -1) typeList.splice(idx, 1);
          }
        });
      },

      updateAsset: (id: string, updates: Partial<Asset>) => {
        set((state) => {
          const asset = state.assets[id];
          if (!asset) return;
          Object.assign(asset, updates, { updatedAt: Date.now() });
        });
      },

      getAsset: (id: string) => {
        return get().assets[id];
      },

      getAssetsByType: (type: AssetType) => {
        const state = get();
        return state.assetIdsByType[type]
          ?.map((id) => state.assets[id])
          .filter(Boolean) ?? [];
      },

      searchAssets: (query: string, type?: AssetType) => {
        const state = get();
        const q = query.toLowerCase();
        let assets = type
          ? state.getAssetsByType(type)
          : Object.values(state.assets);

        if (!q) return assets;

        return assets.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q)),
        );
      },

      loadFont: async (assetId: string) => {
        const state = get();
        const asset = state.assets[assetId];
        if (!asset || asset.type !== 'font') return;

        const fontAsset = asset;
        if (state.loadedFonts.includes(fontAsset.fontFamily)) return;

        set((s) => {
          s.assetRuntime[assetId] = { status: 'loading', retryCount: s.assetRuntime[assetId]?.retryCount ?? 0 };
        });

        try {
          if (fontAsset.fontUrl) {
            const font = new FontFace(fontAsset.fontFamily, `url(${fontAsset.fontUrl})`);
            await font.load();
            document.fonts.add(font);
          }
          set((s) => {
            if (!s.loadedFonts.includes(fontAsset.fontFamily)) s.loadedFonts.push(fontAsset.fontFamily);
            s.assetRuntime[assetId] = { status: 'loaded', retryCount: 0 };
          });
        } catch (err) {
          set((s) => {
            const retryCount = (s.assetRuntime[assetId]?.retryCount ?? 0) + 1;
            s.assetRuntime[assetId] = {
              status: 'error',
              error: err instanceof Error ? err.message : 'Font load failed',
              retryCount,
              lastAttemptAt: Date.now(),
            };
          });
        }
      },

      ensureFontLoaded: async (fontAssetId: string) => {
        const state = get();
        const runtime = state.assetRuntime[fontAssetId];
        if (runtime?.status === 'loaded' || runtime?.status === 'loading') return;
        await state.loadFont(fontAssetId);
      },

      setSearchQuery: (query: string) => {
        set((state) => { state.searchQuery = query; });
      },

      setFilterTags: (tags: string[]) => {
        set((state) => { state.filterTags = tags; });
      },

      setFilterCategory: (category: string | null) => {
        set((state) => { state.filterCategory = category; });
      },

      setRuntimeStatus: (id: string, status: AssetRuntimeState) => {
        set((state) => { state.assetRuntime[id] = status; });
      },

      markFontLoaded: (fontFamily: string) => {
        set((state) => { if (!state.loadedFonts.includes(fontFamily)) state.loadedFonts.push(fontFamily); });
      },
    })),
    { name: 'poster-asset-store', enabled: process.env.NODE_ENV === 'development' },
  ),
);
