/**
 * Clip Path Editor Store Actions
 */

import type { StateCreator } from 'zustand';
import type {
  ClipPathEditorStore,
  ClipPathEditorActions,
  ClipPathMode,
  Point,
} from './types';
import { clipPathInitialState } from './initialState';

export const createClipPathActions: StateCreator<
  ClipPathEditorStore,
  [],
  [],
  ClipPathEditorActions
> = (set, get) => ({
  setMode: (mode: ClipPathMode) => {
    set({ mode, selectedPointIndex: null });
  },

  movePolygonPoint: (index: number, x: number, y: number) => {
    set((state) => ({
      polygonPoints: state.polygonPoints.map((p, i) =>
        i === index
          ? { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
          : p,
      ),
    }));
  },

  addPolygonPoint: (afterIndex: number, point: Point) => {
    set((state) => {
      const newPoints = [...state.polygonPoints];
      newPoints.splice(afterIndex + 1, 0, {
        x: Math.max(0, Math.min(100, point.x)),
        y: Math.max(0, Math.min(100, point.y)),
      });
      return { polygonPoints: newPoints };
    });
  },

  removePolygonPoint: (index: number) => {
    set((state) => {
      if (state.polygonPoints.length <= 3) return state;
      return {
        polygonPoints: state.polygonPoints.filter((_, i) => i !== index),
        selectedPointIndex:
          state.selectedPointIndex === index
            ? null
            : state.selectedPointIndex,
      };
    });
  },

  updateCircle: (updates) => {
    set((state) => ({ circle: { ...state.circle, ...updates } }));
  },

  updateEllipse: (updates) => {
    set((state) => ({ ellipse: { ...state.ellipse, ...updates } }));
  },

  updateInset: (updates) => {
    set((state) => ({ inset: { ...state.inset, ...updates } }));
  },

  applyPreset: (mode, config) => {
    const updates: Partial<ClipPathEditorStore> = { mode, selectedPointIndex: null };
    if (mode === 'polygon' && Array.isArray(config.points)) {
      updates.polygonPoints = config.points as Point[];
    } else if (mode === 'circle') {
      updates.circle = {
        radius: (config.radius as number) ?? 50,
        centerX: (config.positionX as number) ?? 50,
        centerY: (config.positionY as number) ?? 50,
      };
    } else if (mode === 'ellipse') {
      updates.ellipse = {
        radiusX: (config.radiusX as number) ?? 40,
        radiusY: (config.radiusY as number) ?? 50,
        centerX: (config.positionX as number) ?? 50,
        centerY: (config.positionY as number) ?? 50,
      };
    } else if (mode === 'inset') {
      updates.inset = {
        top: (config.top as number) ?? 10,
        right: (config.right as number) ?? 10,
        bottom: (config.bottom as number) ?? 10,
        left: (config.left as number) ?? 10,
        borderRadius: 0,
      };
    }
    set(updates);
  },

  setScale: (scale) => set({ scale }),

  setCanvasSize: (updates) => {
    set((state) => ({
      canvasSize: { ...state.canvasSize, ...updates },
    }));
  },

  setImageFit: (fit) => set({ imageFit: fit }),

  setImageUrl: (url) => set({ imageUrl: url }),

  setBackgroundColor: (color) => set({ backgroundColor: color }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  setGridSize: (size) => set({ gridSize: size }),
  toggleOutside: () => set((state) => ({ showOutside: !state.showOutside })),

  setSelectedPointIndex: (index) => set({ selectedPointIndex: index }),
  setExportDialogOpen: (open) => set({ exportDialogOpen: open }),

  uploadImage: (file: File) => {
    const { imageUrl } = get();
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    set({ imageUrl: URL.createObjectURL(file) });
  },

  centerShape: () => {
    const { mode, polygonPoints, circle, ellipse, inset } = get();
    if (mode === 'polygon') {
      const cx =
        polygonPoints.reduce((sum, p) => sum + p.x, 0) / polygonPoints.length;
      const cy =
        polygonPoints.reduce((sum, p) => sum + p.y, 0) / polygonPoints.length;
      const dx = 50 - cx;
      const dy = 50 - cy;
      set({
        polygonPoints: polygonPoints.map((p) => ({
          x: Math.max(0, Math.min(100, p.x + dx)),
          y: Math.max(0, Math.min(100, p.y + dy)),
        })),
      });
    } else if (mode === 'circle') {
      set({ circle: { ...circle, centerX: 50, centerY: 50 } });
    } else if (mode === 'ellipse') {
      set({ ellipse: { ...ellipse, centerX: 50, centerY: 50 } });
    } else if (mode === 'inset') {
      const hCenter =
        (inset.left + (100 - inset.right)) / 2;
      const vCenter =
        (inset.top + (100 - inset.bottom)) / 2;
      const dx = 50 - hCenter;
      const dy = 50 - vCenter;
      set({
        inset: {
          ...inset,
          left: Math.max(0, inset.left + dx),
          right: Math.max(0, inset.right - dx),
          top: Math.max(0, inset.top + dy),
          bottom: Math.max(0, inset.bottom - dy),
        },
      });
    }
  },

  reset: () => set({ ...clipPathInitialState }),
});
