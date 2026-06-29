/**
 * Poster Card Editor - EngineCache (Derived Layer)
 *
 * Based on: 09-architecture-upgrades.md (修正2, 修正8)
 * Caches worldMatrix and worldBounds with dirty tracking.
 * Binds to a Zustand store instance for automatic invalidation.
 */

import type { PosterNode, Matrix2D } from './node-tree/types';
import type { SpatialGrid } from './snapping/spatial-grid';
import { multiplyMatrix, applyMatrixToPoint, IDENTITY_MATRIX } from './matrix-utils';
import { getDepth } from './node-tree/selectors';

export interface Rect {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface DerivedState {
  worldMatrices: Record<string, Matrix2D>;
  worldBounds: Record<string, Rect>;
  dirtyNodeIds: Set<string>;
  version: number;
}

export class EngineCache {
  readonly derived: DerivedState;
  private lastVersion: number = -1;

  constructor(private getNodes: () => Record<string, PosterNode>) {
    this.derived = {
      worldMatrices: {},
      worldBounds: {},
      dirtyNodeIds: new Set(),
      version: 0,
    };
  }

  /**
   * Mark all nodes as dirty. Call after any tree mutation.
   */
  markAllDirty(): void {
    const nodes = this.getNodes();
    this.derived.dirtyNodeIds = new Set(Object.keys(nodes));
    this.derived.version++;
  }

  /**
   * Mark specific nodes and their ancestors as dirty.
   */
  markDirty(nodeIds: string[]): void {
    const nodes = this.getNodes();
    for (const id of nodeIds) {
      this.markSubtreeDirty(nodes, id);
    }
    this.derived.version++;
  }

  private markSubtreeDirty(nodes: Record<string, PosterNode>, id: string): void {
    this.derived.dirtyNodeIds.add(id);
    const node = nodes[id];
    if (!node) return;

    // Mark all descendants
    for (const childId of node.childrenIds) {
      this.markSubtreeDirty(nodes, childId);
    }
  }

  /**
   * Flush all dirty nodes: recompute worldMatrix and worldBounds.
   * Processes in topological order (parent before child).
   */
  flushDirty(): void {
    const nodes = this.getNodes();
    if (this.derived.dirtyNodeIds.size === 0) return;

    // Sort by depth (shallow first = parent before child)
    const sorted = [...this.derived.dirtyNodeIds].sort(
      (a, b) => getDepth(nodes, a) - getDepth(nodes, b),
    );

    for (const id of sorted) {
      this.computeWorldMatrix(nodes, id);
      this.computeWorldBounds(nodes, id);
    }

    this.derived.dirtyNodeIds.clear();
  }

  /**
   * Rebuild the spatial grid if cache has been invalidated.
   * Call during drag start or when spatial queries are needed.
   */
  rebuildSpatial(spatialGrid: SpatialGrid): void {
    this.flushDirty();
    const nodes = this.getNodes();
    spatialGrid.rebuild(nodes, (id: string) => this.getWorldBounds(id));
  }

  /**
   * Get the world matrix for a node. Recomputes if dirty.
   */
  getWorldMatrix(id: string): Matrix2D {
    const nodes = this.getNodes();

    if (!this.derived.dirtyNodeIds.has(id) && this.derived.worldMatrices[id]) {
      return this.derived.worldMatrices[id];
    }

    this.computeWorldMatrix(nodes, id);
    return this.derived.worldMatrices[id] ?? IDENTITY_MATRIX;
  }

  /**
   * Get the world bounding box for a node. Recomputes if dirty.
   */
  getWorldBounds(id: string): Rect {
    const nodes = this.getNodes();

    if (!this.derived.dirtyNodeIds.has(id) && this.derived.worldBounds[id]) {
      return this.derived.worldBounds[id];
    }

    this.computeWorldBounds(nodes, id);
    return this.derived.worldBounds[id] ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  private computeWorldMatrix(nodes: Record<string, PosterNode>, id: string): void {
    const node = nodes[id];
    if (!node) return;

    if (!node.parentId) {
      // Root node: world matrix = local matrix
      this.derived.worldMatrices[id] = node.localMatrix;
      this.derived.dirtyNodeIds.delete(id);
      return;
    }

    // Ensure parent's world matrix is computed first
    if (this.derived.dirtyNodeIds.has(node.parentId)) {
      this.computeWorldMatrix(nodes, node.parentId);
    }

    const parentWorld = this.derived.worldMatrices[node.parentId] ?? IDENTITY_MATRIX;
    this.derived.worldMatrices[id] = multiplyMatrix(parentWorld, node.localMatrix);
    this.derived.dirtyNodeIds.delete(id);
  }

  private computeWorldBounds(nodes: Record<string, PosterNode>, id: string): void {
    const node = nodes[id];
    if (!node) return;

    const wm = this.derived.worldMatrices[id] ?? IDENTITY_MATRIX;

    // Transform the four corners
    const corners = [
      applyMatrixToPoint(wm, { x: 0, y: 0 }),
      applyMatrixToPoint(wm, { x: node.width, y: 0 }),
      applyMatrixToPoint(wm, { x: 0, y: node.height }),
      applyMatrixToPoint(wm, { x: node.width, y: node.height }),
    ];

    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);

    this.derived.worldBounds[id] = {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    };
  }

  /**
   * Clear all cached data. Call when the entire tree is replaced.
   */
  clear(): void {
    this.derived.worldMatrices = {};
    this.derived.worldBounds = {};
    this.derived.dirtyNodeIds.clear();
    this.derived.version++;
  }
}
