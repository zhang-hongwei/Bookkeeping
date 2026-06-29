/**
 * Poster Card Editor - Store Types
 *
 * Based on: 05-store-design.md, 09-architecture-upgrades.md
 * Combined type for the editor store with all slices.
 */

import type { PosterNode, Background } from '../node-tree/types';
import type { EngineCache } from '../engine-cache';
import type { Command } from '../commands/types';
import type { SnapType } from '../snapping/types';

// ── Node Tree Slice ──

export interface NodeTreeSlice {
  nodes: Record<string, PosterNode>;
  rootNodeId: string | null;
  version: number;

  addNode: (nodeData: Omit<PosterNode, 'id'>, parentId?: string, index?: number) => string;
  removeNode: (id: string) => void;
  moveNode: (id: string, newParentId: string, newIndex?: number) => void;
  updateNode: (id: string, updates: Partial<PosterNode>) => void;
  setNodes: (nodes: Record<string, PosterNode>, rootNodeId: string) => void;
  initCanvas: (width: number, height: number, background?: Background) => string;
  resetAndInitCanvas: (width: number, height: number, background?: Background) => string;
  reorderNode: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
}

// ── Command Slice ──

export interface CommandSlice {
  undoStack: Command[];
  redoStack: Command[];
  isExecuting: boolean;

  execute: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

// ── Selection Slice ──

export interface ResolvedSelection {
  type: 'none' | 'single' | 'multi' | 'group';
  ids: string[];
  groupId: string | null;
}

export interface SelectionSlice {
  selectedIds: Set<string>;
  activeGroupId: string | null;
  hoverNodeId: string | null;

  singleSelect: (id: string) => void;
  toggleSelect: (id: string) => void;
  boxSelect: (nodeIds: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  enterGroup: (id: string) => void;
  exitGroup: () => void;
  setHoverNode: (id: string | null) => void;
}

// ── Snapping Slice ──

export interface SnapGuide {
  direction: 'horizontal' | 'vertical';
  position: number;
}

export interface SnappingSlice {
  snapEnabled: boolean;
  snapRange: number;
  gridSize: number;
  snapTypes: Set<SnapType>;
  activeGuides: SnapGuide[];

  setSnapEnabled: (enabled: boolean) => void;
  setSnapRange: (range: number) => void;
  setGridSize: (size: number) => void;
  setSnapTypes: (types: Set<SnapType>) => void;
  setActiveGuides: (guides: SnapGuide[]) => void;
}

// ── Canvas Meta Slice ──

export interface CanvasMetaSlice {
  zoom: number;
  panOffset: { x: number; y: number };
  editingTextId: string | null;
  exportScale: number;
  activeTemplateId: string | null;

  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  setEditingTextId: (id: string | null) => void;
  setExportScale: (scale: number) => void;
  setActiveTemplateId: (id: string | null) => void;
}

// ── Combined ──

export type EditorState = NodeTreeSlice & CommandSlice & SelectionSlice & SnappingSlice & CanvasMetaSlice;
export type EditorStore = EditorState;
