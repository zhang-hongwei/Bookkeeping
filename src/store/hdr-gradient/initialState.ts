import type { GradientLayer } from '@/app/(tools)/hdr-gradient/types';

function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `layer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function createDefaultLayer(): GradientLayer {
  return {
    id: uid(),
    name: 'Layer 1',
    visible: true,
    type: 'linear',
    space: 'oklab',
    interpolation: 'shorter',
    stops: [
      { kind: 'stop', color: 'oklch(70% 0.5 340)', auto: '0', position1: '0', position2: '0' },
      { kind: 'hint', auto: '50', percentage: '50' },
      { kind: 'stop', color: 'oklch(90% 0.5 200)', auto: '100', position1: '100', position2: '100' },
    ],
    linear: {
      namedAngle: 'to right',
      angle: '90',
    },
    radial: {
      shape: 'circle',
      size: 'farthest-corner',
      namedPosition: 'center',
      position: { x: null, y: null },
    },
    conic: {
      angle: '0',
      namedPosition: 'center',
      position: { x: null, y: null },
    },
  };
}

export const initialHdrGradientState = {
  layers: [createDefaultLayer()],
  activeLayerIndex: 0,
  colorPickerOpen: false,
  colorPickerStopIndex: null,
  importDialogOpen: false,
  exportDialogOpen: false,
  previewHd: true,
};
