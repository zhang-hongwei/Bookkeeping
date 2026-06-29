/**
 * Clip Path Editor Store Initial State
 */

import type { ClipPathEditorState } from './types';

export const clipPathInitialState: ClipPathEditorState = {
  mode: 'polygon',
  polygonPoints: [
    { x: 50, y: 5 },
    { x: 95, y: 95 },
    { x: 5, y: 95 },
  ],
  circle: { radius: 50, centerX: 50, centerY: 50 },
  ellipse: { radiusX: 40, radiusY: 50, centerX: 50, centerY: 50 },
  inset: { top: 10, right: 10, bottom: 10, left: 10, borderRadius: 0 },

  canvasSize: { width: 450, height: 450 },
  scale: 1,
  imageFit: 'stretch',
  imageUrl: null,
  backgroundColor: '#6366f1',

  showGrid: true,
  snapToGrid: true,
  gridSize: 5,
  showOutside: true,

  selectedPointIndex: null,
  exportDialogOpen: false,
};
