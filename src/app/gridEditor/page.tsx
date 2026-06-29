/**
 * Grid Layout Editor Page
 * MUI Grid 可视化布局编辑器
 */

'use client';

import { useState } from 'react';
import { Box, Grid, Typography, Stack, Chip } from '@mui/material';
import GridPreview from './components/GridPreview';
import GridItemList from './components/GridItemList';
import GridItemControls from './components/GridItemControls';
import GridCodeExport from './components/GridCodeExport';
import { useGridLayout } from './hooks/useGridLayout';

/**
 * Grid 布局编辑器主页面
 */
export default function GridEditorPage() {
  const {
    containerConfig,
    nodes,
    activeNodeId,
    activeNode,
    enableResponsiveBreakpoints,
    updateContainer,
    updateNode,
    addItem,
    addContainer,
    deleteNode,
    moveNode,
    setActiveNodeId,
    setEnableResponsiveBreakpoints,
    reset,
  } = useGridLayout();

  const [showCode, setShowCode] = useState(false);

  // 计算节点总数
  const countNodes = (nodeList: typeof nodes): number => {
    let count = 0;
    nodeList.forEach((node) => {
      count += 1;
      if (node.type === 'container') {
        count += countNodes(node.children);
      }
    });
    return count;
  };

  return (
    <Box
      sx={{
        p: 2,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: 'background.default',
      }}
    >
      {/* 页面头部 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          MUI Grid 布局编辑器
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`${countNodes(nodes)} 个节点`} color="primary" />
          <GridCodeExport
            containerConfig={containerConfig}
            nodes={nodes}
            enableResponsiveBreakpoints={enableResponsiveBreakpoints}
            showCode={showCode}
            onToggleCode={() => setShowCode(!showCode)}
          />
        </Stack>
      </Box>

      {/* 主内容区域 */}
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* 左侧：预览区域 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <GridPreview
            containerConfig={containerConfig}
            nodes={nodes}
            activeNodeId={activeNodeId}
            enableResponsiveBreakpoints={enableResponsiveBreakpoints}
            onSelectNode={setActiveNodeId}
            onUpdateContainer={updateContainer}
          />
        </Grid>

        {/* 中间：节点树 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <GridItemList
            nodes={nodes}
            activeNodeId={activeNodeId}
            enableResponsiveBreakpoints={enableResponsiveBreakpoints}
            onSelectNode={setActiveNodeId}
            onAddItem={addItem}
            onAddContainer={addContainer}
            onDeleteNode={deleteNode}
            onMoveNode={moveNode}
          />
        </Grid>

        {/* 右侧：控制面板 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <GridItemControls
            activeNode={activeNode}
            containerConfig={containerConfig}
            enableResponsiveBreakpoints={enableResponsiveBreakpoints}
            onUpdateNode={updateNode}
            onUpdateContainer={updateContainer}
            onToggleResponsiveBreakpoints={setEnableResponsiveBreakpoints}
            onReset={reset}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
