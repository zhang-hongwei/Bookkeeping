/**
 * ShapeEditor Component
 * Edit individual shape parameters
 */

import React, { useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
  Slider,
  TextField,
  Grid,
  Button,
  IconButton,
  InputLabel,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ContentCopy,
} from "@mui/icons-material";
import type { Shape, CustomShapeType } from "../types";
import { SHAPE_TYPE_LABELS } from "../types";

interface ShapeEditorProps {
  shape: Shape;
  isPageLight: boolean;
  onUpdateShape: (updates: Partial<Shape>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function ShapeEditor({ shape, isPageLight, onUpdateShape, onDuplicate, onDelete }: ShapeEditorProps) {
  const labelColor = isPageLight ? "grey.600" : "grey.400";

  const updateParam = useCallback(
    <K extends keyof Shape["params"]>(key: K, value: Shape["params"][K]) => {
      onUpdateShape({
        params: {
          ...shape.params,
          [key]: value,
        },
      });
    },
    [onUpdateShape, shape.params]
  );

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "primary.main" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          {SHAPE_TYPE_LABELS[shape.type]}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Button size="small" startIcon={<ContentCopy fontSize="small" />} onClick={onDuplicate}>
            复制
          </Button>
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Stack spacing={2}>
        {/* Position */}
        <Grid container spacing={2}>
          <Grid size={6}>
            <InputLabel sx={{ fontSize: 11, color: labelColor }}>X 位置: {shape.params.x}</InputLabel>
            <Slider
              value={shape.params.x ?? 10}
              onChange={(_, v) => updateParam("x", v as number)}
              min={0}
              max={100}
              size="small"
            />
          </Grid>
          <Grid size={6}>
            <InputLabel sx={{ fontSize: 11, color: labelColor }}>Y 位置: {shape.params.y}</InputLabel>
            <Slider
              value={shape.params.y ?? 10}
              onChange={(_, v) => updateParam("y", v as number)}
              min={0}
              max={100}
              size="small"
            />
          </Grid>
        </Grid>

        {/* Rotation */}
        {shape.type !== "circle" && shape.type !== "ellipse" && (
          <Box>
            <InputLabel sx={{ fontSize: 11, color: labelColor }}>
              旋转: {shape.params.rotation ?? 0}°
            </InputLabel>
            <Slider
              value={shape.params.rotation ?? 0}
              onChange={(_, v) => updateParam("rotation", v as number)}
              min={0}
              max={360}
              size="small"
            />
          </Box>
        )}

        {/* Rect-specific */}
        {shape.type === "rect" && (
          <>
            <Grid container spacing={2}>
              <Grid size={6}>
                <InputLabel sx={{ fontSize: 11, color: labelColor }}>宽度: {shape.params.width}</InputLabel>
                <Slider
                  value={shape.params.width ?? 40}
                  onChange={(_, v) => updateParam("width", v as number)}
                  min={1}
                  max={100}
                  size="small"
                />
              </Grid>
              <Grid size={6}>
                <InputLabel sx={{ fontSize: 11, color: labelColor }}>高度: {shape.params.height}</InputLabel>
                <Slider
                  value={shape.params.height ?? 40}
                  onChange={(_, v) => updateParam("height", v as number)}
                  min={1}
                  max={100}
                  size="small"
                />
              </Grid>
            </Grid>
            <Box>
              <InputLabel sx={{ fontSize: 11, color: labelColor }}>
                圆角: {shape.params.radius ?? 0}
              </InputLabel>
              <Slider
                value={shape.params.radius ?? 0}
                onChange={(_, v) => updateParam("radius", v as number)}
                min={0}
                max={50}
                size="small"
              />
            </Box>
          </>
        )}

        {/* Circle/Ellipse */}
        {(shape.type === "circle" || shape.type === "ellipse") && (
          <>
            {shape.type === "ellipse" && (
              <Grid container spacing={2}>
                <Grid size={6}>
                  <InputLabel sx={{ fontSize: 11, color: labelColor }}>X 半径: {shape.params.radiusX}</InputLabel>
                  <Slider
                    value={shape.params.radiusX ?? 30}
                    onChange={(_, v) => updateParam("radiusX", v as number)}
                    min={1}
                    max={50}
                    size="small"
                  />
                </Grid>
                <Grid size={6}>
                  <InputLabel sx={{ fontSize: 11, color: labelColor }}>Y 半径: {shape.params.radiusY}</InputLabel>
                  <Slider
                    value={shape.params.radiusY ?? 15}
                    onChange={(_, v) => updateParam("radiusY", v as number)}
                    min={1}
                    max={50}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}
            {shape.type === "circle" && (
              <Box>
                <InputLabel sx={{ fontSize: 11, color: labelColor }}>半径: {shape.params.radius}</InputLabel>
                <Slider
                  value={shape.params.radius ?? 20}
                  onChange={(_, v) => updateParam("radius", v as number)}
                  min={1}
                  max={50}
                  size="small"
                />
              </Box>
            )}
          </>
        )}

        {/* Star */}
        {shape.type === "star" && (
          <>
            <Grid container spacing={2}>
              <Grid size={6}>
                <InputLabel sx={{ fontSize: 11, color: labelColor }}>
                  外半径: {shape.params.outerRadius}
                </InputLabel>
                <Slider
                  value={shape.params.outerRadius ?? 25}
                  onChange={(_, v) => updateParam("outerRadius", v as number)}
                  min={5}
                  max={45}
                  size="small"
                />
              </Grid>
              <Grid size={6}>
                <InputLabel sx={{ fontSize: 11, color: labelColor }}>
                  内半径: {shape.params.innerRadius}
                </InputLabel>
                <Slider
                  value={shape.params.innerRadius ?? 12}
                  onChange={(_, v) => updateParam("innerRadius", v as number)}
                  min={2}
                  max={40}
                  size="small"
                />
              </Grid>
            </Grid>
            <Box>
              <InputLabel sx={{ fontSize: 11, color: labelColor }}>角数: {shape.params.sides}</InputLabel>
              <Slider
                value={shape.params.sides ?? 5}
                onChange={(_, v) => updateParam("sides", v as number)}
                min={3}
                max={12}
                step={1}
                size="small"
              />
            </Box>
          </>
        )}

        {/* Custom Path */}
        {shape.type === "path" && (
          <Box>
            <InputLabel sx={{ fontSize: 11, color: labelColor, mb: 1, display: "block" }}>
              SVG Path 数据 (d 属性)
            </InputLabel>
            <TextField
              multiline
              rows={3}
              fullWidth
              value={shape.params.d || ""}
              onChange={(e) => updateParam("d", e.target.value)}
              placeholder="M 10 10 L 50 10 L 50 50 Z"
              size="small"
              sx={{
                fontFamily: "monospace",
                fontSize: 12,
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                },
              }}
            />
            <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
              示例: M 10 10 L 50 10 L 30 50 Z (三角形)
            </Typography>
          </Box>
        )}

        <Divider />

        {/* Style */}
        <Grid container spacing={2}>
          <Grid size={4}>
            <TextField
              label="描边"
              type="color"
              value={shape.stroke}
              onChange={(e) => onUpdateShape({ stroke: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="填充"
              type="color"
              value={shape.fill === "transparent" ? "#000000" : shape.fill}
              onChange={(e) => onUpdateShape({ fill: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid size={4}>
            <Button
              size="small"
              variant={shape.fill === "transparent" ? "outlined" : "contained"}
              onClick={() => onUpdateShape({ fill: shape.fill === "transparent" ? "#cccccc" : "transparent" })}
              fullWidth
            >
              {shape.fill === "transparent" ? "透明" : "实心"}
            </Button>
          </Grid>
        </Grid>

        <Box>
          <InputLabel sx={{ fontSize: 11, color: labelColor }}>
            描边粗细: {shape.strokeWidth}px
          </InputLabel>
          <Slider
            value={shape.strokeWidth}
            onChange={(_, v) => onUpdateShape({ strokeWidth: v as number })}
            min={0.5}
            max={10}
            step={0.5}
            size="small"
          />
        </Box>

        <Box>
          <InputLabel sx={{ fontSize: 11, color: labelColor }}>
            透明度: {Math.round(shape.opacity * 100)}%
          </InputLabel>
          <Slider
            value={shape.opacity}
            onChange={(_, v) => onUpdateShape({ opacity: v as number })}
            min={0.1}
            max={1}
            step={0.05}
            size="small"
          />
        </Box>
      </Stack>
    </Paper>
  );
}
