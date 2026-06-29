/**
 * Poster Card Editor - Snap Engine
 *
 * Based on: 04-snapping-system.md section 3, 09-architecture-upgrades.md (修正6)
 * Computes snap positions using spatial grid for O(candidates) performance.
 * Supports edge, center, spacing, distribution, and grid snap types.
 */

import type { PosterNode } from '../node-tree/types';
import type { SnapResult, SnapGuide, SnapPoint, SnapType } from './types';
import { SpatialGrid } from './spatial-grid';

// ── Internal result type ──

interface SnapCandidate {
  delta: number;
  snapValue: number;
  anchor: number;
  point: SnapPoint;
}

// ── Main entry point ──

/**
 * Compute snap position for a dragging element.
 * Returns snapped X/Y coordinates and guide lines to display.
 *
 * Priority per axis: distribution > spacing > edge/center > grid
 */
export function computeSnap(
  nodes: Record<string, PosterNode>,
  rootNodeId: string,
  spatialGrid: SpatialGrid,
  dragNodeId: string,
  dragX: number,
  dragY: number,
  dragWidth: number,
  dragHeight: number,
  snapRange = 5,
  snapTypes?: Set<SnapType>,
  gridSize = 10,
): SnapResult {
  const types = snapTypes ?? new Set<SnapType>(['edge', 'center', 'spacing', 'distribution', 'grid']);

  const root = nodes[rootNodeId];
  if (!root) return { snappedX: null, snappedY: null, guides: [] };

  const needEdgeCenter = types.has('edge') || types.has('center');
  const needDistribution = types.has('distribution');
  const needSpacing = types.has('spacing');
  const needGrid = types.has('grid');

  // ── Step 1: Edge/Center snap ──
  let edgeCenterResult: { snappedX: number | null; snappedY: number | null; guides: SnapGuide[] } | null = null;

  if (needEdgeCenter) {
    edgeCenterResult = computeEdgeCenterSnap(
      nodes, rootNodeId, spatialGrid,
      dragNodeId, dragX, dragY,
      dragWidth, dragHeight, snapRange,
      types.has('edge'), types.has('center'),
    );
  }

  // ── Step 2: Distribution snap (higher priority than spacing) ──
  let distributionResult: { snappedX: number | null; snappedY: number | null; guides: SnapGuide[] } | null = null;

  if (needDistribution) {
    distributionResult = computeDistributionSnap(
      nodes, spatialGrid,
      dragNodeId, dragX, dragY,
      dragWidth, dragHeight, snapRange,
    );
  }

  // ── Step 2.5: Spacing snap ──
  let spacingResult: { snappedX: number | null; snappedY: number | null; guides: SnapGuide[] } | null = null;

  if (needSpacing) {
    // Skip spacing on axes where distribution already produced a snap
    const skipX = distributionResult?.snappedX !== null;
    const skipY = distributionResult?.snappedY !== null;

    if (!skipX || !skipY) {
      spacingResult = computeSpacingSnap(
        nodes, spatialGrid,
        dragNodeId, dragX, dragY,
        dragWidth, dragHeight, snapRange,
      );
      // Null out axes already claimed by distribution
      if (skipX && spacingResult) spacingResult = { ...spacingResult, snappedX: null };
      if (skipY && spacingResult) spacingResult = { ...spacingResult, snappedY: null };
    }
  }

  // ── Step 3: Grid snap (fallback when no higher-priority snap found) ──
  let gridResult: { snappedX: number | null; snappedY: number | null; guides: SnapGuide[] } | null = null;

  if (needGrid) {
    const hasDistributionX = distributionResult?.snappedX !== null;
    const hasDistributionY = distributionResult?.snappedY !== null;
    const hasSpacingX = spacingResult?.snappedX !== null;
    const hasSpacingY = spacingResult?.snappedY !== null;
    const hasEdgeCenterX = edgeCenterResult?.snappedX !== null;
    const hasEdgeCenterY = edgeCenterResult?.snappedY !== null;

    const needGridX = !hasEdgeCenterX && !hasDistributionX && !hasSpacingX;
    const needGridY = !hasEdgeCenterY && !hasDistributionY && !hasSpacingY;

    if (needGridX || needGridY) {
      gridResult = computeGridSnap(dragX, dragY, dragWidth, dragHeight, gridSize, needGridX, needGridY);
    }
  }

  // ── Step 4: Merge results ──
  // Priority per axis: distribution > spacing > edge/center > grid
  const snappedX = distributionResult?.snappedX
    ?? spacingResult?.snappedX
    ?? edgeCenterResult?.snappedX
    ?? gridResult?.snappedX
    ?? null;
  const snappedY = distributionResult?.snappedY
    ?? spacingResult?.snappedY
    ?? edgeCenterResult?.snappedY
    ?? gridResult?.snappedY
    ?? null;

  const guides: SnapGuide[] = [
    ...(edgeCenterResult?.guides ?? []),
    ...(distributionResult?.guides ?? []),
    ...(spacingResult?.guides ?? []),
    ...(gridResult?.guides ?? []),
  ];

  return { snappedX, snappedY, guides };
}

// ── Edge/Center snap (original logic) ──

function computeEdgeCenterSnap(
  nodes: Record<string, PosterNode>,
  rootNodeId: string,
  spatialGrid: SpatialGrid,
  dragNodeId: string,
  dragX: number,
  dragY: number,
  dragWidth: number,
  dragHeight: number,
  snapRange: number,
  includeEdge: boolean,
  includeCenter: boolean,
): SnapResult {
  const root = nodes[rootNodeId];
  if (!root) return { snappedX: null, snappedY: null, guides: [] };

  // Determine which point types to include based on snap type flags
  const horizontalTypes = new Set<string>();
  const verticalTypes = new Set<string>();

  if (includeEdge) {
    horizontalTypes.add('left');
    horizontalTypes.add('right');
    verticalTypes.add('top');
    verticalTypes.add('bottom');
  }
  if (includeCenter) {
    horizontalTypes.add('center-h');
    verticalTypes.add('center-v');
  }

  // Query spatial grid for nearby candidates
  const candidates = spatialGrid.queryRange(
    dragX - snapRange,
    dragY - snapRange,
    dragX + dragWidth + snapRange,
    dragY + dragHeight + snapRange,
  );

  // Build snap points filtered by enabled types
  const points: SnapPoint[] = [];

  // Canvas edges and centers
  const cw = root.width;
  const ch = root.height;

  if (horizontalTypes.has('left')) points.push({ type: 'left', value: 0, nodeId: null });
  if (horizontalTypes.has('right')) points.push({ type: 'right', value: cw, nodeId: null });
  if (horizontalTypes.has('center-h')) points.push({ type: 'center-h', value: cw / 2, nodeId: null });
  if (verticalTypes.has('top')) points.push({ type: 'top', value: 0, nodeId: null });
  if (verticalTypes.has('bottom')) points.push({ type: 'bottom', value: ch, nodeId: null });
  if (verticalTypes.has('center-v')) points.push({ type: 'center-v', value: ch / 2, nodeId: null });

  // Candidate element edges and centers
  for (const nodeId of candidates) {
    if (nodeId === dragNodeId) continue;
    const bounds = spatialGrid.getNodeBounds(nodeId);
    if (!bounds) continue;

    if (horizontalTypes.has('left')) points.push({ type: 'left', value: bounds.minX, nodeId });
    if (horizontalTypes.has('right')) points.push({ type: 'right', value: bounds.maxX, nodeId });
    if (horizontalTypes.has('center-h')) points.push({ type: 'center-h', value: (bounds.minX + bounds.maxX) / 2, nodeId });
    if (verticalTypes.has('top')) points.push({ type: 'top', value: bounds.minY, nodeId });
    if (verticalTypes.has('bottom')) points.push({ type: 'bottom', value: bounds.maxY, nodeId });
    if (verticalTypes.has('center-v')) points.push({ type: 'center-v', value: (bounds.minY + bounds.maxY) / 2, nodeId });
  }

  // X-axis anchors of dragging element
  const xAnchors = [
    { value: dragX, type: 'left' as const },
    { value: dragX + dragWidth / 2, type: 'center-h' as const },
    { value: dragX + dragWidth, type: 'right' as const },
  ];

  // Y-axis anchors
  const yAnchors = [
    { value: dragY, type: 'top' as const },
    { value: dragY + dragHeight / 2, type: 'center-v' as const },
    { value: dragY + dragHeight, type: 'bottom' as const },
  ];

  const bestX = findBestSnap(xAnchors, points, snapRange, horizontalTypes);
  const bestY = findBestSnap(yAnchors, points, snapRange, verticalTypes);

  const guides: SnapGuide[] = [];
  const snappedX = bestX ? dragX + bestX.delta : null;
  const snappedY = bestY ? dragY + bestY.delta : null;

  if (bestX) {
    guides.push({ direction: 'vertical', position: bestX.snapValue, source: bestX.point });
  }
  if (bestY) {
    guides.push({ direction: 'horizontal', position: bestY.snapValue, source: bestY.point });
  }

  return { snappedX, snappedY, guides };
}

// ── Distribution snap ──

/**
 * Detects when dragging a node creates perfectly equal spacing among 3+ nodes
 * in the same parent container. Unlike spacing snap which uses the existing
 * sibling span as a fixed boundary, distribution snap considers the dragged
 * node itself as a potential outermost boundary node and recomputes the full
 * equal-gap layout from scratch for each possible insertion position.
 *
 * Algorithm (per axis):
 * 1. Collect visible siblings in the same parent (excluding the dragged node).
 * 2. For each possible insertion index in the sorted order:
 *    a. Build the full set of nodes (siblings + dragged) at that position.
 *    b. Determine the outermost start and end from the full set.
 *    c. Compute equalGap = (totalSpan - totalNodeSizes) / (nodeCount - 1).
 *    d. Walk the equal-gap layout and check whether the dragged node's current
 *       position is within snapRange of its assigned equal-gap position.
 * 3. Return the snap position and distribution guides for the best match.
 */
function computeDistributionSnap(
  nodes: Record<string, PosterNode>,
  spatialGrid: SpatialGrid,
  dragNodeId: string,
  dragX: number,
  dragY: number,
  dragWidth: number,
  dragHeight: number,
  snapRange: number,
): SnapResult {
  const dragNode = nodes[dragNodeId];
  if (!dragNode || dragNode.parentId === null) {
    return { snappedX: null, snappedY: null, guides: [] };
  }

  const parent = nodes[dragNode.parentId];
  if (!parent) return { snappedX: null, snappedY: null, guides: [] };

  // Collect visible, unlocked siblings (excluding the dragged node)
  const siblingIds = parent.childrenIds.filter(
    (id) => id !== dragNodeId && nodes[id]?.visible && !nodes[id]?.locked,
  );

  // Need at least 2 siblings (3+ total including the dragged node)
  if (siblingIds.length < 2) {
    return { snappedX: null, snappedY: null, guides: [] };
  }

  const guides: SnapGuide[] = [];
  let snappedX: number | null = null;
  let snappedY: number | null = null;

  // ── Horizontal distribution ──
  const hResult = computeAxisDistributionSnap(
    siblingIds,
    spatialGrid,
    dragX,
    dragWidth,
    snapRange,
    'horizontal',
  );
  if (hResult) {
    snappedX = hResult.snapped;
    guides.push(...hResult.guides);
  }

  // ── Vertical distribution ──
  const vResult = computeAxisDistributionSnap(
    siblingIds,
    spatialGrid,
    dragY,
    dragHeight,
    snapRange,
    'vertical',
  );
  if (vResult) {
    snappedY = vResult.snapped;
    guides.push(...vResult.guides);
  }

  return { snappedX, snappedY, guides };
}

/**
 * Internal node entry used during distribution computation.
 * `id` is null for the virtual dragged-node entry.
 */
interface DistNode {
  id: string | null;
  start: number;
  end: number;
}

interface AxisDistributionResult {
  snapped: number;
  guides: SnapGuide[];
}

/**
 * For a single axis, try every possible insertion position for the dragged
 * node among its sorted siblings. For each insertion, compute the equal-gap
 * layout and check whether the drag position is within snapRange.
 *
 * Returns the closest snap match, or null if no distribution is detected.
 */
function computeAxisDistributionSnap(
  siblingIds: string[],
  spatialGrid: SpatialGrid,
  dragPos: number,
  dragSize: number,
  snapRange: number,
  axis: 'horizontal' | 'vertical',
): AxisDistributionResult | null {
  // Gather sibling positions along the axis
  const siblings: DistNode[] = [];
  for (const id of siblingIds) {
    const bounds = spatialGrid.getNodeBounds(id);
    if (!bounds) continue;
    siblings.push({
      id,
      start: axis === 'horizontal' ? bounds.minX : bounds.minY,
      end: axis === 'horizontal' ? bounds.maxX : bounds.maxY,
    });
  }

  if (siblings.length < 2) return null;

  // Sort siblings by start position
  siblings.sort((a, b) => a.start - b.start);

  // The virtual dragged node entry
  const dragEntry: DistNode = { id: null, start: dragPos, end: dragPos + dragSize };

  let bestResult: AxisDistributionResult | null = null;
  let bestDelta = Infinity;

  // Try inserting the dragged node at every position in the sorted order.
  // Each insertion index produces a different arrangement and therefore a
  // potentially different equal-gap layout.
  for (let insertIdx = 0; insertIdx <= siblings.length; insertIdx++) {
    // Build the full ordered set: siblings with drag inserted at insertIdx
    const allNodes: DistNode[] = [
      ...siblings.slice(0, insertIdx),
      dragEntry,
      ...siblings.slice(insertIdx),
    ];

    // The outermost boundaries determine the total span for equal distribution.
    // Unlike spacing snap, the dragged node can extend the span if it is the
    // leftmost or rightmost node in the arrangement.
    const minStart = Math.min(...allNodes.map((n) => n.start));
    const maxEnd = Math.max(...allNodes.map((n) => n.end));
    const totalSpan = maxEnd - minStart;

    const nodeCount = allNodes.length;
    const totalNodeSizes = allNodes.reduce((sum, n) => sum + (n.end - n.start), 0);
    const gapCount = nodeCount - 1;
    const equalGap = (totalSpan - totalNodeSizes) / gapCount;

    // Skip layouts that would cause overlapping nodes
    if (equalGap < -0.5) continue;

    // Walk the equal-gap layout from left to right and find the position
    // assigned to the dragged node (the one with id === null).
    let cursor = minStart;
    let dragSnapPos: number | null = null;

    for (let i = 0; i < allNodes.length; i++) {
      const nodeSize = allNodes[i].end - allNodes[i].start;
      if (allNodes[i].id === null) {
        dragSnapPos = cursor;
        break;
      }
      cursor += nodeSize + Math.max(0, equalGap);
    }

    if (dragSnapPos === null) continue;

    // Check if the current drag position is within snap range
    const delta = dragSnapPos - dragPos;
    if (Math.abs(delta) <= snapRange && Math.abs(delta) < bestDelta) {
      bestDelta = Math.abs(delta);
      bestResult = {
        snapped: dragPos + delta,
        guides: buildDistributionGuides(allNodes, equalGap, minStart, axis),
      };
    }
  }

  return bestResult;
}

/**
 * Build guide lines for a detected distribution snap.
 * Emits one guide at the start edge of each node so the user can see
 * the equal spacing across the full distribution.
 */
function buildDistributionGuides(
  allNodes: DistNode[],
  equalGap: number,
  spanStart: number,
  axis: 'horizontal' | 'vertical',
): SnapGuide[] {
  const guides: SnapGuide[] = [];
  const snapType = axis === 'horizontal' ? 'left' as const : 'top' as const;

  let cursor = spanStart;
  for (let i = 0; i < allNodes.length; i++) {
    const nodeSize = allNodes[i].end - allNodes[i].start;

    // Guide at the start edge of each node in the distribution
    guides.push({
      direction: axis,
      position: cursor,
      source: { type: snapType, value: cursor, nodeId: allNodes[i].id },
    });

    cursor += nodeSize;
    if (i < allNodes.length - 1) {
      cursor += Math.max(0, equalGap);
    }
  }

  return guides;
}

// ── Spacing snap ──

/**
 * Computes equal-spacing snap by examining sibling nodes in the same parent.
 * When the dragged node's position would create equal gaps between siblings,
 * a snap is generated. Requires at least 2 other siblings.
 */
function computeSpacingSnap(
  nodes: Record<string, PosterNode>,
  spatialGrid: SpatialGrid,
  dragNodeId: string,
  dragX: number,
  dragY: number,
  dragWidth: number,
  dragHeight: number,
  snapRange: number,
): SnapResult {
  const dragNode = nodes[dragNodeId];
  if (!dragNode || dragNode.parentId === null) {
    return { snappedX: null, snappedY: null, guides: [] };
  }

  const parent = nodes[dragNode.parentId];
  if (!parent) return { snappedX: null, snappedY: null, guides: [] };

  // Collect visible, unlocked siblings (excluding the dragged node)
  const siblingIds = parent.childrenIds.filter(
    (id) => id !== dragNodeId && nodes[id]?.visible && !nodes[id]?.locked,
  );

  // Need at least 2 siblings to compute equal spacing
  if (siblingIds.length < 2) {
    return { snappedX: null, snappedY: null, guides: [] };
  }

  const guides: SnapGuide[] = [];
  let snappedX: number | null = null;
  let snappedY: number | null = null;

  // ── Horizontal spacing ──
  const hResult = computeAxisSpacingSnap(
    siblingIds,
    spatialGrid,
    dragX,
    dragWidth,
    snapRange,
    'horizontal',
  );
  if (hResult) {
    snappedX = hResult.snapped;
    guides.push(...hResult.guides);
  }

  // ── Vertical spacing ──
  const vResult = computeAxisSpacingSnap(
    siblingIds,
    spatialGrid,
    dragY,
    dragHeight,
    snapRange,
    'vertical',
  );
  if (vResult) {
    snappedY = vResult.snapped;
    guides.push(...vResult.guides);
  }

  return { snappedX, snappedY, guides };
}

interface AxisSpacingResult {
  snapped: number;
  guides: SnapGuide[];
}

/**
 * For a single axis, compute whether moving the drag node to a specific
 * position would produce equal gaps among all siblings.
 */
function computeAxisSpacingSnap(
  siblingIds: string[],
  spatialGrid: SpatialGrid,
  dragPos: number,
  dragSize: number,
  snapRange: number,
  axis: 'horizontal' | 'vertical',
): AxisSpacingResult | null {
  // Gather sibling positions along the axis
  const siblings: Array<{ id: string; start: number; end: number }> = [];
  for (const id of siblingIds) {
    const bounds = spatialGrid.getNodeBounds(id);
    if (!bounds) continue;
    siblings.push({
      id,
      start: axis === 'horizontal' ? bounds.minX : bounds.minY,
      end: axis === 'horizontal' ? bounds.maxX : bounds.maxY,
    });
  }

  if (siblings.length < 2) return null;

  // Sort siblings by start position
  siblings.sort((a, b) => a.start - b.start);

  // Compute the gap that would make all nodes equally spaced.
  // The approach: iterate through sorted siblings and for each gap where
  // the drag node could be inserted, compute the equal-gap position.
  // All nodes including drag: compute the total span and equal gap
  const allStarts = siblings.map((s) => s.start);
  const allEnds = siblings.map((s) => s.end);

  // Total span from first sibling start to last sibling end
  const spanStart = allStarts[0];
  const spanEnd = allEnds[allEnds.length - 1];
  const totalSpan = spanEnd - spanStart;

  // Total occupied width of siblings (not including drag node)
  const totalOccupied = siblings.reduce((sum, s) => sum + (s.end - s.start), 0) + dragSize;

  // Number of gaps = number of nodes (siblings + drag)
  const nodeCount = siblings.length + 1;
  const gapCount = nodeCount - 1;
  const equalGap = (totalSpan - totalOccupied) / gapCount;

  // Negative or very small gap means nodes would overlap -- skip
  if (equalGap < -0.5) return null;

  // Try inserting drag node at each gap position and see if it matches
  // the current drag position within snap range
  let currentPos = spanStart;

  for (let i = 0; i <= siblings.length; i++) {
    const snapPos = currentPos;

    // Check if drag position is within snap range of this equal-gap position
    const delta = snapPos - dragPos;
    if (Math.abs(delta) <= snapRange) {
      const guidePoint: SnapPoint = {
        type: axis === 'horizontal' ? 'left' : 'top',
        value: snapPos,
        nodeId: null, // spacing snap is not tied to a single node
      };

      return {
        snapped: dragPos + delta,
        guides: [{
          direction: axis,
          position: snapPos,
          source: guidePoint,
        }],
      };
    }

    // Advance past the node at position i (if not past siblings array)
    if (i < siblings.length) {
      currentPos += (siblings[i].end - siblings[i].start) + Math.max(0, equalGap);
    }
  }

  return null;
}

// ── Grid snap ──

/**
 * Snaps coordinates to a configurable grid interval.
 * Returns snapped position or null if already aligned.
 */
function computeGridSnap(
  dragX: number,
  dragY: number,
  _dragWidth: number,
  _dragHeight: number,
  gridSize: number,
  needX: boolean,
  needY: boolean,
): SnapResult {
  if (gridSize <= 0) return { snappedX: null, snappedY: null, guides: [] };

  const guides: SnapGuide[] = [];
  let snappedX: number | null = null;
  let snappedY: number | null = null;

  if (needX) {
    const nearestGridX = Math.round(dragX / gridSize) * gridSize;
    if (nearestGridX !== dragX) {
      snappedX = nearestGridX;
      guides.push({
        direction: 'vertical',
        position: nearestGridX,
        source: { type: 'left', value: nearestGridX, nodeId: null },
      });
    }
  }

  if (needY) {
    const nearestGridY = Math.round(dragY / gridSize) * gridSize;
    if (nearestGridY !== dragY) {
      snappedY = nearestGridY;
      guides.push({
        direction: 'horizontal',
        position: nearestGridY,
        source: { type: 'top', value: nearestGridY, nodeId: null },
      });
    }
  }

  return { snappedX, snappedY, guides };
}

// ── Helpers ──

function findBestSnap(
  anchors: Array<{ value: number; type: string }>,
  points: SnapPoint[],
  snapRange: number,
  allowedTypes: Set<string>,
): SnapCandidate | null {
  let best: SnapCandidate | null = null;

  for (const anchor of anchors) {
    if (!allowedTypes.has(anchor.type)) continue;

    for (const point of points) {
      if (point.type !== anchor.type) continue;
      const delta = point.value - anchor.value;
      if (Math.abs(delta) <= snapRange) {
        if (!best || Math.abs(delta) < Math.abs(best.delta)) {
          best = { delta, snapValue: point.value, anchor: anchor.value, point };
        }
      }
    }
  }

  return best;
}
