/**
 * ShapeLibrary Component
 * Pre-made shape templates with editable parameters
 */

"use client";

import React, { useCallback, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Grid,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  CropSquare as RectIcon,
  Circle as CircleIcon,
  ChangeHistory as TriangleIcon,
  Star as StarIcon,
  Favorite as HeartIcon,
  Close as CrossIcon,
  EditOutlined,
  BrushOutlined,
} from "@mui/icons-material";
import type { CustomShapeType, Shape } from "../types";
import { SHAPE_TYPE_LABELS, SHAPE_PRESETS } from "../types";
import { createShape } from "../utils";
import { DrawingCanvas } from "./DrawingCanvas";

interface ShapeLibraryProps {
  onAddShape: (shape: Shape) => void;
}

const SHAPE_TEMPLATES: { type: CustomShapeType; icon: React.ReactNode; description: string }[] = [
  { type: "rect", icon: <RectIcon />, description: "矩形" },
  { type: "circle", icon: <CircleIcon />, description: "圆形" },
  { type: "ellipse", icon: <CircleIcon sx={{ transform: "scaleX(1.5)" }} />, description: "椭圆" },
  { type: "polygon", icon: <TriangleIcon />, description: "多边形" },
  { type: "star", icon: <StarIcon />, description: "星形" },
  { type: "heart", icon: <HeartIcon />, description: "心形" },
  { type: "cross", icon: <CrossIcon />, description: "十字" },
  { type: "path", icon: <EditOutlined />, description: "自定义路径" },
];

export function ShapeLibrary({ onAddShape }: ShapeLibraryProps) {
  const [mode, setMode] = useState<"templates" | "draw">("templates");
  const [drawnPath, setDrawnPath] = useState("");

  const handleAddShape = useCallback(
    (type: CustomShapeType) => {
      const shape = createShape(type);
      onAddShape(shape);
    },
    [onAddShape]
  );

  const handleDrawnPathApply = useCallback(() => {
    console.log("handleDrawnPathApply called, drawnPath:", drawnPath ? drawnPath.substring(0, 100) + "..." : "empty");
    if (drawnPath) {
      const shape = createShape("path");
      console.log("Created shape:", shape);
      shape.params.d = drawnPath; // 路径数据在 params.d 中
      console.log("Shape with path:", shape);
      onAddShape(shape);
      console.log("onAddShape called");
      setDrawnPath("");
      setMode("templates");
    }
  }, [drawnPath, onAddShape]);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      {/* Mode Tabs */}
      <Tabs
        value={mode}
        onChange={(_, value) => setMode(value)}
        variant="fullWidth"
        sx={{ mb: 2, minHeight: 40 }}
      >
        <Tab
          value="templates"
          label="形状库"
          icon={<RectIcon fontSize="small" />}
          sx={{ minHeight: 40, fontSize: 12 }}
        />
        <Tab
          value="draw"
          label="手绘"
          icon={<BrushOutlined fontSize="small" />}
          sx={{ minHeight: 40, fontSize: 12 }}
        />
      </Tabs>

      {mode === "templates" ? (
        <>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
            点击添加形状到画布
          </Typography>

          <Grid container spacing={1}>
            {SHAPE_TEMPLATES.map((template) => (
              <Grid size={3} key={template.type}>
                <Tooltip title={template.description} arrow>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => handleAddShape(template.type)}
                    sx={{
                      height: 60,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      fontSize: 10,
                    }}
                  >
                    <Box sx={{ fontSize: 24, color: "primary.main" }}>{template.icon}</Box>
                    <span>{template.description}</span>
                  </Button>
                </Tooltip>
              </Grid>
            ))}
          </Grid>

          {/* Path Editor Shortcut */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              💡 切换到"手绘"标签页可手动绘制路径
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <DrawingCanvas
            pathData={drawnPath}
            onPathChange={setDrawnPath}
            width={280}
            height={280}
          />
          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={handleDrawnPathApply}
              disabled={!drawnPath}
              startIcon={<AddIcon />}
            >
              添加到画布
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}
