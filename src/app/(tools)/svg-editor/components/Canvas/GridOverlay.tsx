'use client';

interface GridOverlayProps {
  width: number;
  height: number;
}

/**
 * Renders a dot grid pattern on the canvas.
 */
export default function GridOverlay({ width, height }: GridOverlayProps) {
  return (
    <rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill="url(#svg-editor-grid)"
      opacity={0.5}
      pointerEvents="none"
    />
  );
}
