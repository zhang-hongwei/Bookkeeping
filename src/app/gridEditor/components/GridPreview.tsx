/**
 * GridPreview Component
 * Grid 布局实时预览组件
 */

"use client";

import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import type { GridNode, GridContainerConfig } from "../types";

interface GridPreviewProps {
  /** 容器配置 */
  containerConfig: GridContainerConfig;
  /** Grid 节点树 */
  nodes: GridNode[];
  /** 当前选中的节点 ID */
  activeNodeId: string;
  /** 是否启用响应式断点配置 */
  enableResponsiveBreakpoints: boolean;
  /** 选中节点回调 */
  onSelectNode: (id: string) => void;
  /** 更新容器配置回调 */
  onUpdateContainer: (updates: Partial<GridContainerConfig>) => void;
}

/**
 * 递归渲染节点
 */
interface RenderNodeProps {
  node: GridNode;
  activeNodeId: string;
  enableResponsiveBreakpoints: boolean;
  onSelectNode: (id: string) => void;
}

const RenderNode: React.FC<RenderNodeProps> = ({
  node,
  activeNodeId,
  enableResponsiveBreakpoints,
  onSelectNode,
}) => {
  const isActive = activeNodeId === node.id;

  if (node.type === "item") {
    // 渲染项目
    return (
      <Grid
        key={node.id}
        size={enableResponsiveBreakpoints ? node.size : node.size.xs}
        order={node.order}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode(node.id);
        }}
        sx={{ cursor: "pointer" }}
      >
        <Box
          sx={{
            borderRadius: 1,
            p: 2,
            minHeight: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isActive ? 6 : 1,
            border: (theme) =>
              isActive
                ? `2px solid ${theme.palette.primary.main}`
                : "1px solid rgba(0,0,0,0.06)",
            bgcolor: node.bgcolor,
            transition: "all 0.2s ease",
          }}
        >
          <Typography variant="body2">{node.label}</Typography>
        </Box>
      </Grid>
    );
  }

  // 渲染容器
  return (
    <Grid
      key={node.id}
      size={enableResponsiveBreakpoints ? node.size : node.size.xs}
      order={node.order}
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode(node.id);
      }}
      sx={{ cursor: "pointer" }}
    >
      <Box
        sx={{
          borderRadius: 1,
          p: 1,
          minHeight: 64,
          border: (theme) =>
            isActive
              ? `2px solid ${theme.palette.primary.main}`
              : "1px solid rgba(0,0,0,0.12)",
          bgcolor: isActive ? "primary.lighter" : "grey.100",
          transition: "all 0.2s ease",
        }}
      >
        {/* 容器标题 */}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          {node.label}
        </Typography>

        {/* 嵌套的 Grid 容器 */}
        <Grid
          container
          spacing={node.containerConfig.spacing}
          direction={node.containerConfig.direction}
          wrap={node.containerConfig.wrap}
          sx={{
            alignItems: node.containerConfig.alignItems,
            justifyContent: node.containerConfig.justifyContent,
          }}
        >
          {node.children.map((child) => (
            <RenderNode
              key={child.id}
              node={child}
              activeNodeId={activeNodeId}
              enableResponsiveBreakpoints={enableResponsiveBreakpoints}
              onSelectNode={onSelectNode}
            />
          ))}
        </Grid>
      </Box>
    </Grid>
  );
};

/**
 * Grid 布局预览组件
 */
const GridPreview: React.FC<GridPreviewProps> = ({
  containerConfig,
  nodes,
  activeNodeId,
  enableResponsiveBreakpoints,
  onSelectNode,
  onUpdateContainer,
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Typography variant="subtitle1" gutterBottom>
        预览
      </Typography>

      {/* 预览区域 */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 1,
          bgcolor: "grey.50",
          borderRadius: 1,
        }}
      >
        <Grid
          container
          spacing={containerConfig.spacing}
          direction={containerConfig.direction}
          wrap={containerConfig.wrap}
          sx={{
            p: 2,
            alignItems: containerConfig.alignItems,
            justifyContent: containerConfig.justifyContent,
          }}
        >
          {nodes.map((node) => (
            <RenderNode
              key={node.id}
              node={node}
              activeNodeId={activeNodeId}
              enableResponsiveBreakpoints={enableResponsiveBreakpoints}
              onSelectNode={onSelectNode}
            />
          ))}
        </Grid>
      </Box>

      {/* 容器配置面板 */}
      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          gutterBottom
          display="block"
        >
          容器配置
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <TextField
            label="Columns"
            value={containerConfig.columns}
            size="small"
            type="number"
            onChange={(e) =>
              onUpdateContainer({ columns: Number(e.target.value) || 0 })
            }
            sx={{ width: 100 }}
          />
          <TextField
            label="Spacing"
            value={containerConfig.spacing}
            size="small"
            type="number"
            onChange={(e) =>
              onUpdateContainer({ spacing: Number(e.target.value) || 0 })
            }
            sx={{ width: 100 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Direction</InputLabel>
            <Select
              value={containerConfig.direction}
              label="Direction"
              onChange={(e) =>
                onUpdateContainer({
                  direction: e.target.value as GridContainerConfig["direction"],
                })
              }
            >
              <MenuItem value="row">row</MenuItem>
              <MenuItem value="row-reverse">row-reverse</MenuItem>
              <MenuItem value="column">column</MenuItem>
              <MenuItem value="column-reverse">column-reverse</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </Paper>
  );
};

export default React.memo(GridPreview);
