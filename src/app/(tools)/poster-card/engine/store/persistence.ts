/**
 * Persistence layer with auto-migration from old format.
 *
 * Old key: 'poster-card-state' (flat elements[] format)
 * New key: 'poster-card-editor-v2' (tree-based node format)
 */

import { serializeTree, deserializeTree } from '../node-tree/serialization';
import { migrateOldToNew } from '../migration';
import type { PosterNode } from '../node-tree/types';

const STORAGE_KEY_V2 = 'poster-card-editor-v2';
const STORAGE_KEY_OLD = 'poster-card-state';
const SAVE_DEBOUNCE_MS = 500;

export interface PersistedState {
  nodes: Record<string, PosterNode>;
  rootNodeId: string;
}

/**
 * Load editor state from localStorage.
 * Checks v2 key first, falls back to old key with auto-migration.
 */
export function loadEditorState(): PersistedState | null {
  // Try v2 first
  const v2Raw = localStorage.getItem(STORAGE_KEY_V2);
  if (v2Raw) {
    try {
      const doc = deserializeTree(v2Raw);
      return { nodes: doc.nodes, rootNodeId: doc.rootNodeId };
    } catch {
      console.warn('[persistence] Failed to parse v2 data, clearing');
      localStorage.removeItem(STORAGE_KEY_V2);
    }
  }

  // Fall back to old format
  const oldRaw = localStorage.getItem(STORAGE_KEY_OLD);
  if (oldRaw) {
    try {
      const oldData = JSON.parse(oldRaw);
      const migrated = migrateOldToNew(oldData);
      saveEditorState(migrated.nodes, migrated.rootNodeId);
      localStorage.removeItem(STORAGE_KEY_OLD);
      return migrated;
    } catch {
      console.warn('[persistence] Failed to migrate old data');
    }
  }

  return null;
}

/**
 * Save editor state to localStorage as v2 format.
 */
export function saveEditorState(nodes: Record<string, PosterNode>, rootNodeId: string): void {
  try {
    const json = serializeTree(nodes, rootNodeId);
    localStorage.setItem(STORAGE_KEY_V2, json);
  } catch (err) {
    console.warn('[persistence] Failed to save:', err);
  }
}

/**
 * Clear persisted editor state from localStorage.
 */
export function clearSavedState(): void {
  localStorage.removeItem(STORAGE_KEY_V2);
  localStorage.removeItem(STORAGE_KEY_OLD);
}

/**
 * Create a debounced auto-save function.
 * Returns the save trigger that should be called on state changes.
 */
export function createAutoSave(
  getNodes: () => Record<string, PosterNode>,
  getRootNodeId: () => string | null,
  getVersion: () => number,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastSavedVersion = -1;

  const save = () => {
    const version = getVersion();
    if (version === lastSavedVersion) return;
    const nodes = getNodes();
    const rootNodeId = getRootNodeId();
    if (rootNodeId && Object.keys(nodes).length > 0) {
      saveEditorState(nodes, rootNodeId);
      lastSavedVersion = version;
    }
  };

  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(save, SAVE_DEBOUNCE_MS);
  };
}
