/**
 * KonvaTextEditor - Overlay textarea for inline text editing
 * Shows an HTML textarea positioned over the Konva Stage when double-clicking a text node
 */

"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import type Konva from 'konva';
import type { TextNode } from '../engine/node-tree/types';
import { decomposeMatrix } from '../engine/matrix-utils';

interface KonvaTextEditorProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  editingNode: TextNode | null;
  zoom: number;
  onSave: (id: string, content: string) => void;
  onCancel: () => void;
}

export function KonvaTextEditor({
  stageRef,
  containerRef,
  editingNode,
  zoom,
  onSave,
  onCancel,
}: KonvaTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    if (editingNode && textareaRef.current) {
      setText(editingNode.content);
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingNode]);

  const handleBlur = useCallback(() => {
    if (editingNode) {
      onSave(editingNode.id, text);
    }
  }, [editingNode, text, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
      // Enter without Shift finishes editing
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (editingNode) {
          onSave(editingNode.id, text);
        }
      }
      // Stop propagation to prevent Konva from handling keys
      e.stopPropagation();
    },
    [editingNode, text, onSave, onCancel],
  );

  if (!editingNode) return null;

  const container = containerRef.current;
  const stage = stageRef.current;
  if (!container || !stage) return null;

  // Find the text node in the stage
  const textNode = stage.findOne(`.element-${editingNode.id}`);
  if (!textNode) return null;

  // Get the text node's position relative to the stage container
  const clientRect = textNode.getClientRect();
  const containerRect = container.getBoundingClientRect();

  const { rotation } = decomposeMatrix(editingNode.localMatrix);

  const textareaStyle: React.CSSProperties = {
    position: 'absolute',
    left: containerRect.left + clientRect.x,
    top: containerRect.top + clientRect.y,
    width: clientRect.width,
    height: clientRect.height,
    fontFamily: editingNode.fontFamily,
    fontSize: editingNode.fontSize * zoom,
    fontWeight: editingNode.fontWeight,
    color: editingNode.color,
    textAlign: editingNode.textAlign,
    lineHeight: editingNode.lineHeight,
    letterSpacing: editingNode.letterSpacing * zoom,
    padding: (editingNode.padding || 0) * zoom,
    backgroundColor: editingNode.backgroundColor || 'transparent',
    border: 'none',
    outline: '2px solid #1976d2',
    resize: 'none',
    overflow: 'hidden',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    zIndex: 10000,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transformOrigin: 'top left',
  };

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={textareaStyle}
    />
  );
}
