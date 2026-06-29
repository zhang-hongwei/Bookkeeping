/**
 * Poster Card Editor - Snapping Types
 *
 * Based on: 04-snapping-system.md, 09-architecture-upgrades.md (修正6)
 */

export type SnapType = 'edge' | 'center' | 'spacing' | 'distribution' | 'grid';

export interface SnapPoint {
  type: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v';
  value: number;
  nodeId: string | null; // null = canvas edge/center
}

export interface SnapResult {
  snappedX: number | null;
  snappedY: number | null;
  guides: SnapGuide[];
}

export interface SnapGuide {
  direction: 'horizontal' | 'vertical';
  position: number;
  source: SnapPoint;
}

export interface SnapContext {
  draggingBounds: { minX: number; minY: number; maxX: number; maxY: number };
  draggingIds: Set<string>;
  snapRange: number;
  snapTypes: Set<SnapType>;
}
