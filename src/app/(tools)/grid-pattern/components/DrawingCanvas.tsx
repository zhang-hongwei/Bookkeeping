/**
 * DrawingCanvas Component
 * Hand-drawn SVG path editor
 */

"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Slider,
} from "@mui/material";
import {
  Clear as ClearIcon,
  Undo as UndoIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

interface DrawingCanvasProps {
  pathData: string;
  onPathChange: (pathData: string) => void;
  width?: number;
  height?: number;
}

export function DrawingCanvas({
  pathData,
  onPathChange,
  width = 240,
  height = 240,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [history, setHistory] = useState<{ x: number; y: number }[][]>([]);

  // Use ref to track current path without closure issues
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Redraw canvas
  const redrawCanvas = useCallback(
    (paths: { x: number; y: number }[][], currentDraw: { x: number; y: number }[] = []) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = "rgba(167, 139, 250, 0.2)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i <= height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Draw all completed paths
      paths.forEach((path) => {
        if (path.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = "#a78bfa";
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.moveTo(path[0].x, path[0].y);

        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }

        ctx.stroke();
      });

      // Draw current path being drawn
      if (currentDraw.length >= 2) {
        ctx.beginPath();
        ctx.strokeStyle = "#a78bfa";
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.moveTo(currentDraw[0].x, currentDraw[0].y);

        for (let i = 1; i < currentDraw.length; i++) {
          ctx.lineTo(currentDraw[i].x, currentDraw[i].y);
        }

        ctx.stroke();
      }
    },
    [width, height, strokeWidth]
  );

  // Handle drawing start
  const handleStart = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      let clientX: number;
      let clientY: number;

      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      setIsDrawing(true);
      currentPathRef.current = [{ x, y }];
      redrawCanvas(history, [{ x, y }]);
    },
    [history, redrawCanvas]
  );

  // Handle drawing move
  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      let clientX: number;
      let clientY: number;

      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = Math.max(0, Math.min(width, clientX - rect.left));
      const y = Math.max(0, Math.min(height, clientY - rect.top));

      currentPathRef.current.push({ x, y });
      redrawCanvas(history, currentPathRef.current);
    },
    [isDrawing, history, width, height, redrawCanvas]
  );

  // Handle drawing end
  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const currentPath = currentPathRef.current;
    console.log("Drawing ended, path length:", currentPath.length);

    if (currentPath.length >= 2) {
      setHistory((prev) => {
        const newHistory = [...prev, currentPath];
        console.log("History updated, total paths:", newHistory.length);
        redrawCanvas(newHistory, []);
        return newHistory;
      });
    } else {
      redrawCanvas(history, []);
    }

    currentPathRef.current = [];
  }, [isDrawing, history, redrawCanvas]);

  // Convert paths to SVG path string
  const pathsToSvgPath = useCallback((paths: { x: number; y: number }[][]): string => {
    if (paths.length === 0) return "";

    return paths
      .map((path) => {
        if (path.length === 0) return "";
        if (path.length === 1) return `M ${path[0].x.toFixed(1)} ${path[0].y.toFixed(1)}`;

        let pathStr = `M ${path[0].x.toFixed(1)} ${path[0].y.toFixed(1)}`;
        for (let i = 1; i < path.length; i++) {
          pathStr += ` L ${path[i].x.toFixed(1)} ${path[i].y.toFixed(1)}`;
        }
        return pathStr;
      })
      .filter(Boolean)
      .join(" ");
  }, []);

  // Clear canvas
  const handleClear = useCallback(() => {
    setHistory([]);
    currentPathRef.current = [];
    onPathChange("");
    redrawCanvas([], []);
  }, [onPathChange, redrawCanvas]);

  // Undo last stroke
  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, -1);
      redrawCanvas(newHistory, []);
      onPathChange(pathsToSvgPath(newHistory));
      return newHistory;
    });
  }, [redrawCanvas, onPathChange, pathsToSvgPath]);

  // Apply button
  const handleApply = useCallback(() => {
    console.log("Apply clicked, history length:", history.length);

    if (history.length === 0) {
      console.warn("No paths to apply!");
      return;
    }

    const svgPath = pathsToSvgPath(history);
    console.log("Generated SVG path:", svgPath);

    onPathChange(svgPath);
    console.log("onPathChange called with:", svgPath);
  }, [history, pathsToSvgPath, onPathChange]);

  // Initial draw
  useEffect(() => {
    redrawCanvas(history, []);
  }, [redrawCanvas, history]);

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" fontWeight={600}>
          手绘路径
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            style={{
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 8,
              cursor: "crosshair",
              touchAction: "none",
              background: "white",
            }}
          />
        </Box>

        {/* Stroke Width */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            线条粗细: {strokeWidth}px
          </Typography>
          <Slider
            value={strokeWidth}
            onChange={(_, v) => setStrokeWidth(v as number)}
            min={1}
            max={10}
            step={1}
            size="small"
          />
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            size="small"
            startIcon={<UndoIcon />}
            onClick={handleUndo}
            disabled={history.length === 0}
          >
            撤销
          </Button>
          <Button size="small" startIcon={<ClearIcon />} onClick={handleClear} color="error">
            清除
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={handleApply}
            disabled={history.length === 0}
          >
            应用
          </Button>
        </Stack>

        {/* Instructions */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            💡 在画布上绘制线条，点击"应用"保存路径
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
