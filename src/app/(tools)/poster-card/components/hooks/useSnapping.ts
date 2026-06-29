/**
 * useSnapping - React hook connecting GuideManager to Konva drag events.
 *
 * Thin adapter: owns the GuideManager lifecycle and delegates
 * drag move / drag end events to it.
 */

"use client";

import { useRef, useEffect, useCallback } from 'react';
import type Konva from 'konva';
import { GuideManager } from '../../engine/snapping/guide-manager';

export function useSnapping(
  guideLayerRef: React.RefObject<Konva.Layer | null>,
  snapRange = 5,
) {
  const managerRef = useRef<GuideManager | null>(null);

  useEffect(() => {
    const layer = guideLayerRef.current;
    if (!layer) return;

    const manager = new GuideManager(snapRange);
    manager.attachLayer(layer);
    managerRef.current = manager;

    return () => {
      manager.destroy();
      managerRef.current = null;
    };
  }, [snapRange]);

  const handleDragging = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const manager = managerRef.current;
      if (!manager) return;

      const snapped = manager.handleDragMove(e.target);
      if (snapped) {
        e.target.position(snapped);
      }
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    managerRef.current?.handleDragEnd();
  }, []);

  return { handleDragging, handleDragEnd };
}
