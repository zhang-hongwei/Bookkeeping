/**
 * Gradient Border Store Actions
 */

import type { StateCreator } from 'zustand';
import type { GradientBorderStore, GradientBorderActions } from './types';
import type { ColorStop, GradientBorderConfig } from '@/app/(tools)/gradient-border/types';
import type { ColorStop as SharedColorStop } from '@/components/shared/color-stop';
import { createColorStop, generateCSS } from '@/app/(tools)/gradient-border/utils';
import { gradientBorderInitialState } from './initialState';
import { getPresetByName } from '@/app/(tools)/gradient-border/presets';

export const createGradientBorderActions: StateCreator<
  GradientBorderStore,
  [],
  [],
  GradientBorderActions
> = (set, get) => ({
  // Config updates
  updateConfig: (partial) => {
    set((state) => ({ config: { ...state.config, ...partial } }));
  },

  updateBorderImageOption: (field, value) => {
    set((state) => ({
      config: {
        ...state.config,
        borderImageOptions: { ...state.config.borderImageOptions, [field]: value },
      },
    }));
  },

  updateColorStop: (id, field, value) => {
    set((state) => ({
      config: {
        ...state.config,
        colorStops: state.config.colorStops.map((s) =>
          s.id === id ? { ...s, [field]: value } : s,
        ),
      },
    }));
  },

  addColorStop: (position?: number) => {
    const { config } = get();
    const newPos = position ?? (() => {
      const lastStop = config.colorStops[config.colorStops.length - 1];
      return lastStop ? Math.max(lastStop.position - 25, 50) : 50;
    })();
    set({
      config: {
        ...config,
        colorStops: [...config.colorStops, createColorStop('#a855f7', newPos)],
      },
    });
  },

  removeColorStop: (id) => {
    const { config } = get();
    if (config.colorStops.length <= 2) return;
    set((state) => ({
      config: {
        ...config,
        colorStops: config.colorStops.filter((s) => s.id !== id),
      },
      selectedStopId: state.selectedStopId === id ? null : state.selectedStopId,
    }));
  },

  moveColorStop: (id, position) => {
    set((state) => ({
      config: {
        ...state.config,
        colorStops: state.config.colorStops.map((s) =>
          s.id === id ? { ...s, position: Math.max(0, Math.min(100, position)) } : s,
        ),
      },
    }));
  },

  duplicateColorStop: (id) => {
    const { config } = get();
    const target = config.colorStops.find((s) => s.id === id);
    if (!target) return;
    const newStop: ColorStop = {
      ...target,
      id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      position: Math.min(target.position + 5, 100),
    };
    set({
      config: { ...config, colorStops: [...config.colorStops, newStop] },
    });
  },

  selectColorStop: (id) => {
    set({ selectedStopId: id });
  },

  updateColorStopPartial: (id, updates) => {
    set((state) => ({
      config: {
        ...state.config,
        colorStops: state.config.colorStops.map((s) =>
          s.id === id ? { ...s, ...updates } : s,
        ),
      },
    }));
  },

  // Inner background stops
  addInnerBgStop: (position?: number) => {
    const { config } = get();
    const stops = config.innerBgStops;
    const newPos = position ?? Math.round(stops.reduce((sum, s) => sum + s.position, 0) / stops.length);
    set({
      config: {
        ...config,
        innerBgStops: [...stops, createColorStop('#ffffff', newPos)],
      },
    });
  },

  removeInnerBgStop: (id) => {
    const { config } = get();
    if (config.innerBgStops.length <= 1) return;
    set((state) => ({
      config: {
        ...config,
        innerBgStops: config.innerBgStops.filter((s) => s.id !== id),
      },
      innerBgSelectedStopId: state.innerBgSelectedStopId === id ? null : state.innerBgSelectedStopId,
    }));
  },

  moveInnerBgStop: (id, position) => {
    set((state) => ({
      config: {
        ...state.config,
        innerBgStops: state.config.innerBgStops.map((s) =>
          s.id === id ? { ...s, position: Math.max(0, Math.min(100, position)) } : s,
        ),
      },
    }));
  },

  duplicateInnerBgStop: (id) => {
    const { config } = get();
    const target = config.innerBgStops.find((s) => s.id === id);
    if (!target) return;
    set({
      config: {
        ...config,
        innerBgStops: [...config.innerBgStops, {
          ...target,
          id: `ib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          position: Math.min(target.position + 5, 100),
        }],
      },
    });
  },

  selectInnerBgStop: (id) => {
    set({ innerBgSelectedStopId: id });
  },

  updateInnerBgStopPartial: (id, updates) => {
    set((state) => ({
      config: {
        ...state.config,
        innerBgStops: state.config.innerBgStops.map((s) =>
          s.id === id ? { ...s, ...updates } : s,
        ),
      },
    }));
  },

  // Preset & copy
  applyPreset: (name) => {
    const preset = getPresetByName(name);
    if (preset) {
      set((state) => ({ config: { ...state.config, ...preset.config } }));
    }
  },

  copyCSS: async () => {
    await navigator.clipboard.writeText(generateCSS(get().config));
    set({ copied: true });
    setTimeout(() => set({ copied: false }), 2000);
  },

  // Toggle handlers
  setGradientType: (type) => {
    get().updateConfig({ gradientType: type });
  },

  setImplementation: (impl) => {
    get().updateConfig({ implementation: impl });
  },

  // File upload
  handleFileUpload: (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { objectUrl, config } = get();
    if (objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
    const url = URL.createObjectURL(file);
    set({
      objectUrl: url,
      config: {
        ...config,
        borderImageOptions: { ...config.borderImageOptions, sourceMode: 'image', imageUrl: url },
      },
    });
    e.target.value = '';
  },

  setImageUrl: (url) => {
    const { objectUrl, config } = get();
    if (objectUrl && !url.startsWith('blob:')) {
      if (objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
      set({ objectUrl: '' });
    }
    set({
      config: {
        ...config,
        borderImageOptions: { ...config.borderImageOptions, imageUrl: url },
      },
    });
  },

  // UI toggles
  setExportDialogOpen: (open) => {
    set({ exportDialogOpen: open });
  },

  toggleBorderImageOptions: () => {
    set((state) => ({ showBorderImageOptions: !state.showBorderImageOptions }));
  },

  // Reset
  reset: () => {
    const { objectUrl } = get();
    if (objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
    set(gradientBorderInitialState);
  },
});
