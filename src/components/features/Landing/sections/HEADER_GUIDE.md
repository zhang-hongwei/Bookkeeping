# Header/AppBar 组件文档

## 📋 概览

`Header` 是一个功能完整的顶部导航栏组件，提供了品牌展示、导航菜单、主题切换和用户认证等功能。

## 🎯 主要特性

### 1. **品牌展示**
- Logo 图标 + 品牌名称
- 点击可返回首页
- 响应式设计（移动端隐藏文字）

### 2. **导航菜单**
- 桌面端：水平菜单栏
- 菜单项：
  - 📚 文档 (`/docs`)
  - 💰 定价 (`#pricing`)
  - 📝 博客 (`/blog`)
  - 👥 关于我们 (`/about`)

### 3. **产品下拉菜单**
- 桌面端：鼠标悬停显示下拉菜单
- 移动端：展开为可点击菜单
- 菜单项：
  - API 文档
  - Playground
  - SDK

### 4. **右侧操作栏**
- **GitHub 链接**: 指向项目 GitHub
- **主题切换**: 亮/暗模式切换
  - 显示对应的图标 (Sun/Moon)
  - 需要配合主题提供者使用
- **登录按钮**: 
  - 主要 CTA（行动呼吁）按钮
  - 包含登录图标
  - 链接到 `/auth/login`

### 5. **移动端菜单**
- 汉堡菜单图标
- 顶部抽屉式菜单
- 完整的导航项和子菜单
- 点击菜单项后自动关闭

## 🎨 样式特点

| 特性 | 说明 |
|------|------|
| **背景** | 毛玻璃效果 + 渐变背景 |
| **粘性定位** | `position: sticky` - 滚动时保持可见 |
| **深色模式** | 完全适配亮/暗主题 |
| **悬停效果** | 平滑的过渡动画 |
| **响应式** | `xs` 到 `lg` 完全覆盖 |

## 📱 响应式行为

```
桌面端 (md+)
├─ Logo + 品牌名
├─ 完整导航菜单
├─ 产品下拉菜单
└─ 右侧操作栏

移动端 (xs-sm)
├─ Logo 仅显示图标
├─ 汉堡菜单
└─ 右侧操作栏（简化）
```

## 🔗 Props 接口

```typescript
interface HeaderProps {
  onThemeToggle?: () => void;      // 主题切换回调
  isDarkMode?: boolean;             // 当前主题状态
}
```

## 💡 使用示例

```tsx
import { Header } from "./sections";
import { useState } from "react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <>
      <Header 
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        isDarkMode={isDarkMode}
      />
      {/* 其他页面内容 */}
    </>
  );
}
```

## 🚀 后续优化建议

1. **认证状态集成**
   - 显示已登录用户信息
   - 登出选项
   - 个人资料下拉菜单

2. **主题持久化**
   - 保存用户主题偏好到 localStorage
   - 从主题提供者集成

3. **动态导航**
   - 从配置文件读取导航项
   - 支持角色基访问控制 (RBAC)

4. **搜索功能**
   - 添加搜索框
   - 全局搜索快捷键

5. **国际化 (i18n)**
   - 多语言支持
   - 语言切换器

6. **通知中心**
   - 消息提示
   - 通知图标

## 📦 依赖项

```
@mui/material
@mui/icons-material (通过 lucide-react 替代)
lucide-react
next/link
react (useState)
```

## ✅ 集成步骤

1. ✅ 创建 `Header.tsx` 组件
2. ✅ 更新 `sections/index.ts` 导出
3. ✅ 在 `page.tsx` 中导入并使用 Header
4. ✅ 添加主题切换状态管理
5. ⏳ 配合主题提供者实现真正的主题切换
