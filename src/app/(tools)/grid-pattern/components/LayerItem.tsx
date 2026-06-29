/**
 * LayerItem Component
 * Single layer item in the layer panel
 */

import React from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Switch,
  TextField,
} from "@mui/material";
import {
  VisibilityOutlined,
  VisibilityOffOutlined,
  DeleteOutlined,
  ContentCopy,
  DragIndicator,
} from "@mui/icons-material";
import type { GridLayer } from "../types";

interface LayerItemProps {
  layer: GridLayer;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onVisibilityChange: (visible: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
}

export function LayerItem({
  layer,
  index,
  isSelected,
  onSelect,
  onVisibilityChange,
  onDuplicate,
  onDelete,
  onNameChange,
}: LayerItemProps) {
  return (
    <Box
      onClick={onSelect}
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: 1,
        border: "1px solid",
        borderColor: isSelected ? "primary.main" : "divider",
        bgcolor: isSelected ? "primary.50" : "background.paper",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "primary.light",
          bgcolor: isSelected ? "primary.100" : "action.hover",
        },
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {/* Drag Handle */}
      <DragIndicator sx={{ color: "text.disabled", cursor: "grab" }} />

      {/* Layer Number */}
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

      {/* Layer Name */}
      <TextField
        value={layer.name}
        onChange={(e) => onNameChange(e.target.value)}
        size="small"
        variant="standard"
        sx={{ flex: 1, mx: 1 }}
        InputProps={{ disableUnderline: true }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Visibility Toggle */}
      <Switch
        checked={layer.visible}
        onChange={(e) => onVisibilityChange(e.target.checked)}
        size="small"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Actions */}
      <Stack direction="row" spacing={0.25}>
        <Tooltip title="复制图层">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="删除图层">
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
