# Navigation Menu Demo - MUI Implementation

这是一个使用 Material-UI (MUI v7) 实现的导航菜单组件,灵感来自 Radix UI 的 NavigationMenu。

## 📁 文件结构

```txt
src/
├── app/
│   └── demo/
│       └── page.tsx                          # 演示页面
└── components/
    └── demo/
        ├── navigation-menu-demo.tsx          # 基础 Hover 版本
        ├── navigation-menu-smooth.tsx        # 平滑滑动版本 ⭐ 推荐
        └── navigation-menu-advanced.tsx      # 高级版本(带移动端支持)
```

## 🎯 功能特性

### 平滑滑动版本 (`navigation-menu-smooth.tsx`) ⭐ **推荐**

完美复刻 Radix UI 官网效果：

- ✅ **鼠标 Hover 自动打开** - 无需点击
- ✅ **平滑内容滑动** - 共享 Viewport，内容横向滑动过渡
- ✅ **智能方向检测** - 自动判断左右滑动方向
- ✅ **宽度自适应** - 根据内容自动调整宽度
- ✅ **流畅动画** - 使用 cubic-bezier 缓动函数
- ✅ **延迟关闭** - 鼠标移动到内容时保持打开

### 基础 Hover 版本 (`navigation-menu-demo.tsx`)

- ✅ 鼠标 Hover 自动打开
- ✅ 渐变过渡动画 (Fade)
- ✅ 点击外部关闭
- ✅ 精美的特色链接卡片

### 高级版本 (`navigation-menu-advanced.tsx`)

基础版本的所有功能 +

- ✅ **响应式设计**: 桌面/移动端自适应
- ✅ **移动端 Drawer**: 汉堡菜单 + 侧边栏
- ✅ **折叠子菜单**: 移动端可展开/收起

## 🚀 使用方法

### 访问演示页面

```bash
# 启动开发服务器
pnpm dev

# 访问
http://localhost:3000/demo
```

### 在项目中使用

#### 平滑滑动版本 ⭐ **强烈推荐**

```tsx
import NavigationMenuSmooth from '@/components/demo/navigation-menu-smooth';

export default function MyPage() {
  return (
    <div>
      <NavigationMenuSmooth />
    </div>
  );
}
```

#### 基础 Hover 版本

```tsx
import NavigationMenuDemo from '@/components/demo/navigation-menu-demo';

export default function MyPage() {
  return (
    <div>
      <NavigationMenuDemo />
    </div>
  );
}
```

#### 高级版本(带移动端支持)

```tsx
import NavigationMenuAdvanced from '@/components/demo/navigation-menu-advanced';

export default function MyPage() {
  return (
    <div>
      <NavigationMenuAdvanced />
    </div>
  );
}
```

## ✨ 核心实现原理

### 平滑滑动效果的关键

1. **共享 Viewport**: 所有菜单内容共享一个容器
2. **绝对定位**: 内容使用绝对定位重叠放置
3. **Transform 动画**: 使用 translateX 实现左右滑动
4. **宽度过渡**: Viewport 宽度根据活动菜单平滑变化
5. **方向检测**: 根据菜单索引判断滑动方向

```tsx
// 核心代码片段
const Viewport = styled(Box)<{ contentWidth: number }>(({ contentWidth }) => ({
  width: contentWidth,
  transition: 'width 300ms cubic-bezier(0.87, 0, 0.13, 1)',
}));

const ContentWrapper = styled(Box)<{ isActive: boolean; direction: string }>(
  ({ isActive, direction }) => ({
    transform: isActive
      ? 'translateX(0)'
      : direction === 'left'
      ? 'translateX(-10%)'
      : 'translateX(10%)',
    opacity: isActive ? 1 : 0,
  })
);
```

## 🎨 自定义样式

所有组件都使用 MUI 的 `styled` API,可以轻松自定义:

```tsx
import { styled, alpha } from '@mui/material';

const CustomNavigationMenuTrigger = styled(Button)(({ theme }) => ({
  // 你的自定义样式
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.9),
  },
}));
```

## 🎯 核心组件说明

### NavigationMenuRoot
- 导航菜单的根容器
- 负责居中对齐和 z-index 管理

### NavigationMenuList
- 菜单项的容器
- 使用 Paper 组件提供阴影效果

### NavigationMenuTrigger
- 菜单触发按钮
- 支持 active 状态
- 带有旋转图标动画

### NavigationMenuContent
- 下拉内容容器
- 使用 Popper 定位
- 支持 Fade 过渡动画

### FeaturedLink
- 特色链接组件
- 渐变背景
- 悬停动画效果

### ListItem
- 菜单项组件
- 带有标题和描述
- 左侧悬停指示器

## 📱 响应式设计

高级版本在不同屏幕尺寸下的表现:

- **桌面端 (≥ md)**: 横向菜单栏 + 下拉菜单
- **移动端 (< md)**: 汉堡菜单 + 侧边栏 Drawer

## 🎭 动画效果

### 基础版本
- `Grow`: 下拉菜单展开/收起动画
- `rotate`: 图标旋转动画

### 高级版本
- `Fade`: 更流畅的淡入淡出
- `Collapse`: 移动端折叠动画
- `Drawer`: 侧边栏滑入滑出
- 自定义悬停过渡效果

## 🔧 技术栈

- **React 19**: 最新版本
- **Material-UI v7**: 组件库
- **TypeScript**: 类型安全
- **Emotion**: CSS-in-JS

## 📝 对比 Radix UI

| 特性 | Radix UI | MUI 实现 |
|------|----------|----------|
| 无样式 | ✅ | ❌ (有默认样式) |
| TypeScript | ✅ | ✅ |
| 可访问性 | ✅ | ✅ |
| 主题支持 | ❌ | ✅ (MUI 主题系统) |
| 移动端优化 | ⚠️ | ✅ |
| 动画内置 | ❌ | ✅ |
| 学习曲线 | 中等 | 低 (熟悉 MUI) |

## 💡 最佳实践

1. **使用高级版本**用于生产环境,它提供更好的移动端体验
2. **自定义主题**通过 MUI 主题系统统一管理颜色和间距
3. **添加分析**跟踪用户点击的菜单项
4. **优化性能**使用 `React.memo` 包装组件(如有必要)
5. **增强可访问性**添加 `aria-label` 等属性

## 🐛 已知限制

- 不支持多级嵌套菜单(可扩展)
- 移动端不支持手势滑动(可添加)
- 没有键盘快捷键(可添加)

## 📚 相关资源

- [MUI Documentation](https://mui.com/)
- [Radix UI NavigationMenu](https://www.radix-ui.com/primitives/docs/components/navigation-menu)
- [MUI Popper](https://mui.com/material-ui/react-popper/)
- [MUI Drawer](https://mui.com/material-ui/react-drawer/)

## 🤝 贡献

欢迎提交 PR 来改进这些组件!
