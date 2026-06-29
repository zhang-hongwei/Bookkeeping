/**
 * Gradient Text Store Initial State
 */

import type { GradientTextState } from './types';
import type { GradientTextConfig } from '@/app/(tools)/gradient-text/types';

const DEFAULT_CONFIG: GradientTextConfig = {
  colorStops: [
    { id: 's1', color: '#6366f1', opacity: 100, position: 0 },
    { id: 's2', color: '#ec4899', opacity: 100, position: 50 },
    { id: 's3', color: '#f59e0b', opacity: 100, position: 100 },
  ],
  gradientType: 'linear',
  angle: 135,

  text: 'Gradient Text',
  fontSize: 72,
  fontWeight: 800,
  fontFamily: 'system-ui, sans-serif',
  letterSpacing: -1,
  lineHeight: 1.2,
  textAlign: 'center',

  previewBgColor: '#0f172a',
};

export const gradientTextInitialState: GradientTextState = {
  config: DEFAULT_CONFIG,
  selectedStopId: null,
  exportDialogOpen: false,
  copied: false,
};
