# 🎯 Navigation Menu 滑动效果修复说明

## 问题分析

### ❌ 之前的实现问题

使用多个**绝对定位**的 `ContentWrapper`，每次切换时：
- 旧内容淡出消失（opacity: 0）
- 新内容淡入出现（opacity: 1）
- **没有真正的横向滑动**，只是简单的渐变切换

```tsx
// ❌ 错误的方式：每个内容独立定位
<ContentWrapper isActive={activeMenu === 'learn'}>
  {learnContent}
</ContentWrapper>
<ContentWrapper isActive={activeMenu === 'overview'}>
  {overviewContent}
</ContentWrapper>
```

## ✅ 正确的实现

### 核心原理：轮播滑动

使用**一个容器**，内容并排放置，通过 `translateX` 实现真正的滑动：

```tsx
// ✅ 正确的方式：内容并排，容器滑动
<ContentSlider activeIndex={0}>  {/* translateX(-0%) */}
  <ContentPanel>{learnContent}</ContentPanel>
  <ContentPanel>{overviewContent}</ContentPanel>
</ContentSlider>

// 当切换到 overview 时
<ContentSlider activeIndex={1}>  {/* translateX(-100%) */}
  <ContentPanel>{learnContent}</ContentPanel>
  <ContentPanel>{overviewContent}</ContentPanel>
</ContentSlider>
```

## 🎨 关键代码

### 1. ContentSlider - 滑动容器

```tsx
const ContentSlider = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'activeIndex',
})<{ activeIndex: number }>(({ activeIndex }) => ({
    display: 'flex',           // 横向布局
    height: '100%',
    transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
    transform: `translateX(-${activeIndex * 100}%)`,  // 关键！根据索引滑动
}));
```

**工作原理**：
- `activeIndex = 0` → `translateX(0%)` → 显示第 1 个面板
- `activeIndex = 1` → `translateX(-100%)` → 显示第 2 个面板
- `activeIndex = 2` → `translateX(-200%)` → 显示第 3 个面板

### 2. ContentPanel - 内容面板

```tsx
const ContentPanel = styled(Box)(({ theme }) => ({
    minWidth: '100%',     // 每个面板占满容器宽度
    height: '100%',
}));
```

### 3. 使用示例

```tsx
const menuContents = [
  { id: 'learn', width: 500, height: 280, content: <LearnContent /> },
  { id: 'overview', width: 600, height: 280, content: <OverviewContent /> },
];

const activeIndex = menuContents.findIndex(m => m.id === activeMenu);

<ContentSlider activeIndex={activeIndex === -1 ? 0 : activeIndex}>
  {menuContents.map(menu => (
    <ContentPanel key={menu.id}>
      {menu.content}
    </ContentPanel>
  ))}
</ContentSlider>
```

## 🎬 动画流程

### 从 Learn 切换到 Overview

1. **初始状态** (Learn 激活)
   ```
   [Learn内容 | Overview内容]
   ^显示区域 (translateX(0%))
   ```

2. **鼠标移到 Overview**
   ```
   [Learn内容 | Overview内容]
              ^显示区域 (translateX(-100%))
   ```
   - ContentSlider 向左滑动 100%
   - 300ms 平滑过渡
   - Viewport 宽度从 500px 变为 600px

3. **完成**
   ```
   [Learn内容 | Overview内容]
              ^显示
   ```

## 🆚 对比总结

| 方面 | ❌ 旧实现 | ✅ 新实现 |
|------|---------|---------|
| 结构 | 多个独立定位的容器 | 一个滑动容器 |
| 动画 | 淡入淡出 (opacity) | 横向滑动 (translateX) |
| 效果 | 内容切换 | 真正的滑动 |
| 类似 | - | Radix UI 官网 |

## 📐 完整的 DOM 结构

```html
<Viewport> <!-- 固定宽高的窗口，overflow: hidden -->
  <ContentSlider> <!-- 滑动的容器，flex 布局 -->
    <ContentPanel>Learn 内容</ContentPanel>
    <ContentPanel>Overview 内容</ContentPanel>
  </ContentSlider>
</Viewport>
```

**视觉效果**：
```
┌─────────────────┐ ← Viewport (可见区域)
│ Learn 内容      │
│                 │
│                 │
└─────────────────┘
                    Overview 内容 (隐藏在右侧)
```

切换后：
```
Learn 内容 (隐藏在左侧)
                  ┌─────────────────┐
                  │ Overview 内容   │
                  │                 │
                  │                 │
                  └─────────────────┘
```

## 💡 关键点

1. **不销毁 DOM**：所有内容始终存在，只是通过 transform 移动位置
2. **使用 transform**：GPU 加速，性能更好
3. **transition**：平滑的过渡动画
4. **minWidth: 100%**：确保每个面板占满容器宽度
5. **overflow: hidden**：Viewport 隐藏溢出内容

这样就实现了完美的左右滑动效果！🎉
