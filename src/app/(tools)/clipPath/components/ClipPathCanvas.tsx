/**
 * Interactive SVG Canvas for Clip Path Editor
 * Supports draggable points, click-to-add, double-click-to-remove
 */

"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { Box, Paper, Tooltip } from "@mui/material";
import { useClipPathStore, useClipPathActions } from "@/store/clip-path";
import type { Point } from "@/store/clip-path/types";

type DragType =
  | { kind: "polygon"; index: number }
  | { kind: "circle-center" }
  | { kind: "circle-radius" }
  | { kind: "ellipse-center" }
  | { kind: "ellipse-rx" }
  | { kind: "ellipse-ry" }
  | { kind: "inset-top" }
  | { kind: "inset-right" }
  | { kind: "inset-bottom" }
  | { kind: "inset-left" };

const HANDLE_RADIUS = 1.8;
const EDGE_CLICK_WIDTH = 3;
const MIN_POLYGON_POINTS = 3;

export function ClipPathCanvas() {
  const mode = useClipPathStore((s) => s.mode);
  const polygonPoints = useClipPathStore((s) => s.polygonPoints);
  const circle = useClipPathStore((s) => s.circle);
  const ellipse = useClipPathStore((s) => s.ellipse);
  const inset = useClipPathStore((s) => s.inset);
  const showGrid = useClipPathStore((s) => s.showGrid);
  const snapToGrid = useClipPathStore((s) => s.snapToGrid);
  const gridSize = useClipPathStore((s) => s.gridSize);
  const showOutside = useClipPathStore((s) => s.showOutside);
  const imageUrl = useClipPathStore((s) => s.imageUrl);
  const backgroundColor = useClipPathStore((s) => s.backgroundColor);
  const canvasSize = useClipPathStore((s) => s.canvasSize);
  const scale = useClipPathStore((s) => s.scale);
  const selectedPointIndex = useClipPathStore((s) => s.selectedPointIndex);

  const {
    movePolygonPoint,
    addPolygonPoint,
    removePolygonPoint,
    updateCircle,
    updateEllipse,
    updateInset,
    setSelectedPointIndex,
  } = useClipPathActions();

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragType | null>(null);

  const snap = useCallback(
    (value: number) =>
      snapToGrid ? Math.round(value / gridSize) * gridSize : value,
    [snapToGrid, gridSize],
  );

  const getSVGCoords = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
        y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
      };
    },
    [],
  );

  const handlePointerDown = useCallback(
    (drag: DragType) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      dragRef.current = drag;
      if (drag.kind === "polygon") {
        setSelectedPointIndex(drag.index);
      }
    },
    [setSelectedPointIndex],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const { x, y } = getSVGCoords(e);
      const sx = snap(x);
      const sy = snap(y);

      switch (drag.kind) {
        case "polygon":
          movePolygonPoint(drag.index, sx, sy);
          break;
        case "circle-center":
          updateCircle({ centerX: sx, centerY: sy });
          break;
        case "circle-radius": {
          const dx = x - circle.centerX;
          const dy = y - circle.centerY;
          updateCircle({ radius: Math.max(1, Math.sqrt(dx * dx + dy * dy)) });
          break;
        }
        case "ellipse-center":
          updateEllipse({ centerX: sx, centerY: sy });
          break;
        case "ellipse-rx": {
          const rxVal = Math.abs(x - ellipse.centerX);
          updateEllipse({ radiusX: Math.max(1, rxVal) });
          break;
        }
        case "ellipse-ry": {
          const ryVal = Math.abs(y - ellipse.centerY);
          updateEllipse({ radiusY: Math.max(1, ryVal) });
          break;
        }
        case "inset-top":
          updateInset({ top: Math.max(0, Math.min(100 - inset.bottom - 1, sy)) });
          break;
        case "inset-bottom":
          updateInset({ bottom: Math.max(0, Math.min(100 - inset.top - 1, sy)) });
          break;
        case "inset-left":
          updateInset({ left: Math.max(0, Math.min(100 - inset.right - 1, sx)) });
          break;
        case "inset-right":
          updateInset({ right: Math.max(0, Math.min(100 - inset.left - 1, sx)) });
          break;
      }
    },
    [
      getSVGCoords, snap, movePolygonPoint, updateCircle, updateEllipse,
      updateInset, circle.centerX, circle.centerY, ellipse.centerX,
      ellipse.centerY, inset.top, inset.bottom, inset.left, inset.right,
    ],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Click on polygon edge to add a new point
  const handleEdgeClick = useCallback(
    (afterIndex: number) => (e: React.PointerEvent) => {
      if (dragRef.current) return;
      if (mode !== "polygon") return;
      // Only handle single clicks (not drag end)
      if (e.pressure === 0) return;
      const { x, y } = getSVGCoords(e);
      addPolygonPoint(afterIndex, { x: snap(x), y: snap(y) });
    },
    [mode, getSVGCoords, snap, addPolygonPoint],
  );

  // Double-click to remove polygon point
  const handleDoubleClick = useCallback(
    (index: number) => () => {
      if (mode !== "polygon" || polygonPoints.length <= MIN_POLYGON_POINTS) return;
      removePolygonPoint(index);
    },
    [mode, polygonPoints.length, removePolygonPoint],
  );

  // Grid lines
  const gridLines = useMemo(() => {
    if (!showGrid) return [];
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let i = gridSize; i < 100; i += gridSize) {
      lines.push({ x1: i, y1: 0, x2: i, y2: 100 });
      lines.push({ x1: 0, y1: i, x2: 100, y2: i });
    }
    return lines;
  }, [showGrid, gridSize]);

  // Polygon points string for SVG
  const polygonPointsStr = useMemo(
    () => polygonPoints.map((p) => `${p.x},${p.y}`).join(" "),
    [polygonPoints],
  );

  // Shape path for mask/clip (shared across modes)
  const renderShape = useCallback(
    (id: string, asClip: boolean) => {
      const attrs = asClip ? {} : {};
      switch (mode) {
        case "polygon":
          return (
            <polygon
              id={id}
              points={polygonPointsStr}
              {...attrs}
            />
          );
        case "circle":
          return (
            <circle
              id={id}
              cx={circle.centerX}
              cy={circle.centerY}
              r={Math.max(0.1, circle.radius)}
              {...attrs}
            />
          );
        case "ellipse":
          return (
            <ellipse
              id={id}
              cx={ellipse.centerX}
              cy={ellipse.centerY}
              rx={Math.max(0.1, ellipse.radiusX)}
              ry={Math.max(0.1, ellipse.radiusY)}
              {...attrs}
            />
          );
        case "inset":
          return (
            <rect
              id={id}
              x={inset.left}
              y={inset.top}
              width={Math.max(0.1, 100 - inset.left - inset.right)}
              height={Math.max(0.1, 100 - inset.top - inset.bottom)}
              rx={inset.borderRadius}
              ry={inset.borderRadius}
              {...attrs}
            />
          );
      }
    },
    [mode, polygonPointsStr, circle, ellipse, inset],
  );

  const displayWidth = canvasSize.width * scale;
  const displayHeight = canvasSize.height * scale;

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Canvas size info */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          px: 1,
        }}
      >
        <Box sx={{ typography: "caption", color: "text.secondary" }}>
          {displayWidth} x {displayHeight} px
        </Box>
        <Box sx={{ typography: "caption", color: "text.secondary" }}>
          {mode === "polygon"
            ? `${polygonPoints.length} points`
            : mode === "circle"
              ? `r: ${circle.radius.toFixed(1)}%`
              : mode === "ellipse"
                ? `${ellipse.radiusX.toFixed(1)}% x ${ellipse.radiusY.toFixed(1)}%`
                : `${inset.top}% ${inset.right}% ${inset.bottom}% ${inset.left}%`}
        </Box>
      </Box>

      {/* SVG Canvas */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "action.hover",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: displayWidth,
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          width={displayWidth}
          height={displayHeight}
          style={{ display: "block", userSelect: "none" }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            {/* Clip path for the shape preview */}
            <clipPath id="shapeClip" clipPathUnits="objectBoundingBox">
              {renderShape("shapeClipEl", true)}
            </clipPath>

            {/* Mask for outside area dimming */}
            <mask id="outsideMask">
              <rect width="100" height="100" fill="white" />
              {mode === "polygon" && (
                <polygon points={polygonPointsStr} fill="black" />
              )}
              {mode === "circle" && (
                <circle
                  cx={circle.centerX}
                  cy={circle.centerY}
                  r={Math.max(0.1, circle.radius)}
                  fill="black"
                />
              )}
              {mode === "ellipse" && (
                <ellipse
                  cx={ellipse.centerX}
                  cy={ellipse.centerY}
                  rx={Math.max(0.1, ellipse.radiusX)}
                  ry={Math.max(0.1, ellipse.radiusY)}
                  fill="black"
                />
              )}
              {mode === "inset" && (
                <rect
                  x={inset.left}
                  y={inset.top}
                  width={Math.max(0.1, 100 - inset.left - inset.right)}
                  height={Math.max(0.1, 100 - inset.top - inset.bottom)}
                  rx={inset.borderRadius}
                  ry={inset.borderRadius}
                  fill="black"
                />
              )}
            </mask>
          </defs>

          {/* Background image or solid color */}
          {imageUrl ? (
            <image
              href={imageUrl}
              width="100"
              height="100"
              preserveAspectRatio={
                mode === "inset"
                  ? "xMidYMid slice"
                  : "xMidYMid slice"
              }
              style={{
                clipPath:
                  mode === "polygon"
                    ? `polygon(${polygonPoints.map((p) => `${p.x}% ${p.y}%`).join(", ")})`
                    : mode === "circle"
                      ? `circle(${circle.radius}% at ${circle.centerX}% ${circle.centerY}%)`
                      : mode === "ellipse"
                        ? `ellipse(${ellipse.radiusX}% ${ellipse.radiusY}% at ${ellipse.centerX}% ${ellipse.centerY}%)`
                        : `inset(${inset.top}% ${inset.right}% ${inset.bottom}% ${inset.left}%${inset.borderRadius ? ` round ${inset.borderRadius}px` : ""})`,
              }}
            />
          ) : (
            <rect
              width="100"
              height="100"
              fill={backgroundColor}
              style={{
                clipPath:
                  mode === "polygon"
                    ? `polygon(${polygonPoints.map((p) => `${p.x}% ${p.y}%`).join(", ")})`
                    : mode === "circle"
                      ? `circle(${circle.radius}% at ${circle.centerX}% ${circle.centerY}%)`
                      : mode === "ellipse"
                        ? `ellipse(${ellipse.radiusX}% ${ellipse.radiusY}% at ${ellipse.centerX}% ${ellipse.centerY}%)`
                        : `inset(${inset.top}% ${inset.right}% ${inset.bottom}% ${inset.left}%${inset.borderRadius ? ` round ${inset.borderRadius}px` : ""})`,
              }}
            />
          )}

          {/* Outside area overlay */}
          {showOutside && (
            <rect
              width="100"
              height="100"
              fill="rgba(0,0,0,0.35)"
              mask="url(#outsideMask)"
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* Grid lines */}
          {gridLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth={0.2}
              style={{ pointerEvents: "none" }}
            />
          ))}

          {/* Shape outline */}
          {mode === "polygon" && (
            <polygon
              points={polygonPointsStr}
              fill="none"
              stroke="rgba(33,150,243,0.6)"
              strokeWidth={0.5}
              strokeDasharray="1.5,1"
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* Edge click areas (polygon mode) */}
          {mode === "polygon" &&
            polygonPoints.map((point, i) => {
              const next = polygonPoints[(i + 1) % polygonPoints.length];
              return (
                <line
                  key={`edge-${i}`}
                  x1={point.x}
                  y1={point.y}
                  x2={next.x}
                  y2={next.y}
                  stroke="transparent"
                  strokeWidth={EDGE_CLICK_WIDTH}
                  style={{ cursor: "crosshair" }}
                  onClick={(e) => {
                    if (dragRef.current) return;
                    const { x, y } = getSVGCoords(e as unknown as React.PointerEvent);
                    addPolygonPoint(i, { x: snap(x), y: snap(y) });
                  }}
                />
              );
            })}

          {/* Polygon control handles */}
          {mode === "polygon" &&
            polygonPoints.map((point, i) => (
              <g key={`handle-${i}`}>
                {/* Hit area (larger) */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={HANDLE_RADIUS + 1}
                  fill="transparent"
                  onPointerDown={handlePointerDown({ kind: "polygon", index: i })}
                  onDoubleClick={handleDoubleClick(i)}
                  style={{ cursor: "grab" }}
                />
                {/* Visual handle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={HANDLE_RADIUS}
                  fill={selectedPointIndex === i ? "#fff" : "#2196f3"}
                  stroke="#fff"
                  strokeWidth={0.6}
                  style={{ pointerEvents: "none" }}
                />
                {/* Index label */}
                <text
                  x={point.x}
                  y={point.y - HANDLE_RADIUS - 1.2}
                  textAnchor="middle"
                  fontSize={3}
                  fill="#666"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {i + 1}
                </text>
              </g>
            ))}

          {/* Circle mode handles */}
          {mode === "circle" && (
            <>
              {/* Center handle */}
              <g>
                <circle
                  cx={circle.centerX}
                  cy={circle.centerY}
                  r={HANDLE_RADIUS + 1}
                  fill="transparent"
                  onPointerDown={handlePointerDown({ kind: "circle-center" })}
                  style={{ cursor: "grab" }}
                />
                <circle
                  cx={circle.centerX}
                  cy={circle.centerY}
                  r={HANDLE_RADIUS}
                  fill="#2196f3"
                  stroke="#fff"
                  strokeWidth={0.6}
                  style={{ pointerEvents: "none" }}
                />
                {/* Crosshair */}
                <line
                  x1={circle.centerX - 3}
                  y1={circle.centerY}
                  x2={circle.centerX + 3}
                  y2={circle.centerY}
                  stroke="#2196f3"
                  strokeWidth={0.3}
                  style={{ pointerEvents: "none" }}
                />
                <line
                  x1={circle.centerX}
                  y1={circle.centerY - 3}
                  x2={circle.centerX}
                  y2={circle.centerY + 3}
                  stroke="#2196f3"
                  strokeWidth={0.3}
                  style={{ pointerEvents: "none" }}
                />
              </g>
              {/* Radius handle (on top edge of circle) */}
              <g>
                <circle
                  cx={circle.centerX}
                  cy={circle.centerY - circle.radius}
                  r={HANDLE_RADIUS + 1}
                  fill="transparent"
                  onPointerDown={handlePointerDown({ kind: "circle-radius" })}
                  style={{ cursor: "ns-resize" }}
                />
                <circle
                  cx={circle.centerX}
                  cy={circle.centerY - circle.radius}
                  r={HANDLE_RADIUS}
                  fill="#ff9800"
                  stroke="#fff"
                  strokeWidth={0.6}
                  style={{ pointerEvents: "none" }}
                />
              </g>
              {/* Radius line */}
              <line
                x1={circle.centerX}
                y1={circle.centerY}
                x2={circle.centerX}
                y2={circle.centerY - circle.radius}
                stroke="#ff9800"
                strokeWidth={0.3}
                strokeDasharray="1,1"
                style={{ pointerEvents: "none" }}
              />
            </>
          )}

          {/* Ellipse mode handles */}
          {mode === "ellipse" && (
            <>
              {/* Center handle */}
              <g>
                <circle
                  cx={ellipse.centerX}
                  cy={ellipse.centerY}
                  r={HANDLE_RADIUS + 1}
                  fill="transparent"
                  onPointerDown={handlePointerDown({ kind: "ellipse-center" })}
                  style={{ cursor: "grab" }}
                />
                <circle
                  cx={ellipse.centerX}
                  cy={ellipse.centerY}
                  r={HANDLE_RADIUS}
                  fill="#2196f3"
                  stroke="#fff"
                  strokeWidth={0.6}
                  style={{ pointerEvents: "none" }}
                />
              </g>
              {/* Radius X handle */}
              <g>
                <circle
                  cx={ellipse.centerX + ellipse.radiusX}
                  cy={ellipse.centerY}
                  r={HANDLE_RADIUS + 1}
                  fill="transparent"
                  onPointerDown={handlePointerDown({ kind: "ellipse-rx" })}
                  style={{ cursor: "ew-resize" }}
                />
                <circle
                  cx={ellipse.centerX + ellipse.radiusX}
                  cy={ellipse.centerY}
                  r={HANDLE_RADIUS}
                  fill="#4caf50"
                  stroke="#fff"
                  strokeWidth={0.6}
                  style={{ pointerEvents: "none" }}
                />
              </g>
              {/* Radius Y handle */}
              <g>
                <circle
                  cx={ellipse.centerX}
                  cy={ellipse.centerY - ellipse.radiusY}
                  r={HANDLE_RADIUS + 1}
                  fill="transparent"
                  onPointerDown={handlePointerDown({ kind: "ellipse-ry" })}
                  style={{ cursor: "ns-resize" }}
                />
                <circle
                  cx={ellipse.centerX}
                  cy={ellipse.centerY - ellipse.radiusY}
                  r={HANDLE_RADIUS}
                  fill="#ff9800"
                  stroke="#fff"
                  strokeWidth={0.6}
                  style={{ pointerEvents: "none" }}
                />
              </g>
              {/* Radius lines */}
              <line
                x1={ellipse.centerX}
                y1={ellipse.centerY}
                x2={ellipse.centerX + ellipse.radiusX}
                y2={ellipse.centerY}
                stroke="#4caf50"
                strokeWidth={0.3}
                strokeDasharray="1,1"
                style={{ pointerEvents: "none" }}
              />
              <line
                x1={ellipse.centerX}
                y1={ellipse.centerY}
                x2={ellipse.centerX}
                y2={ellipse.centerY - ellipse.radiusY}
                stroke="#ff9800"
                strokeWidth={0.3}
                strokeDasharray="1,1"
                style={{ pointerEvents: "none" }}
              />
            </>
          )}

          {/* Inset mode handles */}
          {mode === "inset" && (
            <>
              {/* Top edge handle */}
              <g>
                <rect
                  x={inset.left}
                  y={inset.top - 1}
                  width={Math.max(1, 100 - inset.left - inset.right)}
                  height={2}
                  fill="transparent"
                  onPointerDown={handlePointerDown({ kind: "inset-top" })}
                  style={{ cursor: "ns-resize" }}
                />
                <line
                  x1={inset.left}
                  y1={inset.top}
                  x2={100 - inset.right}
                  y2={inset.top}
                  stroke="#2196f3"
                  strokeWidth={0.8}
                  style={{ pointerEvents: "none" }}
                />
              </g>
              {/* Bottom edge handle */}
              <g>
                <rect
                  x={inset.left}
                  y={100 - inset.bottom - 1}
                  width={Math.max(1, 100 - inset.left - inset.right)}
                  height={2}
                  fill="transparent"
                  onPointerDown={handlePointerDown({ kind: "inset-bottom" })}
                  style={{ cursor: "ns-resize" }}
                />
                <line
                  x1={inset.left}
                  y1={100 - inset.bottom}
                  x2={100 - inset.right}
                  y2={100 - inset.bottom}
                  stroke="#2196f3"
                  strokeWidth={0.8}
                  style={{ pointerEvents: "none" }}
                />
              </g>
              {/* Left edge handle */}
              <g>
                <rect
                  x={inset.left - 1}
                  y={inset.top}
                  width={2}
                  height={Math.max(1, 100 - inset.top - inset.bottom)}
                  fill="transparent"
                  onPointerDown={handlePointerDown({ kind: "inset-left" })}
                  style={{ cursor: "ew-resize" }}
                />
                <line
                  x1={inset.left}
                  y1={inset.top}
                  x2={inset.left}
                  y2={100 - inset.bottom}
                  stroke="#2196f3"
                  strokeWidth={0.8}
                  style={{ pointerEvents: "none" }}
                />
              </g>
              {/* Right edge handle */}
              <g>
                <rect
                  x={100 - inset.right - 1}
                  y={inset.top}
                  width={2}
                  height={Math.max(1, 100 - inset.top - inset.bottom)}
                  fill="transparent"
                  onPointerDown={handlePointerDown({ kind: "inset-right" })}
                  style={{ cursor: "ew-resize" }}
                />
                <line
                  x1={100 - inset.right}
                  y1={inset.top}
                  x2={100 - inset.right}
                  y2={100 - inset.bottom}
                  stroke="#2196f3"
                  strokeWidth={0.8}
                  style={{ pointerEvents: "none" }}
                />
              </g>
            </>
          )}
        </svg>
      </Box>

      {/* Quick tips */}
      <Box sx={{ typography: "caption", color: "text.secondary", textAlign: "center", px: 2 }}>
        {mode === "polygon"
          ? "Drag points to reshape. Click on edges to add points. Double-click points to remove."
          : "Drag handles to adjust the shape."}
      </Box>
    </Paper>
  );
}
