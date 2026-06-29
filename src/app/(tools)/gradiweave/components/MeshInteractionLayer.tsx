'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useGradientStore } from '../store/gradient-store';
import { randomOklch } from '../lib/colours/random';
import { getUpdateSingleColourPosition } from '../hooks/useGradientRenderer';
import ColourHandle from './ColourHandle';
import type { RefObject } from 'react';

interface MeshInteractionLayerProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

/**
 * MeshInteractionLayer - Canvas overlay for interactive mesh gradient editing
 *
 * Features:
 * - Draggable color control points
 * - Click empty space to add new color
 * - Right-click or double-click to delete colors
 * - Only visible in mesh-static mode
 *
 * Performance optimizations:
 * - Direct WebGL updates during drag (bypasses store subscriptions)
 * - Temporary position state for handle display
 * - Only commits to store on drag end
 */
export function MeshInteractionLayer({ canvasRef }: MeshInteractionLayerProps) {
  const gradientType = useGradientStore((s) => s.type);
  const colours = useGradientStore((s) => s.colours);
  const updateColourPosition = useGradientStore((s) => s.updateColourPosition);
  const addColour = useGradientStore((s) => s.addColour);
  const removeColour = useGradientStore((s) => s.removeColour);

  // Interaction state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Temporary position for handle display during drag (WebGL coordinates)
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(null);

  // Track the colour index during drag for direct WebGL updates
  const draggingColourIndexRef = useRef<number | null>(null);

  // Refs for pointer tracking
  const overlayRef = useRef<HTMLDivElement>(null);

  // Track canvas position and size for overlay positioning
  useEffect(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) return;

    const updateOverlayPosition = () => {
      const canvasRect = canvas.getBoundingClientRect();
      const parentRect = canvas.parentElement?.getBoundingClientRect();

      if (!parentRect) return;

      // Position overlay to match canvas within its parent
      const relativeLeft = canvasRect.left - parentRect.left;
      const relativeTop = canvasRect.top - parentRect.top;

      overlay.style.position = 'absolute';
      overlay.style.left = `${relativeLeft}px`;
      overlay.style.top = `${relativeTop}px`;
      overlay.style.width = `${canvasRect.width}px`;
      overlay.style.height = `${canvasRect.height}px`;
    };

    // Initial positioning
    updateOverlayPosition();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateOverlayPosition);
    resizeObserver.observe(canvas);

    // Also update on window resize and scroll
    window.addEventListener('resize', updateOverlayPosition);
    window.addEventListener('scroll', updateOverlayPosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateOverlayPosition);
      window.removeEventListener('scroll', updateOverlayPosition, true);
    };
  }, [canvasRef]);

  // Initialize default positions for colors that don't have one
  useEffect(() => {
    const state = useGradientStore.getState();
    const needsPosition = state.colours.filter((c) => !c.position);

    if (needsPosition.length === 0) return;

    // Distribute colors in a circle pattern
    const updatedColours = state.colours.map((colour, index) => {
      if (colour.position) return colour;

      // Calculate position in a circle
      const angle = (index / state.colours.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 0.3;
      const x = 0.5 + Math.cos(angle) * radius;
      const y = 0.5 + Math.sin(angle) * radius;

      return { ...colour, position: { x, y } };
    });

    // Update store with new positions
    state.setColours(updatedColours);
  }, []); // Run once on mount

  /**
   * Convert screen coordinates to normalized (0-1) canvas coordinates
   * Note: WebGL origin is bottom-left, DOM origin is top-left, so we flip Y
   */
  const screenToNormalized = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0.5, y: 0.5 };

      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height)), // Flip Y for WebGL
      };
    },
    [canvasRef],
  );

  /**
   * Check if point is near any existing color handle
   */
  const isNearHandle = useCallback(
    (x: number, y: number): boolean => {
      const threshold = 0.05; // 5% of canvas size
      return colours.some((colour) => {
        const pos = colour.position;
        if (!pos) return false;
        const dx = pos.x - x;
        const dy = pos.y - y;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
      });
    },
    [colours],
  );

  /**
   * Handle pointer down on overlay
   */
  const handleOverlayPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only handle left mouse button
      if (e.button !== 0) return;

      // Check if clicking on a handle (handled by ColourHandle component)
      const target = e.target as HTMLElement;
      if (target.dataset.colourId) {
        return; // Let ColourHandle handle it
      }

      const pos = screenToNormalized(e.clientX, e.clientY);

      // Check if near an existing handle
      if (isNearHandle(pos.x, pos.y)) {
        return;
      }

      // Click on empty space - add new color
      const newOklch = randomOklch();
      addColour(newOklch);

      // Set the position for the newly added color
      // We need to get the latest colors and find the one we just added
      setTimeout(() => {
        const latestColours = useGradientStore.getState().colours;
        const newColour = latestColours[latestColours.length - 1];
        if (newColour) {
          updateColourPosition(newColour.id, pos);
        }
      }, 0);
    },
    [screenToNormalized, isNearHandle, addColour, updateColourPosition],
  );

  /**
   * Handle pointer down on a color handle
   */
  const handleHandlePointerDown = useCallback(
    (colourId: string, colourIndex: number) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const pos = screenToNormalized(e.clientX, e.clientY);

      setDraggingId(colourId);
      setHoveredId(colourId);
      setTempPosition(pos); // Initialize temp position
      draggingColourIndexRef.current = colourIndex;

      // Capture pointer to track movement outside the element
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [screenToNormalized],
  );

  /**
   * Handle pointer move - update color position while dragging
   * Uses direct WebGL update for real-time feedback without store updates
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingId || draggingColourIndexRef.current === null) return;

      const pos = screenToNormalized(e.clientX, e.clientY);

      // Direct WebGL update (bypasses store, no component re-renders)
      const updatePosition = getUpdateSingleColourPosition();
      if (updatePosition) {
        updatePosition(draggingColourIndexRef.current, pos.x, pos.y);
      }

      // Update temp position for handle display
      setTempPosition(pos);
    },
    [draggingId, screenToNormalized],
  );

  /**
   * Handle pointer up - commit the drag position to store
   */
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingId) return;

      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

      // Get the current position
      const pos = tempPosition || screenToNormalized(e.clientX, e.clientY);

      // Commit to store - triggers single re-render
      updateColourPosition(draggingId, pos);

      setDraggingId(null);
      setTempPosition(null);
      draggingColourIndexRef.current = null;
    },
    [draggingId, tempPosition, screenToNormalized, updateColourPosition],
  );

  /**
   * Handle pointer cancel - clean up without committing
   */
  const handlePointerCancel = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingId) return;

      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingId(null);
      setTempPosition(null);
      draggingColourIndexRef.current = null;
    },
    [draggingId],
  );

  /**
   * Handle double click on handle - delete color
   */
  const handleDoubleClick = useCallback(
    (colourId: string) => () => {
      if (colours.length <= 2) return; // Minimum 2 colors
      removeColour(colourId);
    },
    [colours.length, removeColour],
  );

  // Only show in mesh-static mode - EARLY RETURN AFTER ALL HOOKS
  if (gradientType !== 'mesh-static') {
    return null;
  }

  return (
    <Box
      ref={overlayRef}
      sx={{ touchAction: 'none', pointerEvents: 'auto', position: 'relative' }}
      onPointerDown={handleOverlayPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {colours.map((colour, index) => {
        const storePos = colour.position ?? { x: 0.5, y: 0.5 };
        const isDragging = draggingId === colour.id;
        const isHovered = hoveredId === colour.id;

        // Use temp position during drag for the dragging handle
        const effectivePos = isDragging && tempPosition ? tempPosition : storePos;

        // Flip Y back for DOM positioning (WebGL stores flipped Y, DOM needs normal Y)
        const displayY = 1 - effectivePos.y;

        return (
          <ColourHandle
            key={colour.id}
            colour={colour}
            x={effectivePos.x}
            y={displayY}
            isDragging={isDragging}
            isHovered={isHovered}
            onPointerDown={handleHandlePointerDown(colour.id, index)}
            onPointerEnter={() => setHoveredId(colour.id)}
            onPointerLeave={() => setHoveredId(null)}
            onDelete={handleDoubleClick(colour.id)}
          />
        );
      })}

      {/* Instructions hint - shown when not dragging */}
      {colours.length < 12 && !draggingId && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 2,
            left: 2,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            pointerEvents: 'none',
            bgcolor: 'rgba(0, 0, 0, 0.8)',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Click empty space to add color • Right-click handle to delete
          </Typography>
        </Box>
      )}
    </Box>
  );
}
