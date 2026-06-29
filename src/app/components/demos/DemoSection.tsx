'use client';

import { Box, Paper, Typography } from '@mui/material';
import { forwardRef } from 'react';

interface DemoSectionProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * DemoSection 组件
 * 包裹每个演示案例，提供统一的样式和滚动锚点
 */
const DemoSection = forwardRef<HTMLDivElement, DemoSectionProps>(
  ({ id, title, description, children }, ref) => {
    return (
      <Box
        ref={ref}
        id={id}
        sx={{
          mb: 4,
          scrollMarginTop: '80px', // 为顶部固定导航留出空间
        }}
      >
        <Paper
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          {/* 标题区域 */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>

          {/* 演示内容区域 */}
          <Box sx={{ p: 4 }}>{children}</Box>
        </Paper>
      </Box>
    );
  }
);

DemoSection.displayName = 'DemoSection';

export default DemoSection;
