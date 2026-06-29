# Tools 开发指南

本指南适用于 `src/app/(tools)/` 目录下所有可视化 CSS 工具的开发。

---

## 1. 开发前评估

在开始开发新工具之前，**必须先完成以下评估**：

### 1.1 布局评估

| 评估维度 | 三栏布局 | 双栏布局 | 单栏布局 |
|---------|---------|---------|---------|
| **适用场景** | 属性多、有预设、需预览 | 属性少或无预设 | 简单配置即可完成 |
| **示例工具** | boxShadow, glassmorphism, clipPath | gradient-border | 单位转换器 |
| **属性复杂度** | >5 个可调参数 | 3-5 个参数 | <3 个参数 |

**判断流程**：

```
是否有 >5 个可调参数？
  ├─ 是 → 是否有预设系统？
  │       ├─ 是 → 三栏布局（左属性 | 中预览 | 右预设）
  │       └─ 否 → 双栏布局（左属性 | 右预览 + 导出按钮）
  └─ 否 → 是否需要实时预览？
          ├─ 是 → 双栏布局
          └─ 否 → 单栏布局即可
```

### 1.2 三栏布局结构

```
┌─────────────────────────────────────────────────────────┐
│  Page Header (工具名称 + 简短描述)                        │
│  ─────────────────────────────────────────────────────── │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │          │  │                  │  │              │  │
│  │  左侧栏   │  │     中间预览栏     │  │    右侧栏     │  │
│  │          │  │                  │  │              │  │
│  │ 属性编辑  │  │   实时效果预览     │  │  预设列表     │  │
│  │ 参数调整  │  │                  │  │  导出按钮     │  │
│  │ 颜色选择  │  │   CSS 代码输出    │  │  重置按钮     │  │
│  │          │  │                  │  │              │  │
│  │ 300px    │  │     1fr          │  │   280px      │  │
│  │ sticky   │  │    sticky        │  │   sticky     │  │
│  └──────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 目录结构规范

每个工具遵循统一的文件组织结构：

```
src/app/(tools)/tool-name/
├── page.tsx              # 主页面（必须）- 组合三栏布局
├── types.ts              # TypeScript 类型定义（必须）
├── utils.ts              # CSS 生成、格式转换等工具函数（必须）
├── presets.ts            # 预设配置（有预设系统时必须）
├── hooks/                # 自定义 React Hooks（简单工具使用）
│   └── useToolConfig.ts
├── components/           # UI 组件
│   ├── ToolControls.tsx       # 左侧：属性编辑面板
│   ├── ToolPreview.tsx        # 中间：效果预览区
│   ├── ToolPresetsPanel.tsx   # 右侧：预设 + 导出
│   └── ToolExportDialog.tsx   # 导出弹窗（必须）
```

### 状态管理选择

| 方案 | 适用场景 | 位置 |
|------|---------|------|
| **自定义 Hook** | 简单工具（< 3 个组件共享状态） | `hooks/useToolConfig.ts` |
| **Zustand Store** | 复杂工具（多组件共享、需 devtools） | `src/store/tool-name/` |

Zustand Store 结构（复杂工具）：

```
src/store/tool-name/
├── index.ts          # 导出
├── types.ts          # Store 类型定义（State + Actions）
├── initialState.ts   # 默认状态
├── actions.ts        # Action 实现
└── store.ts          # createStore 入口
```

---

## 3. 页面模板

### 3.1 三栏布局 page.tsx 模板

```tsx
/**
 * Tool Name - Page
 * 工具简短描述
 */
"use client";

import React, { useState } from "react";
import { Box, Container, Typography, Stack, Divider, Paper } from "@mui/material";
import { ToolControls } from "./components/ToolControls";
import { ToolPreview } from "./components/ToolPreview";
import { ToolPresetsPanel } from "./components/ToolPresetsPanel";
import { ToolExportDialog } from "./components/ToolExportDialog";
import { useToolStore } from "@/store/tool-name";

export default function ToolNamePage() {
  const exportDialogOpen = useToolStore((s) => s.exportDialogOpen);
  const { setExportDialogOpen } = useToolActions();
  const config = useToolStore((s) => s.config);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* 页面标题 */}
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              工具名称
            </Typography>
            <Typography variant="body2" color="text.secondary">
              工具简短功能描述
            </Typography>
          </Box>

          <Divider />

          {/* 三栏布局 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "300px 1fr 280px",
              },
              gap: 2.5,
              alignItems: "start",
            }}
          >
            {/* 左栏：属性编辑 */}
            <Paper
              elevation={2}
              sx={{
                position: { xs: "relative", lg: "sticky" },
                top: { xs: 0, lg: 24 },
                maxHeight: { lg: "calc(100vh - 120px)" },
                overflow: "auto",
              }}
            >
              <ToolControls />
            </Paper>

            {/* 中栏：实时预览 */}
            <Paper
              elevation={2}
              sx={{
                position: { xs: "relative", lg: "sticky" },
                top: { xs: 0, lg: 24 },
                p: 3,
              }}
            >
              <ToolPreview config={config} />
            </Paper>

            {/* 右栏：预设 + 操作 */}
            <Paper
              elevation={2}
              sx={{
                position: { xs: "relative", lg: "sticky" },
                top: { xs: 0, lg: 24 },
                maxHeight: { lg: "calc(100vh - 120px)" },
                overflow: "auto",
              }}
            >
              <ToolPresetsPanel />
            </Paper>
          </Box>
        </Stack>
      </Container>

      {/* 导出弹窗 */}
      <ToolExportDialog
        open={exportDialogOpen}
        config={config}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
```

### 3.2 布局关键参数

```tsx
// 三栏响应式断点
gridTemplateColumns: {
  xs: "1fr",                    // 移动端：单列
  lg: "300px 1fr 280px",        // 桌面端：三栏
}

// 左右栏 sticky 定位
position: { xs: "relative", lg: "sticky" },
top: { xs: 0, lg: 24 },
maxHeight: { lg: "calc(100vh - 120px)" },
overflow: "auto",

// 页面容器
Container maxWidth="xl"         // 使用 xl 留足预览空间
```

---

## 4. 类型定义规范

### 4.1 types.ts 模板

```tsx
/**
 * Tool Name Types
 */

/** 工具配置接口 */
export interface ToolConfig {
  /** 效果类型（如有多种模式） */
  effectType?: string;
  // ... 工具特有属性
}

/** 预设接口 */
export interface ToolPreset {
  /** 预设名称 */
  name: string;
  /** 预设描述 */
  description: string;
  /** 预设配置（Partial 允许部分覆盖） */
  config: Partial<ToolConfig>;
}

/** 导出格式类型 - 必须包含以下四种 */
export type ExportFormat = 'css' | 'mui' | 'tailwind' | 'cssVariables';
```

---

## 5. 导出格式规范（必须）

**所有工具必须支持以下 4 种导出格式**：

### 5.1 格式定义

| 格式 | 类型标识 | 说明 |
|------|---------|------|
| **CSS** | `css` | 标准 CSS 样式 |
| **MUI sx** | `mui` | MUI `sx` prop 格式 |
| **Tailwind** | `tailwind` | Tailwind CSS 类名 |
| **CSS 变量** | `cssVariables` | CSS 自定义属性方案 |

### 5.2 utils.ts 导出函数模板

```tsx
import type { ExportFormat, ToolConfig } from './types';

/**
 * 生成导出代码
 */
export function generateExportCode(config: ToolConfig, format: ExportFormat): string {
  const cssValue = buildCSSValue(config);

  switch (format) {
    case 'css':
      return generateCSS(cssValue, config);

    case 'mui':
      return generateMUI(cssValue, config);

    case 'tailwind':
      return generateTailwind(cssValue, config);

    case 'cssVariables':
      return generateCSSVariables(cssValue, config);

    default:
      return generateCSS(cssValue, config);
  }
}

/** 格式 1：标准 CSS */
function generateCSS(value: string, config: ToolConfig): string {
  return `/* Tool Name */
.element {
  property: ${value};
}`;
}

/** 格式 2：MUI sx prop */
function generateMUI(value: string, config: ToolConfig): string {
  return `// MUI sx prop
<Box
  sx={{
    property: '${value}',
  }}
>
  Content
</Box>`;
}

/** 格式 3：Tailwind CSS */
function generateTailwind(value: string, config: ToolConfig): string {
  return `<!-- Tailwind CSS -->
<div class="property-[${value}]">
  Content
</div>

<!-- 或在 tailwind.config.js 中扩展:
theme: {
  extend: {
    property: {
      'custom': '${value}',
    },
  },
}
-->`;
}

/** 格式 4：CSS 变量 */
function generateCSSVariables(value: string, config: ToolConfig): string {
  return `/* CSS Variables 方案 */
:root {
  --tool-property: ${value};
}

.element {
  property: var(--tool-property);
}

/* 暗色模式覆盖 */
@media (prefers-color-scheme: dark) {
  :root {
    --tool-property: ${value}; /* 暗色模式适配值 */
  }
}`;
}
```

---

## 6. 明暗模式适配规范

### 6.1 预览区域

预览区域**必须**支持 light/dark 模式切换，确保效果在两种模式下都可预览：

```tsx
// 预览组件应提供背景切换
<Box sx={{
  // 使用 MUI theme token，自动适配明暗模式
  backgroundColor: 'background.paper',
  color: 'text.primary',
  border: '1px solid',
  borderColor: 'divider',
}}>
  {/* 预览内容 */}
</Box>
```

### 6.2 导出代码中的暗色适配

CSS 变量导出格式中**必须包含** `prefers-color-scheme: dark` 媒体查询：

```css
/* CSS Variables 导出应包含暗色模式 */
:root {
  --tool-property: light-mode-value;
}

@media (prefers-color-scheme: dark) {
  :root {
    --tool-property: dark-mode-value;
  }
}
```

### 6.3 控件面板

所有控件使用 MUI theme token，不硬编码颜色：

```tsx
// ✅ 正确：使用 theme token
<Paper sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>

// ❌ 错误：硬编码颜色
<Paper sx={{ bgcolor: '#ffffff', color: '#000000' }}>
```

---

## 7. 组件开发规范

### 7.1 左侧 Controls 面板

- 使用 MUI `Slider`, `TextField`, `ToggleButtonGroup`, `Switch` 等标准控件
- 按功能分组，使用 `Divider` 分隔
- 所有数值控件显示当前值
- 颜色控件提供 ColorPicker + HEX 输入
- 底部放置「重置」按钮

### 7.2 中间 Preview 面板

- 实时反映参数变化
- 显示生成的 CSS 代码（可折叠）
- 提供「复制 CSS」快捷按钮
- 预览背景可切换（支持 light/dark 棋盘格等）

### 7.3 右侧 Presets 面板

- 预设卡片网格布局
- 点击预设直接应用效果
- 显示「导出」按钮打开导出弹窗
- 底部提供「重置为默认」按钮

### 7.4 ExportDialog 导出弹窗

两种 UI 模式可选：

**模式 A - ToggleButton 切换**（适用于格式少的情况）：
```tsx
<ToggleButtonGroup value={format} exclusive onChange={handleFormatChange}>
  <ToggleButton value="css">CSS</ToggleButton>
  <ToggleButton value="mui">MUI</ToggleButton>
  <ToggleButton value="tailwind">Tailwind</ToggleButton>
  <ToggleButton value="cssVariables">CSS Variables</ToggleButton>
</ToggleButtonGroup>
```

**模式 B - Tabs 切换**（适用于格式多或有子选项的情况）：
```tsx
<Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
  <Tab label="CSS" />
  <Tab label="MUI" />
  <Tab label="Tailwind" />
  <Tab label="CSS Variables" />
</Tabs>
```

弹窗公共要素：
- 代码区域使用等宽字体 `fontFamily: "monospace"`
- 右上角复制按钮，带成功/失败反馈
- 每种格式底部附使用说明
- `Snackbar` 提示复制成功

---

## 8. 导航注册

新工具开发完成后，需在导航配置中注册：

```tsx
// src/app/(tools)/_config/nav-config.tsx
{
  title: "工具名称",
  path: "/tool-name",       // 与目录名一致
  icon: <SomeIcon />,       // 选择语义化的 MUI Icon
  description: "一句话描述工具功能",
}
```

---

## 9. Zustand Store 规范

对于复杂工具，使用 `src/store/` 下的 Zustand Store：

### 9.1 Store 创建模板

```tsx
// src/store/tool-name/store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ToolStore } from './types';
import { toolInitialState } from './initialState';
import { createToolActions } from './actions';

export const useToolStore = create<ToolStore>()(
  devtools(
    (set, get, api) => ({
      ...toolInitialState,
      ...createToolActions(set, get, api),
    }),
    {
      name: 'tool-name-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
```

### 9.2 Actions Selector 模式

避免不必要的重渲染，导出静态 actions selector：

```tsx
// src/store/tool-name/store.ts
import { useShallow } from 'zustand/react/shallow';

const actionsSelector = (state: ToolStore) => ({
  updateConfig: state.updateConfig,
  applyPreset: state.applyPreset,
  reset: state.reset,
  setExportDialogOpen: state.setExportDialogOpen,
});

export const useToolActions = () => {
  return useToolStore(useShallow(actionsSelector));
};
```

---

## 10. 预设系统规范

### 10.1 presets.ts 模板

```tsx
import type { ToolPreset } from './types';

export const TOOL_PRESETS: ToolPreset[] = [
  {
    name: 'preset-1',
    description: '预设描述',
    config: {
      // Partial<ToolConfig>
    },
  },
  // ...
];

export function getPresetByName(name: string): ToolPreset | undefined {
  return TOOL_PRESETS.find((p) => p.name === name);
}
```

---

## 11. 开发检查清单

新工具开发完成前，逐项确认：

### 功能完整性
- [ ] 页面标题 + 描述
- [ ] 三栏/双栏响应式布局（移动端单列）
- [ ] 所有属性可编辑且有合理默认值
- [ ] 实时预览与参数同步
- [ ] 预设系统（如有）

### 导出格式
- [ ] CSS 标准格式
- [ ] MUI sx prop 格式
- [ ] Tailwind CSS 格式
- [ ] CSS Variables 格式（含暗色模式适配）
- [ ] 复制到剪贴板 + 成功提示

### 明暗模式
- [ ] 所有 UI 使用 MUI theme token（不硬编码颜色）
- [ ] 预览区域在 light/dark 下均正常显示
- [ ] CSS Variables 导出包含 `prefers-color-scheme: dark`

### 代码质量
- [ ] TypeScript 严格类型，无 `any`
- [ ] 组件使用 `React.memo` 优化（导出弹窗等）
- [ ] 导航配置已注册
- [ ] `page.tsx` 为 `"use client"` 组件

---

## 12. 现有工具参考

| 工具 | 状态管理 | 导出格式 | 布局 | 参考程度 |
|------|---------|---------|------|---------|
| **glassmorphism** | Zustand Store | css, scss, tailwind, mui, json | 三栏 | ⭐ 最佳参考 |
| **clipPath** | Zustand Store | css, scss, tailwind, svg, json | 三栏 | ⭐ 复杂交互参考 |
| **boxShadow** | 自定义 Hook | css, mui, tailwind, json | 三栏 | 简单工具参考 |
| **gradient-border** | Zustand Store | 多种格式 | 三栏 | 渐变类参考 |

**推荐开发顺序**：先参考 `glassmorphism` 的整体架构，再参考 `boxShadow` 的简洁实现。
