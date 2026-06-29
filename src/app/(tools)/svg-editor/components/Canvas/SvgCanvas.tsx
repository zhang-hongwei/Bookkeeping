'use client';

import { useCallback, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { useSvgEditorStore } from '../../store/svgEditorStore';
import { screenToCanvas } from '../../utils';
import CanvasRenderer from './CanvasRenderer';
import SelectionOverlay from './SelectionOverlay';
import GridOverlay from './GridOverlay';
import PathEditorOverlay from './PathEditorOverlay';
import type { BBox, ResizeHandlePosition } from '../../types';
import { findElementById } from '../../lib/svg-parser';

export default function SvgCanvas() {
  const document = useSvgEditorStore((s) => s.document);
  const viewport = useSvgEditorStore((s) => s.viewport);
  const activeTool = useSvgEditorStore((s) => s.activeTool);
  const drag = useSvgEditorStore((s) => s.drag);
  const selection = useSvgEditorStore((s) => s.selection);
  const showGrid = useSvgEditorStore((s) => s.showGrid);

  const selectElements = useSvgEditorStore((s) => s.selectElements);
  const clearSelection = useSvgEditorStore((s) => s.clearSelection);
  const updateElementAttrs = useSvgEditorStore((s) => s.updateElementAttrs);
  const addElement = useSvgEditorStore((s) => s.addElement);
  const startDrag = useSvgEditorStore((s) => s.startDrag);
  const updateDrag = useSvgEditorStore((s) => s.updateDrag);
  const endDrag = useSvgEditorStore((s) => s.endDrag);
  const setZoom = useSvgEditorStore((s) => s.setZoom);
  const setPan = useSvgEditorStore((s) => s.setPan);
  const pushHistory = useSvgEditorStore((s) => s.pushHistory);
  const startPathEdit = useSvgEditorStore((s) => s.startPathEdit);
  const convertToPathAndEdit = useSvgEditorStore((s) => s.convertToPathAndEdit);
  const zoomToFitIn = useSvgEditorStore((s) => s.zoomToFitIn);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // =========================================================================
  // Auto-fit on mount and document change
  // =========================================================================
  const docIdRef = useRef(document.id);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      zoomToFitIn(rect.width, rect.height);
    }
    docIdRef.current = document.id;
  }, [document.id, zoomToFitIn]);

  // =========================================================================
  // Coordinate transform — reads viewport from store to avoid stale closures
  // =========================================================================
  const getCanvasPoint = useCallback((e: React.MouseEvent | MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const vp = useSvgEditorStore.getState().viewport;
    const rect = svg.getBoundingClientRect();
    return screenToCanvas(e.clientX, e.clientY, vp, rect);
  }, []);

  // =========================================================================
  // Get real bounding box from DOM element
  // =========================================================================
  const getDomBBox = useCallback((elementId: string): BBox | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const domEl = svg.querySelector(`[data-editor-id="${elementId}"]`);
    if (!domEl) return null;
    try {
      const bbox = (domEl as SVGGraphicsElement).getBBox();
      return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
    } catch {
      return null;
    }
  }, []);

  // =========================================================================
  // Get all valid element IDs that can be selected (exclude containers)
  // =========================================================================
  const isSelectableElement = useCallback((elementId: string): boolean => {
    const store = useSvgEditorStore.getState();
    const el = findElementById(store.document, elementId);
    if (!el) return false;
    const containerTags = new Set(['svg', 'g', 'defs', 'clipPath', 'mask', 'symbol']);
    return !containerTags.has(el.tag);
  }, []);

  // =========================================================================
  // Resize start — called from SelectionOverlay handle mousedown
  // =========================================================================
  const handleResizeStart = useCallback(
    (handle: ResizeHandlePosition, bbox: BBox) => {
      const store = useSvgEditorStore.getState();
      if (store.selection.elementIds.length === 0) return;

      // Collect original attrs for all selected elements
      const firstId = store.selection.elementIds[0];
      const el = findElementById(store.document, firstId);
      if (!el) return;

      startDrag({
        mode: 'resize',
        startX: bbox.x + bbox.width / 2,
        startY: bbox.y + bbox.height / 2,
        handle,
        elementId: firstId,
        originalAttrs: { ...el.attrs },
        originalBBox: bbox,
      });
    },
    [startDrag],
  );

  // =========================================================================
  // Canvas mouse down — EVENT DELEGATION
  // =========================================================================
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Middle button or hand tool — panning
      if (e.button === 1 || (e.button === 0 && activeTool === 'hand')) {
        isPanning.current = true;
        const vp = useSvgEditorStore.getState().viewport;
        panStart.current = { x: e.clientX, y: e.clientY, panX: vp.panX, panY: vp.panY };
        e.preventDefault();
        return;
      }

      if (e.button !== 0) return;
      const point = getCanvasPoint(e);

      // Find the clicked element via event delegation
      const target = e.target as Element;
      const editorEl = target.closest('[data-editor-id]');
      const elementId = editorEl?.getAttribute('data-editor-id') ?? null;

      // Check if it's a selectable element (not a container)
      const clickedSelectable = elementId && isSelectableElement(elementId);

      // --- Select tool ---
      if (activeTool === 'select') {
        if (clickedSelectable && elementId) {
          const store = useSvgEditorStore.getState();
          const isSelected = store.selection.elementIds.includes(elementId);

          if (e.shiftKey) {
            const ids = isSelected
              ? store.selection.elementIds.filter((id) => id !== elementId)
              : [...store.selection.elementIds, elementId];
            selectElements(ids, ids.length > 1 ? 'multi' : 'single');
          } else if (!isSelected) {
            selectElements([elementId], 'single');
          }

          // Auto-enter path edit mode for shape/path elements
          const el = findElementById(store.document, elementId);
          const editableTags = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline']);
          if (el && editableTags.has(el.tag) && !store.pathEdit) {
            convertToPathAndEdit(elementId);
          }

          // Start move drag
          const freshEl = findElementById(useSvgEditorStore.getState().document, elementId);
          const domBBox = getDomBBox(elementId);
          startDrag({
            mode: 'move',
            startX: point.x,
            startY: point.y,
            elementId,
            originalAttrs: freshEl ? { ...freshEl.attrs } : undefined,
            originalBBox: domBBox ?? undefined,
          });
        } else {
          // Clicked on background — deselect
          clearSelection();
        }
        return;
      }

      // --- Shape creation tools ---
      if (['rect', 'ellipse', 'line'].includes(activeTool)) {
        startDrag({ mode: 'create', startX: point.x, startY: point.y });
        return;
      }

      // --- Pen tool ---
      if (activeTool === 'pen') {
        useSvgEditorStore.getState().penToolClick(point.x, point.y);
        return;
      }
    },
    [activeTool, getCanvasPoint, getDomBBox, isSelectableElement, selectElements, clearSelection, startDrag, convertToPathAndEdit],
  );

  // =========================================================================
  // Double click — enter path edit mode
  // =========================================================================
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const target = e.target as Element;
      const editorEl = target.closest('[data-editor-id]');
      const elementId = editorEl?.getAttribute('data-editor-id');
      if (!elementId) return;

      const store = useSvgEditorStore.getState();
      const el = findElementById(store.document, elementId);
      if (!el) return;

      const editableTags = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline']);
      if (editableTags.has(el.tag)) {
        convertToPathAndEdit(elementId);
      }
    },
    [convertToPathAndEdit],
  );

  // =========================================================================
  // Resize computation — calculate new bbox from handle + delta
  // =========================================================================
  function computeResizedBBox(
    handle: ResizeHandlePosition,
    origBBox: BBox,
    dx: number,
    dy: number,
    startCenterX: number,
    startCenterY: number,
  ): BBox {
    let { x, y, width, height } = origBBox;

    switch (handle) {
      case 'nw':
        x += dx;
        y += dy;
        width -= dx;
        height -= dy;
        break;
      case 'n':
        y += dy;
        height -= dy;
        break;
      case 'ne':
        y += dy;
        width += dx;
        height -= dy;
        break;
      case 'e':
        width += dx;
        break;
      case 'se':
        width += dx;
        height += dy;
        break;
      case 's':
        height += dy;
        break;
      case 'sw':
        x += dx;
        width -= dx;
        height += dy;
        break;
      case 'w':
        x += dx;
        width -= dx;
        break;
    }

    // Enforce minimum size
    if (width < 2) { width = 2; }
    if (height < 2) { height = 2; }

    return { x, y, width, height };
  }

  // =========================================================================
  // Apply resize to element based on its type
  // =========================================================================
  function applyResizeToElement(
    el: { tag: string; attrs: Record<string, string> },
    newBBox: BBox,
    origBBox: BBox,
    origAttrs: Record<string, string>,
  ): Record<string, string> {
    const updates: Record<string, string> = {};

    switch (el.tag) {
      case 'rect': {
        updates.x = String(newBBox.x);
        updates.y = String(newBBox.y);
        updates.width = String(newBBox.width);
        updates.height = String(newBBox.height);
        break;
      }
      case 'circle': {
        const r = Math.min(newBBox.width, newBBox.height) / 2;
        updates.cx = String(newBBox.x + newBBox.width / 2);
        updates.cy = String(newBBox.y + newBBox.height / 2);
        updates.r = String(r);
        break;
      }
      case 'ellipse': {
        updates.cx = String(newBBox.x + newBBox.width / 2);
        updates.cy = String(newBBox.y + newBBox.height / 2);
        updates.rx = String(newBBox.width / 2);
        updates.ry = String(newBBox.height / 2);
        break;
      }
      case 'line': {
        // Scale line endpoints relative to original bbox
        const scaleX = origBBox.width > 0 ? newBBox.width / origBBox.width : 1;
        const scaleY = origBBox.height > 0 ? newBBox.height / origBBox.height : 1;
        const ox1 = Number.parseFloat(origAttrs.x1 ?? '0');
        const oy1 = Number.parseFloat(origAttrs.y1 ?? '0');
        const ox2 = Number.parseFloat(origAttrs.x2 ?? '0');
        const oy2 = Number.parseFloat(origAttrs.y2 ?? '0');
        updates.x1 = String(newBBox.x + (ox1 - origBBox.x) * scaleX);
        updates.y1 = String(newBBox.y + (oy1 - origBBox.y) * scaleY);
        updates.x2 = String(newBBox.x + (ox2 - origBBox.x) * scaleX);
        updates.y2 = String(newBBox.y + (oy2 - origBBox.y) * scaleY);
        break;
      }
      case 'text': {
        updates.x = String(newBBox.x);
        updates.y = String(newBBox.y + newBBox.height);
        break;
      }
      case 'image': {
        updates.x = String(newBBox.x);
        updates.y = String(newBBox.y);
        updates.width = String(newBBox.width);
        updates.height = String(newBBox.height);
        break;
      }
      default: {
        // path, polygon, polyline — use transform to scale
        const scaleX = origBBox.width > 0 ? newBBox.width / origBBox.width : 1;
        const scaleY = origBBox.height > 0 ? newBBox.height / origBBox.height : 1;
        const baseTransform = (origAttrs.transform ?? '').replace(/translate\([^)]*\)\s*/g, '').replace(/scale\([^)]*\)\s*/g, '');
        const tx = newBBox.x - origBBox.x * scaleX;
        const ty = newBBox.y - origBBox.y * scaleY;
        const parts: string[] = [];
        parts.push(`translate(${tx}, ${ty})`);
        parts.push(`scale(${scaleX}, ${scaleY})`);
        if (baseTransform) parts.push(baseTransform);
        updates.transform = parts.join(' ');
        break;
      }
    }

    return updates;
  }

  // =========================================================================
  // Global mouse move + up
  // =========================================================================
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Panning
      if (isPanning.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        setPan(panStart.current.panX + dx, panStart.current.panY + dy);
        return;
      }

      const store = useSvgEditorStore.getState();
      if (store.drag.mode === 'none') return;

      const point = getCanvasPoint(e);
      updateDrag(point.x, point.y);

      // Live update during move
      if (store.drag.mode === 'move' && store.drag.elementId && store.drag.originalAttrs) {
        const dx = point.x - store.drag.startX;
        const dy = point.y - store.drag.startY;
        const el = findElementById(store.document, store.drag.elementId);
        if (!el) return;

        const orig = store.drag.originalAttrs;

        // Check if element has position attributes (rect, circle, ellipse, line, text, image)
        const hasPosAttrs = ['x', 'y', 'cx', 'cy', 'x1', 'y1', 'x2', 'y2'].some(
          (k) => k in orig,
        );

        if (hasPosAttrs) {
          // Update position attributes directly
          const updates: Record<string, string> = {};
          const posKeys = ['x', 'y', 'cx', 'cy', 'x1', 'y1', 'x2', 'y2'] as const;
          for (const key of posKeys) {
            if (key in orig) {
              const val = Number.parseFloat(orig[key]);
              const delta = (key === 'x' || key === 'cx' || key === 'x1' || key === 'x2') ? dx : dy;
              updates[key] = String(val + delta);
            }
          }
          updateElementAttrs(store.drag.elementId, updates);
        } else {
          // For path, polygon, polyline — use transform attribute to move
          // Strip any existing translate from the original transform to prevent accumulation
          const baseTransform = (orig.transform ?? '').replace(/translate\([^)]*\)\s*/g, '');
          const newTransform = baseTransform
            ? `translate(${dx}, ${dy}) ${baseTransform}`
            : `translate(${dx}, ${dy})`;
          updateElementAttrs(store.drag.elementId, { transform: newTransform });
        }
      }

      // Live update during resize
      if (store.drag.mode === 'resize' && store.drag.elementId && store.drag.originalBBox && store.drag.handle && store.drag.originalAttrs) {
        const el = findElementById(store.document, store.drag.elementId);
        if (!el) return;

        const origBBox = store.drag.originalBBox;
        const dx = point.x - store.drag.startX;
        const dy = point.y - store.drag.startY;

        const newBBox = computeResizedBBox(
          store.drag.handle,
          origBBox,
          dx,
          dy,
          store.drag.startX,
          store.drag.startY,
        );

        const updates = applyResizeToElement(el, newBBox, origBBox, store.drag.originalAttrs);
        updateElementAttrs(store.drag.elementId, updates);
      }
    };

    const handleMouseUp = () => {
      if (isPanning.current) {
        isPanning.current = false;
        return;
      }

      const store = useSvgEditorStore.getState();
      if (store.drag.mode === 'none') return;

      // Finalize create
      if (store.drag.mode === 'create') {
        const { startX, startY, currentX, currentY } = store.drag;
        const tool = store.activeTool;
        const w = currentX - startX;
        const h = currentY - startY;

        if (Math.abs(w) > 2 || Math.abs(h) > 2) {
          const x = Math.min(startX, currentX);
          const y = Math.min(startY, currentY);
          const width = Math.abs(w);
          const height = Math.abs(h);

          if (tool === 'rect') {
            addElement(null, {
              tag: 'rect',
              attrs: { x: String(x), y: String(y), width: String(width), height: String(height), fill: '#643DFF', stroke: 'none' },
              children: [],
              parentId: null,
            });
          } else if (tool === 'ellipse') {
            addElement(null, {
              tag: 'ellipse',
              attrs: { cx: String(x + width / 2), cy: String(y + height / 2), rx: String(width / 2), ry: String(height / 2), fill: '#643DFF', stroke: 'none' },
              children: [],
              parentId: null,
            });
          } else if (tool === 'line') {
            addElement(null, {
              tag: 'line',
              attrs: { x1: String(startX), y1: String(startY), x2: String(currentX), y2: String(currentY), stroke: '#000000', 'stroke-width': '2' },
              children: [],
              parentId: null,
            });
          }
          pushHistory(`Create ${tool}`);
        }
      }

      // Finalize move
      if (store.drag.mode === 'move' && store.drag.elementId) {
        pushHistory('Move element');
      }

      // Finalize resize
      if (store.drag.mode === 'resize' && store.drag.elementId) {
        pushHistory('Resize element');
      }

      endDrag();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [getCanvasPoint, updateDrag, updateElementAttrs, addElement, pushHistory, endDrag, setPan]);

  // =========================================================================
  // Wheel zoom — non-passive listener
  // =========================================================================
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const store = useSvgEditorStore.getState();
      const vp = store.viewport;

      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? 1 / 1.1 : 1.1;
        const newZoom = Math.max(0.05, Math.min(64, vp.zoom * delta));
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        setZoom(newZoom);
        setPan(
          mx - (mx - vp.panX) * (newZoom / vp.zoom),
          my - (my - vp.panY) * (newZoom / vp.zoom),
        );
      } else {
        setPan(vp.panX - e.deltaX, vp.panY - e.deltaY);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [setZoom, setPan]);

  // =========================================================================
  // Render
  // =========================================================================
  const { zoom, panX, panY, canvasWidth, canvasHeight } = viewport;

  let createBBox: BBox | null = null;
  if (drag.mode === 'create') {
    createBBox = {
      x: Math.min(drag.startX, drag.currentX),
      y: Math.min(drag.startY, drag.currentY),
      width: Math.abs(drag.currentX - drag.startX),
      height: Math.abs(drag.currentY - drag.startY),
    };
  }

  return (
    <Box
      ref={containerRef}
      data-svg-canvas
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        cursor:
          activeTool === 'hand'
            ? 'grab'
            : ['rect', 'ellipse', 'line', 'pen', 'pencil'].includes(activeTool)
              ? 'crosshair'
              : 'default',
        backgroundImage:
          'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        onMouseDown={handleCanvasMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <defs>
          <pattern id="svg-editor-grid" width={20} height={20} patternUnits="userSpaceOnUse">
            <circle cx={0.5} cy={0.5} r={0.5} fill="rgba(128,128,128,0.3)" />
          </pattern>
        </defs>

        {/* Transparent click target */}
        <rect data-canvas-bg width="100%" height="100%" fill="transparent" />

        {/* Canvas transform group */}
        <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
          {showGrid && <GridOverlay width={canvasWidth} height={canvasHeight} />}

          {/* Artboard */}
          <rect
            data-artboard
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill="white"
            stroke="#cccccc"
            strokeWidth={1 / zoom}
          />

          {/* SVG elements */}
          <CanvasRenderer
            document={document}
            selectedIds={selection.elementIds}
            zoom={zoom}
          />

          {/* Selection overlay */}
          <SelectionOverlay
            selection={selection}
            svgRef={svgRef}
            zoom={zoom}
            createBBox={createBBox}
            onResizeStart={handleResizeStart}
          />

          {/* Path node editor */}
          <PathEditorOverlay />
        </g>
      </svg>
    </Box>
  );
}
