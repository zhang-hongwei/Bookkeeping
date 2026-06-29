/**
 * LayerEditor Component
 * Edit properties of the selected layer (with custom shape support)
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
  Slider,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import {
  ViewModule as LayersIcon,
  Tune as SettingsIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { GridLayer, GridPatternType, BlendMode, AnimationType, Shape } from "../types";
import { PATTERN_TYPE_LABELS, BLEND_MODE_LABELS, ANIMATION_TYPE_LABELS, SHAPE_TYPE_LABELS } from "../types";
import { ShapeEditor } from "./ShapeEditor";
import { TilePreview } from "./TilePreview";
import { duplicateShape } from "../utils";

interface LayerEditorProps {
  layer: GridLayer | null;
  isPageLight: boolean;
  onUpdateLayer: (updates: Partial<GridLayer>) => void;
}

export function LayerEditor({ layer, isPageLight, onUpdateLayer }: LayerEditorProps) {
  const [tabValue, setTabValue] = useState(0);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  // 当图层变化时，自动选中新添加的形状
  useEffect(() => {
    if (layer && layer.shapes.length > 0) {
      // 如果当前没有选中的形状，或者选中的形状不在列表中，选中最后一个形状
      if (!selectedShapeId || !layer.shapes.find((s) => s.id === selectedShapeId)) {
        setSelectedShapeId(layer.shapes[layer.shapes.length - 1].id);
      }
    }
  }, [layer?.shapes, selectedShapeId]);

  if (!layer) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <Typography variant="body1">请选择一个图层进行编辑</Typography>
        </Box>
      </Paper>
    );
  }

  const labelColor = isPageLight ? "grey.600" : "grey.400";
  const selectedShape = layer.shapes.find((s) => s.id === selectedShapeId) || null;

  const handleAddShape = (shape: Shape) => {
    onUpdateLayer({ shapes: [...layer.shapes, shape] });
    setSelectedShapeId(shape.id);
  };

  const handleUpdateShape = (shapeId: string, updates: Partial<Shape>) => {
    onUpdateLayer({
      shapes: layer.shapes.map((s) => (s.id === shapeId ? { ...s, ...updates } : s)),
    });
  };

  const handleDuplicateShape = (shapeId: string) => {
    const shape = layer.shapes.find((s) => s.id === shapeId);
    if (!shape) return;
    const newShape = duplicateShape(shape);
    onUpdateLayer({ shapes: [...layer.shapes, newShape] });
    setSelectedShapeId(newShape.id);
  };

  const handleDeleteShape = (shapeId: string) => {
    onUpdateLayer({
      shapes: layer.shapes.filter((s) => s.id !== shapeId),
    });
    if (selectedShapeId === shapeId) {
      setSelectedShapeId(null);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 0, display: "flex", flexDirection: "column" }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
          <Tab label="形状" icon={<LayersIcon fontSize="small" />} iconPosition="start" />
          <Tab label="设置" icon={<SettingsIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      <Box sx={{ p: 2, maxHeight: 500, overflow: "auto" }}>
        {/* Shapes Tab */}
        {tabValue === 0 && (
          <Stack spacing={2}>
            {/* Tile Preview */}
            <TilePreview layer={layer} />

            {/* Shape List */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                形状列表 ({layer.shapes.length})
              </Typography>

              {layer.shapes.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography variant="body2">暂无形状</Typography>
                  <Typography variant="caption">从下方形状库添加</Typography>
                </Paper>
              ) : (
                <Stack spacing={1}>
                  {layer.shapes.map((shape, index) => (
                    <Paper
                      key={shape.id}
                      onClick={() => setSelectedShapeId(shape.id)}
                      sx={{
                        p: 1.5,
                        cursor: "pointer",
                        border: "1px solid",
                        borderColor: selectedShapeId === shape.id ? "primary.main" : "divider",
                        bgcolor: selectedShapeId === shape.id ? "primary.50" : "background.paper",
                        "&:hover": {
                          borderColor: "primary.light",
                          bgcolor: selectedShapeId === shape.id ? "primary.100" : "action.hover",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {SHAPE_TYPE_LABELS[shape.type]}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {shape.stroke}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShape(shape.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Selected Shape Editor */}
            {selectedShape && (
              <ShapeEditor
                shape={selectedShape}
                isPageLight={isPageLight}
                onUpdateShape={(updates) => handleUpdateShape(selectedShape.id, updates)}
                onDuplicate={() => handleDuplicateShape(selectedShape.id)}
                onDelete={() => handleDeleteShape(selectedShape.id)}
              />
            )}
          </Stack>
        )}

        {/* Settings Tab */}
        {tabValue === 1 && (
          <Stack spacing={2.5}>
            {/* Layer Name */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                图层名称
              </Typography>
              <TextField
                value={layer.name}
                onChange={(e) => onUpdateLayer({ name: e.target.value })}
                size="small"
                fullWidth
              />
            </Box>

            <Divider />

            {/* Pattern Type */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                格子类型
              </Typography>
              <ToggleButtonGroup
                value={layer.type}
                exclusive
                onChange={(_, value) => value && onUpdateLayer({ type: value })}
                size="small"
                fullWidth
                sx={{ flexWrap: "wrap", gap: 0.5 }}
              >
                {(Object.entries(PATTERN_TYPE_LABELS) as [GridPatternType, string][]).map(([value, label]) => (
                  <ToggleButton key={value} value={value} sx={{ fontSize: 11, flex: "0 0 calc(33.33% - 4px)" }}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Divider />

            {/* Blend Mode */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                混合模式
              </Typography>
              <ToggleButtonGroup
                value={layer.blendMode}
                exclusive
                onChange={(_, value) => value && onUpdateLayer({ blendMode: value as BlendMode })}
                size="small"
                fullWidth
                sx={{ flexWrap: "wrap", gap: 0.5 }}
              >
                {(Object.entries(BLEND_MODE_LABELS) as [BlendMode, string][]).slice(0, 6).map(([value, label]) => (
                  <ToggleButton key={value} value={value} sx={{ fontSize: 11, flex: "0 0 calc(33.33% - 4px)" }}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Divider />

            {/* Size */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ color: labelColor }}>
                  格子大小
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {layer.size}px
                </Typography>
              </Box>
              <Slider
                value={layer.size}
                onChange={(_, v) => onUpdateLayer({ size: v as number })}
                min={20}
                max={200}
                size="small"
              />
            </Box>

            {/* Spacing */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ color: labelColor }}>
                  间距
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {layer.spacing}px
                </Typography>
              </Box>
              <Slider
                value={layer.spacing}
                onChange={(_, v) => onUpdateLayer({ spacing: v as number })}
                min={0}
                max={50}
                size="small"
              />
            </Box>

            {/* Opacity */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ color: labelColor }}>
                  整体透明度
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {Math.round(layer.opacity * 100)}%
                </Typography>
              </Box>
              <Slider
                value={layer.opacity}
                onChange={(_, v) => onUpdateLayer({ opacity: v as number })}
                min={0.1}
                max={1}
                step={0.05}
                size="small"
              />
            </Box>

            {/* Angle */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ color: labelColor }}>
                  旋转角度
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {layer.angle}°
                </Typography>
              </Box>
              <Slider
                value={layer.angle}
                onChange={(_, v) => onUpdateLayer({ angle: v as number })}
                min={0}
                max={360}
                size="small"
              />
            </Box>

            <Divider />

            {/* Animation */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                动画效果
              </Typography>
              <ToggleButtonGroup
                value={layer.animation}
                exclusive
                onChange={(_, value) => value && onUpdateLayer({ animation: value as AnimationType })}
                size="small"
                fullWidth
              >
                {(Object.entries(ANIMATION_TYPE_LABELS) as [AnimationType, string][]).map(([value, label]) => (
                  <ToggleButton key={value} value={value} sx={{ fontSize: 11 }}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
