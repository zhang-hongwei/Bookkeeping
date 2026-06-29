/**
 * GuideRenderer - Manages guide line visualization via a line pool.
 *
 * Pre-allocates Konva.Line objects to avoid create/destroy overhead
 * during drag operations. Renders on a dedicated Layer (listening: false)
 * that sits above the elements layer so guides are never clipped.
 */

import type Konva from 'konva';
import type { SnapGuide } from './types';

const POOL_SIZE = 20;
const LINE_COLOR = 'rgba(255, 64, 129, 0.8)';
const LINE_EXTENT = 10000;

export class GuideRenderer {
  private layer: Konva.Layer | null = null;
  private pool: Konva.Line[] = [];

  /**
   * Attach to a Konva Layer (should be listening: false).
   * Creates the line pool as children of this Layer.
   */
  attach(layer: Konva.Layer): void {
    if (this.layer) this.destroy();
    this.layer = layer;

    for (let i = 0; i < POOL_SIZE; i++) {
      const line = new Konva.Line({
        points: [-LINE_EXTENT, 0, LINE_EXTENT, 0],
        stroke: LINE_COLOR,
        strokeWidth: 1,
        dash: [4, 4],
        visible: false,
        listening: false,
        perfectDrawEnabled: false,
      });
      layer.add(line);
      this.pool.push(line);
    }
  }

  /**
   * Render active snap guides by showing/reusing pooled lines.
   */
  render(guides: SnapGuide[]): void {
    if (!this.layer) return;

    for (const line of this.pool) line.visible(false);

    const count = Math.min(guides.length, this.pool.length);
    for (let i = 0; i < count; i++) {
      const guide = guides[i];
      const line = this.pool[i];

      if (guide.direction === 'horizontal') {
        line.points([-LINE_EXTENT, 0, LINE_EXTENT, 0]);
        line.position({ x: 0, y: guide.position });
      } else {
        line.points([0, -LINE_EXTENT, 0, LINE_EXTENT]);
        line.position({ x: guide.position, y: 0 });
      }
      line.visible(true);
    }

    this.layer.batchDraw();
  }

  clear(): void {
    if (!this.layer) return;
    for (const line of this.pool) line.visible(false);
    this.layer.batchDraw();
  }

  destroy(): void {
    for (const line of this.pool) line.destroy();
    this.pool = [];
    this.layer = null;
  }
}
