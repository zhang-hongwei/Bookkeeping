import type { StateCreator } from 'zustand';
import type { HdrGradientStore } from './types';
import type {
  GradientType,
  ColorSpace,
  HueInterpolation,
  RadialShape,
  RadialSize,
  GradientStop,
  GradientLayer,
  GradientPreset,
  NamedDirection,
  NamedPosition,
} from '@/app/(tools)/hdr-gradient/types';
import {
  percentToNamedPosition,
  NAMED_DIRECTION_TO_DEG as degMap,
  NAMED_POSITION_TO_PERCENT as posMap,
} from '@/app/(tools)/hdr-gradient/types';
import { buildGradientStrings } from '@/lib/gradient/gradientString';
import { deserializeUrl } from '@/lib/gradient/url';
import { updateStops as autoDistributeStops, removeStop as removeStopPair } from '@/lib/gradient/stops';
import { randomNumber } from '@/lib/gradient/numbers';
import type { ParsedGradient } from '@/lib/gradient/parseGradient';
import { normalizeParsedGradient, toDegreesString } from '@/lib/gradient/importGradient';
import { createDefaultLayer } from './initialState';

function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `layer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

// Convert GradientLayer to the snapshot format expected by gradientString.ts
function layerToSnapshot(layer: GradientLayer) {
  return {
    type: layer.type,
    space: layer.space,
    interpolation: layer.interpolation,
    stops: layer.stops,
    linear: { named_angle: layer.linear.namedAngle, angle: layer.linear.angle },
    radial: {
      shape: layer.radial.shape,
      size: layer.radial.size,
      named_position: layer.radial.namedPosition,
      position: layer.radial.position,
    },
    conic: {
      angle: layer.conic.angle,
      named_position: layer.conic.namedPosition,
      position: layer.conic.position,
    },
  };
}

function recalcCss(layer: GradientLayer): GradientLayer {
  const snapshot = layerToSnapshot(layer);
  const cachedCss = buildGradientStrings(snapshot);
  return { ...layer, cachedCss };
}

function updateActiveLayer(
  state: HdrGradientStore,
  mutator: (layer: GradientLayer) => GradientLayer,
): Partial<HdrGradientStore> {
  const { layers, activeLayerIndex } = state;
  const layer = layers[activeLayerIndex];
  if (!layer) return {};
  const updated = recalcCss(mutator(layer));
  const newLayers = [...layers];
  newLayers[activeLayerIndex] = updated;
  return { layers: newLayers };
}

// Degree ↔ named angle bidirectional sync
function degToNamed(deg: number): NamedDirection {
  const n = ((deg % 360) + 360) % 360;
  const tol = 0.5;
  for (const [name, d] of Object.entries(degMap)) {
    const diff = Math.abs((((n - d) % 360) + 540) % 360 - 180);
    if (diff <= tol) return name as NamedDirection;
  }
  return '--';
}

function namedToDeg(name: NamedDirection): number | null {
  if (name === '--') return null;
  return (degMap as Record<string, number>)[name] ?? null;
}

// Apply alpha transparency to a color string (supports hex, oklch, generic function colors)
function withAlpha(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  if (/^#([0-9a-f]{3,8})$/i.test(color)) {
    const hex = color.replace('#', '');
    let r: number, g: number, b: number;
    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    const aHex = Math.round(a * 255).toString(16).padStart(2, '0');
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}${aHex}`;
  }
  if (/^oklch\(/i.test(color)) {
    if (/\/\s*\d*\.?\d+\s*\)$/.test(color)) {
      return color.replace(/\/(.*)\)/, `/ ${a})`);
    }
    return color.replace(/\)$/, ' / ' + a + ')');
  }
  if (/\(/.test(color) && !/\//.test(color)) {
    return color.replace(/\)$/, ' / ' + a + ')');
  }
  return color;
}

// Position cache for radial ↔ conic cross-type inheritance
const positionCache = {
  lastRadialPos: { x: null as number | null, y: null as number | null },
  lastConicPos: { x: null as number | null, y: null as number | null },
};

export const createActions: StateCreator<HdrGradientStore> = (set, get) => ({
  // ─── Gradient Config ────────────────────────────────────────────────────

  setGradientType(type: GradientType) {
    set((s) => {
      const layer = s.layers[s.activeLayerIndex];
      if (!layer) return {};

      // Cache current position before switching
      if (layer.type === 'radial' && layer.radial.position.x != null) {
        positionCache.lastRadialPos = { ...layer.radial.position };
      }
      if (layer.type === 'conic' && layer.conic.position.x != null) {
        positionCache.lastConicPos = { ...layer.conic.position };
      }

      const updated = { ...layer, type };

      // Inherit position from opposite type when target has no position
      if (type === 'radial' && updated.radial.position.x == null) {
        if (positionCache.lastConicPos.x != null) {
          updated.radial = {
            ...updated.radial,
            namedPosition: '--',
            position: { ...positionCache.lastConicPos },
          };
        }
      } else if (type === 'conic' && updated.conic.position.x == null) {
        if (positionCache.lastRadialPos.x != null) {
          updated.conic = {
            ...updated.conic,
            namedPosition: '--',
            position: { ...positionCache.lastRadialPos },
          };
        }
      }

      const snapshot = layerToSnapshot(updated);
      updated.cachedCss = buildGradientStrings(snapshot);
      const newLayers = [...s.layers];
      newLayers[s.activeLayerIndex] = updated;
      return { layers: newLayers };
    });
  },

  setGradientSpace(space: ColorSpace) {
    set((s) => updateActiveLayer(s, (l) => ({ ...l, space })));
  },

  setInterpolation(method: HueInterpolation) {
    set((s) => updateActiveLayer(s, (l) => ({ ...l, interpolation: method })));
  },

  // ─── Linear Controls (bidirectional) ────────────────────────────────────

  setLinearAngle(angle: string | number | null) {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const n = angle != null ? Number(angle) : NaN;
        const namedAngle = !Number.isNaN(n) ? degToNamed(n) : '--';
        return { ...l, linear: { ...l.linear, angle, namedAngle } };
      }),
    );
  },

  setLinearNamedAngle(name: NamedDirection) {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const deg = namedToDeg(name);
        return {
          ...l,
          linear: {
            ...l.linear,
            namedAngle: name,
            angle: deg != null ? String(deg) : l.linear.angle,
          },
        };
      }),
    );
  },

  // ─── Radial Controls (bidirectional) ────────────────────────────────────

  setRadialShape(shape: RadialShape) {
    set((s) => updateActiveLayer(s, (l) => ({ ...l, radial: { ...l.radial, shape } })));
  },

  setRadialSize(size: RadialSize) {
    set((s) => updateActiveLayer(s, (l) => ({ ...l, radial: { ...l.radial, size } })));
  },

  setRadialPosition(x: number | null, y: number | null) {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const namedPos =
          x != null && y != null ? (percentToNamedPosition(x, y) ?? '--') : l.radial.namedPosition;
        return {
          ...l,
          radial: { ...l.radial, position: { x, y }, namedPosition: namedPos },
        };
      }),
    );
  },

  setRadialNamedPosition(name: NamedPosition) {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const pos = (posMap as Record<string, { x: number; y: number }>)[name];
        return {
          ...l,
          radial: {
            ...l.radial,
            namedPosition: name,
            position: pos ?? l.radial.position,
          },
        };
      }),
    );
  },

  // ─── Conic Controls (bidirectional) ─────────────────────────────────────

  setConicAngle(angle: string | number) {
    set((s) => updateActiveLayer(s, (l) => ({ ...l, conic: { ...l.conic, angle } })));
  },

  setConicPosition(x: number | null, y: number | null) {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const namedPos =
          x != null && y != null ? (percentToNamedPosition(x, y) ?? '--') : l.conic.namedPosition;
        return {
          ...l,
          conic: { ...l.conic, position: { x, y }, namedPosition: namedPos },
        };
      }),
    );
  },

  setConicNamedPosition(name: NamedPosition) {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const pos = (posMap as Record<string, { x: number; y: number }>)[name];
        return {
          ...l,
          conic: {
            ...l.conic,
            namedPosition: name,
            position: pos ?? l.conic.position,
          },
        };
      }),
    );
  },

  // ─── Stops ──────────────────────────────────────────────────────────────

  setStops(stops: GradientStop[]) {
    set((s) => updateActiveLayer(s, (l) => ({ ...l, stops: autoDistributeStops(stops) })));
  },

  updateStop(index: number, updates: Partial<GradientStop>) {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const stops = [...l.stops];
        if (stops[index]) {
          stops[index] = { ...stops[index], ...updates };
        }
        return { ...l, stops: autoDistributeStops(stops) };
      }),
    );
  },

  addStop() {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const newStops: GradientStop[] = [
          ...l.stops,
          { kind: 'hint', auto: '', percentage: null },
          {
            kind: 'stop',
            color: `oklch(80% 0.3 ${randomNumber(0, 360)})`,
            auto: '',
            position1: null as unknown as string,
            position2: null as unknown as string,
          },
        ];
        return { ...l, stops: autoDistributeStops(newStops) };
      }),
    );
  },

  removeStop(index: number) {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const newStops = removeStopPair(l.stops, index);
        return { ...l, stops: autoDistributeStops(newStops) };
      }),
    );
  },

  duplicateStop(index: number) {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const stop = l.stops[index];
        if (!stop) return l;
        const stops = [...l.stops];
        stops.splice(index + 1, 0, { ...stop, auto: '' });
        return { ...l, stops: autoDistributeStops(stops) };
      }),
    );
  },

  moveStop(fromIndex: number, toIndex: number) {
    set((s) =>
      updateActiveLayer(s, (l) => {
        const stops = [...l.stops];
        const [moved] = stops.splice(fromIndex, 1);
        stops.splice(toIndex, 0, moved);
        return { ...l, stops: autoDistributeStops(stops) };
      }),
    );
  },

  // ─── Layers ─────────────────────────────────────────────────────────────

  addLayer(options?: { seed?: 'duplicate' | 'new'; position?: 'top' | 'bottom' }) {
    const { seed = 'duplicate', position = 'top' } = options ?? {};
    const state = get();
    const base =
      seed === 'duplicate' ? structuredClone(state.layers[state.activeLayerIndex]) : null;

    const newLayer: GradientLayer = base
      ? { ...base, id: uid(), name: `Layer ${state.layers.length + 1}` }
      : {
          id: uid(),
          name: `Layer ${state.layers.length + 1}`,
          visible: true,
          type: 'linear',
          space: 'oklab',
          interpolation: 'shorter',
          stops: [
            {
              kind: 'stop',
              color: `oklch(${Math.round(randomNumber(60, 85))}% ${randomNumber(0.2, 0.35).toFixed(2)} ${Math.round(randomNumber(0, 360))})`,
              auto: '0',
              position1: '0',
              position2: '0',
            },
            { kind: 'hint', auto: '50', percentage: '50' },
            {
              kind: 'stop',
              color: `oklch(${Math.round(randomNumber(60, 85))}% ${randomNumber(0.2, 0.35).toFixed(2)} ${Math.round(randomNumber(0, 360))})`,
              auto: '100',
              position1: '100',
              position2: '100',
            },
          ],
          linear: { namedAngle: 'to right', angle: '90' },
          radial: {
            shape: 'circle',
            size: 'farthest-corner',
            namedPosition: 'center',
            position: { x: null, y: null },
          },
          conic: { angle: '0', namedPosition: 'center', position: { x: null, y: null } },
        };

    // Apply 50% transparency to all stop colors for layer blending
    newLayer.stops = newLayer.stops.map(s =>
      s?.kind === 'stop' ? { ...s, color: withAlpha(s.color, 0.5) } : s,
    );

    const snapshot = layerToSnapshot(newLayer);
    newLayer.cachedCss = buildGradientStrings(snapshot);

    const layers = position === 'top' ? [newLayer, ...state.layers] : [...state.layers, newLayer];
    const newIndex = position === 'top' ? 0 : layers.length - 1;
    set({ layers, activeLayerIndex: newIndex });
  },

  selectLayer(index: number) {
    const { layers } = get();
    if (index < 0 || index >= layers.length) return;
    set({ activeLayerIndex: index });
  },

  deleteLayer(index: number) {
    const { layers, activeLayerIndex } = get();
    if (layers.length <= 1) return;
    const newLayers = [...layers];
    newLayers.splice(index, 1);
    let newIndex = activeLayerIndex;
    if (newIndex === index) newIndex = Math.max(0, index - 1);
    else if (index < newIndex) newIndex--;
    set({ layers: newLayers, activeLayerIndex: newIndex });
  },

  moveLayer(from: number, to: number) {
    const { layers, activeLayerIndex } = get();
    if (from === to) return;
    const newLayers = [...layers];
    const [moved] = newLayers.splice(from, 1);
    newLayers.splice(to, 0, moved);
    let newIndex = activeLayerIndex;
    if (activeLayerIndex === from) newIndex = to;
    else if (from < activeLayerIndex && to >= activeLayerIndex) newIndex--;
    else if (from > activeLayerIndex && to <= activeLayerIndex) newIndex++;
    set({ layers: newLayers, activeLayerIndex: newIndex });
  },

  toggleLayerVisibility(index: number) {
    const { layers } = get();
    const newLayers = [...layers];
    if (newLayers[index]) {
      newLayers[index] = { ...newLayers[index], visible: !newLayers[index].visible };
    }
    set({ layers: newLayers });
  },

  renameLayer(index: number, name: string) {
    const { layers } = get();
    const newLayers = [...layers];
    if (newLayers[index]) {
      newLayers[index] = { ...newLayers[index], name };
    }
    set({ layers: newLayers });
  },

  // ─── Presets & Import ───────────────────────────────────────────────────

  applyPreset(preset: GradientPreset) {
    const { layers, activeLayerIndex } = get();
    const layer: GradientLayer = {
      id: uid(),
      name: preset.name,
      visible: true,
      type: preset.type,
      space: preset.space,
      interpolation: preset.interpolation ?? 'shorter',
      stops: autoDistributeStops(preset.stops),
      linear: {
        namedAngle: preset.linear?.namedAngle ?? 'to right',
        angle: preset.linear?.angle ?? '90',
      },
      radial: {
        shape: preset.radial?.shape ?? 'circle',
        size: preset.radial?.size ?? 'farthest-corner',
        namedPosition: preset.radial?.namedPosition ?? 'center',
        position: preset.radial?.position ?? { x: null, y: null },
      },
      conic: {
        angle: preset.conic?.angle ?? '0',
        namedPosition: preset.conic?.namedPosition ?? 'center',
        position: preset.conic?.position ?? { x: null, y: null },
      },
    };
    const snapshot = layerToSnapshot(layer);
    layer.cachedCss = buildGradientStrings(snapshot);
    const newLayers = [...layers];
    newLayers[activeLayerIndex] = layer;
    set({ layers: newLayers });
  },

  applyParsedGradient(raw: ParsedGradient) {
    const parsed = normalizeParsedGradient(raw);
    const { layers, activeLayerIndex } = get();
    const linear = parsed.linear;
    const radial = parsed.radial;
    const conic = parsed.conic;

    // Map angle keyword to named direction
    let linearNamedAngle: NamedDirection = 'to right';
    let linearAngle: string | number | null = '90';
    if (linear?.angleKeyword && linear.angleKeyword !== '--') {
      linearNamedAngle = linear.angleKeyword as NamedDirection;
      const deg = (degMap as Record<string, number>)[linear.angleKeyword];
      linearAngle = deg != null ? String(deg) : (linear.angleDeg ?? '90');
    } else if (linear?.angleDeg) {
      linearAngle = linear.angleDeg;
      const n = Number(linear.angleDeg);
      if (!Number.isNaN(n)) linearNamedAngle = degToNamed(n);
    }

    const layer: GradientLayer = {
      id: uid(),
      name: 'Imported',
      visible: true,
      type: parsed.type ?? 'linear',
      space: (parsed.space as ColorSpace) ?? 'srgb',
      interpolation: parsed.interpolation ?? 'shorter',
      stops: parsed.stops as GradientStop[],
      linear: { namedAngle: linearNamedAngle, angle: linearAngle },
      radial: {
        shape: (radial?.shape ?? 'circle') as RadialShape,
        size: (radial?.size ?? 'farthest-corner') as RadialSize,
        namedPosition: (radial?.namedPosition ?? 'center') as NamedPosition,
        position: radial?.position ?? { x: null, y: null },
      },
      conic: {
        angle: conic?.fromDeg ?? '0',
        namedPosition: (conic?.namedPosition ?? 'center') as NamedPosition,
        position: conic?.position ?? { x: null, y: null },
      },
    };
    const snapshot = layerToSnapshot(layer);
    layer.cachedCss = buildGradientStrings(snapshot);
    const newLayers = [...layers];
    newLayers[activeLayerIndex] = layer;
    set({ layers: newLayers });
  },

  restoreFromHash(hash: string) {
    const raw = typeof hash === 'string' ? hash.replace(/^#/, '') : '';
    if (!raw) return;
    const state = deserializeUrl(raw);
    if (!state) return;

    if (state.layers && Array.isArray(state.layers)) {
      // Multi-layer restore
      try {
        const restored: GradientLayer[] = state.layers.map((l: any) => {
          const layer: GradientLayer = {
            id: uid(),
            name: l.name ?? 'Layer',
            visible: l.visible ?? true,
            type: l.type ?? 'linear',
            space: l.space ?? 'oklab',
            interpolation: l.interpolation ?? 'shorter',
            stops: l.stops ?? [],
            linear: l.linear
              ? { namedAngle: l.linear.named_angle ?? l.linear.namedAngle ?? 'to right', angle: l.linear.angle ?? '90' }
              : { namedAngle: 'to right' as NamedDirection, angle: '90' },
            radial: l.radial
              ? {
                  shape: l.radial.shape ?? 'circle',
                  size: l.radial.size ?? 'farthest-corner',
                  namedPosition: l.radial.named_position ?? l.radial.namedPosition ?? 'center',
                  position: l.radial.position ?? { x: null, y: null },
                }
              : { shape: 'circle' as RadialShape, size: 'farthest-corner' as RadialSize, namedPosition: 'center' as NamedPosition, position: { x: null, y: null } },
            conic: l.conic
              ? {
                  angle: l.conic.angle ?? '0',
                  namedPosition: l.conic.named_position ?? l.conic.namedPosition ?? 'center',
                  position: l.conic.position ?? { x: null, y: null },
                }
              : { angle: '0', namedPosition: 'center' as NamedPosition, position: { x: null, y: null } },
          };
          const snapshot = layerToSnapshot(layer);
          layer.cachedCss = buildGradientStrings(snapshot);
          return layer;
        });
        const idx = Math.max(0, Math.min(restored.length - 1, (state.active as number) ?? 0));
        set({ layers: restored, activeLayerIndex: idx });
      } catch (e) {
        console.warn('Failed to restore layers from URL:', e);
      }
    } else if (state.type) {
      // Single-layer restore
      const linearNamedAngle = (state.linear_named_angle ?? 'to right') as NamedDirection;
      const deg = namedToDeg(linearNamedAngle);
      const linearAngle = state.linear_angle ?? (deg != null ? String(deg) : '90');

      const radialPos = state.radial_position ?? { x: null, y: null };
      const conicPos = state.conic_position ?? { x: null, y: null };

      const layer: GradientLayer = {
        id: uid(),
        name: 'Layer 1',
        visible: true,
        type: (state.type as GradientType) ?? 'linear',
        space: (state.space as ColorSpace) ?? 'oklab',
        interpolation: (state.interpolation as HueInterpolation) ?? 'shorter',
        stops: autoDistributeStops(state.stops ?? []),
        linear: { namedAngle: linearNamedAngle, angle: linearAngle },
        radial: {
          shape: (state.radial_shape as RadialShape) ?? 'circle',
          size: (state.radial_size as RadialSize) ?? 'farthest-corner',
          namedPosition: (state.radial_named_position ?? (radialPos.x != null ? '--' : 'center')) as NamedPosition,
          position: radialPos,
        },
        conic: {
          angle: (state.conic_angle as string) ?? '0',
          namedPosition: (state.conic_named_position ?? (conicPos.x != null ? '--' : 'center')) as NamedPosition,
          position: conicPos,
        },
      };
      const snapshot = layerToSnapshot(layer);
      layer.cachedCss = buildGradientStrings(snapshot);
      set({ layers: [layer], activeLayerIndex: 0 });
    }
  },

  reset() {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const defaultLayer = createDefaultLayer();
    const snapshot = layerToSnapshot(defaultLayer);
    defaultLayer.cachedCss = buildGradientStrings(snapshot);
    set({ layers: [defaultLayer], activeLayerIndex: 0 });
  },

  // ─── UI State ───────────────────────────────────────────────────────────

  setColorPickerOpen(open: boolean, stopIndex?: number) {
    set({ colorPickerOpen: open, colorPickerStopIndex: stopIndex ?? null });
  },

  setImportDialogOpen(open: boolean) {
    set({ importDialogOpen: open });
  },

  setExportDialogOpen(open: boolean) {
    set({ exportDialogOpen: open });
  },

  setPreviewHd(hd: boolean) {
    set({ previewHd: hd });
  },
});
