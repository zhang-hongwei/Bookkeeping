import { create } from 'zustand';
import type {
  GradientState,
  GradientType,
  WarpShape,
  SimpleGradientSubtype,
  PixelDensity,
  PreviewDeviceId,
  OklchColour,
  NoiseType,
  NoiseColorMode,
  StylePresetConfig,
} from '../types/gradient';
import { oklchToHex } from '../lib/colours/conversion';
import { generateRandomPalette } from '../lib/colours/random';

export const useGradientStore = create<GradientState>((set, get) => ({
  type: 'mesh-static',
  warpShape: 'flat',
  width: 642,
  height: 642,
  warp: 0,
  warpSize: 0.5,
  noise: 0,
  noiseScale: 0.5,
  noiseType: 'value',
  noiseColorMode: 'mono',
  colours: generateRandomPalette(3),
  simpleSubtype: 'linear',
  angle: 135,
  pixelDensity: 1,
  previewDevice: 'actual',
  previewZoom: 1,

  setType: (type: GradientType) => set({ type }),
  setWarpShape: (shape: WarpShape) => set({ warpShape: shape }),
  setDimensions: (w: number, h: number) => set({ width: w, height: h }),
  setWarp: (value: number) => set({ warp: value }),
  setWarpSize: (value: number) => set({ warpSize: value }),
  setNoise: (value: number) => set({ noise: value }),
  setNoiseScale: (value: number) => set({ noiseScale: value }),
  setNoiseType: (type: NoiseType) => set({ noiseType: type }),
  setNoiseColorMode: (mode: NoiseColorMode) => set({ noiseColorMode: mode }),
  setSimpleSubtype: (subtype: SimpleGradientSubtype) => set({ simpleSubtype: subtype }),
  setAngle: (angle: number) => set({ angle }),
  setPixelDensity: (density: PixelDensity) => set({ pixelDensity: density }),
  setPreviewDevice: (device: PreviewDeviceId) => set({ previewDevice: device }),
  setPreviewZoom: (zoom: number) => set({ previewZoom: Math.max(0.1, Math.min(3, zoom)) }),

  setColours: (colours) => set({ colours }),

  addColour: (oklch: OklchColour) => {
    const { colours } = get();
    if (colours.length >= 12) return;
    set({
      colours: [
        ...colours,
        {
          id: crypto.randomUUID(),
          oklch,
          hex: oklchToHex(oklch),
          displayFormat: 'oklch',
          locked: false,
        },
      ],
    });
  },

  removeColour: (id: string) => {
    const { colours } = get();
    if (colours.length <= 2) return;
    set({ colours: colours.filter((c) => c.id !== id) });
  },

  updateColour: (id: string, oklch: OklchColour) => {
    set({
      colours: get().colours.map((c) =>
        c.id === id ? { ...c, oklch, hex: oklchToHex(oklch) } : c,
      ),
    });
  },

  updateColourPosition: (id: string, position: { x: number; y: number }) => {
    set({
      colours: get().colours.map((c) =>
        c.id === id ? { ...c, position } : c,
      ),
    });
  },

  setColourFormat: (id: string, format: 'oklch' | 'hex') => {
    set({
      colours: get().colours.map((c) =>
        c.id === id ? { ...c, displayFormat: format } : c,
      ),
    });
  },

  toggleColourLock: (id: string) => {
    set({
      colours: get().colours.map((c) =>
        c.id === id ? { ...c, locked: !c.locked } : c,
      ),
    });
  },

  randomiseColours: () => {
    const { colours } = get();
    const newPalette = generateRandomPalette(colours.length);
    set({
      colours: colours.map((c, i) =>
        c.locked ? c : newPalette[i],
      ),
    });
  },

  applyStylePreset: (preset: StylePresetConfig) => {
    const isMeshMode = preset.type === 'mesh-static' || preset.type === 'mesh-grid';

    const colours = preset.colors.map((oklch, index) => ({
      id: crypto.randomUUID(),
      oklch,
      hex: oklchToHex(oklch),
      displayFormat: 'oklch' as const,
      locked: false,
      position: isMeshMode
        ? {
            x: 0.5 + Math.cos((index / preset.colors.length) * Math.PI * 2) * 0.3,
            y: 0.5 + Math.sin((index / preset.colors.length) * Math.PI * 2) * 0.3,
          }
        : undefined,
    }));

    set({
      type: preset.type,
      warpShape: preset.warpShape,
      warp: preset.warp,
      warpSize: preset.warpSize,
      noise: preset.noise,
      colours,
    });
  },
}));
