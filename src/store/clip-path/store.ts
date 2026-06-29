/**
 * Clip Path Editor Store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { ClipPathEditorStore } from './types';
import { clipPathInitialState } from './initialState';
import { createClipPathActions } from './actions';
import type { ClipPathConfig } from '@/app/(tools)/clipPath/types';

export const useClipPathStore = create<ClipPathEditorStore>()(
  devtools(
    (set, get, api) => ({
      ...clipPathInitialState,
      ...createClipPathActions(set, get, api),
    }),
    {
      name: 'clip-path-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

// Map store state to ClipPathConfig for existing utils
export function getClipPathConfig(state: ClipPathEditorStore): ClipPathConfig {
  switch (state.mode) {
    case 'polygon':
      return { type: 'polygon', points: state.polygonPoints };
    case 'circle':
      return {
        type: 'circle',
        radius: state.circle.radius,
        positionX: state.circle.centerX,
        positionY: state.circle.centerY,
      };
    case 'ellipse':
      return {
        type: 'ellipse',
        radiusX: state.ellipse.radiusX,
        radiusY: state.ellipse.radiusY,
        positionX: state.ellipse.centerX,
        positionY: state.ellipse.centerY,
      };
    case 'inset':
      return {
        type: 'inset',
        top: state.inset.top,
        right: state.inset.right,
        bottom: state.inset.bottom,
        left: state.inset.left,
        borderRadius: state.inset.borderRadius,
      };
  }
}

// Static actions selector to avoid re-renders
const actionsSelector = (state: ClipPathEditorStore) => ({
  setMode: state.setMode,
  movePolygonPoint: state.movePolygonPoint,
  addPolygonPoint: state.addPolygonPoint,
  removePolygonPoint: state.removePolygonPoint,
  updateCircle: state.updateCircle,
  updateEllipse: state.updateEllipse,
  updateInset: state.updateInset,
  applyPreset: state.applyPreset,
  setScale: state.setScale,
  setCanvasSize: state.setCanvasSize,
  setImageFit: state.setImageFit,
  setImageUrl: state.setImageUrl,
  setBackgroundColor: state.setBackgroundColor,
  toggleGrid: state.toggleGrid,
  toggleSnap: state.toggleSnap,
  setGridSize: state.setGridSize,
  toggleOutside: state.toggleOutside,
  setSelectedPointIndex: state.setSelectedPointIndex,
  setExportDialogOpen: state.setExportDialogOpen,
  uploadImage: state.uploadImage,
  centerShape: state.centerShape,
  reset: state.reset,
});

export const useClipPathActions = () => {
  return useClipPathStore(useShallow(actionsSelector));
};

export default useClipPathStore;
