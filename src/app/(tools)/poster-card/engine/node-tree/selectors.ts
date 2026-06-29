/**
 * Poster Card Editor - Node Tree Selectors
 *
 * Based on: 01-node-tree.md section 3
 * Pure query functions for the node tree.
 */

import type { PosterNode, LeafNode, CanvasNode } from './types';
import { isLeafNode } from './types';

/** O(1) - Get a node by ID. */
export function getNode(nodes: Record<string, PosterNode>, id: string): PosterNode | undefined {
  return nodes[id];
}

/** O(k) - Get ordered children of a parent node. */
export function getChildren(nodes: Record<string, PosterNode>, parentId: string): PosterNode[] {
  const parent = nodes[parentId];
  if (!parent) return [];
  return parent.childrenIds.map((id) => nodes[id]).filter(Boolean);
}

/** O(d) - Get ancestors from node to root (exclusive of node). */
export function getAncestors(nodes: Record<string, PosterNode>, id: string): PosterNode[] {
  const result: PosterNode[] = [];
  let currentId = nodes[id]?.parentId ?? null;
  while (currentId !== null) {
    const node = nodes[currentId];
    if (!node) break;
    result.push(node);
    currentId = node.parentId;
  }
  return result;
}

/** O(n) - Get all descendants of a node (recursive). */
export function getDescendants(nodes: Record<string, PosterNode>, id: string): PosterNode[] {
  const result: PosterNode[] = [];
  const collect = (nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return;
    for (const childId of node.childrenIds) {
      const child = nodes[childId];
      if (child) {
        result.push(child);
        collect(childId);
      }
    }
  };
  collect(id);
  return result;
}

/** O(n) - Get all leaf nodes under a root. */
export function getLeafNodes(nodes: Record<string, PosterNode>, rootId: string): LeafNode[] {
  const result: LeafNode[] = [];
  const collect = (nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return;
    if (isLeafNode(node)) {
      result.push(node);
      return;
    }
    for (const childId of node.childrenIds) {
      collect(childId);
    }
  };
  collect(rootId);
  return result;
}

/** O(1) - Check if node is the root (parentId === null). */
export function isRootNode(node: PosterNode): boolean {
  return node.parentId === null;
}

/** O(n) - Find the root canvas node by scanning for parentId === null. */
export function getRootNode(nodes: Record<string, PosterNode>): CanvasNode | undefined {
  for (const node of Object.values(nodes)) {
    if (node.type === 'canvas' && node.parentId === null) {
      return node as CanvasNode;
    }
  }
  return undefined;
}

/** Get the depth of a node (root = 0). */
export function getDepth(nodes: Record<string, PosterNode>, id: string): number {
  let depth = 0;
  let currentId = nodes[id]?.parentId ?? null;
  while (currentId !== null) {
    depth++;
    const node = nodes[currentId];
    if (!node) break;
    currentId = node.parentId;
  }
  return depth;
}

/** Get all sibling IDs (including self) from same parent. */
export function getSiblingIds(nodes: Record<string, PosterNode>, id: string): string[] {
  const node = nodes[id];
  if (!node || !node.parentId) return [id];
  const parent = nodes[node.parentId];
  return parent ? parent.childrenIds : [id];
}
