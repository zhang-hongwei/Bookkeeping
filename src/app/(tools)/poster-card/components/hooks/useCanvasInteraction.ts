/**
 * Canvas interaction hook - wheel zoom, mouse pan, marquee box selection,
 * and multi-drag from within selection bounds.
 */

"use client";

import { useRef, useCallback, useEffect, useState } from 'react';
import type Konva from 'konva';
import { useEditorStore, engineCache } from '../../engine/store';
import { rectHitTest } from '../../engine/selection/hit-test';
import { decomposeMatrix } from '../../engine/matrix-utils';
import { moveSelectedWithTransaction } from '../../engine/selection/selection-ops';

export interface MarqueeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useCanvasInteraction(
  stageRef: React.RefObject<Konva.Stage | null>,
  zoom: number,
  isSpaceHeld: React.RefObject<boolean>,
) {
  const isPanning = useRef(false);
  const panStart = useRef<{ x: number; y: number; stageX: number; stageY: number } | null>(null);

  // Marquee state
  const marqueeStart = useRef<{ x: number; y: number } | null>(null);
  const isMarqueeActive = useRef(false);
  const [marqueeRect, setMarqueeRect] = useState<MarqueeRect | null>(null);

  // Multi-drag state (dragging from blank area within selection bounds)
  const multiDragRef = useRef<{
    selectedIds: Set<string>;
    positions: Record<string, { x: number; y: number }>;
    mouseStart: { x: number; y: number };
  } | null>(null);
  const isMultiDragging = useRef(false);

  // Convert screen position to world (canvas) coordinates
  const screenToWorld = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const stage = stageRef.current;
      if (!stage) return null;
      const containerRect = stage.container().getBoundingClientRect();
      const stageX = clientX - containerRect.left;
      const stageY = clientY - containerRect.top;
      return {
        x: (stageX - stage.x()) / zoom,
        y: (stageY - stage.y()) / zoom,
      };
    },
    [stageRef, zoom],
  );

  // Wheel zoom toward cursor
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const oldScale = zoom;
      const factor = e.evt.deltaY > 0 ? 0.92 : 1.08;
      const newScale = Math.max(0.1, Math.min(3, oldScale * factor));

      if (newScale === oldScale) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      useEditorStore.getState().setZoom(newScale);

      stage.scale({ x: newScale, y: newScale });
      stage.position({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
      stage.batchDraw();
    },
    [zoom, stageRef],
  );

  // Check if a world point is inside the bounding box of currently selected nodes
  const isPointInSelectionBounds = useCallback(
    (worldPos: { x: number; y: number }): boolean => {
      const state = useEditorStore.getState();
      if (state.selectedIds.size === 0) return false;

      engineCache.flushDirty();

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const id of state.selectedIds) {
        const bounds = engineCache.getWorldBounds(id);
        if (bounds) {
          minX = Math.min(minX, bounds.minX);
          minY = Math.min(minY, bounds.minY);
          maxX = Math.max(maxX, bounds.maxX);
          maxY = Math.max(maxY, bounds.maxY);
        }
      }

      return (
        minX !== Infinity &&
        worldPos.x >= minX &&
        worldPos.x <= maxX &&
        worldPos.y >= minY &&
        worldPos.y <= maxY
      );
    },
    [],
  );

  // Stage mouse down: start pan OR multi-drag OR marquee selection
  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const clickedOnStage = e.target === e.target.getStage();
      const isMiddleButton = e.evt.button === 1;

      // Space+drag or middle-click → pan mode
      if (isSpaceHeld.current || isMiddleButton) {
        e.evt.preventDefault();
        // If starting a pan, cancel any pending marquee or multi-drag
        isMarqueeActive.current = false;
        marqueeStart.current = null;
        setMarqueeRect(null);
        isMultiDragging.current = false;
        multiDragRef.current = null;

        isPanning.current = true;
        const stage = stageRef.current;
        if (!stage) return;
        panStart.current = {
          x: e.evt.clientX,
          y: e.evt.clientY,
          stageX: stage.x(),
          stageY: stage.y(),
        };
        return;
      }

      // Click on empty stage
      if (clickedOnStage) {
        const worldPos = screenToWorld(e.evt.clientX, e.evt.clientY);

        // Check if click is within selection bounds → start multi-drag
        if (worldPos && isPointInSelectionBounds(worldPos)) {
          const state = useEditorStore.getState();
          const positions: Record<string, { x: number; y: number }> = {};
          for (const id of state.selectedIds) {
            const n = state.nodes[id];
            if (n) {
              const { x, y } = decomposeMatrix(n.localMatrix);
              positions[id] = { x, y };
            }
          }
          multiDragRef.current = {
            selectedIds: new Set(state.selectedIds),
            positions,
            mouseStart: worldPos,
          };
          isMultiDragging.current = true;
          // Cancel any pending marquee
          isMarqueeActive.current = false;
          marqueeStart.current = null;
          return;
        }

        // Outside selection bounds → start marquee selection
        if (worldPos) {
          marqueeStart.current = worldPos;
          isMarqueeActive.current = false;
          setMarqueeRect(null);
        }
        // Clear selection immediately on click (will be overridden if drag becomes marquee)
        useEditorStore.getState().clearSelection();
      }
    },
    [stageRef, isSpaceHeld, screenToWorld, isPointInSelectionBounds],
  );

  // Global move/up handlers (document-level so mouse can leave stage)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Pan handling
      if (isPanning.current && panStart.current) {
        const stage = stageRef.current;
        if (!stage) return;

        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        stage.position({
          x: panStart.current.stageX + dx,
          y: panStart.current.stageY + dy,
        });
        stage.batchDraw();
        return;
      }

      // Multi-drag handling (dragging from blank area within selection)
      if (isMultiDragging.current && multiDragRef.current) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        if (!worldPos) return;

        const dx = worldPos.x - multiDragRef.current.mouseStart.x;
        const dy = worldPos.y - multiDragRef.current.mouseStart.y;

        const stage = stageRef.current;
        if (!stage) return;

        for (const [id, startPos] of Object.entries(multiDragRef.current.positions)) {
          const node = stage.findOne(`.element-${id}`);
          if (node) {
            node.x(startPos.x + dx);
            node.y(startPos.y + dy);
          }
        }
        stage.batchDraw();
        return;
      }

      // Marquee handling
      if (marqueeStart.current) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        if (!worldPos) return;

        const dx = worldPos.x - marqueeStart.current.x;
        const dy = worldPos.y - marqueeStart.current.y;

        // Only activate marquee if drag distance exceeds threshold
        if (!isMarqueeActive.current && Math.abs(dx) < 3 && Math.abs(dy) < 3) {
          return;
        }

        isMarqueeActive.current = true;
        const x = Math.min(marqueeStart.current.x, worldPos.x);
        const y = Math.min(marqueeStart.current.y, worldPos.y);
        setMarqueeRect({
          x,
          y,
          width: Math.abs(dx),
          height: Math.abs(dy),
        });
      }
    };

    const handleMouseUp = () => {
      // Finish pan
      if (isPanning.current) {
        isPanning.current = false;
        panStart.current = null;
        return;
      }

      // Finish multi-drag
      if (isMultiDragging.current && multiDragRef.current) {
        const { positions, selectedIds: ids } = multiDragRef.current;
        const stage = stageRef.current;

        if (stage) {
          const firstId = Object.keys(positions)[0];
          if (firstId) {
            const node = stage.findOne(`.element-${firstId}`);
            if (node) {
              const dx = Math.round(node.x() - positions[firstId].x);
              const dy = Math.round(node.y() - positions[firstId].y);

              if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) {
                const state = useEditorStore.getState();
                state.execute(moveSelectedWithTransaction(ids, dx, dy, state.nodes));
              }
            }
          }
        }

        isMultiDragging.current = false;
        multiDragRef.current = null;
        return;
      }

      // Finish marquee selection
      if (isMarqueeActive.current && marqueeStart.current) {
        const state = useEditorStore.getState();
        const { nodes, rootNodeId, activeGroupId } = state;

        if (rootNodeId && marqueeRect) {
          engineCache.flushDirty();
          const hitIds = rectHitTest(
            nodes,
            rootNodeId,
            activeGroupId,
            marqueeRect,
            (id: string) => engineCache.getWorldBounds(id),
          );

          if (hitIds.length > 0) {
            state.boxSelect(hitIds);
          }
        }

        isMarqueeActive.current = false;
        marqueeStart.current = null;
        setMarqueeRect(null);
        return;
      }

      // Simple click on empty area (no marquee drag) — selection already cleared in mousedown
      marqueeStart.current = null;
      isMarqueeActive.current = false;
      setMarqueeRect(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [stageRef, screenToWorld, marqueeRect]);

  return { handleWheel, handleStageMouseDown, marqueeRect };
}
