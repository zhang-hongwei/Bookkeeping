'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useSvgEditorStore } from '../../store/svgEditorStore';
import { findElementById } from '../../lib/svg-parser';
import type { PathNode } from '../../types';

/**
 * Renders path anchor points and Bezier control handles for editing.
 * Shows automatically when a path/shape element is selected.
 * Nodes are wrapped in the element's transform so they stay aligned after moves.
 */
export default function PathEditorOverlay() {
  const pathEdit = useSvgEditorStore((s) => s.pathEdit);
  const doc = useSvgEditorStore((s) => s.document);
  const zoom = useSvgEditorStore((s) => s.viewport.zoom);
  const updatePathNode = useSvgEditorStore((s) => s.updatePathNode);
  const selectedNodeIndices = pathEdit?.selectedNodeIndices ?? [];

  const dragRef = useRef<{
    nodeIndex: number;
    field: 'pos' | 'cp1' | 'cp2' | 'cp';
    startX: number;
    startY: number;
    origNode: PathNode;
  } | null>(null);

  if (!pathEdit) return null;

  const el = findElementById(doc, pathEdit.elementId);
  if (!el) return null;

  const { nodes } = pathEdit;
  const nodeRadius = 4 / zoom;
  const handleRadius = 3.5 / zoom;
  const lineStroke = 1.2 / zoom;

  // The element's own transform — wrap nodes in it so they stay aligned
  const elementTransform = el.attrs.transform || undefined;

  // =========================================================================
  // Mouse handlers — global move/up for dragging
  // =========================================================================
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      e.preventDefault();

      const store = useSvgEditorStore.getState();
      const vp = store.viewport;
      const svgEl = document.querySelector('[data-svg-canvas] svg');
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      const x = (e.clientX - rect.left - vp.panX) / vp.zoom;
      const y = (e.clientY - rect.top - vp.panY) / vp.zoom;

      const { nodeIndex, field } = dragRef.current;
      const updates: Partial<PathNode> = {};

      if (field === 'pos') {
        updates.x = x;
        updates.y = y;
      } else if (field === 'cp1') {
        updates.cp1x = x;
        updates.cp1y = y;
      } else if (field === 'cp2') {
        updates.cp2x = x;
        updates.cp2y = y;
      } else if (field === 'cp') {
        updates.cpx = x;
        updates.cpy = y;
      }

      updatePathNode(nodeIndex, updates);
    };

    const handleUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [updatePathNode]);

  const handlePointDown = useCallback(
    (e: React.MouseEvent, nodeIndex: number, field: 'pos' | 'cp1' | 'cp2' | 'cp') => {
      e.stopPropagation();
      e.preventDefault();
      const node = nodes[nodeIndex];
      if (!node) return;
      dragRef.current = {
        nodeIndex,
        field,
        startX: e.clientX,
        startY: e.clientY,
        origNode: { ...node },
      };
    },
    [nodes],
  );

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Wrap all nodes in the element's transform so they track with moves */}
      <g transform={elementTransform}>
        {/* === Bezier control point lines (red) === */}
        {nodes.map((node, i) => {
          if (i === 0) return null;
          const lines: React.ReactElement[] = [];

          if (node.cp1x !== undefined && node.cp1y !== undefined) {
            const prevNode = nodes[i - 1];
            lines.push(
              <line
                key={`cp1-line-${i}`}
                x1={prevNode.x}
                y1={prevNode.y}
                x2={node.cp1x}
                y2={node.cp1y}
                stroke="#E53935"
                strokeWidth={lineStroke}
                style={{ pointerEvents: 'none' }}
              />,
            );
          }

          if (node.cp2x !== undefined && node.cp2y !== undefined) {
            lines.push(
              <line
                key={`cp2-line-${i}`}
                x1={node.x}
                y1={node.y}
                x2={node.cp2x}
                y2={node.cp2y}
                stroke="#E53935"
                strokeWidth={lineStroke}
                style={{ pointerEvents: 'none' }}
              />,
            );
          }

          if (node.cpx !== undefined && node.cpy !== undefined) {
            const prevNode = nodes[i - 1];
            lines.push(
              <line
                key={`cp-line-${i}`}
                x1={prevNode.x}
                y1={prevNode.y}
                x2={node.cpx}
                y2={node.cpy}
                stroke="#E53935"
                strokeWidth={lineStroke}
                style={{ pointerEvents: 'none' }}
              />,
              <line
                key={`cp-line2-${i}`}
                x1={node.x}
                y1={node.y}
                x2={node.cpx}
                y2={node.cpy}
                stroke="#E53935"
                strokeWidth={lineStroke}
                style={{ pointerEvents: 'none' }}
              />,
            );
          }

          return lines;
        })}

        {/* === Bezier control point handles (small red dots) === */}
        {nodes.map((node, i) => {
          if (i === 0) return null;
          const handles: React.ReactElement[] = [];

          if (node.cp1x !== undefined && node.cp1y !== undefined) {
            handles.push(
              <circle
                key={`cp1-${i}`}
                cx={node.cp1x}
                cy={node.cp1y}
                r={handleRadius}
                fill="white"
                stroke="#E53935"
                strokeWidth={1.5 / zoom}
                style={{ pointerEvents: 'all', cursor: 'move' }}
                onMouseDown={(e) => handlePointDown(e, i, 'cp1')}
              />,
            );
          }

          if (node.cp2x !== undefined && node.cp2y !== undefined) {
            handles.push(
              <circle
                key={`cp2-${i}`}
                cx={node.cp2x}
                cy={node.cp2y}
                r={handleRadius}
                fill="white"
                stroke="#E53935"
                strokeWidth={1.5 / zoom}
                style={{ pointerEvents: 'all', cursor: 'move' }}
                onMouseDown={(e) => handlePointDown(e, i, 'cp2')}
              />,
            );
          }

          if (node.cpx !== undefined && node.cpy !== undefined) {
            handles.push(
              <circle
                key={`cp-${i}`}
                cx={node.cpx}
                cy={node.cpy}
                r={handleRadius}
                fill="white"
                stroke="#E53935"
                strokeWidth={1.5 / zoom}
                style={{ pointerEvents: 'all', cursor: 'move' }}
                onMouseDown={(e) => handlePointDown(e, i, 'cp')}
              />,
            );
          }

          return handles;
        })}

        {/* === Anchor points (white circles) === */}
        {nodes.map((node, i) => {
          const isSelected = selectedNodeIndices.includes(i);
          return (
            <circle
              key={`node-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              fill={isSelected ? '#643DFF' : 'white'}
              stroke={isSelected ? '#643DFF' : '#333'}
              strokeWidth={1.5 / zoom}
              style={{ pointerEvents: 'all', cursor: 'move' }}
              onMouseDown={(e) => handlePointDown(e, i, 'pos')}
            />
          );
        })}

        {/* Escape hint */}
        <text
          x={nodes[0]?.x ?? 0}
          y={(nodes[0]?.y ?? 0) - 14 / zoom}
          fontSize={10 / zoom}
          fill="#999"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          Press Esc to exit
        </text>
      </g>
    </g>
  );
}
