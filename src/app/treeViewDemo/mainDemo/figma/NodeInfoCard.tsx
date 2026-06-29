import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { ExtendedTreeItemProps } from './items';

// 使用与 FigmaCard 相同的样式逻辑
const PreviewContainer = styled(Box)({
  overflow: 'visible',
  maxWidth: 600,
  '& .selectedItem': {
    outline: '2px solid hsl(269, 100%, 57%)',
    outlineOffset: '-2px',
  },
});

interface NodeInfoCardProps {
  rootNode: TreeViewBaseItem<ExtendedTreeItemProps>;
  selectedItemId: string | null;
}

// 渲染子节点
const renderChildren = (
  children: TreeViewBaseItem<ExtendedTreeItemProps>[] | undefined,
  selectedItemId: string | null,
): React.ReactNode => {
  if (!children || children.length === 0) {
    return null;
  }

  return children.map((child) => renderNode(child, selectedItemId));
};

// 根据节点类型动态渲染组件，类似 FigmaCard 的结构
const renderNode = (
  node: TreeViewBaseItem<ExtendedTreeItemProps>,
  selectedItemId: string | null,
): React.ReactNode => {
  // 检查当前节点是否被选中
  const isSelected = node.id === selectedItemId;
  const selectedClass = isSelected ? 'selectedItem' : '';

  const commonProps = {
    key: node.id,
    className: selectedClass,
    sx: {
      border: '1px solid',
      borderColor: 'divider',
      p: 2,
      borderRadius: 1,
      backgroundColor: 'background.paper',
      position: 'relative' as const,
    },
  };

  switch (node.itemType) {
    case 'frame': // Box
      return (
        <Box {...commonProps}>
          <Typography variant="caption" color="primary" sx={{ mb: 1, display: 'block' }}>
            📦 Box: {node.label}
          </Typography>
          {node.children && node.children.length > 0 && (
            <Box sx={{ mt: 1 }}>{renderChildren(node.children, selectedItemId)}</Box>
          )}
        </Box>
      );

    case 'vertical_center': // Stack (vertical)
      return (
        <Stack {...commonProps} spacing={1}>
          <Typography variant="caption" color="success.main">
            ⬇️ Stack (vertical): {node.label}
          </Typography>
          {renderChildren(node.children, selectedItemId)}
        </Stack>
      );

    case 'horizontal_center': // Stack (horizontal)
      return (
        <Stack {...commonProps} direction="row" spacing={1} flexWrap="wrap">
          <Typography variant="caption" color="success.main" sx={{ width: '100%' }}>
            ➡️ Stack (horizontal): {node.label}
          </Typography>
          {renderChildren(node.children, selectedItemId)}
        </Stack>
      );

    case 'bottom':
    case 'top':
    case 'left':
    case 'right':
      return (
        <Stack {...commonProps} spacing={1}>
          <Typography variant="caption" color="success.main">
            📐 Stack ({node.itemType}): {node.label}
          </Typography>
          {renderChildren(node.children, selectedItemId)}
        </Stack>
      );

    case 'text': // Typography
      return (
        <Paper {...commonProps} variant="outlined">
          <Typography variant="caption" color="info.main" sx={{ display: 'block', mb: 0.5 }}>
            📝 Typography
          </Typography>
          <Typography variant="body2">{node.label}</Typography>
        </Paper>
      );

    case 'image': // Image placeholder
      return (
        <Paper {...commonProps} variant="outlined">
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 1 }}>
            🖼️ Image: {node.label}
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 120,
              backgroundColor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Image Placeholder
            </Typography>
          </Box>
        </Paper>
      );

    case 'component': // Component
      return (
        <Paper
          {...commonProps}
          variant="outlined"
          sx={{ ...commonProps.sx, bgcolor: 'primary.50' }}
        >
          <Typography variant="caption" color="primary">
            🧩 Component: {node.label}
          </Typography>
        </Paper>
      );

    default:
      return (
        <Box {...commonProps}>
          <Typography variant="caption" color="text.secondary">
            {node.itemType}: {node.label}
          </Typography>
          {renderChildren(node.children, selectedItemId)}
        </Box>
      );
  }
};

export default function NodeInfoCard({ rootNode, selectedItemId }: NodeInfoCardProps) {
  return (
    <PreviewContainer>
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="overline" color="text.secondary">
              组件树预览
            </Typography>
            {renderNode(rootNode, selectedItemId)}
          </Stack>
        </CardContent>
      </Card>
    </PreviewContainer>
  );
}
