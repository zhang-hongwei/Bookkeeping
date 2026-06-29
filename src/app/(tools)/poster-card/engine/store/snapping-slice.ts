/**
 * Poster Card Editor - Snapping Slice
 */

import type { SnapType } from '../snapping/types';
import type { SnappingSlice, EditorState, SnapGuide } from './types';

/** Default snap types: all enabled. */
const DEFAULT_SNAP_TYPES = new Set<SnapType>(['edge', 'center', 'spacing', 'distribution', 'grid']);

export function createSnappingSlice(
  set: (fn: (draft: EditorState) => void) => void,
): SnappingSlice {
  return {
    snapEnabled: true,
    snapRange: 5,
    gridSize: 10,
    snapTypes: DEFAULT_SNAP_TYPES,
    activeGuides: [] as SnapGuide[],

    setSnapEnabled: (enabled) => {
      set((state) => {
        state.snapEnabled = enabled;
      });
    },

    setSnapRange: (range) => {
      set((state) => {
        state.snapRange = range;
      });
    },

    setGridSize: (size) => {
      set((state) => {
        state.gridSize = size;
      });
    },

    setSnapTypes: (types) => {
      set((state) => {
        state.snapTypes = types;
      });
    },

    setActiveGuides: (guides) => {
      set((state) => {
        state.activeGuides = guides;
      });
    },
  };
}
