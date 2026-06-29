/**
 * Chart Editor Store Actions
 */

import type { StateCreator } from 'zustand';
import type { ChartEditorStore, ChartEditorActions } from './types';
import type { ChartEditorSeries } from '@/app/(tools)/chartEditor/types';
import { createDefaultSeries, createDefaultConfig } from '@/app/(tools)/chartEditor/utils';
import { chartEditorInitialState } from './initialState';

export const createChartEditorActions: StateCreator<ChartEditorStore, [], [], ChartEditorActions> = (set, get) => ({
  updateConfig: (partial) => {
    set((state) => ({ config: { ...state.config, ...partial } }));
  },

  addSeries: () => {
    const { config } = get();
    const newIndex = config.series.length;
    const newSeries = createDefaultSeries(newIndex);
    set({
      config: { ...config, series: [...config.series, newSeries] },
      selectedSeriesId: newSeries.id,
    });
  },

  removeSeries: (id) => {
    const { config, selectedSeriesId } = get();
    if (config.series.length <= 1) return;
    const newSeries = config.series.filter((s) => s.id !== id);
    set({
      config: { ...config, series: newSeries },
      selectedSeriesId: selectedSeriesId === id ? (newSeries[0]?.id ?? null) : selectedSeriesId,
    });
  },

  updateSeries: (id, updates) => {
    set((state) => ({
      config: {
        ...state.config,
        series: state.config.series.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      },
    }));
  },

  updateSeriesData: (id, dataIndex, value) => {
    set((state) => ({
      config: {
        ...state.config,
        series: state.config.series.map((s) => {
          if (s.id !== id) return s;
          const data = [...s.data];
          data[dataIndex] = value;
          return { ...s, data };
        }),
      },
    }));
  },

  addDataPoint: (seriesId) => {
    set((state) => ({
      config: {
        ...state.config,
        series: state.config.series.map((s) => {
          if (s.id !== seriesId) return s;
          const lastValue = s.data[s.data.length - 1] ?? 100;
          return { ...s, data: [...s.data, Math.round(lastValue * (0.8 + Math.random() * 0.4))] };
        }),
        xAxis: {
          ...state.config.xAxis,
          categories: [...state.config.xAxis.categories, `Item ${state.config.xAxis.categories.length + 1}`],
        },
      },
    }));
  },

  removeDataPoint: (seriesId, dataIndex) => {
    set((state) => ({
      config: {
        ...state.config,
        series: state.config.series.map((s) => {
          if (s.id !== seriesId) return s;
          const data = [...s.data];
          data.splice(dataIndex, 1);
          return { ...s, data };
        }),
        xAxis: {
          ...state.config.xAxis,
          categories: state.config.xAxis.categories.filter((_, i) => i !== dataIndex),
        },
      },
    }));
  },

  selectSeries: (id) => {
    set({ selectedSeriesId: id });
  },

  applyPreset: (preset) => {
    const baseConfig = createDefaultConfig();
    set({ config: { ...baseConfig, ...preset }, selectedSeriesId: null });
  },

  reset: () => {
    set(chartEditorInitialState);
  },

  setExportDialogOpen: (open) => {
    set({ exportDialogOpen: open });
  },

  setCopied: (copied) => {
    set({ copied });
  },
});
