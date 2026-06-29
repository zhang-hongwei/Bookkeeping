/**
 * GuideManager - Orchestrates snap calculation and guide rendering.
 *
 * Single entry point for drag/resize snap operations.
 * Coordinates: EngineCache → SpatialGrid → SnapEngine → GuideRenderer.
 */

import type Konva from 'konva';
import { useEditorStore, engineCache } from '../store';
import { computeSnap } from './snap-engine';
import { SpatialGrid } from './spatial-grid';
import { GuideRenderer } from './guide-renderer';

export class GuideManager {
  private renderer: GuideRenderer;
  private spatialGrid: SpatialGrid;
  private snapRange: number;

  constructor(snapRange = 5) {
    this.renderer = new GuideRenderer();
    this.spatialGrid = new SpatialGrid(200);
    this.snapRange = snapRange;
  }

  attachLayer(layer: Konva.Layer): void {
    this.renderer.attach(layer);
  }

  /**
   * Compute snap for a dragging node and render active guides.
   * Returns the snapped position, or null if no snap occurred.
   */
  handleDragMove(target: Konva.Node): { x: number; y: number } | null {
    const stage = target.getStage();
    if (!stage) return null;

    const state = useEditorStore.getState();
    if (!state.rootNodeId) return null;

    const draggedId = target.name()?.replace('element-', '') ?? '';
    const node = state.nodes[draggedId];
    if (!node) return null;

    if (this.spatialGrid.isDirty()) {
      engineCache.rebuildSpatial(this.spatialGrid);
    }

    const dragX = target.x();
    const dragY = target.y();

    const result = computeSnap(
      state.nodes,
      state.rootNodeId,
      this.spatialGrid,
      draggedId,
      dragX,
      dragY,
      node.width,
      node.height,
      this.snapRange,
    );

    this.renderer.render(result.guides);

    if (result.snappedX !== null || result.snappedY !== null) {
      return {
        x: result.snappedX ?? dragX,
        y: result.snappedY ?? dragY,
      };
    }

    return null;
  }

  handleDragEnd(): void {
    this.renderer.clear();
    this.spatialGrid.markDirty();
  }

  destroy(): void {
    this.renderer.destroy();
  }
}
