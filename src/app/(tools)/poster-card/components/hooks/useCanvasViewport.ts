/**
 * Canvas viewport hook - resize observation + auto-fit/center
 */

"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import type Konva from 'konva';
import { useEditorStore } from '../../engine/store';

export function useCanvasViewport(
  stageRef: React.RefObject<Konva.Stage | null>,
  rootNodeId: string | null,
  canvasWidth: number,
  canvasHeight: number,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });

  // Observe container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const next = { width: Math.floor(width), height: Math.floor(height) };
      setViewportSize(next);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Center canvas in viewport on mount or when canvas size changes
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !rootNodeId) return;

    const state = useEditorStore.getState();
    const node = state.nodes[rootNodeId];
    if (!node) return;

    const cw = (node as any).canvasWidth ?? 1080;
    const ch = (node as any).canvasHeight ?? 1440;
    const padding = 60;
    const fitZoom = Math.min(
      (viewportSize.width - padding) / cw,
      (viewportSize.height - padding) / ch,
      1,
    );

    useEditorStore.getState().setZoom(fitZoom);
    stage.scale({ x: fitZoom, y: fitZoom });
    stage.position({
      x: (viewportSize.width - cw * fitZoom) / 2,
      y: (viewportSize.height - ch * fitZoom) / 2,
    });
    stage.batchDraw();
  }, [rootNodeId, canvasWidth, canvasHeight, viewportSize.width, viewportSize.height, stageRef]);

  return { containerRef, viewportSize };
}
