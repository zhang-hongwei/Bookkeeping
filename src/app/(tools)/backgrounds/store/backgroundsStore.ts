/**
 * Backgrounds Store - Zustand state management with Immer
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  BackgroundGeneratorType,
  BackgroundConfig,
  TrianglifyConfig,
  ParticlesConfig,
  TopographyConfig,
  UnsplashConfig,
  GradientConfig,
  CanvasSize,
  ColorPalette,
} from '../types';
import { DEFAULT_CANVAS, DEFAULT_COLORS } from '../generators/BaseBackgroundGenerator';
import { randomSeed } from '../lib/algorithms/random';

// =============================================================================
// Store Types
// =============================================================================

interface HistoryEntry {
  config: BackgroundConfig;
  timestamp: number;
}

interface StoreState {
  generatorType: BackgroundGeneratorType;
  config: BackgroundConfig;
  history: HistoryEntry[];
  historyIndex: number;
  generatedDataUrl: string;
  isLoading: boolean;
  error: string | null;
}

interface StoreActions {
  // Generator selection
  setGeneratorType: (type: BackgroundGeneratorType) => void;

  // Config updates
  updateConfig: (updates: Partial<BackgroundConfig>) => void;
  updateCanvas: (canvas: CanvasSize) => void;
  updateColors: (colors: Partial<ColorPalette>) => void;
  updatePalette: (palette: string[]) => void;

  // History
  undo: () => void;
  redo: () => void;

  // Actions
  randomize: () => void;
  resetToDefaults: () => void;
  applyPreset: (presetName: string) => void;

  // Export
  exportPng: (scale?: number) => Promise<Blob>;
  exportSvg: () => string | null;
  exportCss: () => string | null;

  // State setters
  setGeneratedDataUrl: (url: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Regeneration
  regenerate: (canvas: HTMLCanvasElement) => Promise<void>;
}

// =============================================================================
// Default Configurations
// =============================================================================

const getDefaultConfigForType = (type: BackgroundGeneratorType): BackgroundConfig => {
  const base = {
    canvas: DEFAULT_CANVAS,
    seed: randomSeed(),
    colors: DEFAULT_COLORS,
  };

  switch (type) {
    case 'gradient':
      return {
        ...base,
        type: 'linear',
        angle: 135,
        centerX: 50,
        centerY: 50,
        stops: [
          { color: '#667eea', position: 0 },
          { color: '#764ba2', position: 50 },
          { color: '#f093fb', position: 100 },
        ],
        smoothing: true,
      } as GradientConfig;

    case 'particles':
      return {
        ...base,
        count: 100,
        minSize: 2,
        maxSize: 15,
        opacity: 60,
        distribution: 'random',
        shape: 'circle',
        blur: 0,
      } as ParticlesConfig;

    case 'topography':
      return {
        ...base,
        layers: 8,
        amplitude: 50,
        frequency: 3,
        strokeWidth: 1.5,
        fillStyle: 'gradient',
        smoothness: 70,
        offset: 50,
      } as TopographyConfig;

    case 'trianglify':
      return {
        ...base,
        cellSize: 75,
        variance: 50,
        bleed: 0,
        strokeWidth: 0,
        strokeColor: '#000000',
        fillOpacity: 100,
      } as TrianglifyConfig;

    case 'unsplash':
      return {
        ...base,
        query: 'nature',
        orientation: 'landscape',
        overlay: false,
        overlayColor: '#000000',
        overlayOpacity: 30,
        blur: 0,
        brightness: 0,
      } as UnsplashConfig;

    case 'wave':
      return {
        ...base,
        layers: 3,
        amplitude: 50,
        frequency: 0.02,
        speed: 1,
        opacity: 0.8,
        direction: 'right',
        waveType: 'sine',
        gradient: true,
      } as any;

    default:
      return base;
  }
};

// =============================================================================
// Store Implementation
// =============================================================================

const initialState: StoreState = {
  generatorType: 'trianglify',
  config: getDefaultConfigForType('trianglify'),
  history: [],
  historyIndex: -1,
  generatedDataUrl: '',
  isLoading: false,
  error: null,
};

export const useBackgroundsStore = create<StoreState & StoreActions>()(
  immer((set, get) => ({
    ...initialState,

    setGeneratorType: (type: BackgroundGeneratorType) => {
      set((state) => {
        // Save current state to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          config: { ...state.config } as BackgroundConfig,
          timestamp: Date.now(),
        });
        state.historyIndex = state.history.length - 1;

        // Switch generator
        state.generatorType = type;
        state.config = getDefaultConfigForType(type);
        state.error = null;
      });
    },

    updateConfig: (updates: Partial<BackgroundConfig>) => {
      set((state) => {
        // Save to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          config: { ...state.config } as BackgroundConfig,
          timestamp: Date.now(),
        });
        state.historyIndex = state.history.length - 1;

        // Apply updates
        Object.assign(state.config, updates);
      });
    },

    updateCanvas: (canvas: CanvasSize) => {
      set((state) => {
        state.config.canvas = canvas;
      });
    },

    updateColors: (colors: Partial<ColorPalette>) => {
      set((state) => {
        state.config.colors = {
          ...state.config.colors,
          ...colors,
        };
      });
    },

    updatePalette: (palette: string[]) => {
      set((state) => {
        state.config.colors.palette = palette;
      });
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--;
          const entry = state.history[state.historyIndex];
          if (entry) {
            state.config = { ...entry.config } as BackgroundConfig;
          }
        }
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          const entry = state.history[state.historyIndex];
          if (entry) {
            state.config = { ...entry.config } as BackgroundConfig;
          }
        }
      });
    },

    randomize: () => {
      set((state) => {
        // Save to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          config: { ...state.config } as BackgroundConfig,
          timestamp: Date.now(),
        });
        state.historyIndex = state.history.length - 1;

        // New random seed
        state.config.seed = randomSeed();
      });
    },

    resetToDefaults: () => {
      set((state) => {
        state.config = getDefaultConfigForType(state.generatorType);
        state.history = [];
        state.historyIndex = -1;
      });
    },

    applyPreset: (presetName: string) => {
      // This will be implemented by looking up the preset in the generator
      set((state) => {
        state.config.seed = randomSeed();
      });
    },

    exportPng: async (scale: number = 1): Promise<Blob> => {
      const state = get();
      const { canvas } = state.config;
      const width = canvas.width * scale;
      const height = canvas.height * scale;

      return new Promise((resolve, reject) => {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = width;
        exportCanvas.height = height;
        const ctx = exportCanvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.scale(scale, scale);

        // Import generator dynamically to avoid circular deps
        import('../generators').then(({ getBackgroundGenerator }) => {
          const generator = getBackgroundGenerator(state.generatorType);
          if (!generator) {
            reject(new Error('Generator not found'));
            return;
          }

          const result = generator.generateCanvas(
            state.config as BackgroundConfig,
            exportCanvas
          );

          const finishExport = () => {
            exportCanvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Could not convert canvas to blob'));
              }
            }, 'image/png');
          };

          if (result instanceof Promise) {
            result.then(finishExport).catch(reject);
          } else {
            finishExport();
          }
        });
      });
    },

    exportSvg: (): string | null => {
      const state = get();
      // Import generator dynamically
      const { getBackgroundGenerator } = require('../generators');
      const generator = getBackgroundGenerator(state.generatorType);

      if (generator?.supportsSVG && generator.generateSVG) {
        return generator.generateSVG(state.config as BackgroundConfig);
      }

      return null;
    },

    exportCss: (): string | null => {
      const state = get();

      if (state.generatorType === 'gradient') {
        const config = state.config as GradientConfig;
        const stops = config.stops.map((s) => `${s.color} ${s.position}%`).join(', ');

        switch (config.type) {
          case 'linear':
            return `background: linear-gradient(${config.angle}deg, ${stops});`;
          case 'radial':
            return `background: radial-gradient(circle at ${config.centerX}% ${config.centerY}%, ${stops});`;
          case 'conic':
            return `background: conic-gradient(from ${config.angle}deg at ${config.centerX}% ${config.centerY}%, ${stops});`;
          default:
            return `background: linear-gradient(${stops});`;
        }
      } else if (state.generatorType === 'wave') {
        const config = state.config as any;
        const { width, height } = config.canvas;
        const keyframes = `@keyframes wave-animation {
  0% { transform: translateX(0); }
  100% { transform: translateX(${config.direction === 'right' ? '-100' : '100'}px); }
}`;

        let css = keyframes + '\n\n';
        css += `.wave-background {
  position: relative;
  width: ${width}px;
  height: ${height}px;
  background: ${config.colors.background};
  overflow: hidden;
}`;

        for (let i = 0; i < config.layers; i++) {
          const layerProgress = i / (config.layers - 1);
          const layerAmplitude = config.amplitude * (1 - layerProgress * 0.3);
          const layerSpeed = 1 + layerProgress * 0.5;
          const layerOpacity = config.opacity * (0.5 + layerProgress * 0.5);
          const layerY = height * (0.3 + layerProgress * 0.4);

          const color = config.colors.palette[i % config.colors.palette.length] || '#ffffff';

          css += `\n\n.wave-layer-${i} {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: ${height - layerY + layerAmplitude}px;
  background: ${color};
  opacity: ${layerOpacity};
  animation: wave-animation ${10 / layerSpeed}s linear infinite;
  transform-origin: bottom left;
}`;
        }

        return css;
      }

      return null;
    },

    setGeneratedDataUrl: (url: string) => {
      set((state) => {
        state.generatedDataUrl = url;
      });
    },

    setIsLoading: (loading: boolean) => {
      set((state) => {
        state.isLoading = loading;
      });
    },

    setError: (error: string | null) => {
      set((state) => {
        state.error = error;
      });
    },

    regenerate: async (canvas: HTMLCanvasElement) => {
      const state = get();
      const { getBackgroundGenerator } = await import('../generators');
      const generator = getBackgroundGenerator(state.generatorType);

      if (!generator) return;

      const { width, height } = state.config.canvas;
      canvas.width = width;
      canvas.height = height;

      const result = generator.generateCanvas(state.config as BackgroundConfig, canvas);

      if (result instanceof Promise) {
        await result;
      }

      set((s) => {
        s.generatedDataUrl = canvas.toDataURL('image/png');
      });
    },
  }))
);

// =============================================================================
// Selector Hooks
// =============================================================================

export const useGeneratorType = () => useBackgroundsStore((s) => s.generatorType);
export const useBackgroundConfig = () => useBackgroundsStore((s) => s.config);
export const useGeneratedDataUrl = () => useBackgroundsStore((s) => s.generatedDataUrl);
export const useIsLoading = () => useBackgroundsStore((s) => s.isLoading);
export const useError = () => useBackgroundsStore((s) => s.error);
export const useCanvasSize = () => useBackgroundsStore((s) => s.config.canvas);
export const useColorPalette = () => useBackgroundsStore((s) => s.config.colors);

// History selectors
export const useHistoryIndex = () => useBackgroundsStore((s) => s.historyIndex);
export const useHistoryLength = () => useBackgroundsStore((s) => s.history.length);

// History hooks
export const useCanUndo = () => useBackgroundsStore((s) => s.historyIndex > 0);
export const useCanRedo = () =>
  useBackgroundsStore((s) => s.historyIndex < s.history.length - 1);
