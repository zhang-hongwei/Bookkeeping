/**
 * Tree View Demo Page
 * MUI TreeView 组件演示页面
 */

'use client';

import { Box, Container, Typography } from '@mui/material';
import MainDemo from './mainDemo/MainDemo';

/**
 * Tree View 演示页面
 */
export default function TreeViewDemoPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          MUI Tree View 演示
        </Typography>
        <Typography variant="body1" color="text.secondary">
          展示 MUI X Tree View 组件的高级用法，包括 Figma 和 GitHub 风格的文件树
        </Typography>
      </Box>

      <MainDemo />
    </Container>
  );
}
