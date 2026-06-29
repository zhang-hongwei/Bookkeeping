# MUI 组件属性编辑器

## 功能概述

这是一个专业的 MUI 组件主题编辑器，允许用户通过可视化界面自定义 MUI 组件的所有样式属性。

## 核心特性

### 🎨 MUI Button 编辑器

目前完全支持 MUI Button 组件的所有样式属性编辑，包括：

#### Style Overrides 覆盖
- **Root**: 基础样式（字体大小、圆角、内边距等）
- **Contained**: Contained 变体样式（背景色、文字颜色、阴影等）
- **Outlined**: Outlined 变体样式（边框、颜色等）
- **Text**: Text 变体样式（文字颜色、悬停效果等）
- **Size Small**: 小尺寸样式
- **Size Large**: 大尺寸样式
- **Start Icon**: 起始图标样式
- **End Icon**: 结束图标样式
- **Disabled**: 禁用状态样式

#### 实时预览
- 🔄 实时显示所有变体的修改效果
- 🎯 包含不同尺寸和状态的按钮预览

#### 配置管理
- 📋 复制配置到剪贴板
- 💾 导出配置为 JSON 文件
- 🔄 一键重置为默认值

## 使用方法

### 1. 访问编辑器
1. 访问 `http://localhost:3001/create`
2. 在左侧导航中点击任意 Button 相关组件（如 "Buttons", "ContainedButtons" 等）
3. 在右侧面板中点击 "Component" 标签

### 2. 编辑样式属性
1. 点击 "创建自定义主题 +" 展开编辑器
2. 使用 Accordion 列表浏览不同的样式覆盖
3. 修改文本框中的 CSS 属性值
4. 实时预览修改效果

### 3. 导出配置
- 点击右上角的复制按钮复制配置到剪贴板
- 点击导出按钮下载 JSON 配置文件
- 点击重置按钮恢复默认值

## 技术架构

### 组件结构
```
ComponentProperties/
├── index.tsx              # 主编辑器组件
├── MUIButtonEditor.tsx    # MUI Button 专用编辑器
└── README.md              # 说明文档
```

### 数据流
1. **状态管理**: 使用 `selectedComponentId` 跟踪当前选中的组件
2. **属性编辑器**: 根据组件类型加载对应的编辑器
3. **实时预览**: 使用 MUI ThemeProvider 动态应用样式
4. **配置导出**: 支持复制和下载 JSON 配置

### 扩展性
- 采用模块化设计，易于添加新组件编辑器
- 统一的属性编辑器接口
- 可配置的属性模板系统

## 未来规划

### 即将支持的组件
- 🔘 Text Fields
- ☑️ Checkboxes
- 📋 Select
- 🃏 Cards
- 💬 Dialog
- 📊 Table
- 🎚️ Slider
- 📈 Progress
- 📱 Navigation Components

### 高级功能
- 🌙 主题切换预览
- 🎨 颜色选择器
- 📏 尺寸滑块
- 🔄 批量编辑
- 📱 响应式设计支持
- 🔗 CSS 变量导出

## API 参考

### MUIButtonEditor Props
```typescript
interface MUIButtonEditorProps {
  onThemeChange?: (themeConfig: any) => void;
}
```

### 配置格式
```typescript
{
  styleOverrides: {
    root: {
      fontSize: "14px",
      borderRadius: "4px",
      // ... 其他属性
    },
    contained: {
      backgroundColor: "#1976d2",
      // ... 其他属性
    },
    // ... 其他变体
  }
}
```

## 贡献指南

### 添加新组件编辑器
1. 在 `ComponentProperties/` 目录下创建新的编辑器文件
2. 实现标准的组件编辑器接口
3. 在 `index.tsx` 中添加组件映射
4. 更新属性模板和配置

### 代码规范
- 使用 TypeScript 进行类型安全
- 遵循 MUI 组件设计规范
- 提供详细的属性描述和默认值
- 包含实时预览功能

---

💡 **提示**: 这是一个开发中的功能，欢迎贡献代码和提出改进建议！