/**
 * Gradient Text Store Actions
 */

import type { StateCreator } from 'zustand';
import type { GradientTextStore, GradientTextActions } from './types';
import type { ColorStop } from '@/app/(tools)/gradient-text/types';
import type { ColorStop as SharedColorStop } from '@/components/shared/color-stop';
import { createColorStop, generateCSS } from '@/app/(tools)/gradient-text/utils';
import { gradientTextInitialState } from './initialState';
import { getPresetByName } from '@/app/(tools)/gradient-text/presets';

export const createGradientTextActions: StateCreator<
  GradientTextStore,
  [],
  [],
  GradientTextActions
> = (set, get) => ({
  // Config updates
  updateConfig: (partial) => {
    set((state) => ({ config: { ...state.config, ...partial } }));
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
      const stops = config.colorStops;
      if (stops.length < 2) return 50;
      const lastStop = stops[stops.length - 1];
      return Math.max(lastStop.position - 25, 50);
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
        ...state.config,
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

  // Gradient type
  setGradientType: (type) => {
    get().updateConfig({ gradientType: type });
  },

  // UI toggles
  setExportDialogOpen: (open) => {
    set({ exportDialogOpen: open });
  },

  // Reset
  reset: () => {
    set(gradientTextInitialState);
  },
});
