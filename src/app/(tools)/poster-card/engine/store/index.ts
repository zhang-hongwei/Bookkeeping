/**
 * Poster Card Editor - Editor Store
 *
 * Based on: 05-store-design.md
 * Zustand store with immer + devtools middleware, composed from slices.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { EditorState } from './types';
import { createNodeTreeSlice } from './node-tree-slice';
import { createCommandSlice } from './command-slice';
import { createSelectionSlice } from './selection-slice';
import { createSnappingSlice } from './snapping-slice';
import { createCanvasMetaSlice } from './canvas-meta-slice';
import { EngineCache } from '../engine-cache';
import { createAutoSave, loadEditorState } from './persistence';
export { loadEditorState, clearSavedState } from './persistence';
export type { PersistedState } from './persistence';

export type { EditorState, EditorStore } from './types';

export const useEditorStore = create<EditorState>()(
  devtools(
    immer((set, get) => ({
      ...createNodeTreeSlice(set, get),
      ...createCommandSlice(set, get),
      ...createSelectionSlice(set, get),
      ...createSnappingSlice(set),
      ...createCanvasMetaSlice(set),
    })),
    { name: 'poster-editor-v2', enabled: process.env.NODE_ENV === 'development' },
  ),
);

// Engine cache binds to store instance
export const engineCache = new EngineCache(() => useEditorStore.getState().nodes);

// Debounced auto-save
const debouncedSave = createAutoSave(
  () => useEditorStore.getState().nodes,
  () => useEditorStore.getState().rootNodeId,
  () => useEditorStore.getState().version,
);

// Subscribe to version changes to auto-invalidate cache and trigger save.
let previousVersion = 0;

useEditorStore.subscribe((state) => {
  if (state.version !== previousVersion) {
    previousVersion = state.version;
    engineCache.markAllDirty();
    debouncedSave();
  }
});
