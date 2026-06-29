/**
 * LayerPanel Component
 * Manages layers list and add layer functionality
 */

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  LayersOutlined,
} from "@mui/icons-material";
import { LayerItem } from "./LayerItem";
import type { GridLayer, GridPatternConfig } from "../types";

interface LayerPanelProps {
  config: GridPatternConfig;
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onLayerNameChange: (id: string, name: string) => void;
}

export function LayerPanel({
  config,
  selectedLayerId,
  onSelectLayer,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onToggleVisibility,
  onLayerNameChange,
}: LayerPanelProps) {
  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LayersOutlined fontSize="small" />
          <Typography variant="subtitle2" fontWeight={600}>
            图层
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            ({config.layers.length})
          </Typography>
        </Box>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddLayer}
        >
          添加
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Layer List */}
      <Box sx={{ flex: 1, overflow: "auto", maxHeight: "calc(100vh - 300px)" }}>
        {config.layers.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">暂无图层</Typography>
            <Typography variant="caption">点击"添加"按钮创建新图层</Typography>
          </Box>
        ) : (
          <Stack>
            {/* Render layers in reverse order (top layer first) */}
            {[...config.layers].reverse().map((layer, reverseIndex) => {
              const actualIndex = config.layers.length - 1 - reverseIndex;
              return (
                <LayerItem
                  key={layer.id}
                  layer={layer}
                  index={actualIndex}
                  isSelected={selectedLayerId === layer.id}
                  onSelect={() => onSelectLayer(layer.id)}
                  onVisibilityChange={(visible) => onToggleVisibility(layer.id, visible)}
                  onDuplicate={() => onDuplicateLayer(layer.id)}
                  onDelete={() => onDeleteLayer(layer.id)}
                  onNameChange={(name) => onLayerNameChange(layer.id, name)}
                />
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Tips */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          💡 提示：图层从上到下叠加，最上面的图层会覆盖下面的图层
        </Typography>
      </Box>
    </Paper>
  );
}
