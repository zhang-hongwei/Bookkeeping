/**
 * SVG Generator Store - Zustand state management
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  GeneratorType,
  GeneratorConfig,
} from '../types';
import { getGenerator, DEFAULT_CONFIG } from '../generators/BaseGenerator';
import { randomSeed } from '../lib/algorithms/random';

// Import all generators to ensure they are registered
import '../generators';

// =============================================================================
// Store Implementation
// =============================================================================

interface StoreState {
  generatorType: GeneratorType;
  config: GeneratorConfig;
  history: GeneratorConfig[];
  historyIndex: number;
  generatedSvg: string;
}

interface StoreActions {
  setGeneratorType: (type: GeneratorType) => void;
  updateConfig: (updates: Partial<GeneratorConfig>) => void;
  randomize: () => void;
  resetToDefaults: () => void;
  undo: () => void;
  redo: () => void;
  exportSvg: () => string;
  exportPng: (scale?: number) => Promise<Blob>;
  _generateSvg: () => string;
}

const initialState: StoreState = {
  generatorType: 'blob',
  config: {
    ...DEFAULT_CONFIG,
    // Blob-specific defaults
    complexity: 8,
    contrast: 50,
    balance: 50,
  } as GeneratorConfig,
  history: [],
  historyIndex: -1,
  generatedSvg: '',
};

export const useSvgGeneratorStore = create<StoreState & StoreActions>()(
  immer((set, get) => ({
    ...initialState,

    setGeneratorType: (type: GeneratorType) => {
      const generator = getGenerator(type);
      if (!generator) return;

      set((state) => {
        state.generatorType = type;
        // Reset to generator's default config
        state.config = generator.mergeConfig({}) as GeneratorConfig;
        state.history = [];
        state.historyIndex = -1;
        state.generatedSvg = generator.generate(state.config);
      });
    },

    updateConfig: (updates: Partial<GeneratorConfig>) => {
      set((state) => {
        // Save current state to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({ ...state.config });
        state.historyIndex = state.history.length - 1;

        // Apply updates
        Object.assign(state.config, updates);

        // Regenerate SVG
        const generator = getGenerator(state.generatorType);
        if (generator) {
          state.generatedSvg = generator.generate(state.config);
        }
      });
    },

    randomize: () => {
      set((state) => {
        // Save current state to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({ ...state.config });
        state.historyIndex = state.history.length - 1;

        // New random seed
        state.config.seed = randomSeed();

        // Regenerate SVG
        const generator = getGenerator(state.generatorType);
        if (generator) {
          state.generatedSvg = generator.generate(state.config);
        }
      });
    },

    resetToDefaults: () => {
      set((state) => {
        const generator = getGenerator(state.generatorType);
        if (generator) {
          state.config = generator.mergeConfig({}) as GeneratorConfig;
          state.generatedSvg = generator.generate(state.config);
        }
        state.history = [];
        state.historyIndex = -1;
      });
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--;
          state.config = { ...state.history[state.historyIndex] };

          const generator = getGenerator(state.generatorType);
          if (generator) {
            state.generatedSvg = generator.generate(state.config);
          }
        }
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          state.config = { ...state.history[state.historyIndex] };

          const generator = getGenerator(state.generatorType);
          if (generator) {
            state.generatedSvg = generator.generate(state.config);
          }
        }
      });
    },

    exportSvg: () => {
      return get().generatedSvg;
    },

    exportPng: async (scale: number = 2) => {
      const state = get();
      const svgString = state.generatedSvg;
      const { width, height } = state.config.canvas;

      return new Promise<Blob>((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not convert canvas to blob'));
            }
          }, 'image/png');
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Could not load SVG'));
        };

        img.src = url;
      });
    },

    _generateSvg: () => {
      const state = get();
      const generator = getGenerator(state.generatorType);
      if (!generator) return '';
      return generator.generate(state.config);
    },
  }))
);

// =============================================================================
// Selector Hooks
// =============================================================================

export const useGeneratorType = () => useSvgGeneratorStore((s) => s.generatorType);
export const useGeneratorConfig = () => useSvgGeneratorStore((s) => s.config);
export const useGeneratedSvg = () => useSvgGeneratorStore((s) => s.generatedSvg);
export const useCanUndo = () => useSvgGeneratorStore((s) => s.historyIndex > 0);
export const useCanRedo = () => useSvgGeneratorStore((s) => s.historyIndex < s.history.length - 1);
