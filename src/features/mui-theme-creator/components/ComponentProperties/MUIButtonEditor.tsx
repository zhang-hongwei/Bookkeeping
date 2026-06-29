import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Stack,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useThemeCreatorActions } from '@/store/mui-theme-creator';
import ColorInput from '@/features/mui-theme-creator/components/ColorInput';

// MUI Button 属性模板
const MUI_BUTTON_PROPS = {
  root: {
    label: 'Root',
    properties: [
      { key: 'fontSize', defaultValue: '14px', description: '字体大小' },
      { key: 'fontWeight', defaultValue: '500', description: '字体粗细' },
      { key: 'fontFamily', defaultValue: 'Roboto, sans-serif', description: '字体族' },
      { key: 'textTransform', defaultValue: 'uppercase', description: '文字转换' },
      { key: 'borderRadius', defaultValue: '4px', description: '圆角' },
      { key: 'minHeight', defaultValue: '36px', description: '最小高度' },
      { key: 'padding', defaultValue: '6px 16px', description: '内边距' },
      { key: 'transition', defaultValue: 'all 0.2s ease-in-out', description: '过渡动画' },
      { key: 'boxShadow', defaultValue: '0px 3px 1px -2px rgba(0,0,0,0.2)', description: '阴影' },
      { key: '&.Mui-disabled', defaultValue: '{\n  "color": "rgba(0, 0, 0, 0.26)",\n  "boxShadow": "none",\n  "backgroundColor": "rgba(0, 0, 0, 0.12)"\n}', description: '禁用状态样式 (JSON格式)' },
      { key: 'disabledColor', defaultValue: 'rgba(0, 0, 0, 0.26)', description: '禁用状态 - 文字颜色' },
      { key: 'disabledBackground', defaultValue: 'rgba(0, 0, 0, 0.12)', description: '禁用状态 - 背景色 (contained)' },
      { key: 'disabledBoxShadow', defaultValue: 'none', description: '禁用状态 - 阴影' },
    ],
  },
  contained: {
    label: 'Contained Variant',
    properties: [
      { key: 'backgroundColor', defaultValue: '#1976d2', description: '背景色' },
      { key: 'color', defaultValue: '#fff', description: '文字颜色' },
      { key: 'boxShadow', defaultValue: '0px 3px 1px -2px rgba(0,0,0,0.2)', description: '阴影' },
      { key: '&:hover', defaultValue: '{\n  "backgroundColor": "#1565c0",\n  "boxShadow": "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)"\n}', description: '悬停状态 (JSON格式)' },
      { key: '&:active', defaultValue: '{\n  "boxShadow": "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)"\n}', description: '激活状态 (JSON格式)' },
    ],
  },
  outlined: {
    label: 'Outlined Variant',
    properties: [
      { key: 'border', defaultValue: '1px solid rgba(0, 0, 0, 0.23)', description: '边框' },
      { key: 'color', defaultValue: '#1976d2', description: '文字颜色' },
      { key: '&:hover', defaultValue: '{\n  "borderColor": "#1976d2",\n  "backgroundColor": "rgba(25, 118, 210, 0.04)"\n}', description: '悬停状态 (JSON格式)' },
      { key: '&:active', defaultValue: '{\n  "borderColor": "#1976d2",\n  "backgroundColor": "rgba(25, 118, 210, 0.12)"\n}', description: '激活状态 (JSON格式)' },
    ],
  },
  text: {
    label: 'Text Variant',
    properties: [
      { key: 'color', defaultValue: '#1976d2', description: '文字颜色' },
      { key: '&:hover', defaultValue: '{\n  "backgroundColor": "rgba(25, 118, 210, 0.04)"\n}', description: '悬停状态 (JSON格式)' },
      { key: '&:active', defaultValue: '{\n  "backgroundColor": "rgba(25, 118, 210, 0.12)"\n}', description: '激活状态 (JSON格式)' },
    ],
  },
  sizeSmall: {
    label: 'Small Size',
    properties: [
      { key: 'padding', defaultValue: '4px 10px', description: '内边距' },
      { key: 'fontSize', defaultValue: '13px', description: '字体大小' },
      { key: 'minHeight', defaultValue: '30px', description: '最小高度' },
    ],
  },
  sizeLarge: {
    label: 'Large Size',
    properties: [
      { key: 'padding', defaultValue: '8px 22px', description: '内边距' },
      { key: 'fontSize', defaultValue: '15px', description: '字体大小' },
      { key: 'minHeight', defaultValue: '42px', description: '最小高度' },
    ],
  },
  startIcon: {
    label: 'Start Icon',
    properties: [
      { key: 'marginRight', defaultValue: '8px', description: '右边距' },
      { key: 'fontSize', defaultValue: '18px', description: '图标大小' },
    ],
  },
  endIcon: {
    label: 'End Icon',
    properties: [
      { key: 'marginLeft', defaultValue: '8px', description: '左边距' },
      { key: 'fontSize', defaultValue: '18px', description: '图标大小' },
    ],
  },
  };

/**
 * 判断属性键是否为颜色属性
 */
const isColorProperty = (key: string): boolean => {
  const colorKeywords = [
    'color',
    'background',
    'backgroundColor',
    'borderColor',
    'fill',
    'stroke',
  ];

  const lowerKey = key.toLowerCase();
  return colorKeywords.some(keyword => lowerKey.includes(keyword));
};

interface MUIButtonEditorProps {}

const MUIButtonEditor: React.FC<MUIButtonEditorProps> = () => {
  const { setComponentThemeConfig } = useThemeCreatorActions();
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [buttonConfig, setButtonConfig] = useState(() => ({
    styleOverrides: {},
  }));

  // 初始化默认配置
  useEffect(() => {
    const defaultConfig: any = {};
    Object.entries(MUI_BUTTON_PROPS).forEach(([slot, config]) => {
      defaultConfig[slot] = {};
      config.properties.forEach((prop) => {
        if (typeof prop.key === 'string') {
          // 检查是否是复杂的对象属性（如 &:hover, &:active 等）
          if (prop.key.startsWith('&') || prop.key.includes('.')) {
            try {
              // 如果默认值是 JSON 字符串，尝试解析
              if (typeof prop.defaultValue === 'string' && prop.defaultValue.startsWith('{')) {
                defaultConfig[slot][prop.key] = JSON.parse(prop.defaultValue);
              } else {
                defaultConfig[slot][prop.key] = prop.defaultValue;
              }
            } catch (e) {
              // 如果解析失败，使用原始值
              defaultConfig[slot][prop.key] = prop.defaultValue;
            }
          } else {
            defaultConfig[slot][prop.key] = prop.defaultValue;
          }
        }
      });
    });

    // 设置禁用状态的简化属性
    const muiDisabled = defaultConfig.root?.['&.Mui-disabled'] || {};
    defaultConfig.root.disabledColor = muiDisabled.color;
    defaultConfig.root.disabledBackground = muiDisabled.backgroundColor;
    defaultConfig.root.disabledBoxShadow = muiDisabled.boxShadow;

    setButtonConfig({ styleOverrides: defaultConfig });
  }, []);

  // 处理样式覆盖更改
  const handleStyleOverrideChange = (slot: string, key: string, value: string) => {
    setButtonConfig((prev) => {
      let processedValue: any = value;
      let additionalUpdates: any = {};

      // 对于复杂的对象属性（如 &:hover, &:active, &.Mui-disabled），尝试解析 JSON
      if (key.startsWith('&') || key.includes('.')) {
        try {
          // 如果值看起来像 JSON，尝试解析
          if (value.trim().startsWith('{') && value.trim().endsWith('}')) {
            processedValue = JSON.parse(value);
          } else {
            // 否则尝试作为单个属性值处理
            processedValue = value;
          }
        } catch (e) {
          // 如果解析失败，使用原始字符串值
          processedValue = value;
        }
      }

      // 同步简化的禁用属性到 &.Mui-disabled 对象
      if (key.startsWith('disabled') && slot === 'root') {
        const currentDisabled = prev.styleOverrides.root?.['&.Mui-disabled'] || {};

        // 创建更新的禁用状态对象
        let updatedDisabled: any = { ...currentDisabled };

        if (key === 'disabledColor') {
          updatedDisabled.color = value;
        } else if (key === 'disabledBackground') {
          updatedDisabled.backgroundColor = value;
        } else if (key === 'disabledBoxShadow') {
          updatedDisabled.boxShadow = value;
        }

        additionalUpdates['root'] = {
          ...prev.styleOverrides.root,
          '&.Mui-disabled': updatedDisabled,
        };
      }

      const newConfig = {
        ...prev,
        styleOverrides: {
          ...prev.styleOverrides,
          [slot]: {
            ...(prev.styleOverrides[slot] || {}),
            [key]: processedValue,
          },
          ...additionalUpdates,
        },
      };

      // 直接更新 store
      setComponentThemeConfig('MuiButton', newConfig);

      return newConfig;
    });
  };

  // 重置为默认值
  const handleReset = () => {
    const defaultConfig: any = {};
    Object.entries(MUI_BUTTON_PROPS).forEach(([slot, config]) => {
      defaultConfig[slot] = {};
      config.properties.forEach((prop) => {
        if (typeof prop.key === 'string') {
          // 检查是否是复杂的对象属性
          if (prop.key.startsWith('&') || prop.key.includes('.')) {
            try {
              // 如果默认值是 JSON 字符串，尝试解析
              if (typeof prop.defaultValue === 'string' && prop.defaultValue.startsWith('{')) {
                defaultConfig[slot][prop.key] = JSON.parse(prop.defaultValue);
              } else {
                defaultConfig[slot][prop.key] = prop.defaultValue;
              }
            } catch (e) {
              defaultConfig[slot][prop.key] = prop.defaultValue;
            }
          } else {
            defaultConfig[slot][prop.key] = prop.defaultValue;
          }
        }
      });
    });

    // 设置禁用状态的简化属性
    const muiDisabled = defaultConfig.root?.['&.Mui-disabled'] || {};
    defaultConfig.root.disabledColor = muiDisabled.color;
    defaultConfig.root.disabledBackground = muiDisabled.backgroundColor;
    defaultConfig.root.disabledBoxShadow = muiDisabled.boxShadow;

    setButtonConfig({ styleOverrides: defaultConfig });
  };

  // 复制配置到剪贴板
  const handleCopyConfig = () => {
    const configStr = JSON.stringify(buttonConfig, null, 2);
    navigator.clipboard.writeText(configStr);
  };

  // 导出配置
  const handleExportConfig = () => {
    const configStr = JSON.stringify(buttonConfig, null, 2);
    const blob = new Blob([configStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mui-button-theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 创建预览主题
  const previewTheme = createTheme({
    components: {
      MuiButton: buttonConfig,
    },
  });

  return (
    <Stack spacing={2}>
      {/* 控制面板 */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          MUI Button 主题编辑器
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="复制配置">
            <IconButton size="small" onClick={handleCopyConfig}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="导出配置">
            <IconButton size="small" onClick={handleExportConfig}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="重置为默认值">
            <IconButton size="small" onClick={handleReset}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* 创建自定义主题提示 */}
      {!showCustomTheme && (
        <Paper
          sx={{
            p: 2,
            bgcolor: 'info.lighter',
            border: '1px solid',
            borderColor: 'info.light',
            cursor: 'pointer',
          }}
          onClick={() => setShowCustomTheme(true)}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="info.dark">
              🎨 预设主题配置
            </Typography>
            <Chip label="创建自定义主题 +" size="small" color="primary" />
          </Stack>
        </Paper>
      )}

      {/* 自定义主题编辑器 */}
      {showCustomTheme && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Style Overrides
          </Typography>

          {Object.entries(MUI_BUTTON_PROPS).map(([slot, config]) => (
            <Accordion key={slot} defaultExpanded={slot === 'root'}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  {config.label} ({slot})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {config.properties.map((prop, index) => {
                    const isColor = isColorProperty(prop.key as string);
                    const currentValue = buttonConfig.styleOverrides[slot]?.[prop.key]
                      ? (typeof buttonConfig.styleOverrides[slot][prop.key] === 'object'
                          ? JSON.stringify(buttonConfig.styleOverrides[slot][prop.key], null, 2)
                          : buttonConfig.styleOverrides[slot][prop.key])
                      : (typeof prop.defaultValue === 'string' && prop.defaultValue.startsWith('{')
                          ? prop.defaultValue
                          : prop.defaultValue || '');

                    return (
                      <Box key={`${slot}-${index}`}>
                        {isColor && typeof currentValue === 'string' && !currentValue.startsWith('{') ? (
                          // 使用 ColorInput 组件处理颜色属性
                          <ColorInput
                            label={prop.description || prop.key as string}
                            color={currentValue}
                            onColorChange={(color) =>
                              handleStyleOverrideChange(slot, prop.key as string, color)
                            }
                          />
                        ) : (
                          // 使用 TextField 处理非颜色属性
                          <TextField
                            label={prop.description || prop.key}
                            value={currentValue}
                            onChange={(e) =>
                              handleStyleOverrideChange(slot, prop.key as string, e.target.value)
                            }
                            fullWidth
                            size="small"
                            helperText={`${prop.key}`}
                            multiline={prop.key.startsWith('&') || prop.key.includes('.') || prop.key === 'transition'}
                            rows={(prop.key.startsWith('&') || prop.key.includes('.')) ? 4 : (prop.key === 'transition' ? 2 : 1)}
                          />
                        )}
                        {(prop.key.startsWith('&') || prop.key.includes('.')) && (
                          <Typography variant="caption" color="info.main" sx={{ mt: 0.5, display: 'block' }}>
                            💡 使用 JSON 格式定义状态样式。了解更多: <a href="https://mui.com/r/state-classes-guide" target="_blank" rel="noopener noreferrer">MUI State Classes Guide</a>
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}

      {/* 实时预览 */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          实时预览
        </Typography>
        <ThemeProvider theme={previewTheme}>
          <Stack spacing={2} direction="row" flexWrap="wrap">
            <Button variant="contained" color="primary">
              Contained Button
            </Button>
            <Button variant="outlined" color="secondary">
              Outlined Button
            </Button>
            <Button variant="text" color="success">
              Text Button
            </Button>
            <Button variant="contained" size="small" color="warning">
              Small Button
            </Button>
            <Button variant="contained" size="large" color="error">
              Large Button
            </Button>
            <Button variant="contained" disabled>
              Disabled Button
            </Button>
          </Stack>
        </ThemeProvider>
      </Box>
    </Stack>
  );
};

export default MUIButtonEditor;