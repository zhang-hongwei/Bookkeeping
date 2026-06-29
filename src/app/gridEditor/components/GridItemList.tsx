/**
 * GridItemList Component
 * Grid 项目列表组件（树形结构）
 */

'use client';

import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Stack,
  Box,
  IconButton,
  Tooltip,
  Button,
  Divider,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import GridOnIcon from '@mui/icons-material/GridOn';
import type { GridNode } from '../types';

interface GridItemListProps {
  /** Grid 节点树 */
  nodes: GridNode[];
  /** 当前选中的节点 ID */
  activeNodeId: string;
  /** 是否启用响应式断点配置 */
  enableResponsiveBreakpoints: boolean;
  /** 选中节点回调 */
  onSelectNode: (id: string) => void;
  /** 添加项目回调 */
  onAddItem: (parentId: string | null) => void;
  /** 添加容器回调 */
  onAddContainer: (parentId: string | null) => void;
  /** 删除节点回调 */
  onDeleteNode: (id: string) => void;
  /** 移动节点回调 */
  onMoveNode: (id: string, direction: 'up' | 'down', parentId: string | null) => void;
}

/**
 * 树节点组件
 */
interface TreeNodeProps {
  node: GridNode;
  level: number;
  parentId: string | null;
  activeNodeId: string;
  enableResponsiveBreakpoints: boolean;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelectNode: (id: string) => void;
  onAddItem: (parentId: string | null) => void;
  onAddContainer: (parentId: string | null) => void;
  onDeleteNode: (id: string) => void;
  onMoveNode: (id: string, direction: 'up' | 'down', parentId: string | null) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  parentId,
  activeNodeId,
  enableResponsiveBreakpoints,
  expanded,
  onToggleExpand,
  onSelectNode,
  onAddItem,
  onAddContainer,
  onDeleteNode,
  onMoveNode,
}) => {
  const isContainer = node.type === 'container';
  const isExpanded = expanded.has(node.id);
  const isActive = activeNodeId === node.id;

  return (
    <Box>
      {/* 节点本身 */}
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          ml: level * 2,
          bgcolor: isActive ? 'primary.lighter' : 'transparent',
          border: (theme) =>
            isActive
              ? `1px solid ${theme.palette.primary.main}`
              : '1px solid rgba(0,0,0,0.12)',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: isActive ? 'primary.lighter' : 'action.hover',
          },
        }}
        onClick={() => onSelectNode(node.id)}
      >
        {/* 左侧：展开图标 + 节点图标 + 标签 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
          {isContainer ? (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              sx={{ p: 0.5 }}
            >
              {isExpanded ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </IconButton>
          ) : (
            <Box sx={{ width: 28 }} />
          )}

          {isContainer ? (
            <FolderIcon fontSize="small" color="primary" />
          ) : (
            <InsertDriveFileIcon fontSize="small" color="action" />
          )}

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {node.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {enableResponsiveBreakpoints
                ? `xs:${node.size.xs} sm:${node.size.sm} md:${node.size.md} lg:${node.size.lg}`
                : `size: ${node.size.xs}`}
            </Typography>
          </Box>
        </Box>

        {/* 右侧：操作按钮 */}
        <Stack direction="row" spacing={0.5}>
          {isContainer && (
            <>
              <Tooltip title="添加项目">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddItem(node.id);
                  }}
                >
                  <InsertDriveFileIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="添加容器">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddContainer(node.id);
                  }}
                >
                  <FolderIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="上移">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMoveNode(node.id, 'up', parentId);
              }}
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="下移">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMoveNode(node.id, 'down', parentId);
              }}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="删除">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(node.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* 子节点（如果是容器） */}
      {isContainer && (
        <Collapse in={isExpanded}>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                parentId={node.id}
                activeNodeId={activeNodeId}
                enableResponsiveBreakpoints={enableResponsiveBreakpoints}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                onSelectNode={onSelectNode}
                onAddItem={onAddItem}
                onAddContainer={onAddContainer}
                onDeleteNode={onDeleteNode}
                onMoveNode={onMoveNode}
              />
            ))}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
};

/**
 * Grid 项目列表组件
 */
const GridItemList: React.FC<GridItemListProps> = ({
  nodes,
  activeNodeId,
  enableResponsiveBreakpoints,
  onSelectNode,
  onAddItem,
  onAddContainer,
  onDeleteNode,
  onMoveNode,
}) => {
  // 展开状态（默认全部展开）
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const allContainerIds = new Set<string>();
    const traverse = (nodeList: GridNode[]) => {
      nodeList.forEach((node) => {
        if (node.type === 'container') {
          allContainerIds.add(node.id);
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return allContainerIds;
  });

  const handleToggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="subtitle1" gutterBottom>
        节点树
      </Typography>

      {/* 节点树 */}
      <Stack spacing={1} sx={{ overflow: 'auto', flex: 1 }}>
        {nodes.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            level={0}
            parentId={null}
            activeNodeId={activeNodeId}
            enableResponsiveBreakpoints={enableResponsiveBreakpoints}
            expanded={expanded}
            onToggleExpand={handleToggleExpand}
            onSelectNode={onSelectNode}
            onAddItem={onAddItem}
            onAddContainer={onAddContainer}
            onDeleteNode={onDeleteNode}
            onMoveNode={onMoveNode}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* 添加按钮 */}
      <Stack direction="row" spacing={1}>
        <Button
          startIcon={<InsertDriveFileIcon />}
          variant="outlined"
          fullWidth
          onClick={() => onAddItem(null)}
        >
          添加项目
        </Button>
        <Button
          startIcon={<GridOnIcon />}
          variant="contained"
          fullWidth
          onClick={() => onAddContainer(null)}
        >
          添加容器
        </Button>
      </Stack>
    </Paper>
  );
};

export default React.memo(GridItemList);
