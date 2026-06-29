/**
 * Asset drop hook - handles drag-and-drop from asset panels onto the canvas
 */

"use client";

import { useState, useCallback } from 'react';
import type Konva from 'konva';
import { useEditorStore } from '../../engine/store';
import { createMatrix } from '../../engine/matrix-utils';
import { AddNodeCommand } from '../../engine/commands/commands/add-node';

export function useAssetDrop(
  stageRef: React.RefObject<Konva.Stage | null>,
  zoom: number,
  canvasWidth: number,
  canvasHeight: number,
) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const raw = e.dataTransfer.getData('application/poster-asset');
    if (!raw) return;
    const data = JSON.parse(raw);
    const stage = stageRef.current;
    if (!stage) return;

    const stageBox = stage.container().getBoundingClientRect();
    const canvasX = (e.clientX - stageBox.left - stage.x()) / zoom;
    const canvasY = (e.clientY - stageBox.top - stage.y()) / zoom;

    const state = useEditorStore.getState();
    if (!state.rootNodeId) return;

    if (data.assetType === 'image') {
      const rawW = data.width ?? 400;
      const rawH = data.height ?? 300;
      const maxDim = Math.min(canvasWidth, canvasHeight) * 0.8;
      const scale = Math.min(maxDim / rawW, maxDim / rawH, 1);
      const imgW = Math.round(rawW * scale);
      const imgH = Math.round(rawH * scale);

      const cmd = new AddNodeCommand({
        type: 'image',
        parentId: state.rootNodeId,
        childrenIds: [],
        localMatrix: createMatrix({ x: canvasX - imgW / 2, y: canvasY - imgH / 2 }),
        width: imgW,
        height: imgH,
        opacity: 100,
        visible: true,
        locked: false,
        src: data.src,
        assetId: data.assetId,
        objectFit: 'cover',
        borderRadius: 0,
      }, state.rootNodeId);
      state.execute(cmd);
    } else if (data.assetType === 'shape') {
      const cmd = new AddNodeCommand({
        type: 'shape',
        parentId: state.rootNodeId,
        childrenIds: [],
        localMatrix: createMatrix({ x: canvasX, y: canvasY }),
        width: 100,
        height: 100,
        opacity: 100,
        visible: true,
        locked: false,
        shapeType: 'svg',
        assetId: data.assetId,
        svgContent: data.svgContent,
        fill: data.defaultFill ?? '#e0e0e0',
        stroke: data.defaultStroke ?? '#999999',
        strokeWidth: 1,
        borderRadius: 0,
      }, state.rootNodeId);
      state.execute(cmd);
    }
  }, [zoom, stageRef, canvasWidth, canvasHeight]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return { isDragOver, handleDrop, handleDragOver, handleDragLeave };
}
