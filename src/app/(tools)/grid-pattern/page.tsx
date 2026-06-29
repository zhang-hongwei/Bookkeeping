/**
 * Grid Pattern Generator Page - Custom Shape Version
 * 格子背景生成器 - 支持自定义形状的手动创作工具
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
  Button,
  Snackbar,
  Alert,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  PatternOutlined,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  LightMode,
  DarkMode,
  Palette as PaletteIcon,
  Layers as LayersIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { useThemeMode } from "@/hooks/useThemeMode";
import {
  generateCSS,
  generateStyleObject,
  createLayer,
  duplicateLayer,
} from "./utils";
import type { GridPatternConfig, GridLayer } from "./types";
import { DEFAULT_CONFIG } from "./types";
import { LayerPanel } from "./components/LayerPanel";
import { LayerEditor } from "./components/LayerEditor";
import { ShapeLibrary } from "./components/ShapeLibrary";
import { PresetLibrary } from "./components/PresetLibrary";
import { configToJson, jsonToConfig } from "./persistence";
import { useUrlState } from "./hooks";
import { generateStyledRandom, RANDOM_STYLE_LABELS, type RandomStyle } from "./styledRandom";

type ViewMode = "preset" | "editor";

export default function GridPatternPage() {
  const { isLight: isPageLight } = useThemeMode();
  const { configFromUrl, hasUrlConfig, copyShareUrl } = useUrlState();
  const [config, setConfig] = useState<GridPatternConfig>(() =>
    hasUrlConfig && configFromUrl ? configFromUrl : DEFAULT_CONFIG
  );
  const [isPreviewLight, setIsPreviewLight] = useState(true);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    () => (hasUrlConfig && configFromUrl ? configFromUrl : DEFAULT_CONFIG).layers[0]?.id || null
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });
  const [viewMode, setViewMode] = useState<ViewMode>(
    hasUrlConfig ? "editor" : "preset"
  );

  const labelColor = isPageLight ? "grey.600" : "grey.400";

  // Get selected layer
  const selectedLayer =
    config.layers.find((l) => l.id === selectedLayerId) || null;

  // Update a specific layer
  const updateLayer = useCallback(
    (id: string | null, updates: Partial<GridLayer>) => {
      if (!id) return;
      setConfig((prev) => ({
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === id ? { ...l, ...updates } : l
        ),
      }));
    },
    []
  );

  // Add new layer
  const handleAddLayer = useCallback(() => {
    const newLayer = createLayer(`图层 ${config.layers.length + 1}`);
    setConfig((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
    }));
    setSelectedLayerId(newLayer.id);
  }, [config.layers.length]);

  // Duplicate layer
  const handleDuplicateLayer = useCallback(
    (id: string) => {
      const layer = config.layers.find((l) => l.id === id);
      if (!layer) return;
      const newLayer = duplicateLayer(layer);
      setConfig((prev) => ({
        ...prev,
        layers: [...prev.layers, newLayer],
      }));
      setSelectedLayerId(newLayer.id);
    },
    [config.layers]
  );

  // Delete layer
  const handleDeleteLayer = useCallback(
    (id: string) => {
      setConfig((prev) => ({
        ...prev,
        layers: prev.layers.filter((l) => l.id !== id),
      }));
      if (selectedLayerId === id) {
        setSelectedLayerId(null);
      }
    },
    [selectedLayerId]
  );

  // Toggle layer visibility
  const handleToggleVisibility = useCallback(
    (id: string, visible: boolean) => {
      updateLayer(id, { visible });
    },
    [updateLayer]
  );

  // Update layer name
  const handleLayerNameChange = useCallback(
    (id: string, name: string) => {
      updateLayer(id, { name });
    },
    [updateLayer]
  );

  // Apply preset
  const handleApplyPreset = useCallback(
    (presetConfig: GridPatternConfig) => {
      setConfig(presetConfig);
      setSelectedLayerId(presetConfig.layers[0]?.id || null);
      setSnackbar({ open: true, message: "预设已应用！" });
      setViewMode("editor");
    },
    []
  );

  // Copy CSS
  const handleCopyCSS = useCallback(async () => {
    const css = generateCSS(config);
    await navigator.clipboard.writeText(css);
    setSnackbar({ open: true, message: "CSS 代码已复制到剪贴板！" });
  }, [config]);

  // Randomize
  const handleRandomize = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) => ({
        ...layer,
        size: Math.floor(Math.random() * 80) + 40,
        angle: Math.floor(Math.random() * 360),
        spacing: Math.floor(Math.random() * 20),
      })),
    }));
  }, []);

  // Export JSON
  const handleExportJson = useCallback(async () => {
    const json = configToJson(config);
    await navigator.clipboard.writeText(json);
    setSnackbar({ open: true, message: "JSON 配置已复制到剪贴板！" });
  }, [config]);

  // Import JSON
  const handleImportJson = useCallback(() => {
    const input = prompt("粘贴 JSON 配置：");
    if (input) {
      try {
        const importedConfig = jsonToConfig(input);
        setConfig(importedConfig);
        setSelectedLayerId(importedConfig.layers[0]?.id || null);
        setSnackbar({ open: true, message: "配置已导入！" });
      } catch {
        setSnackbar({ open: true, message: "导入失败：无效的 JSON" });
      }
    }
  }, []);

  // Copy Share URL
  const handleCopyShareUrl = useCallback(async () => {
    const success = await copyShareUrl(config);
    if (success) {
      setSnackbar({ open: true, message: "分享链接已复制到剪贴板！" });
    } else {
      setSnackbar({ open: true, message: "复制失败，请重试" });
    }
  }, [config, copyShareUrl]);

  const cssCode = generateCSS(config);
  // 根据预览主题覆盖背景色
  const previewStyle = {
    ...generateStyleObject(config),
    backgroundColor: isPreviewLight ? config.background : "#1a1a1a",
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PatternOutlined sx={{ fontSize: 36, color: "#a78bfa" }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>
                格子背景生成器
              </Typography>
              <Typography variant="body2" sx={{ color: labelColor }}>
                Grid Pattern Generator — 预设库 · 自定义形状 · 多层叠加
              </Typography>
            </Box>
          </Box>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={(e, value) => value && setViewMode(value)}
          >
            <ToggleButton value="preset">
              <PaletteIcon sx={{ mr: 0.5 }} />
              预设
            </ToggleButton>
            <ToggleButton value="editor">
              <LayersIcon sx={{ mr: 0.5 }} />
              编辑器
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Main Layout */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: viewMode === "preset" ? "320px 1fr" : "240px 1fr 320px",
            },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* Left: Preset Library or Layer Panel */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              width: "100%",
              overflow: "auto",
            }}
          >
            {viewMode === "preset" ? (
              <PresetLibrary
                onApplyPreset={handleApplyPreset}
                currentConfig={config}
              />
            ) : (
              <LayerPanel
                config={config}
                selectedLayerId={selectedLayerId}
                onSelectLayer={setSelectedLayerId}
                onAddLayer={handleAddLayer}
                onDuplicateLayer={handleDuplicateLayer}
                onDeleteLayer={handleDeleteLayer}
                onToggleVisibility={handleToggleVisibility}
                onLayerNameChange={handleLayerNameChange}
              />
            )}
          </Box>

          {/* Center: Preview Panel */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {/* Preview Area */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  实时预览
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    onClick={() => setIsPreviewLight(!isPreviewLight)}
                    startIcon={isPreviewLight ? <LightMode /> : <DarkMode />}
                    sx={{ minWidth: 100 }}
                  >
                    {isPreviewLight ? "亮色" : "暗色"}
                  </Button>
                  <Button
                    size="small"
                    onClick={handleRandomize}
                    startIcon={<RefreshIcon />}
                  >
                    随机
                  </Button>
                  <Button
                    size="small"
                    onClick={handleCopyShareUrl}
                    startIcon={<ShareIcon />}
                  >
                    分享
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleCopyCSS}
                    startIcon={<CopyIcon />}
                  >
                    复制 CSS
                  </Button>
                </Stack>
              </Box>
              <Box
                sx={{
                  height: 500,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    ...previewStyle,
                  }}
                />
                {/* Layer count badge */}
                {config.layers.length > 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      bgcolor: "rgba(0,0,0,0.7)",
                      color: "white",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {config.layers.filter((l) => l.visible).length} 图层
                  </Box>
                )}
              </Box>
            </Paper>

            {/* CSS Code Output */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  CSS 代码
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={handleImportJson}>
                    导入 JSON
                  </Button>
                  <Button size="small" onClick={handleExportJson}>
                    导出 JSON
                  </Button>
                  <Button size="small" onClick={handleCopyCSS} startIcon={<CopyIcon />}>
                    复制
                  </Button>
                </Stack>
              </Box>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  fontFamily: '"Fira Code", monospace',
                  fontSize: 11,
                  bgcolor: isPageLight ? "grey.100" : "grey.900",
                  color: isPageLight ? "grey.900" : "grey.100",
                  whiteSpace: "pre-wrap",
                  overflow: "auto",
                  maxHeight: 250,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {cssCode}
              </Paper>
            </Paper>

            {/* Background Color */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                背景颜色
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 40,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: config.background,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <input
                    type="color"
                    value={config.background}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, background: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      height: 40,
                      cursor: "pointer",
                      border: "1px solid #444",
                      borderRadius: 4,
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "monospace", minWidth: 80 }}
                >
                  {config.background}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Right: Layer Editor (only in editor mode) */}
          {viewMode === "editor" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                width: "100%",
              }}
            >
              <LayerEditor
                layer={selectedLayer}
                isPageLight={isPageLight}
                onUpdateLayer={(updates) =>
                  updateLayer(selectedLayerId, updates)
                }
              />

              {selectedLayer && selectedLayer.type === "custom" && (
                <ShapeLibrary
                  onAddShape={(shape) => {
                    setConfig((prev) => ({
                      ...prev,
                      layers: prev.layers.map((l) =>
                        l.id === selectedLayerId
                          ? { ...l, shapes: [...l.shapes, shape] }
                          : l
                      ),
                    }));
                  }}
                />
              )}

              {selectedLayer && selectedLayer.type !== "custom" && (
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    形状库
                  </Typography>
                  <Box
                    sx={{ textAlign: "center", py: 2, color: "text.secondary" }}
                  >
                    <Typography variant="body2">
                      当前图层类型不是"自定义形状"
                    </Typography>
                    <Typography variant="caption">
                      请在上方设置中将格子类型改为"自定义形状"
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
