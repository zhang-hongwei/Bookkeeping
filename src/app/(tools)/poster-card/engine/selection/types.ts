/**
 * Poster Card Editor - Selection Types
 *
 * Based on: 03-selection-engine.md, 09-architecture-upgrades.md (修正5)
 */

import type { PosterNode } from '../node-tree/types';

export interface SelectionState {
  selectedIds: Set<string>;
  activeGroupId: string | null;
  hoverNodeId: string | null;
}

export interface ResolvedSelection {
  type: 'none' | 'single' | 'multi' | 'group';
  ids: string[];
  groupId: string | null;
}

export interface HitResult {
  nodeId: string;
  worldPoint: { x: number; y: number };
}

export type Alignment =
  | 'left'
  | 'center-h'
  | 'right'
  | 'top'
  | 'center-v'
  | 'bottom'
  | 'distribute-h'
  | 'distribute-v';

export interface SelectionBox {
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  center: { x: number; y: number };
  width: number;
  height: number;
}

/**
 * Resolve selection: determine if selection is none/single/multi/group.
 */
export function resolveSelection(
  selectedIds: Set<string>,
  nodes: Record<string, PosterNode>,
): ResolvedSelection {
  if (selectedIds.size === 0) {
    return { type: 'none', ids: [], groupId: null };
  }

  const ids = [...selectedIds];

  if (selectedIds.size === 1) {
    return { type: 'single', ids, groupId: null };
  }

  // Check if all selected nodes share the same parent
  const parentIds = new Set(
    ids.map((id) => nodes[id]?.parentId).filter(Boolean),
  );

  if (parentIds.size === 1) {
    const groupId = parentIds.values().next().value!;
    return { type: 'group', ids, groupId };
  }

  return { type: 'multi', ids, groupId: null };
}
