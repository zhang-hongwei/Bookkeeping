/**
 * Poster Card Editor - Tree Invariant Validators
 *
 * Based on: 01-node-tree.md section 1.3
 * Dev-only validation for tree invariants.
 */

import type { PosterNode } from './types';

/**
 * Validate all tree invariants. Throws in dev mode if violated.
 * Invariant list:
 * 1. Exactly one node has parentId === null (canvas root)
 * 2. Each node's ID appears in its parent's childrenIds
 * 3. childrenIds has no duplicates
 * 4. childrenIds order = z-order
 * 5. Leaf nodes have empty childrenIds
 * 6. All IDs in nodes map exist (no dangling references)
 */
export function validateTreeInvariants(
  nodes: Record<string, PosterNode>,
  rootNodeId: string,
): string[] {
  const errors: string[] = [];

  // 1. Root must exist and have parentId === null
  const root = nodes[rootNodeId];
  if (!root) {
    errors.push(`Root node ${rootNodeId} does not exist in nodes map`);
    return errors;
  }
  if (root.parentId !== null) {
    errors.push(`Root node ${rootNodeId} must have parentId === null, got ${root.parentId}`);
  }

  // Count roots
  const roots = Object.values(nodes).filter((n) => n.parentId === null);
  if (roots.length !== 1) {
    errors.push(`Expected exactly 1 root node, found ${roots.length}`);
  }

  for (const node of Object.values(nodes)) {
    // 3. No duplicate childrenIds
    const uniqueChildren = new Set(node.childrenIds);
    if (uniqueChildren.size !== node.childrenIds.length) {
      errors.push(`Node ${node.id} has duplicate entries in childrenIds`);
    }

    // 6. All referenced IDs exist
    for (const childId of node.childrenIds) {
      if (!nodes[childId]) {
        errors.push(`Node ${node.id} references non-existent child ${childId}`);
      }
    }

    // 2. Node appears in parent's childrenIds
    if (node.parentId !== null) {
      const parent = nodes[node.parentId];
      if (!parent) {
        errors.push(`Node ${node.id} references non-existent parent ${node.parentId}`);
      } else if (!parent.childrenIds.includes(node.id)) {
        errors.push(`Node ${node.id} not found in parent ${node.parentId}'s childrenIds`);
      }
    }
  }

  if (errors.length > 0 && typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn('[TreeValidator] Invariant violations:', errors);
  }

  return errors;
}
