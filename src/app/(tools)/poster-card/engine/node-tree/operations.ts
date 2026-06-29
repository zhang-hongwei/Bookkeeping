/**
 * Poster Card Editor - Node Tree Operations
 *
 * Based on: 01-node-tree.md section 2
 * Pure functions using immer produce() for immutable tree updates.
 */

import { produce } from 'immer';
import { nanoid } from 'nanoid';

import type { PosterNode } from './types';

/**
 * Add a node to the tree under a specified parent.
 * Returns new nodes map and the generated ID.
 */
export function addNode(
  nodes: Record<string, PosterNode>,
  nodeData: Omit<PosterNode, 'id'>,
  parentId: string,
  index?: number,
): { nodes: Record<string, PosterNode>; id: string } {
  const id = nanoid(10);

  const newNodes = produce(nodes, (draft) => {
    const node = { ...nodeData, id, parentId } as PosterNode;
    draft[id] = node;

    const parent = draft[parentId];
    if (parent) {
      if (index !== undefined) {
        parent.childrenIds.splice(index, 0, id);
      } else {
        parent.childrenIds.push(id);
      }
    }
  });

  return { nodes: newNodes, id };
}

/**
 * Remove a node and its entire subtree from the tree.
 */
export function removeNode(
  nodes: Record<string, PosterNode>,
  id: string,
): Record<string, PosterNode> {
  return produce(nodes, (draft) => {
    const node = draft[id];
    if (!node) return;

    // Collect all descendant IDs recursively
    const toRemove = new Set<string>();
    const collectDescendants = (nodeId: string) => {
      toRemove.add(nodeId);
      const n = draft[nodeId];
      if (n) {
        for (const childId of n.childrenIds) {
          collectDescendants(childId);
        }
      }
    };
    collectDescendants(id);

    // Remove from parent's childrenIds
    if (node.parentId) {
      const parent = draft[node.parentId];
      if (parent) {
        parent.childrenIds = parent.childrenIds.filter((cid) => cid !== id);
      }
    }

    // Delete all collected nodes
    for (const nodeId of toRemove) {
      delete draft[nodeId];
    }
  });
}

/**
 * Move a node to a new parent at a given index.
 * Includes cycle detection to prevent moving a node into its own subtree.
 */
export function moveNode(
  nodes: Record<string, PosterNode>,
  id: string,
  newParentId: string,
  newIndex?: number,
): Record<string, PosterNode> {
  // Cycle detection: newParentId must not be a descendant of id
  if (isDescendant(nodes, id, newParentId)) {
    return nodes; // no-op if would create cycle
  }

  return produce(nodes, (draft) => {
    const node = draft[id];
    if (!node) return;

    // Remove from old parent
    if (node.parentId) {
      const oldParent = draft[node.parentId];
      if (oldParent) {
        oldParent.childrenIds = oldParent.childrenIds.filter((cid) => cid !== id);
      }
    }

    // Add to new parent
    const newParent = draft[newParentId];
    if (newParent) {
      if (newIndex !== undefined) {
        newParent.childrenIds.splice(newIndex, 0, id);
      } else {
        newParent.childrenIds.push(id);
      }
    }

    node.parentId = newParentId;
  });
}

/**
 * Update a node's fields (shallow merge).
 * Disallows changing id, parentId, childrenIds - use dedicated operations for those.
 */
export function updateNode(
  nodes: Record<string, PosterNode>,
  id: string,
  updates: Partial<PosterNode>,
): Record<string, PosterNode> {
  return produce(nodes, (draft) => {
    const node = draft[id];
    if (!node) return;

    // Forbidden fields - use dedicated operations
    const forbidden = ['id', 'parentId', 'childrenIds'] as const;
    for (const key of forbidden) {
      if (key in updates) {
        delete (updates as Record<string, unknown>)[key];
      }
    }

    Object.assign(node, updates);
  });
}

/**
 * Check if `targetId` is a descendant of `ancestorId`.
 */
function isDescendant(nodes: Record<string, PosterNode>, ancestorId: string, targetId: string): boolean {
  let current: string | null = targetId;
  let iterations = 0;
  const maxIterations = Object.keys(nodes).length + 1;
  while (current !== null && iterations < maxIterations) {
    if (current === ancestorId) return true;
    const n: PosterNode | undefined = nodes[current];
    if (!n) break;
    current = n.parentId;
    iterations++;
  }
  return false;
}

/**
 * Reorder a node within its parent's childrenIds (change z-order).
 */
export function reorderNode(
  nodes: Record<string, PosterNode>,
  id: string,
  direction: 'up' | 'down' | 'top' | 'bottom',
): Record<string, PosterNode> {
  return produce(nodes, (draft) => {
    const node = draft[id];
    if (!node || !node.parentId) return;

    const parent = draft[node.parentId];
    if (!parent) return;

    const idx = parent.childrenIds.indexOf(id);
    if (idx === -1) return;

    parent.childrenIds.splice(idx, 1);

    switch (direction) {
      case 'up':
        parent.childrenIds.splice(Math.min(idx + 1, parent.childrenIds.length), 0, id);
        break;
      case 'down':
        parent.childrenIds.splice(Math.max(idx - 1, 0), 0, id);
        break;
      case 'top':
        parent.childrenIds.push(id);
        break;
      case 'bottom':
        parent.childrenIds.unshift(id);
        break;
    }
  });
}
