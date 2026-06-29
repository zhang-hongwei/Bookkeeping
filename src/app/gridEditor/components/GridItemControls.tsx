/**
 * GridItemControls Component
 * Grid 项目控制面板组件
 */

'use client';

import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  Box,
  TextField,
  Slider,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import type { GridNode, GridContainerConfig } from '../types';

interface GridItemControlsProps {
  /** 选中的节点（null 表示未选中） */
  activeNode: GridNode | null;
  /** 根容器配置 */
  containerConfig: GridContainerConfig;
  /** 是否启用响应式断点配置 */
  enableResponsiveBreakpoints: boolean;
  /** 更新节点回调 */
  onUpdateNode: (id: string, updates: Partial<GridNode>) => void;
  /** 更新根容器配置回调 */
  onUpdateContainer: (updates: Partial<GridContainerConfig>) => void;
  /** 切换响应式断点回调 */
  onToggleResponsiveBreakpoints: (enabled: boolean) => void;
  /** 重置回调 */
  onReset: () => void;
}

/**
 * Grid 控制面板组件
 */
const GridItemControls: React.FC<GridItemControlsProps> = ({
  activeNode,
  containerConfig,
  enableResponsiveBreakpoints,
  onUpdateNode,
  onUpdateContainer,
  onToggleResponsiveBreakpoints,
  onReset,
}) => {
  if (!activeNode) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Typography variant="body2" color="text.secondary">
          请选择一个节点
        </Typography>
      </Paper>
    );
  }

  const isContainer = activeNode.type === 'container';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Typography variant="subtitle1" gutterBottom>
        {isContainer ? '容器设置' : '项目设置'}
      </Typography>

      <Stack spacing={2.5} sx={{ mt: 1 }}>
        {/* 节点类型标识 */}
        <Typography variant="caption" color="primary" fontWeight="bold">
          {isContainer ? '🗂️ Grid 容器' : '📄 Grid 项目'}
        </Typography>

        {/* 标签 */}
        <TextField
          label="标签"
          size="small"
          value={activeNode.label}
          onChange={(e) =>
            onUpdateNode(activeNode.id, { label: e.target.value })
          }
          fullWidth
        />

        {/* 响应式断点配置开关 */}
        <FormControlLabel
          control={
            <Switch
              checked={enableResponsiveBreakpoints}
              onChange={(e) => onToggleResponsiveBreakpoints(e.target.checked)}
            />
          }
          label="启用响应式断点配置"
        />

        {/* 尺寸配置 */}
        <Box>
          {enableResponsiveBreakpoints ? (
            // 响应式断点配置（xs/sm/md/lg）
            <>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                断点列跨度 (1-12)
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {/* xs */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ width: 36, fontSize: '0.875rem' }}>xs</Typography>
                  <Slider
                    value={activeNode.size.xs}
                    min={1}
                    max={12}
                    step={1}
                    onChange={(_, value) =>
                      onUpdateNode(activeNode.id, {
                        size: { ...activeNode.size, xs: value as number },
                      })
                    }
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    value={activeNode.size.xs}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, {
                        size: { ...activeNode.size, xs: Number(e.target.value) || 1 },
                      })
                    }
                    type="number"
                    slotProps={{
                      input: { inputProps: { min: 1, max: 12 } },
                    }}
                    sx={{ width: 68 }}
                  />
                </Stack>

                {/* sm */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ width: 36, fontSize: '0.875rem' }}>sm</Typography>
                  <Slider
                    value={activeNode.size.sm}
                    min={1}
                    max={12}
                    step={1}
                    onChange={(_, value) =>
                      onUpdateNode(activeNode.id, {
                        size: { ...activeNode.size, sm: value as number },
                      })
                    }
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    value={activeNode.size.sm}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, {
                        size: { ...activeNode.size, sm: Number(e.target.value) || 1 },
                      })
                    }
                    type="number"
                    slotProps={{
                      input: { inputProps: { min: 1, max: 12 } },
                    }}
                    sx={{ width: 68 }}
                  />
                </Stack>

                {/* md */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ width: 36, fontSize: '0.875rem' }}>md</Typography>
                  <Slider
                    value={activeNode.size.md}
                    min={1}
                    max={12}
                    step={1}
                    onChange={(_, value) =>
                      onUpdateNode(activeNode.id, {
                        size: { ...activeNode.size, md: value as number },
                      })
                    }
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    value={activeNode.size.md}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, {
                        size: { ...activeNode.size, md: Number(e.target.value) || 1 },
                      })
                    }
                    type="number"
                    slotProps={{
                      input: { inputProps: { min: 1, max: 12 } },
                    }}
                    sx={{ width: 68 }}
                  />
                </Stack>

                {/* lg */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ width: 36, fontSize: '0.875rem' }}>lg</Typography>
                  <Slider
                    value={activeNode.size.lg}
                    min={1}
                    max={12}
                    step={1}
                    onChange={(_, value) =>
                      onUpdateNode(activeNode.id, {
                        size: { ...activeNode.size, lg: value as number },
                      })
                    }
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    value={activeNode.size.lg}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, {
                        size: { ...activeNode.size, lg: Number(e.target.value) || 1 },
                      })
                    }
                    type="number"
                    slotProps={{
                      input: { inputProps: { min: 1, max: 12 } },
                    }}
                    sx={{ width: 68 }}
                  />
                </Stack>
              </Stack>
            </>
          ) : (
            // 统一尺寸配置
            <>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                列跨度 (1-12) - 应用于所有断点
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Slider
                  value={activeNode.size.xs}
                  min={1}
                  max={12}
                  step={1}
                  onChange={(_, value) => {
                    const size = value as number;
                    onUpdateNode(activeNode.id, {
                      size: { xs: size, sm: size, md: size, lg: size },
                    });
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  value={activeNode.size.xs}
                  onChange={(e) => {
                    const size = Number(e.target.value) || 1;
                    onUpdateNode(activeNode.id, {
                      size: { xs: size, sm: size, md: size, lg: size },
                    });
                  }}
                  type="number"
                  slotProps={{
                    input: { inputProps: { min: 1, max: 12 } },
                  }}
                  sx={{ width: 68 }}
                />
              </Stack>
            </>
          )}
        </Box>

        {/* Order */}
        <TextField
          label="Order"
          size="small"
          value={activeNode.order}
          onChange={(e) =>
            onUpdateNode(activeNode.id, {
              order: Number(e.target.value) || 0,
            })
          }
          type="number"
          fullWidth
        />

        {/* 类型特定属性 */}
        {!isContainer && (
          // 项目：背景色
          <TextField
            label="背景色"
            size="small"
            value={activeNode.bgcolor}
            onChange={(e) =>
              onUpdateNode(activeNode.id, { bgcolor: e.target.value })
            }
            fullWidth
          />
        )}

        {isContainer && (
          // 容器：容器配置
          <>
            <Divider />
            <Typography variant="subtitle2">容器配置</Typography>
            <Stack spacing={1.5}>
              {/* Spacing */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ width: 80, fontSize: '0.875rem' }}>Spacing</Typography>
                <Slider
                  value={activeNode.containerConfig.spacing}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(_, value) =>
                    onUpdateNode(activeNode.id, {
                      containerConfig: {
                        ...activeNode.containerConfig,
                        spacing: value as number,
                      },
                    })
                  }
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  value={activeNode.containerConfig.spacing}
                  onChange={(e) =>
                    onUpdateNode(activeNode.id, {
                      containerConfig: {
                        ...activeNode.containerConfig,
                        spacing: Number(e.target.value) || 0,
                      },
                    })
                  }
                  type="number"
                  slotProps={{
                    input: { inputProps: { min: 0, max: 10 } },
                  }}
                  sx={{ width: 68 }}
                />
              </Stack>

              {/* Direction */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ width: 80, fontSize: '0.875rem' }}>Direction</Typography>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select
                    value={activeNode.containerConfig.direction}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, {
                        containerConfig: {
                          ...activeNode.containerConfig,
                          direction: e.target.value as GridContainerConfig['direction'],
                        },
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

              {/* Align Items */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ width: 80, fontSize: '0.875rem' }}>Align</Typography>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select
                    value={activeNode.containerConfig.alignItems}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, {
                        containerConfig: {
                          ...activeNode.containerConfig,
                          alignItems: e.target.value as GridContainerConfig['alignItems'],
                        },
                      })
                    }
                  >
                    <MenuItem value="stretch">stretch</MenuItem>
                    <MenuItem value="center">center</MenuItem>
                    <MenuItem value="flex-start">flex-start</MenuItem>
                    <MenuItem value="flex-end">flex-end</MenuItem>
                    <MenuItem value="baseline">baseline</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Justify Content */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ width: 80, fontSize: '0.875rem' }}>Justify</Typography>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select
                    value={activeNode.containerConfig.justifyContent}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, {
                        containerConfig: {
                          ...activeNode.containerConfig,
                          justifyContent: e.target
                            .value as GridContainerConfig['justifyContent'],
                        },
                      })
                    }
                  >
                    <MenuItem value="flex-start">flex-start</MenuItem>
                    <MenuItem value="center">center</MenuItem>
                    <MenuItem value="flex-end">flex-end</MenuItem>
                    <MenuItem value="space-between">space-between</MenuItem>
                    <MenuItem value="space-around">space-around</MenuItem>
                    <MenuItem value="space-evenly">space-evenly</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </>
        )}

        <Divider />

        {/* 根容器控制 */}
        <Typography variant="subtitle2">根容器控制</Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          控制整个布局的根容器配置
        </Typography>
        <Stack spacing={1.5}>
          {/* Spacing */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ width: 80, fontSize: '0.875rem' }}>Spacing</Typography>
            <Slider
              value={containerConfig.spacing}
              min={0}
              max={10}
              step={1}
              onChange={(_, value) =>
                onUpdateContainer({ spacing: value as number })
              }
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              value={containerConfig.spacing}
              onChange={(e) =>
                onUpdateContainer({ spacing: Number(e.target.value) || 0 })
              }
              type="number"
              slotProps={{
                input: { inputProps: { min: 0, max: 10 } },
              }}
              sx={{ width: 68 }}
            />
          </Stack>

          {/* Align Items */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ width: 80, fontSize: '0.875rem' }}>Align</Typography>
            <FormControl size="small" sx={{ flex: 1 }}>
              <Select
                value={containerConfig.alignItems}
                onChange={(e) =>
                  onUpdateContainer({
                    alignItems: e.target.value as GridContainerConfig['alignItems'],
                  })
                }
              >
                <MenuItem value="stretch">stretch</MenuItem>
                <MenuItem value="center">center</MenuItem>
                <MenuItem value="flex-start">flex-start</MenuItem>
                <MenuItem value="flex-end">flex-end</MenuItem>
                <MenuItem value="baseline">baseline</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Justify Content */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ width: 80, fontSize: '0.875rem' }}>Justify</Typography>
            <FormControl size="small" sx={{ flex: 1 }}>
              <Select
                value={containerConfig.justifyContent}
                onChange={(e) =>
                  onUpdateContainer({
                    justifyContent: e.target
                      .value as GridContainerConfig['justifyContent'],
                  })
                }
              >
                <MenuItem value="flex-start">flex-start</MenuItem>
                <MenuItem value="center">center</MenuItem>
                <MenuItem value="flex-end">flex-end</MenuItem>
                <MenuItem value="space-between">space-between</MenuItem>
                <MenuItem value="space-around">space-around</MenuItem>
                <MenuItem value="space-evenly">space-evenly</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Divider />

        {/* 重置按钮 */}
        <Button variant="outlined" fullWidth onClick={onReset}>
          重置布局
        </Button>
      </Stack>
    </Paper>
  );
};

export default React.memo(GridItemControls);
