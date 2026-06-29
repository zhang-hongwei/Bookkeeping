'use client';

import { memo, useCallback } from 'react';
import { Box } from '@mui/material';
import { useGradientStore } from '../store/gradient-store';
import type { ColourStop } from '../types/gradient';

interface ColourHandleProps {
  colour: ColourStop;
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  isDragging: boolean;
  isHovered: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onDelete?: () => void;
}

/**
 * ColourHandle - Circular draggable color control point for mesh gradient editor
 *
 * Visual states:
 * - Normal: White border, grab cursor
 * - Hovered: Primary color border, scale(1.15), elevated z-index
 * - Dragging: Grabbing cursor
 *
 * Performance: Memoized to prevent re-renders when other handles move
 */
function ColourHandle({
  colour,
  x,
  y,
  isDragging,
  isHovered,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onDelete,
}: ColourHandleProps) {
  // Use shallow selector to only re-render when colours.length changes
  const coloursLength = useGradientStore((s) => s.colours.length);
  const canRemove = coloursLength > 2;
  const removeColour = useGradientStore((s) => s.removeColour);

  const handleDelete = useCallback(() => {
    if (canRemove && onDelete) {
      onDelete();
    } else if (canRemove) {
      removeColour(colour.id);
    }
  }, [canRemove, onDelete, removeColour, colour.id]);

  // Handle keyboard delete
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && canRemove) {
        e.stopPropagation();
        handleDelete();
      }
    },
    [canRemove, handleDelete],
  );

  // Handle double click
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleDelete();
    },
    [handleDelete],
  );

  // Prevent context menu on right click for delete action
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canRemove) {
        handleDelete();
      }
    },
    [canRemove, handleDelete],
  );

  const isHoveredOrDragging = isHovered || isDragging;

  return (
    <Box
      data-colour-id={colour.id}
      sx={{
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: '50%',
        bgcolor: colour.hex,
        border: '4px solid',
        borderColor: isHovered ? 'primary.main' : 'white',
        boxShadow: isHoveredOrDragging
          ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(25, 118, 210, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.1)' : ''}`,
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        zIndex: isHoveredOrDragging ? 20 : 5,
        transition: isDragging
          ? 'none'
          : 'transform 0.15s ease, box-shadow 0.15s ease',
        willChange: 'transform',
      }}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      tabIndex={0}
      role="button"
      aria-label={`Color ${colour.hex}`}
      title={`${colour.hex} — Right-click or double-click to delete${canRemove ? '' : ' (minimum 2 colors)'}`}
    />
  );
}

// Memoize to prevent re-renders when props haven't changed
export default memo(ColourHandle, (prevProps, nextProps) => {
  return (
    prevProps.colour.id === nextProps.colour.id &&
    prevProps.colour.hex === nextProps.colour.hex &&
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isHovered === nextProps.isHovered
  );
});
