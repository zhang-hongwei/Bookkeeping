/**
 * KonvaElement - Renders PosterNode types as Konva shapes
 * Adapted to use the new engine store with PosterNode + Matrix2D
 */

"use client";

import { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { Rect, Text, Line, Ellipse, Image as KonvaImage, Shape, Group } from 'react-konva';
import type Konva from 'konva';
import type {
  PosterNode,
  TextNode,
  ShapeNode,
  DecorativeNode,
  ImageNode,
  Matrix2D,
} from '../engine/node-tree/types';
import { isImageAsset, isShapeAsset } from '../engine/assets/types';
import { useAssetStore } from '../engine/assets/asset-store';
import { decomposeMatrix, createMatrix } from '../engine/matrix-utils';
import { useEditorStore } from '../engine/store';
import { AddNodeCommand } from '../engine/commands/commands/add-node';
import { UpdateNodeCommand } from '../engine/commands/commands/update-node';
import { duplicateNodes } from '../engine/clipboard';
import { useKonvaImage, getCrop } from '../utils/konva-helpers';

interface KonvaElementProps {
  nodeId: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, props: { x: number; y: number; width: number; height: number; rotation: number }) => void;
  onDoubleClick: (id: string) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

// Common props shared by all element shape components
interface ElementCommonProps {
  ref?: React.RefObject<never>;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  draggable: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDblClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragStart: (e?: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: () => void;
  name: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function KonvaElement({
  nodeId,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  onDoubleClick,
  onDragMove,
}: KonvaElementProps) {
  // We receive node data via props pattern from parent Canvas to avoid per-element store subscriptions
  // But for simplicity, we read from the parent's data through a wrapper
  // The parent Canvas passes node data via the element prop pattern for compatibility
  // This component is wrapped by KonvaElementAdapter below
  return null;
}

export interface MultiDragContext {
  selectedIds: Set<string>;
  stageRef: React.RefObject<Konva.Stage | null>;
  /** Ref shared across all elements to coordinate multi-drag state */
  stateRef: React.RefObject<{
    active: boolean;
    startPositions: Record<string, { x: number; y: number }>;
    draggingIds: Set<string>;
  }>;
}

/**
 * KonvaElementRenderer - The actual rendering component.
 * Receives the PosterNode directly instead of using per-element store subscriptions.
 */
export function KonvaElementRenderer({
  node,
  isSelected,
  onSelect,
  onToggleSelect,
  onDragEnd,
  onTransformEnd,
  onDoubleClick,
  onDragMove,
  multiDrag,
}: {
  node: PosterNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, props: { x: number; y: number; width: number; height: number; rotation: number }) => void;
  onDoubleClick: (id: string) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  multiDrag?: MultiDragContext;
}) {
  const nodeRef = useRef<Konva.Node>(null);
  const isDragging = useRef(false);
  const altDuplicateRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const { x: storeX, y: storeY, rotation } = decomposeMatrix(node.localMatrix);
  const { width, height, opacity, locked, visible } = node;
  const id = node.id;

  // Check if this element is part of an active multi-drag
  const isPartOfMultiDrag = multiDrag?.stateRef.current.draggingIds.has(id) ?? false;

  // During drag (single or multi), read Konva node's live position to prevent re-renders
  // (e.g. ruler updates) from resetting the element back to store position
  const x = (isDragging.current || isPartOfMultiDrag) && nodeRef.current ? nodeRef.current.x() : storeX;
  const y = (isDragging.current || isPartOfMultiDrag) && nodeRef.current ? nodeRef.current.y() : storeY;

  if (!visible) return null;

  const isMultiSelected = multiDrag != null && multiDrag.selectedIds.size > 1 && multiDrag.selectedIds.has(id);

  const handleDragStart = useCallback((e?: Konva.KonvaEventObject<DragEvent>) => {
    isDragging.current = true;
    setIsHovered(false);
    altDuplicateRef.current = e?.evt?.altKey ?? false;

    // Initialize multi-drag state when starting to drag a multi-selected element
    if (isMultiSelected && multiDrag) {
      const md = multiDrag.stateRef.current;
      if (!md.active) {
        const state = useEditorStore.getState();
        const positions: Record<string, { x: number; y: number }> = {};
        for (const sid of multiDrag.selectedIds) {
          const n = state.nodes[sid];
          if (n) {
            const { x: nx, y: ny } = decomposeMatrix(n.localMatrix);
            positions[sid] = { x: nx, y: ny };
          }
        }
        md.startPositions = positions;
        md.draggingIds = new Set(multiDrag.selectedIds);
        md.active = true;
      }
    }
  }, [id, isMultiSelected, multiDrag]);

  const handleInternalDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      // Let snapping adjust the primary element first
      onDragMove?.(e);

      // Then move all other selected elements by the same delta
      const md = multiDrag?.stateRef.current;
      if (!md?.active || md.draggingIds.size <= 1) return;

      const stage = multiDrag!.stageRef.current;
      if (!stage) return;

      const startPos = md.startPositions[id];
      if (!startPos) return;

      const dx = e.target.x() - startPos.x;
      const dy = e.target.y() - startPos.y;

      for (const otherId of md.draggingIds) {
        if (otherId === id) continue;
        const otherNode = stage.findOne(`.element-${otherId}`);
        const otherStart = md.startPositions[otherId];
        if (otherNode && otherStart) {
          otherNode.x(otherStart.x + dx);
          otherNode.y(otherStart.y + dy);
        }
      }
    },
    [id, onDragMove, multiDrag],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const finalX = Math.round(e.target.x());
      const finalY = Math.round(e.target.y());
      const wasAltDuplicate = altDuplicateRef.current;
      altDuplicateRef.current = false;

      if (wasAltDuplicate) {
        // Alt+drag: duplicate the element at the new position, keep original in place
        requestAnimationFrame(() => {
          isDragging.current = false;
          const s = useEditorStore.getState();
          if (s.rootNodeId) {
            // Move original back to start position
            const { rotation, scaleX, scaleY } = decomposeMatrix(node.localMatrix);
            const oldMatrix = node.localMatrix;
            const newMatrix = createMatrix({ x: storeX, y: storeY, rotation, scaleX, scaleY });
            s.execute(new UpdateNodeCommand(id, { localMatrix: oldMatrix }, { localMatrix: newMatrix }, `Alt-drag restore ${id}`));
            // Create duplicate at the drop position
            const dupMatrix = createMatrix({ x: finalX, y: finalY, rotation, scaleX, scaleY });
            const newNode: Omit<PosterNode, 'id'> = {
              ...node,
              parentId: node.parentId,
              localMatrix: dupMatrix,
              childrenIds: [],
            };
            s.execute(new AddNodeCommand(newNode, node.parentId ?? s.rootNodeId, undefined, `Duplicate ${id}`));
          }
        });
      } else {
        requestAnimationFrame(() => {
          isDragging.current = false;
          onDragEnd(id, finalX, finalY);
        });
      }
    },
    [id, node, storeX, storeY, onDragEnd],
  );

  const handleTransformEnd = useCallback(() => {
    const n = nodeRef.current;
    if (!n) return;

    const scaleX = n.scaleX();
    const scaleY = n.scaleY();

    const newWidth = Math.max(20, Math.round(n.width() * scaleX));
    const newHeight = Math.max(20, Math.round(n.height() * scaleY));

    // Reset scale after computing final size
    n.scaleX(1);
    n.scaleY(1);
    n.width(newWidth);
    n.height(newHeight);

    onTransformEnd(id, {
      x: Math.round(n.x()),
      y: Math.round(n.y()),
      width: newWidth,
      height: newHeight,
      rotation: Math.round(n.rotation()),
    });
  }, [id, onTransformEnd]);

  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if (locked) return;
      if (e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey) {
        onToggleSelect(id);
      } else {
        onSelect(id);
      }
    },
    [id, locked, onSelect, onToggleSelect],
  );

  const handleDblClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if (!locked) onDoubleClick(id);
    },
    [id, locked, onDoubleClick],
  );

  const commonProps: ElementCommonProps = {
    ref: nodeRef as React.RefObject<never>,
    x,
    y,
    width,
    height,
    rotation,
    opacity: opacity / 100,
    draggable: !locked,
    onClick: handleClick,
    onDblClick: handleDblClick,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragMove: isMultiSelected ? handleInternalDragMove : onDragMove,
    onTransformEnd: handleTransformEnd,
    name: `element-${id}`,
    onMouseEnter: !locked ? () => setIsHovered(true) : undefined,
    onMouseLeave: !locked ? () => setIsHovered(false) : undefined,
  };

  const showHoverBorder = isHovered && !isSelected && !locked;

  return (
    <Group>
      {(() => {
        switch (node.type) {
          case 'text':
            return <TextNodeShape node={node as TextNode} {...commonProps} />;
          case 'shape':
            return <ShapeNodeShape node={node as ShapeNode} {...commonProps} />;
          case 'decorative':
            return <DecorativeNodeShape node={node as DecorativeNode} {...commonProps} />;
          case 'image':
            return <ImageNodeShape node={node as ImageNode} {...commonProps} />;
          default:
            return null;
        }
      })()}
      {showHoverBorder && (
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          rotation={rotation}
          stroke="#1976d2"
          strokeWidth={1}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  );
}

// === Text Node ===

function TextNodeShape({
  node,
  ...props
}: { node: TextNode } & ElementCommonProps) {
  const hasBg = node.backgroundColor && node.backgroundColor !== 'transparent';

  const handleTransform = useCallback((e: Konva.KonvaEventObject<Event>) => {
    const group = e.target as Konva.Group;
    const newWidth = Math.max(30, Math.round(group.width() * group.scaleX()));
    group.setAttrs({ width: newWidth, scaleX: 1 });

    const textNode = group.findOne('.text-content') as Konva.Text;
    if (textNode) textNode.width(newWidth);

    const bgNode = group.findOne('.text-bg') as Konva.Rect;
    if (bgNode) bgNode.width(newWidth);
  }, []);

  return (
    <Group {...props} onTransform={handleTransform}>
      {hasBg && (
        <Rect
          name="text-bg"
          width={node.width}
          height={node.height}
          fill={node.backgroundColor}
        />
      )}
      <Text
        name="text-content"
        text={node.content}
        fontFamily={node.fontFamily}
        fontSize={node.fontSize}
        fontStyle={node.fontWeight >= 700 ? 'bold' : 'normal'}
        fill={node.color}
        align={node.textAlign}
        lineHeight={node.lineHeight}
        letterSpacing={node.letterSpacing}
        padding={node.padding}
        wrap="word"
        width={node.width}
        height={node.height}
      />
    </Group>
  );
}

// === Shape Node ===

/**
 * Hook to convert SVG markup into a loaded HTMLImageElement for Konva rendering.
 * Wraps the fragment in a full SVG document, creates a blob URL, and loads it
 * asynchronously. Applies fill/stroke color overrides from the node.
 * Renders at 4x supersampled resolution for anti-aliased edges.
 */
function useSvgImage(
  svgContent: string | undefined,
  viewBox: string | undefined,
  width: number,
  height: number,
  fillColor?: string,
  strokeColor?: string,
): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!svgContent) {
      setImg(null);
      return;
    }

    const vb = viewBox || '0 0 100 100';

    // Build color override wrapper
    let colorWrapper = '';
    let colorClose = '';
    if (fillColor && fillColor !== 'none') {
      colorWrapper += `<g fill="${fillColor}" stroke="${fillColor}">`;
      colorClose += '</g>';
    } else if (strokeColor && strokeColor !== 'none') {
      colorWrapper += `<g fill="none" stroke="${strokeColor}">`;
      colorClose += '</g>';
    }

    // Render at 4x for anti-aliased edges, downscale via canvas to display size
    const scale = 4;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${width * scale}" height="${height * scale}">${colorWrapper}${svgContent}${colorClose}</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const rawImage = new window.Image();
    rawImage.onload = () => {
      // Downscale to display size via canvas for crisp result
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(rawImage, 0, 0, width, height);
      }
      URL.revokeObjectURL(url);

      const finalImage = new window.Image();
      finalImage.onload = () => setImg(finalImage);
      finalImage.src = canvas.toDataURL();
    };
    rawImage.onerror = () => {
      URL.revokeObjectURL(url);
      setImg(null);
    };
    rawImage.src = url;

    return () => {
      rawImage.onload = null;
      rawImage.onerror = null;
      URL.revokeObjectURL(url);
    };
  }, [svgContent, viewBox, width, height, fillColor, strokeColor]);

  return img;
}

/**
 * Renders an SVG shape by converting SVG markup to an image via useSvgImage.
 * Anti-aliasing is handled by 4x supersampling inside useSvgImage.
 */
function SvgShape({
  node,
  ...props
}: { node: ShapeNode } & ElementCommonProps) {
  const { svgContent, viewBox } = useMemo(() => {
    if (node.svgContent) return { svgContent: node.svgContent, viewBox: undefined };
    if (!node.assetId) return { svgContent: undefined, viewBox: undefined };
    const asset = useAssetStore.getState().assets[node.assetId];
    if (asset && isShapeAsset(asset)) {
      return { svgContent: asset.svgContent, viewBox: asset.viewBox };
    }
    return { svgContent: undefined, viewBox: undefined };
  }, [node.svgContent, node.assetId]);

  const svgImage = useSvgImage(
    svgContent,
    viewBox,
    node.width,
    node.height,
    node.fill,
    node.stroke !== 'none' ? node.stroke : undefined,
  );

  if (!svgImage) return null;

  return <KonvaImage {...props} image={svgImage} />;
}

function ShapeNodeShape({
  node,
  ...props
}: { node: ShapeNode } & ElementCommonProps) {
  if (node.shapeType === 'svg') {
    return <SvgShape node={node} {...props} />;
  }

  if (node.shapeType === 'circle') {
    return (
      <Ellipse
        {...props}
        radiusX={node.width / 2}
        radiusY={node.height / 2}
        fill={node.fill}
        stroke={node.stroke}
        strokeWidth={node.strokeWidth}
        width={undefined as unknown as number}
        height={undefined as unknown as number}
      />
    );
  }

  if (node.shapeType === 'line') {
    return (
      <Line
        {...(props as Omit<typeof props, 'width' | 'height'>)}
        points={[0, 0, node.width, 0]}
        stroke={node.stroke}
        strokeWidth={node.strokeWidth || 2}
        fill={undefined}
      />
    );
  }

  // Rectangle
  return (
    <Rect
      {...props}
      fill={node.fill}
      stroke={node.strokeWidth > 0 ? node.stroke : undefined}
      strokeWidth={node.strokeWidth > 0 ? node.strokeWidth : undefined}
      cornerRadius={node.borderRadius}
    />
  );
}

// === Decorative Node ===

function DecorativeNodeShape({
  node,
  ...props
}: { node: DecorativeNode } & ElementCommonProps) {
  const sceneFunc = useCallback(
    (ctx: Konva.Context, shape: Konva.Shape) => {
      const w = node.width;
      const h = node.height;
      const spacing = node.spacing || 20;
      const color = node.color;

      switch (node.decorativeType) {
        case 'border':
          ctx.strokeStyle = color;
          ctx.lineWidth = node.strokeWidth || 1;
          ctx.strokeRect(0, 0, w, h);
          break;

        case 'scanlines': {
          const gap = spacing;
          ctx.strokeStyle = color + '33';
          ctx.lineWidth = 1;
          for (let ly = gap; ly < h; ly += gap) {
            ctx.beginPath();
            ctx.moveTo(0, ly);
            ctx.lineTo(w, ly);
            ctx.stroke();
          }
          break;
        }

        case 'dots': {
          const dotSpacing = spacing;
          ctx.fillStyle = color;
          for (let dy = dotSpacing; dy < h; dy += dotSpacing) {
            for (let dx = dotSpacing; dx < w; dx += dotSpacing) {
              ctx.beginPath();
              ctx.arc(dx, dy, 1, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }

        case 'grid': {
          const gridSpacing = spacing;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          for (let gx = gridSpacing; gx < w; gx += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.lineTo(gx, h);
            ctx.stroke();
          }
          for (let gy = gridSpacing; gy < h; gy += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(w, gy);
            ctx.stroke();
          }
          break;
        }
      }

      ctx.fillStrokeShape(shape);
    },
    [node],
  );

  return <Shape {...props} sceneFunc={sceneFunc} />;
}

// === Image Node ===

function ImageNodeShape({
  node,
  ...props
}: { node: ImageNode } & ElementCommonProps) {
  // Resolve image source: prefer inline src for backward compat, then asset lookup
  const assetSrc = useMemo(() => {
    if (!node.assetId) return undefined;
    const asset = useAssetStore.getState().assets[node.assetId];
    return asset && isImageAsset(asset) ? asset.src : undefined;
  }, [node.assetId]);
  const src = node.src || assetSrc;

  const image = useKonvaImage(src);

  const crop = useMemo(() => {
    if (!image) return undefined;
    return getCrop(image, { width: node.width, height: node.height });
  }, [image, node.width, node.height]);

  const handleTransform = useCallback(
    (e: Konva.KonvaEventObject<Event>) => {
      const n = e.target as Konva.Image;
      if (!image) return;

      const newWidth = Math.max(20, Math.round(n.width() * n.scaleX()));
      const newHeight = Math.max(20, Math.round(n.height() * n.scaleY()));

      n.setAttrs({ scaleX: 1, scaleY: 1, width: newWidth, height: newHeight });

      const newCrop = getCrop(image, { width: newWidth, height: newHeight });
      n.setAttrs(newCrop);
    },
    [image],
  );

  if (!image) return null;

  return (
    <KonvaImage
      {...props}
      image={image}
      cornerRadius={node.borderRadius}
      cropX={crop?.cropX}
      cropY={crop?.cropY}
      cropWidth={crop?.cropWidth}
      cropHeight={crop?.cropHeight}
      onTransform={handleTransform}
    />
  );
}
