/**
 * SVG Icon Editor - Zustand Store with immer
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  SvgEditorState,
  SvgEditorActions,
  SvgElementData,
  EditorTool,
  ShapeVariant,
  SelectionMode,
  RightPanelTab,
  SnapConfig,
  PathEditState,
  PathNode,
  DragState,
  BBox,
} from '../types';
import {
  parseSvgString,
  createEmptyDocument,
  findElementById,
  findParentElement,
  flattenElements,
  removeElementById,
  updateParentRefs,
} from '../lib/svg-parser';
import { serializeToSvgString } from '../lib/svg-serializer';
import { parsePathDAbsolute, commandsToNodes, nodesToPathD } from '../lib/path-parser';
import { deepClone, generateId, getElementBBox, shapeToPathD } from '../utils';

// =============================================================================
// Constants
// =============================================================================

const MAX_HISTORY = 100;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 64;
const ZOOM_STEP = 1.25;

// =============================================================================
// Default SVG content (next.svg logo)
// =============================================================================
const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>`;

// =============================================================================
// Initial State
// =============================================================================

const createInitialState = (): SvgEditorState => {
  const parsed = parseSvgString(DEFAULT_SVG);
  const vb = parsed.attrs.viewBox?.split(/[\s,]+/).map(Number) ?? [0, 0, 800, 600];
  const canvasWidth = vb.length >= 4 ? vb[2] : 800;
  const canvasHeight = vb.length >= 4 ? vb[3] : 600;

  return {
    document: parsed,
    viewport: { zoom: 1, panX: 40, panY: 40, canvasWidth, canvasHeight },
    selection: { elementIds: [], mode: 'none' },
    activeTool: 'select',
    shapeVariant: 'rect',
    drag: { mode: 'none', startX: 0, startY: 0, currentX: 0, currentY: 0 },
    pathEdit: null,
    penTool: { isActive: false, elementId: null, points: [], isClosed: false },
  snapConfig: {
    enabled: true,
    snapToGrid: true,
    gridSize: 1,
    snapToElement: true,
    snapThreshold: 5,
  },
  rightPanelTab: 'properties',
  showCodePanel: false,
  showGrid: true,
  clipboard: [],
  history: [],
  historyIndex: -1,
};
};

// =============================================================================
// Store Implementation
// =============================================================================

export const useSvgEditorStore = create<SvgEditorState & SvgEditorActions>()(
  immer((set, get) => ({
    ...createInitialState(),

    // --- Document ---
    newDocument: (width, height) => {
      set((draft) => {
        draft.document = createEmptyDocument(width, height);
        draft.viewport = { zoom: 1, panX: 0, panY: 0, canvasWidth: width, canvasHeight: height };
        draft.selection = { elementIds: [], mode: 'none' };
        draft.pathEdit = null;
        draft.history = [];
        draft.historyIndex = -1;
      });
    },

    importSvg: (svgString) => {
      const parsed = parseSvgString(svgString);
      set((draft) => {
        draft.document = parsed;
        // Extract dimensions from viewBox, width/height attrs, or fallback
        const vb = parsed.attrs.viewBox?.split(/[\s,]+/).map(Number) ?? [];
        if (vb.length >= 4) {
          draft.viewport.canvasWidth = vb[2];
          draft.viewport.canvasHeight = vb[3];
        } else {
          const w = Number.parseFloat(parsed.attrs.width) || 800;
          const h = Number.parseFloat(parsed.attrs.height) || 600;
          draft.viewport.canvasWidth = w;
          draft.viewport.canvasHeight = h;
        }
        // Center canvas: offset pan so artboard is centered
        draft.viewport.panX = 40;
        draft.viewport.panY = 40;
        draft.viewport.zoom = 1;
        draft.selection = { elementIds: [], mode: 'none' };
        draft.pathEdit = null;
        draft.history = [];
        draft.historyIndex = -1;
      });
    },

    getSvgString: () => serializeToSvgString(get().document),

    // --- Elements CRUD ---
    addElement: (parentId, element) => {
      const newId = generateId();
      set((draft) => {
        const el: SvgElementData = { ...element, id: newId };
        const parent = parentId ? findElementById(draft.document, parentId) : draft.document;
        if (parent) {
          el.parentId = parent.id;
          parent.children.push(el);
        }
        draft.selection = { elementIds: [newId], mode: 'single' };
      });
      return newId;
    },

    removeElements: (ids) => {
      set((draft) => {
        for (const id of ids) {
          removeElementById(draft.document, id);
        }
        draft.selection = { elementIds: [], mode: 'none' };
        if (draft.pathEdit && ids.includes(draft.pathEdit.elementId)) {
          draft.pathEdit = null;
        }
      });
    },

    duplicateElements: (ids) => {
      set((draft) => {
        const newIds: string[] = [];
        for (const id of ids) {
          const el = findElementById(draft.document, id);
          if (!el) continue;
          const parent = findParentElement(draft.document, id);
          if (!parent) continue;

          const clone = deepClone(el);
          reassignIds(clone, parent.id);
          // Offset the duplicate
          offsetElement(clone, 10, 10);
          parent.children.push(clone);
          newIds.push(clone.id);
        }
        draft.selection = { elementIds: newIds, mode: newIds.length > 1 ? 'multi' : 'single' };
      });
    },

    updateElementAttrs: (id, attrs) => {
      set((draft) => {
        const el = findElementById(draft.document, id);
        if (el) {
          Object.assign(el.attrs, attrs);
        }
      });
    },

    moveElementInTree: (elementId, newParentId, index) => {
      set((draft) => {
        const el = findElementById(draft.document, elementId);
        if (!el) return;
        const oldParent = findParentElement(draft.document, elementId);
        if (!oldParent) return;
        const newParent = findElementById(draft.document, newParentId);
        if (!newParent) return;

        const oldIndex = oldParent.children.findIndex((c) => c.id === elementId);
        if (oldIndex === -1) return;
        oldParent.children.splice(oldIndex, 1);
        newParent.children.splice(index, 0, el);
        el.parentId = newParent.id;
      });
    },

    // --- Group operations ---
    groupElements: (ids) => {
      if (ids.length < 2) return;
      set((draft) => {
        const elements = ids.map((id) => findElementById(draft.document, id)).filter(Boolean) as SvgElementData[];
        if (elements.length < 2) return;

        // Find common parent
        const parent = findParentElement(draft.document, ids[0]);
        if (!parent) return;

        const group: SvgElementData = {
          id: generateId(),
          tag: 'g',
          attrs: {},
          children: [],
          parentId: parent.id,
        };

        // Remove elements from parent and add to group
        for (const el of elements) {
          const idx = parent.children.findIndex((c) => c.id === el.id);
          if (idx !== -1) {
            parent.children.splice(idx, 1);
          }
          el.parentId = group.id;
          group.children.push(el);
        }

        // Insert group where first element was
        parent.children.push(group);
        draft.selection = { elementIds: [group.id], mode: 'single' };
      });
    },

    ungroupElement: (id) => {
      set((draft) => {
        const el = findElementById(draft.document, id);
        if (!el || el.tag !== 'g') return;

        const parent = findParentElement(draft.document, id);
        if (!parent) return;

        const groupIndex = parent.children.findIndex((c) => c.id === id);
        if (groupIndex === -1) return;

        // Remove group and insert its children
        parent.children.splice(groupIndex, 1);
        for (const child of el.children) {
          child.parentId = parent.id;
          parent.children.push(child);
        }

        const childIds = el.children.map((c) => c.id);
        draft.selection = { elementIds: childIds, mode: 'multi' };
      });
    },

    // --- Selection ---
    selectElements: (ids, mode = 'single') => {
      set((draft) => {
        draft.selection = { elementIds: ids, mode };
        // End path edit if selecting a different element
        if (draft.pathEdit && !ids.includes(draft.pathEdit.elementId)) {
          draft.pathEdit = null;
        }
      });
    },

    selectAll: () => {
      set((draft) => {
        const all = flattenElements(draft.document)
          .filter((el) => el.tag !== 'svg')
          .map((el) => el.id);
        draft.selection = { elementIds: all, mode: 'multi' };
      });
    },

    clearSelection: () => {
      set((draft) => {
        draft.selection = { elementIds: [], mode: 'none' };
        draft.pathEdit = null;
      });
    },

    // --- Tool ---
    setActiveTool: (tool) => {
      set((draft) => {
        draft.activeTool = tool;
        if (tool !== 'select') {
          draft.pathEdit = null;
        }
      });
    },

    setShapeVariant: (variant) => {
      set((draft) => {
        draft.shapeVariant = variant;
      });
    },

    // --- Drag ---
    startDrag: (state) => {
      set((draft) => {
        draft.drag = {
          ...state,
          currentX: state.currentX ?? state.startX,
          currentY: state.currentY ?? state.startY,
        };
      });
    },

    updateDrag: (currentX, currentY) => {
      set((draft) => {
        draft.drag.currentX = currentX;
        draft.drag.currentY = currentY;
      });
    },

    endDrag: () => {
      set((draft) => {
        draft.drag = { mode: 'none', startX: 0, startY: 0, currentX: 0, currentY: 0 };
      });
    },

    // --- Path editing ---
    startPathEdit: (elementId) => {
      set((draft) => {
        const el = findElementById(draft.document, elementId);
        if (!el || el.tag !== 'path' || !el.attrs.d) return;

        try {
          const absCommands = parsePathDAbsolute(el.attrs.d);
          const nodes = commandsToNodes(absCommands);
          draft.pathEdit = {
            elementId,
            nodes,
            selectedNodeIndices: [],
            hoveredNodeIndex: null,
          };
        } catch (err) {
          console.error('Failed to parse path:', err);
        }
      });
    },

    endPathEdit: () => {
      set((draft) => {
        draft.pathEdit = null;
      });
    },

    /** Convert a shape element to a path and enter path edit mode */
    convertToPathAndEdit: (elementId) => {
      set((draft) => {
        const el = findElementById(draft.document, elementId);
        if (!el) return;

        const convertibleTags = new Set(['rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline']);

        if (el.tag === 'path') {
          // Already a path — just enter edit mode
          if (!el.attrs.d) return;
          try {
            const absCommands = parsePathDAbsolute(el.attrs.d);
            const nodes = commandsToNodes(absCommands);
            draft.pathEdit = {
              elementId,
              nodes,
              selectedNodeIndices: [],
              hoveredNodeIndex: null,
            };
          } catch (err) {
            console.error('Failed to parse path:', err);
          }
          return;
        }

        if (!convertibleTags.has(el.tag)) return;

        // Convert shape to path
        const d = shapeToPathD(el.tag, el.attrs);
        if (!d) return;

        // Preserve visual attributes, remove shape-specific ones
        const keepAttrs: Record<string, string> = {};
        const skipAttrs = new Set([
          'x', 'y', 'width', 'height', 'rx', 'ry',
          'cx', 'cy', 'r', 'x1', 'y1', 'x2', 'y2',
          'points',
        ]);
        for (const [key, value] of Object.entries(el.attrs)) {
          if (!skipAttrs.has(key)) {
            keepAttrs[key] = value;
          }
        }
        keepAttrs.d = d;

        // Mutate the element to become a path
        el.tag = 'path';
        el.attrs = keepAttrs;

        // Enter path edit mode
        try {
          const absCommands = parsePathDAbsolute(d);
          const nodes = commandsToNodes(absCommands);
          draft.pathEdit = {
            elementId,
            nodes,
            selectedNodeIndices: [],
            hoveredNodeIndex: null,
          };
        } catch (err) {
          console.error('Failed to parse converted path:', err);
        }
      });
    },

    updatePathNode: (nodeIndex, updates) => {
      set((draft) => {
        if (!draft.pathEdit) return;
        const node = draft.pathEdit.nodes[nodeIndex];
        if (!node) return;
        Object.assign(node, updates);
        // Rebuild d attribute from nodes
        const el = findElementById(draft.document, draft.pathEdit.elementId);
        if (el) {
          const isClosed = el.attrs.d?.trimEnd().endsWith('Z') ?? false;
          el.attrs.d = nodesToPathD(draft.pathEdit.nodes, isClosed);
        }
      });
    },

    deletePathNodes: (indices) => {
      set((draft) => {
        if (!draft.pathEdit) return;
        const sorted = [...indices].sort((a, b) => b - a);
        for (const idx of sorted) {
          draft.pathEdit.nodes.splice(idx, 1);
        }
        draft.pathEdit.selectedNodeIndices = [];
        const el = findElementById(draft.document, draft.pathEdit.elementId);
        if (el) {
          el.attrs.d = nodesToPathD(draft.pathEdit.nodes);
        }
      });
    },

    // --- Text editing ---
    updateElementTextContent: (id, text) => {
      set((draft) => {
        const el = findElementById(draft.document, id);
        if (el) {
          el.textContent = text || undefined;
        }
      });
    },

    // --- Pen tool ---
    penToolClick: (x, y) => {
      set((draft) => {
        draft.penTool.points.push({ x, y });
        if (!draft.penTool.elementId) {
          // Create a new path element
          const id = generateId();
          const pathEl: SvgElementData = {
            id,
            tag: 'path',
            attrs: {
              d: `M ${x} ${y}`,
              fill: 'none',
              stroke: '#000000',
              'stroke-width': '2',
            },
            children: [],
            parentId: draft.document.id,
          };
          draft.document.children.push(pathEl);
          draft.penTool.elementId = id;
          draft.penTool.isActive = true;
        } else {
          // Append to existing path
          const el = findElementById(draft.document, draft.penTool.elementId);
          if (el) {
            el.attrs.d += ` L ${x} ${y}`;
          }
        }
      });
    },

    penToolClose: () => {
      set((draft) => {
        if (!draft.penTool.elementId) return;
        const el = findElementById(draft.document, draft.penTool.elementId);
        if (el) {
          el.attrs.d += ' Z';
        }
        draft.penTool.isClosed = true;
        draft.penTool.isActive = false;
        draft.penTool.elementId = null;
        draft.penTool.points = [];
      });
    },

    penToolFinish: () => {
      set((draft) => {
        draft.penTool.isActive = false;
        draft.penTool.elementId = null;
        draft.penTool.points = [];
        draft.penTool.isClosed = false;
      });
    },

    // --- Viewport ---
    setZoom: (zoom) => {
      set((draft) => {
        draft.viewport.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
      });
    },

    zoomIn: () => {
      set((draft) => {
        draft.viewport.zoom = Math.min(ZOOM_MAX, draft.viewport.zoom * ZOOM_STEP);
      });
    },

    zoomOut: () => {
      set((draft) => {
        draft.viewport.zoom = Math.max(ZOOM_MIN, draft.viewport.zoom / ZOOM_STEP);
      });
    },

    zoomToFit: () => {
      // zoomToFit is called from the component which knows the actual container size
      // This version uses a default — the component should call zoomToFitIn instead
      set((draft) => {
        const { canvasWidth, canvasHeight } = draft.viewport;
        if (canvasWidth <= 0 || canvasHeight <= 0) return;
        const scaleX = 800 / canvasWidth;
        const scaleY = 600 / canvasHeight;
        draft.viewport.zoom = Math.min(scaleX, scaleY) * 0.85;
        draft.viewport.panX = 40;
        draft.viewport.panY = 40;
      });
    },

    zoomToFitIn: (containerWidth, containerHeight) => {
      set((draft) => {
        const { canvasWidth, canvasHeight } = draft.viewport;
        if (canvasWidth <= 0 || canvasHeight <= 0) return;
        const padding = 40;
        const availW = containerWidth - padding * 2;
        const availH = containerHeight - padding * 2;
        if (availW <= 0 || availH <= 0) return;
        const scaleX = availW / canvasWidth;
        const scaleY = availH / canvasHeight;
        draft.viewport.zoom = Math.min(scaleX, scaleY);
        // Center the artboard in the container
        draft.viewport.panX = padding + (availW - canvasWidth * draft.viewport.zoom) / 2;
        draft.viewport.panY = padding + (availH - canvasHeight * draft.viewport.zoom) / 2;
      });
    },

    setPan: (x, y) => {
      set((draft) => {
        draft.viewport.panX = x;
        draft.viewport.panY = y;
      });
    },

    // --- Panels ---
    setRightPanelTab: (tab) => {
      set((draft) => {
        draft.rightPanelTab = tab;
      });
    },

    toggleCodePanel: () => {
      set((draft) => {
        draft.showCodePanel = !draft.showCodePanel;
      });
    },

    toggleGrid: () => {
      set((draft) => {
        draft.showGrid = !draft.showGrid;
      });
    },

    // --- Snap ---
    updateSnapConfig: (updates) => {
      set((draft) => {
        Object.assign(draft.snapConfig, updates);
      });
    },

    // --- Clipboard ---
    copySelection: () => {
      set((draft) => {
        draft.clipboard = draft.selection.elementIds
          .map((id) => findElementById(draft.document, id))
          .filter(Boolean) as SvgElementData[];
      });
    },

    pasteClipboard: () => {
      set((draft) => {
        const newIds: string[] = [];
        for (const item of draft.clipboard) {
          const clone = deepClone(item);
          reassignIds(clone, draft.document.id);
          offsetElement(clone, 20, 20);
          draft.document.children.push(clone);
          newIds.push(clone.id);
        }
        draft.selection = { elementIds: newIds, mode: newIds.length > 1 ? 'multi' : 'single' };
      });
    },

    cutSelection: () => {
      const state = get();
      set((draft) => {
        draft.clipboard = draft.selection.elementIds
          .map((id) => findElementById(draft.document, id))
          .filter(Boolean) as SvgElementData[];
        for (const id of draft.selection.elementIds) {
          removeElementById(draft.document, id);
        }
        draft.selection = { elementIds: [], mode: 'none' };
      });
    },

    // --- History ---
    undo: () => {
      set((draft) => {
        if (draft.historyIndex <= 0) return;
        draft.historyIndex--;
        draft.document = deepClone(draft.history[draft.historyIndex].document);
        updateParentRefs(draft.document);
        draft.selection = { elementIds: [], mode: 'none' };
        draft.pathEdit = null;
      });
    },

    redo: () => {
      set((draft) => {
        if (draft.historyIndex >= draft.history.length - 1) return;
        draft.historyIndex++;
        draft.document = deepClone(draft.history[draft.historyIndex].document);
        updateParentRefs(draft.document);
        draft.selection = { elementIds: [], mode: 'none' };
        draft.pathEdit = null;
      });
    },

    pushHistory: (label) => {
      set((draft) => {
        // Truncate forward history
        draft.history = draft.history.slice(0, draft.historyIndex + 1);
        // Push snapshot
        draft.history.push({
          document: deepClone(draft.document),
          timestamp: Date.now(),
          label,
        });
        // Limit size
        if (draft.history.length > MAX_HISTORY) {
          draft.history.shift();
        }
        draft.historyIndex = draft.history.length - 1;
      });
    },
  })),
);

// =============================================================================
// Selectors
// =============================================================================

export const useSelectedElements = () =>
  useSvgEditorStore((s) =>
    s.selection.elementIds
      .map((id) => findElementById(s.document, id))
      .filter(Boolean) as SvgElementData[],
  );

export const useCanUndo = () => useSvgEditorStore((s) => s.historyIndex > 0);
export const useCanRedo = () =>
  useSvgEditorStore((s) => s.historyIndex < s.history.length - 1);
export const useActiveTool = () => useSvgEditorStore((s) => s.activeTool);
export const useViewport = () => useSvgEditorStore((s) => s.viewport);
export const useSelectedBBox = (): BBox | null =>
  useSvgEditorStore((s) => {
    if (s.selection.elementIds.length === 0) return null;
    const boxes = s.selection.elementIds
      .map((id) => {
        const el = findElementById(s.document, id);
        return el ? getElementBBox(el.attrs, el.tag) : null;
      })
      .filter(Boolean) as BBox[];
    if (boxes.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const box of boxes) {
      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxX = Math.max(maxX, box.x + box.width);
      maxY = Math.max(maxY, box.y + box.height);
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  });

// =============================================================================
// Helpers
// =============================================================================

function reassignIds(el: SvgElementData, parentId: string | null): void {
  el.id = generateId();
  el.parentId = parentId;
  for (const child of el.children) {
    reassignIds(child, el.id);
  }
}

function offsetElement(el: SvgElementData, dx: number, dy: number): void {
  const posKeys = ['x', 'y', 'cx', 'cy', 'x1', 'y1', 'x2', 'y2'] as const;
  for (const key of posKeys) {
    if (key in el.attrs) {
      if (key === 'x' || key === 'x1' || key === 'x2' || key === 'cx') {
        el.attrs[key] = String(Number.parseFloat(el.attrs[key]) + dx);
      } else {
        el.attrs[key] = String(Number.parseFloat(el.attrs[key]) + dy);
      }
    }
  }
}
