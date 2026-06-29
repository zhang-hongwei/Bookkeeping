'use client';

import { memo } from 'react';
import type { SvgElementData } from '../../types';

interface CanvasRendererProps {
  document: SvgElementData;
  selectedIds: string[];
  zoom: number;
}

/**
 * Recursively render SVG elements as native SVG DOM.
 * No React event handlers — hit detection is done via event delegation on the canvas.
 */
function SvgElement({
  element,
  selectedIds,
  zoom,
}: {
  element: SvgElementData;
  selectedIds: string[];
  zoom: number;
}) {
  const isSelected = selectedIds.includes(element.id);
  const isContainer = element.tag === 'g' || element.tag === 'svg' || element.tag === 'defs'
    || element.tag === 'clipPath' || element.tag === 'mask' || element.tag === 'symbol';

  // Common props: spread attrs + editor id + selection highlight
  const svgProps: Record<string, unknown> = {
    ...Object.fromEntries(Object.entries(element.attrs)),
    'data-editor-id': element.id,
    style: {
      cursor: isContainer ? 'default' : 'pointer',
      pointerEvents: isContainer ? ('none' as const) : ('all' as const),
      outline: isSelected ? `2px solid #643DFF` : undefined,
      outlineOffset: `${2 / zoom}px`,
    },
  };

  // Container elements — render children inside a <g>
  if (isContainer) {
    return (
      <g {...svgProps}>
        {element.children.map((child) => (
          <SvgElement
            key={child.id}
            element={child}
            selectedIds={selectedIds}
            zoom={zoom}
          />
        ))}
      </g>
    );
  }

  const { tag } = element;

  if (tag === 'rect') return <rect {...svgProps} />;
  if (tag === 'circle') return <circle {...svgProps} />;
  if (tag === 'ellipse') return <ellipse {...svgProps} />;
  if (tag === 'line') return <line {...svgProps} />;
  if (tag === 'path') return <path {...svgProps} />;
  if (tag === 'polygon') return <polygon {...svgProps} />;
  if (tag === 'polyline') return <polyline {...svgProps} />;
  if (tag === 'image') return <image {...svgProps} />;

  if (tag === 'text') {
    return (
      <text {...svgProps}>
        {element.textContent}
        {element.children.map((child) => (
          <SvgElement key={child.id} element={child} selectedIds={selectedIds} zoom={zoom} />
        ))}
      </text>
    );
  }
  if (tag === 'tspan') {
    return <tspan {...svgProps}>{element.textContent}</tspan>;
  }

  // Fallback: render as group
  return (
    <g {...svgProps}>
      {element.children.map((child) => (
        <SvgElement key={child.id} element={child} selectedIds={selectedIds} zoom={zoom} />
      ))}
    </g>
  );
}

const MemoizedSvgElement = memo(SvgElement);

export default function CanvasRenderer({ document, selectedIds, zoom }: CanvasRendererProps) {
  return (
    <g>
      {document.children.map((child) => (
        <MemoizedSvgElement key={child.id} element={child} selectedIds={selectedIds} zoom={zoom} />
      ))}
    </g>
  );
}
