/**
 * Grid Pattern Generator - Preset Library Component
 * 预设库组件 - 浏览和应用预设
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import type { PatternPreset } from "../types";
import {
  PATTERN_PRESETS,
  getPresetsByCategory,
  getPresetCategories,
  PRESET_CATEGORY_LABELS,
  type PresetCategory,
} from "../presets";

interface PresetLibraryProps {
  onApplyPreset: (config: PatternPreset["config"]) => void;
  currentConfig?: PatternPreset["config"];
}

export function PresetLibrary({
  onApplyPreset,
  currentConfig,
}: PresetLibraryProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<PresetCategory | "all">("all");
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);

  const categories = getPresetCategories();
  const filteredPresets = useMemo(() => {
    if (selectedCategory === "all") {
      return PATTERN_PRESETS;
    }
    return getPresetsByCategory(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (
    _: React.MouseEvent<HTMLElement>,
    newCategory: PresetCategory | "all" | null
  ) => {
    if (newCategory !== null) {
      setSelectedCategory(newCategory);
      setExpandedPreset(null);
    }
  };

  const handleToggleExpand = (presetId: string) => {
    setExpandedPreset((prev) => (prev === presetId ? null : presetId));
  };

  const handleApplyPreset = (preset: PatternPreset) => {
    onApplyPreset(preset.config);
    setExpandedPreset(null);
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              预设库
            </Typography>
            <Typography variant="caption" color="text.secondary">
              选择一个预设开始创作
            </Typography>
          </Box>

          {/* Category Filter */}
          <Box>
            <ToggleButtonGroup
              value={selectedCategory}
              exclusive
              size="small"
              fullWidth
              onChange={handleCategoryChange}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
              }}
            >
              <ToggleButton value="all" sx={{ flex: 1, minWidth: 60 }}>
                全部
              </ToggleButton>
              {categories.map((cat) => (
                <ToggleButton key={cat} value={cat} sx={{ flex: 1, minWidth: 60 }}>
                  {PRESET_CATEGORY_LABELS[cat]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Preset List */}
          <Stack spacing={1} sx={{ maxHeight: 400, overflowY: "auto" }}>
            {filteredPresets.length === 0 ? (
              <Alert severity="info">该分类暂无预设</Alert>
            ) : (
              filteredPresets.map((preset) => (
                <Card
                  key={preset.id}
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: 2,
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Box
                    onClick={() => handleToggleExpand(preset.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {preset.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.25 }}
                      >
                        {preset.description}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleExpand(preset.id);
                      }}
                    >
                      {expandedPreset === preset.id ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </Box>

                  <Collapse in={expandedPreset === preset.id}>
                    <Box sx={{ p: 1.5, pt: 0 }}>
                      {/* Category Badge */}
                      <Box sx={{ mb: 1.5 }}>
                        <Chip
                          label={PRESET_CATEGORY_LABELS[preset.category as PresetCategory]}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      {/* Layer Info */}
                      <Box
                        sx={{
                          mb: 1.5,
                          p: 1,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {preset.config.layers.length} 图层 ·
                          {preset.config.layers.filter((l) => l.visible).length} 可见 ·{" "}
                          {preset.config.layers.filter((l) => l.animation !== "none")
                            .length > 0
                            ? "包含动画"
                            : "静态"}
                        </Typography>
                      </Box>

                      {/* Apply Button */}
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => handleApplyPreset(preset)}
                      >
                        应用预设
                      </Button>
                    </Box>
                  </Collapse>
                </Card>
              ))
            )}
          </Stack>

          {/* Preset Count */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            显示 {filteredPresets.length} / {PATTERN_PRESETS.length} 个预设
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
