/**
 * Poster Card Editor - Hit Testing
 *
 * Based on: 03-selection-engine.md section 3
 */

import type { PosterNode, Matrix2D } from '../node-tree/types';
import { isContainerNode } from '../node-tree/types';
import { invertMatrix, applyMatrixToPoint, IDENTITY_MATRIX } from '../matrix-utils';
import { getChildren } from '../node-tree/selectors';

/**
 * Transform a world point to local coordinates using inverse matrix.
 */
export function worldToLocal(
  worldPoint: { x: number; y: number },
  worldMatrix: Matrix2D,
): { x: number; y: number } {
  const inv = invertMatrix(worldMatrix);
  return applyMatrixToPoint(inv, worldPoint);
}

/**
 * Check if two rects intersect.
 */
export function rectsIntersect(
  a: { minX: number; minY: number; maxX: number; maxY: number },
  b: { minX: number; minY: number; maxX: number; maxY: number },
): boolean {
  return !(a.maxX < b.minX || b.maxX < a.minX || a.maxY < b.minY || b.maxY < a.minY);
}

/**
 * Point hit test: returns topmost visible/unlocked node ID at the given world point.
 * Returns null if no hit.
 */
export function pointHitTest(
  nodes: Record<string, PosterNode>,
  rootNodeId: string,
  activeGroupId: string | null,
  worldPoint: { x: number; y: number },
  getWorldMatrixFn: (id: string) => Matrix2D,
): string | null {
  // Determine search scope
  const scopeParentId = activeGroupId ?? rootNodeId;
  const candidates = getChildren(nodes, scopeParentId);

  // Iterate in reverse z-order (topmost first)
  const reversed = [...candidates].reverse();

  for (const candidate of reversed) {
    if (candidate.locked || !candidate.visible) continue;

    if (isContainerNode(candidate)) {
      // For groups: if this group is the activeGroup, recurse into children
      if (activeGroupId === candidate.id) {
        const childHit = pointHitTest(nodes, rootNodeId, activeGroupId, worldPoint, getWorldMatrixFn);
        if (childHit) return childHit;
      } else {
        // Check if point is inside group bounds
        const worldMatrix = getWorldMatrixFn(candidate.id);
        const local = worldToLocal(worldPoint, worldMatrix);
        if (local.x >= 0 && local.x <= candidate.width && local.y >= 0 && local.y <= candidate.height) {
          return candidate.id;
        }
      }
    } else {
      // Leaf node: check if point is inside bounds
      const worldMatrix = getWorldMatrixFn(candidate.id);
      const local = worldToLocal(worldPoint, worldMatrix);
      if (local.x >= 0 && local.x <= candidate.width && local.y >= 0 && local.y <= candidate.height) {
        return candidate.id;
      }
    }
  }

  return null;
}

/**
 * Rectangle hit test: returns all node IDs whose bounds intersect the given rect.
 */
export function rectHitTest(
  nodes: Record<string, PosterNode>,
  rootNodeId: string,
  activeGroupId: string | null,
  worldRect: { x: number; y: number; width: number; height: number },
  getWorldBoundsFn: (id: string) => { minX: number; minY: number; maxX: number; maxY: number },
): string[] {
  const scopeParentId = activeGroupId ?? rootNodeId;
  const candidates = getChildren(nodes, scopeParentId);

  const queryRect = {
    minX: worldRect.x,
    minY: worldRect.y,
    maxX: worldRect.x + worldRect.width,
    maxY: worldRect.y + worldRect.height,
  };

  const hits: string[] = [];

  for (const candidate of candidates) {
    if (candidate.locked || !candidate.visible) continue;

    const bounds = getWorldBoundsFn(candidate.id);
    if (rectsIntersect(queryRect, bounds)) {
      hits.push(candidate.id);
    }
  }

  return hits;
}
