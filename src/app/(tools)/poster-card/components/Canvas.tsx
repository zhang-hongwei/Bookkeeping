/**
 * Canvas - Main editing surface using Konva.js
 * Composes extracted hooks for viewport, interaction, snapping, keyboard, and drop.
 */

"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Rect, Shape, Transformer } from 'react-konva';
import type Konva from 'konva';
import { Box } from '@mui/material';
import { useEditorStore } from '../engine/store';
import { useRootChildrenIds, useSelectedIds, useCanvasSettings } from '../engine/store/selectors';
import { decomposeMatrix, createMatrix } from '../engine/matrix-utils';
import { UpdateNodeCommand } from '../engine/commands/commands/update-node';
import { moveSelectedWithTransaction } from '../engine/selection/selection-ops';
import type { PosterNode, TextNode, Background } from '../engine/node-tree/types';
import { drawBackground } from '../utils/konva-helpers';
import { KonvaElementRenderer } from './KonvaElement';
import { KonvaTextEditor } from './KonvaTextEditor';
import { Ruler, RULER_SIZE } from './Ruler';
import { useSnapping } from './hooks/useSnapping';
import { useCanvasViewport } from './hooks/useCanvasViewport';
import { useCanvasKeyboard } from './hooks/useCanvasKeyboard';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { useAssetDrop } from './hooks/useAssetDrop';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { ContextMenu } from './ContextMenu';

export function Canvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const guideLayerRef = useRef<Konva.Layer>(null);

  // Multi-drag coordination state shared across all elements
  const multiDragStateRef = useRef({
    active: false,
    startPositions: {} as Record<string, { x: number; y: number }>,
    draggingIds: new Set<string>(),
  });

  // Engine store selectors
  const childrenIds = useRootChildrenIds();
  const selectedIds = useSelectedIds();
  const settings = useCanvasSettings();
  const zoom = useEditorStore((s) => s.zoom);
  const editingTextId = useEditorStore((s) => s.editingTextId);
  const nodes = useEditorStore((s) => s.nodes);
  const rootNodeId = useEditorStore((s) => s.rootNodeId);

  const canvasWidth = settings?.width ?? 1080;
  const canvasHeight = settings?.height ?? 1440;
  const background = settings?.background ?? { type: 'solid', color: '#1a1a2e' } as Background;

  const editingNode = useMemo(() => {
    if (!editingTextId) return null;
    const n = nodes[editingTextId];
    return n?.type === 'text' ? (n as TextNode) : null;
  }, [editingTextId, nodes]);

  // --- Extracted hooks ---
  const { containerRef, viewportSize } = useCanvasViewport(stageRef, rootNodeId, canvasWidth, canvasHeight);
  const { isSpaceHeld } = useCanvasKeyboard(null, editingTextId);
  const { handleWheel, handleStageMouseDown, marqueeRect } = useCanvasInteraction(stageRef, zoom, isSpaceHeld);
  const { handleDragging, handleDragEnd: handleSnapEnd } = useSnapping(guideLayerRef, 5);
  const { isDragOver, handleDrop, handleDragOver, handleDragLeave } = useAssetDrop(stageRef, zoom, canvasWidth, canvasHeight);

  // === Attach Transformer to selected element(s) ===
  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    if (selectedIds.size === 0) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    const selectedKonvaNodes: Konva.Node[] = [];
    for (const id of selectedIds) {
      const node = stage.findOne(`.element-${id}`);
      if (node) selectedKonvaNodes.push(node);
    }

    if (selectedKonvaNodes.length === 0) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    tr.nodes(selectedKonvaNodes);

    // Use center resize anchors for multi-select, type-specific for single
    if (selectedIds.size === 1) {
      const elementId = [...selectedIds][0];
      const element = nodes[elementId];
      if (element?.type === 'text') {
        tr.enabledAnchors(['middle-left', 'middle-right']);
      } else {
        tr.enabledAnchors([
          'top-left', 'top-center', 'top-right',
          'middle-right', 'bottom-right', 'bottom-center',
          'bottom-left', 'middle-left',
        ]);
      }
    } else {
      tr.enabledAnchors([
        'top-left', 'top-center', 'top-right',
        'middle-right', 'bottom-right', 'bottom-center',
        'bottom-left', 'middle-left',
      ]);
    }

    tr.getLayer()?.batchDraw();
  }, [selectedIds, nodes]);

  // === Element callbacks ===
  const handleElementDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      handleSnapEnd();

      // Multi-drag commit: move all selected elements by the same delta
      const md = multiDragStateRef.current;
      if (md.active && md.draggingIds.size > 1) {
        const startPos = md.startPositions[id];
        if (startPos) {
          const dx = x - startPos.x;
          const dy = y - startPos.y;
          const state = useEditorStore.getState();
          state.execute(moveSelectedWithTransaction(md.draggingIds, dx, dy, state.nodes));
        }
        md.active = false;
        md.startPositions = {};
        md.draggingIds = new Set();
        return;
      }

      // Single element drag
      md.active = false;
      md.startPositions = {};
      md.draggingIds = new Set();

      const state = useEditorStore.getState();
      const node = state.nodes[id];
      if (!node) return;
      const { rotation, scaleX, scaleY } = decomposeMatrix(node.localMatrix);
      const oldMatrix = node.localMatrix;
      const newMatrix = createMatrix({ x, y, rotation, scaleX, scaleY });
      state.execute(new UpdateNodeCommand(id, { localMatrix: oldMatrix }, { localMatrix: newMatrix }, `Move ${id}`));
    },
    [handleSnapEnd],
  );

  const handleElementTransformEnd = useCallback(
    (id: string, props: { x: number; y: number; width: number; height: number; rotation: number }) => {
      const state = useEditorStore.getState();
      const node = state.nodes[id];
      if (!node) return;
      const { scaleX, scaleY } = decomposeMatrix(node.localMatrix);
      const oldMatrix = node.localMatrix;
      const newMatrix = createMatrix({ x: props.x, y: props.y, rotation: props.rotation, scaleX, scaleY });
      state.execute(
        new UpdateNodeCommand(
          id,
          { localMatrix: oldMatrix, width: node.width, height: node.height },
          { localMatrix: newMatrix, width: props.width, height: props.height },
          `Transform ${id}`,
        ),
      );
    },
    [],
  );

  const handleElementDoubleClick = useCallback(
    (id: string) => {
      const node = useEditorStore.getState().nodes[id];
      if (node?.type === 'text') {
        useEditorStore.getState().setEditingTextId(id);
      }
    },
    [],
  );

  const handleTextSave = useCallback(
    (id: string, content: string) => {
      useEditorStore.getState().updateNode(id, { content } as Partial<PosterNode>);
      useEditorStore.getState().setEditingTextId(null);
    },
    [],
  );

  // === Ruler offset ===
  const rulerOffset = useMemo(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    return { x: -stage.x() / zoom, y: -stage.y() / zoom };
  }, [zoom]);

  const [rulerKey, setRulerKey] = useState(0);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let lastUpdate = 0;
    const handleDraw = () => {
      const now = Date.now();
      if (now - lastUpdate < 200) return;
      lastUpdate = now;
      setRulerKey((k) => k + 1);
    };
    stage.on('draw', handleDraw);
    return () => { stage.off('draw', handleDraw); };
  }, []);

  const childNodes = useMemo(
    () => childrenIds.map((id) => nodes[id]).filter(Boolean) as PosterNode[],
    [childrenIds, nodes],
  );

  return (
    <CanvasErrorBoundary>
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        bgcolor: 'action.hover',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Ruler row */}
      <Box sx={{ display: 'flex', flexShrink: 0 }}>
        <Box sx={{ width: RULER_SIZE, height: RULER_SIZE, bgcolor: '#e8e8e8', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', flexShrink: 0 }} />
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Ruler direction="horizontal" length={2000} offset={rulerOffset.x} zoom={zoom} canvasSize={canvasWidth} key={`h-${rulerKey}`} />
        </Box>
      </Box>

      {/* Main row: vertical ruler + stage container */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Box sx={{ overflow: 'hidden', flexShrink: 0 }}>
          <Ruler direction="vertical" length={2000} offset={rulerOffset.y} zoom={zoom} canvasSize={canvasHeight} key={`v-${rulerKey}`} />
        </Box>

        {/* Konva Stage Container */}
        <Box
          ref={containerRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            flex: 1, minHeight: 0, cursor: isSpaceHeld.current ? 'grab' : 'default',
            position: 'relative',
            outline: isDragOver ? '2px dashed #1976d2' : 'none',
            outlineOffset: '-2px',
          }}
        >
          <Stage
            ref={stageRef}
            width={viewportSize.width}
            height={viewportSize.height}
            scaleX={zoom}
            scaleY={zoom}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onWheel={handleWheel}
            onMouseDown={handleStageMouseDown}
          >
            {/* Background Layer */}
            <Layer>
              <Shape
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                sceneFunc={(ctx, shape) => {
                  drawBackground(ctx, background, canvasWidth, canvasHeight);
                  ctx.fillStrokeShape(shape);
                }}
              />
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                stroke="#ccc"
                strokeWidth={1}
                listening={false}
              />
            </Layer>

            {/* Elements Layer — clipped to canvas bounds */}
            <Layer clipX={0} clipY={0} clipWidth={canvasWidth} clipHeight={canvasHeight}>
              {childNodes.map((node) => (
                <KonvaElementRenderer
                  key={node.id}
                  node={node}
                  isSelected={selectedIds.has(node.id)}
                  onSelect={(id) => useEditorStore.getState().singleSelect(id)}
                  onToggleSelect={(id) => useEditorStore.getState().toggleSelect(id)}
                  onDragEnd={handleElementDragEnd}
                  onTransformEnd={handleElementTransformEnd}
                  onDoubleClick={handleElementDoubleClick}
                  onDragMove={handleDragging}
                  multiDrag={{ selectedIds, stageRef, stateRef: multiDragStateRef }}
                />
              ))}
              <Transformer
                ref={transformerRef}
                borderStroke="#1976d2"
                borderStrokeWidth={1}
                anchorFill="white"
                anchorStroke="#1976d2"
                anchorSize={8}
                anchorCornerRadius={1}
                rotateEnabled={true}
                keepRatio={false}
                flipEnabled={false}
                boundBoxFunc={(_oldBox, newBox) => {
                  if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) return _oldBox;
                  return newBox;
                }}
              />
            </Layer>

            {/* Marquee selection overlay */}
            {marqueeRect && (
              <Layer listening={false}>
                <Rect
                  x={marqueeRect.x}
                  y={marqueeRect.y}
                  width={marqueeRect.width}
                  height={marqueeRect.height}
                  fill="rgba(25, 118, 210, 0.1)"
                  stroke="#1976d2"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
              </Layer>
            )}

            {/* Guide lines layer — above elements, not clipped, no hit detection */}
            <Layer ref={guideLayerRef} listening={false} />
          </Stage>

          {/* Overlay text editor */}
          <KonvaTextEditor
            stageRef={stageRef}
            containerRef={containerRef}
            editingNode={editingNode}
            zoom={zoom}
            onSave={handleTextSave}
            onCancel={() => useEditorStore.getState().setEditingTextId(null)}
          />
        </Box>
      </Box>
    </Box>
    <ContextMenu />
    </CanvasErrorBoundary>
  );
}
