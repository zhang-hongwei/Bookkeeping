'use client';

import type { SelectionState, BBox, ResizeHandlePosition } from '../../types';

interface SelectionOverlayProps {
  selection: SelectionState;
  svgRef: React.RefObject<SVGSVGElement | null>;
  zoom: number;
  createBBox: BBox | null;
  onResizeStart?: (handle: ResizeHandlePosition, bbox: BBox) => void;
}

const HANDLE_SIZE = 6;

const HANDLE_POSITIONS: {
  pos: ResizeHandlePosition;
  getX: (b: BBox) => number;
  getY: (b: BBox) => number;
  cursor: string;
}[] = [
  { pos: 'nw', getX: (b) => b.x, getY: (b) => b.y, cursor: 'nw-resize' },
  { pos: 'n', getX: (b) => b.x + b.width / 2, getY: (b) => b.y, cursor: 'n-resize' },
  { pos: 'ne', getX: (b) => b.x + b.width, getY: (b) => b.y, cursor: 'ne-resize' },
  { pos: 'e', getX: (b) => b.x + b.width, getY: (b) => b.y + b.height / 2, cursor: 'e-resize' },
  { pos: 'se', getX: (b) => b.x + b.width, getY: (b) => b.y + b.height, cursor: 'se-resize' },
  { pos: 's', getX: (b) => b.x + b.width / 2, getY: (b) => b.y + b.height, cursor: 's-resize' },
  { pos: 'sw', getX: (b) => b.x, getY: (b) => b.y + b.height, cursor: 'sw-resize' },
  { pos: 'w', getX: (b) => b.x, getY: (b) => b.y + b.height / 2, cursor: 'w-resize' },
];

/**
 * Get real bounding box from the DOM for selected elements.
 */
function getSelectionBBoxFromDom(
  selection: SelectionState,
  svgRef: React.RefObject<SVGSVGElement | null>,
): BBox | null {
  const svg = svgRef.current;
  if (!svg || selection.elementIds.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const id of selection.elementIds) {
    const domEl = svg.querySelector(`[data-editor-id="${id}"]`);
    if (!domEl) continue;
    try {
      const bbox = (domEl as SVGGraphicsElement).getBBox();
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
    } catch {
      // getBBox can fail for some element types — skip
    }
  }

  if (minX === Infinity) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export default function SelectionOverlay({
  selection,
  svgRef,
  zoom,
  createBBox,
  onResizeStart,
}: SelectionOverlayProps) {
  const bbox = getSelectionBBoxFromDom(selection, svgRef);
  const hs = HANDLE_SIZE / zoom;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Selection bounding box */}
      {bbox && bbox.width > 0 && bbox.height > 0 && (
        <>
          <rect
            x={bbox.x}
            y={bbox.y}
            width={bbox.width}
            height={bbox.height}
            fill="none"
            stroke="#643DFF"
            strokeWidth={1.5 / zoom}
            strokeDasharray={`${4 / zoom} ${2 / zoom}`}
          />

          {/* Resize handles */}
          {HANDLE_POSITIONS.map(({ pos, getX, getY, cursor }) => (
            <rect
              key={pos}
              data-resize-handle={pos}
              x={getX(bbox) - hs / 2}
              y={getY(bbox) - hs / 2}
              width={hs}
              height={hs}
              fill="white"
              stroke="#643DFF"
              strokeWidth={1.5 / zoom}
              style={{ pointerEvents: 'all', cursor }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onResizeStart?.(pos, bbox);
              }}
            />
          ))}
        </>
      )}

      {/* Thin bbox outline for very thin selections (lines, thin paths) */}
      {bbox && (bbox.width <= 0 || bbox.height <= 0) && (
        <rect
          x={bbox.x - 2 / zoom}
          y={bbox.y - 2 / zoom}
          width={(bbox.width || 0) + 4 / zoom}
          height={(bbox.height || 0) + 4 / zoom}
          fill="none"
          stroke="#643DFF"
          strokeWidth={1 / zoom}
          strokeDasharray={`${3 / zoom} ${2 / zoom}`}
        />
      )}

      {/* Creation preview */}
      {createBBox && createBBox.width > 0 && createBBox.height > 0 && (
        <rect
          x={createBBox.x}
          y={createBBox.y}
          width={createBBox.width}
          height={createBBox.height}
          fill="rgba(100, 61, 255, 0.1)"
          stroke="#643DFF"
          strokeWidth={1 / zoom}
          strokeDasharray={`${4 / zoom} ${2 / zoom}`}
        />
      )}
    </g>
  );
}
