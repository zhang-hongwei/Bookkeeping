/**
 * Poster Card Editor - Spatial Grid
 *
 * Based on: 04-snapping-system.md section 2
 * Grid Hash spatial index for O(candidates) snap lookups.
 */

import type { PosterNode } from '../node-tree/types';
import { getLeafNodes, getRootNode } from '../node-tree/selectors';

export class SpatialGrid {
  private cellSize: number;
  private cells: Map<string, Set<string>>;
  private nodeBounds: Map<string, { minX: number; minY: number; maxX: number; maxY: number }>;
  private dirty: boolean;

  constructor(cellSize = 200) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.nodeBounds = new Map();
    this.dirty = true;
  }

  /**
   * Rebuild the spatial index from the node tree.
   * Uses world bounds from the provided getWorldBounds function.
   */
  rebuild(
    nodes: Record<string, PosterNode>,
    getWorldBounds: (id: string) => { minX: number; minY: number; maxX: number; maxY: number },
  ): void {
    this.cells.clear();
    this.nodeBounds.clear();

    const root = getRootNode(nodes);
    if (!root) return;

    // Only index visible, unlocked leaf nodes
    const leaves = getLeafNodes(nodes, root.id);

    for (const node of leaves) {
      if (!node.visible || node.locked) continue;

      const bounds = getWorldBounds(node.id);
      this.nodeBounds.set(node.id, bounds);

      // Calculate covered grid cells
      const startCol = Math.floor(bounds.minX / this.cellSize);
      const endCol = Math.floor(bounds.maxX / this.cellSize);
      const startRow = Math.floor(bounds.minY / this.cellSize);
      const endRow = Math.floor(bounds.maxY / this.cellSize);

      for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
          const key = `${col},${row}`;
          if (!this.cells.has(key)) {
            this.cells.set(key, new Set());
          }
          this.cells.get(key)!.add(node.id);
        }
      }
    }

    this.dirty = false;
  }

  /**
   * Query all node IDs whose bounds overlap the given rectangle.
   */
  queryRange(minX: number, minY: number, maxX: number, maxY: number): Set<string> {
    const result = new Set<string>();

    const startCol = Math.floor(minX / this.cellSize);
    const endCol = Math.floor(maxX / this.cellSize);
    const startRow = Math.floor(minY / this.cellSize);
    const endRow = Math.floor(maxY / this.cellSize);

    for (let col = startCol; col <= endCol; col++) {
      for (let row = startRow; row <= endRow; row++) {
        const key = `${col},${row}`;
        const cellNodes = this.cells.get(key);
        if (cellNodes) {
          for (const nodeId of cellNodes) {
            // Precise check: node bounds actually intersect query range
            const bounds = this.nodeBounds.get(nodeId);
            if (bounds && rectsIntersect(
              { minX, minY, maxX, maxY },
              bounds,
            )) {
              result.add(nodeId);
            }
          }
        }
      }
    }

    return result;
  }

  getNodeBounds(id: string): { minX: number; minY: number; maxX: number; maxY: number } | undefined {
    return this.nodeBounds.get(id);
  }

  isDirty(): boolean {
    return this.dirty;
  }

  markDirty(): void {
    this.dirty = true;
  }

  clear(): void {
    this.cells.clear();
    this.nodeBounds.clear();
    this.dirty = true;
  }
}

function rectsIntersect(
  a: { minX: number; minY: number; maxX: number; maxY: number },
  b: { minX: number; minY: number; maxX: number; maxY: number },
): boolean {
  return !(a.maxX < b.minX || b.maxX < a.minX || a.maxY < b.minY || b.maxY < a.minY);
}
