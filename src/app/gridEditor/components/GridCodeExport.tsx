/**
 * GridCodeExport Component
 * Grid 代码导出组件
 */

'use client';

import React, { useMemo } from 'react';
import { Box, Button, Paper, Typography, Stack } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Toast } from '@/components/ui';
import type { GridNode, GridContainerConfig } from '../types';

interface GridCodeExportProps {
  /** 容器配置 */
  containerConfig: GridContainerConfig;
  /** Grid 节点树 */
  nodes: GridNode[];
  /** 是否启用响应式断点配置 */
  enableResponsiveBreakpoints: boolean;
  /** 是否显示代码 */
  showCode: boolean;
  /** 切换代码显示 */
  onToggleCode: () => void;
}

/**
 * 生成节点的 size 属性代码
 */
function generateSizeCode(node: GridNode, enableResponsiveBreakpoints: boolean): string {
  if (enableResponsiveBreakpoints) {
    return `size={{ xs: ${node.size.xs}, sm: ${node.size.sm}, md: ${node.size.md}, lg: ${node.size.lg} }}`;
  }
  return `size={${node.size.xs}}`;
}

/**
 * 递归生成节点代码
 */
function generateNodeCode(
  node: GridNode,
  enableResponsiveBreakpoints: boolean,
  indent: number
): string[] {
  const lines: string[] = [];
  const indentStr = '  '.repeat(indent);

  lines.push(`${indentStr}<Grid`);
  lines.push(`${indentStr}  ${generateSizeCode(node, enableResponsiveBreakpoints)}`);

  if (node.order !== 0) {
    lines.push(`${indentStr}  order={${node.order}}`);
  }

  lines.push(`${indentStr}>`);

  if (node.type === 'item') {
    // 生成项目内容
    lines.push(`${indentStr}  <Box`);
    lines.push(`${indentStr}    sx={{`);
    lines.push(`${indentStr}      p: 2,`);
    lines.push(`${indentStr}      bgcolor: '${node.bgcolor}',`);
    lines.push(`${indentStr}      borderRadius: 1,`);
    lines.push(`${indentStr}      minHeight: 64,`);
    lines.push(`${indentStr}      display: 'flex',`);
    lines.push(`${indentStr}      alignItems: 'center',`);
    lines.push(`${indentStr}      justifyContent: 'center',`);
    lines.push(`${indentStr}    }}`);
    lines.push(`${indentStr}  >`);
    lines.push(`${indentStr}    {/* ${node.label} */}`);
    lines.push(`${indentStr}    ${node.label}`);
    lines.push(`${indentStr}  </Box>`);
  } else {
    // 生成容器内容
    lines.push(`${indentStr}  <Box`);
    lines.push(`${indentStr}    sx={{`);
    lines.push(`${indentStr}      p: 1,`);
    lines.push(`${indentStr}      bgcolor: 'grey.100',`);
    lines.push(`${indentStr}      borderRadius: 1,`);
    lines.push(`${indentStr}      minHeight: 64,`);
    lines.push(`${indentStr}    }}`);
    lines.push(`${indentStr}  >`);
    lines.push(`${indentStr}    {/* ${node.label} */}`);

    // 嵌套的 Grid 容器
    lines.push(`${indentStr}    <Grid`);
    lines.push(`${indentStr}      container`);
    lines.push(`${indentStr}      spacing={${node.containerConfig.spacing}}`);
    lines.push(`${indentStr}      direction="${node.containerConfig.direction}"`);
    lines.push(`${indentStr}      wrap="${node.containerConfig.wrap}"`);
    lines.push(`${indentStr}      sx={{`);
    lines.push(`${indentStr}        alignItems: '${node.containerConfig.alignItems}',`);
    lines.push(`${indentStr}        justifyContent: '${node.containerConfig.justifyContent}',`);
    lines.push(`${indentStr}      }}`);
    lines.push(`${indentStr}    >`);

    // 递归生成子节点
    node.children.forEach((child) => {
      lines.push(...generateNodeCode(child, enableResponsiveBreakpoints, indent + 3));
    });

    lines.push(`${indentStr}    </Grid>`);
    lines.push(`${indentStr}  </Box>`);
  }

  lines.push(`${indentStr}</Grid>`);
  return lines;
}

/**
 * 生成 MUI v7 Grid JSX 代码
 */
function generateGridCode(
  containerConfig: GridContainerConfig,
  nodes: GridNode[],
  enableResponsiveBreakpoints: boolean
): string {
  const lines: string[] = [];

  lines.push(`import { Grid, Box } from '@mui/material';`);
  lines.push(``);
  lines.push(`function Layout() {`);
  lines.push(`  return (`);
  lines.push(`    <Grid`);
  lines.push(`      container`);
  lines.push(`      spacing={${containerConfig.spacing}}`);
  lines.push(`      direction="${containerConfig.direction}"`);
  lines.push(`      wrap="${containerConfig.wrap}"`);
  lines.push(`      sx={{`);
  lines.push(`        alignItems: '${containerConfig.alignItems}',`);
  lines.push(`        justifyContent: '${containerConfig.justifyContent}',`);
  lines.push(`      }}`);
  lines.push(`    >`);

  // 递归生成所有节点
  nodes.forEach((node) => {
    lines.push(...generateNodeCode(node, enableResponsiveBreakpoints, 3));
  });

  lines.push(`    </Grid>`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export default Layout;`);

  return lines.join('\n');
}

/**
 * Grid 代码导出组件
 */
const GridCodeExport: React.FC<GridCodeExportProps> = ({
  containerConfig,
  nodes,
  enableResponsiveBreakpoints,
  showCode,
  onToggleCode,
}) => {
  // 生成代码（缓存）
  const code = useMemo(
    () => generateGridCode(containerConfig, nodes, enableResponsiveBreakpoints),
    [containerConfig, nodes, enableResponsiveBreakpoints]
  );

  /**
   * 复制代码到剪贴板
   */
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      Toast.success('代码已复制到剪贴板');
    } catch (error) {
      Toast.error('复制失败：' + (error as Error).message);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<CodeIcon />}
          onClick={onToggleCode}
          size="small"
        >
          {showCode ? '隐藏代码' : '显示代码'}
        </Button>
        {showCode && (
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyCode}
            size="small"
          >
            复制代码
          </Button>
        )}
      </Stack>

      {/* 代码预览 */}
      {showCode && (
        <Paper
          variant="outlined"
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'grey.900',
            borderRadius: 1,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          <Typography
            component="pre"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#e0e0e0',
              margin: 0,
              whiteSpace: 'pre',
              lineHeight: 1.6,
            }}
          >
            {code}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default React.memo(GridCodeExport);
