import { useState, useCallback, useEffect, useRef } from 'react';
import { useGridGeneratorStore } from '../../store/gridGeneratorStore';

/**
 * Hook for drag-to-select grid area functionality.
 * Handles mouse and touch events for selecting grid cells.
 */
export function useDragSelection(columns: number) {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const dragStartRef = useRef<number | null>(null);

  const addChildren = useGridGeneratorStore((state) => state.addChildren);

  // Keep ref in sync with state for global event handlers
  useEffect(() => {
    dragStartRef.current = dragStart;
  }, [dragStart]);

  // Global mouseup/touchend handler to handle release outside grid
  useEffect(() => {
    const handleGlobalEnd = () => {
      setDragStart(null);
      setDragEnd(null);
    };

    if (dragStart !== null) {
      window.addEventListener('mouseup', handleGlobalEnd);
      window.addEventListener('touchend', handleGlobalEnd);
      return () => {
        window.removeEventListener('mouseup', handleGlobalEnd);
        window.removeEventListener('touchend', handleGlobalEnd);
      };
    }
  }, [dragStart]);

  const handleMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setDragStart(index);
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      if (dragStartRef.current !== null) {
        const gridArea = calcGridArea(dragStartRef.current, index, columns);
        addChildren(gridArea);
      }
      setDragStart(null);
      setDragEnd(null);
    },
    [columns, addChildren],
  );

  const handleMouseEnter = useCallback(
    (index: number) => {
      if (dragStart !== null) {
        setDragEnd(index);
      }
    },
    [dragStart],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    e.preventDefault();
    setDragStart(index);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent, index: number) => {
      e.preventDefault();
      if (dragStart !== null) {
        const gridArea = calcGridArea(dragStart, index, columns);
        addChildren(gridArea);
      }
      setDragStart(null);
      setDragEnd(null);
    },
    [dragStart, columns, addChildren],
  );

  const isInRange = useCallback(
    (index: number): boolean => {
      if (dragStart === null || dragEnd === null) return false;

      const startRow = Math.floor(dragStart / columns);
      const startCol = dragStart % columns;
      const endRow = Math.floor(dragEnd / columns);
      const endCol = dragEnd % columns;

      const currentRow = Math.floor(index / columns);
      const currentCol = index % columns;

      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);

      return (
        currentRow >= minRow &&
        currentRow <= maxRow &&
        currentCol >= minCol &&
        currentCol <= maxCol
      );
    },
    [dragStart, dragEnd, columns],
  );

  return {
    handleMouseDown,
    handleMouseUp,
    handleMouseEnter,
    handleTouchStart,
    handleTouchEnd,
    isInRange,
  };
}

/** Convert start/end cell indices into a CSS grid-area string */
function calcGridArea(start: number, end: number, columns: number): string {
  const startRow = Math.floor(start / columns) + 1;
  const startCol = (start % columns) + 1;
  const endRow = Math.floor(end / columns) + 1;
  const endCol = (end % columns) + 1;

  const rowStart = Math.min(startRow, endRow);
  const colStart = Math.min(startCol, endCol);
  const rowEnd = Math.max(startRow, endRow) + 1;
  const colEnd = Math.max(startCol, endCol) + 1;

  return `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`;
}
