/**
 * Gradient Border Store Initial State
 */

import type { GradientBorderState } from './types';
import type { GradientBorderConfig } from '@/app/(tools)/gradient-border/types';

const DEFAULT_CONFIG: GradientBorderConfig = {
  colorStops: [
    { id: 's1', color: '#6366f1', opacity: 100, position: 0 },
    { id: 's2', color: '#ec4899', opacity: 100, position: 100 },
  ],
  gradientType: 'linear',
  angle: 135,
  borderWidth: 2,
  borderRadius: 8,
  innerBgStops: [
    { id: 'ib1', color: '#ffffff', opacity: 100, position: 0 },
  ],
  innerBgAngle: 180,
  previewWidth: 320,
  previewHeight: 200,
  previewContent: 'Gradient Border',
  previewBgColor: '#ffffff',
  previewBgOpacity: 100,
  implementation: 'background-clip',

  borderImageOptions: {
    sourceMode: 'gradient',
    imageUrl: '',
    slice: '1',
    sliceFill: false,
    width: '1',
    outset: '0',
    repeat: 'stretch',
  },
};

export const gradientBorderInitialState: GradientBorderState = {
  config: DEFAULT_CONFIG,
  selectedStopId: null,
  innerBgSelectedStopId: null,
  exportDialogOpen: false,
  showBorderImageOptions: false,
  copied: false,
  objectUrl: '',
};
