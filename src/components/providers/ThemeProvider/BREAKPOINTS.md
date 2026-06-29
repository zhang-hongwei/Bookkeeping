# Breakpoints 断点系统文档

本项目使用 **MUI 默认断点系统**，未进行自定义配置。

## 📐 断点定义

| 断点名称 | 最小宽度 | 目标设备 | 说明 |
|---------|---------|---------|------|
| **xs** | 0px | 手机竖屏 | Extra Small - 超小屏幕 |
| **sm** | 600px | 手机横屏/小平板 | Small - 小屏幕 |
| **md** | 900px | 平板 | Medium - 中等屏幕 |
| **lg** | 1200px | 桌面 | Large - 大屏幕 |
| **xl** | 1536px | 大桌面 | Extra Large - 超大屏幕 |

## 💻 使用方式

### 1. Grid 响应式布局

```tsx
import { Grid } from "@mui/material";

// Grid 组件使用 size 属性定义响应式列宽（基于 12 列网格）
<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
  <Card>Content</Card>
</Grid>
```

**实际效果：**
- `xs` (0-599px): 占满 12/12 = 100%
- `sm` (600-899px): 占据 6/12 = 50%
- `md` (900-1199px): 占据 4/12 = 33%
- `lg` (1200px+): 占据 3/12 = 25%

### 2. sx prop 响应式样式

```tsx
import { Box } from "@mui/material";

<Box
  sx={{
    width: {
      xs: '100%',      // 0-599px
      sm: '75%',       // 600-899px
      md: '50%',       // 900-1199px
      lg: '25%',       // 1200-1535px
      xl: '20%',       // 1536px+
    },
    padding: {
      xs: 2,           // 16px
      md: 3,           // 24px
    },
  }}
>
  Content
</Box>
```

### 3. useMediaQuery Hook

```tsx
import { useMediaQuery, useTheme } from "@mui/material";

function MyComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <div>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </div>
  );
}
```

### 4. theme.breakpoints API

```tsx
// 在 sx prop 或 styled components 中使用
sx={{
  [theme.breakpoints.up('sm')]: {
    // >= 600px
    fontSize: '1.2rem',
  },
  [theme.breakpoints.down('md')]: {
    // < 900px
    fontSize: '1rem',
  },
  [theme.breakpoints.between('sm', 'lg')]: {
    // 600px <= width < 1200px
    fontSize: '1.1rem',
  },
  [theme.breakpoints.only('md')]: {
    // 900px <= width < 1200px
    fontSize: '1.15rem',
  },
}}
```

## 🎯 常见使用场景

### 场景 1: 响应式卡片网格

```tsx
<Grid container spacing={3}>
  {items.map((item) => (
    <Grid
      key={item.id}
      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
    >
      <Card>{item.content}</Card>
    </Grid>
  ))}
</Grid>
```

**布局效果：**
- 手机: 1 列
- 小屏幕: 2 列
- 平板: 3 列
- 桌面: 4 列

### 场景 2: 响应式导航栏

```tsx
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

return (
  <AppBar>
    {isMobile ? (
      <IconButton>
        <MenuIcon />
      </IconButton>
    ) : (
      <Stack direction="row" spacing={2}>
        <Button>Home</Button>
        <Button>About</Button>
        <Button>Contact</Button>
      </Stack>
    )}
  </AppBar>
);
```

### 场景 3: 响应式字体大小

```tsx
<Typography
  variant="h1"
  sx={{
    fontSize: {
      xs: '2rem',    // 手机
      sm: '2.5rem',  // 小屏
      md: '3rem',    // 平板
      lg: '3.5rem',  // 桌面
      xl: '4rem',    // 大桌面
    },
  }}
>
  Responsive Title
</Typography>
```

### 场景 4: 响应式间距

```tsx
<Box
  sx={{
    padding: {
      xs: 2,  // 16px
      md: 4,  // 32px
      lg: 6,  // 48px
    },
    marginTop: {
      xs: 1,  // 8px
      md: 2,  // 16px
    },
  }}
>
  Content
</Box>
```

## 📱 移动优先设计原则

MUI 采用**移动优先（Mobile First）**的响应式设计策略：

1. **基础样式定义在 xs**
   - 先设计最小屏幕的样式

2. **逐步增强到大屏幕**
   - 随着屏幕变大，添加或覆盖样式

3. **推荐写法**
   ```tsx
   // ✅ 推荐：从小到大
   sx={{
     width: '100%',           // 默认（xs）
     [theme.breakpoints.up('md')]: {
       width: '50%',          // 中等屏幕及以上
     },
   }}

   // ❌ 不推荐：从大到小
   sx={{
     width: '50%',
     [theme.breakpoints.down('md')]: {
       width: '100%',
     },
   }}
   ```

## 🔧 断点辅助方法

### breakpoints.up(key)
匹配 >= 指定断点的屏幕宽度

```tsx
theme.breakpoints.up('md')  // >= 900px
```

### breakpoints.down(key)
匹配 < 指定断点的屏幕宽度

```tsx
theme.breakpoints.down('md')  // < 900px
```

### breakpoints.between(start, end)
匹配两个断点之间的屏幕宽度

```tsx
theme.breakpoints.between('sm', 'lg')  // 600px <= width < 1200px
```

### breakpoints.only(key)
只匹配指定断点范围

```tsx
theme.breakpoints.only('md')  // 900px <= width < 1200px
```

### breakpoints.not(key)
匹配除指定断点外的所有范围

```tsx
theme.breakpoints.not('md')  // width < 900px 或 width >= 1200px
```

## 📊 断点值获取

```tsx
import { useTheme } from "@mui/material";

const theme = useTheme();

// 获取断点值
console.log(theme.breakpoints.values);
// {
//   xs: 0,
//   sm: 600,
//   md: 900,
//   lg: 1200,
//   xl: 1536
// }

// 获取断点单位
console.log(theme.breakpoints.unit); // "px"

// 获取所有断点键
console.log(theme.breakpoints.keys); // ["xs", "sm", "md", "lg", "xl"]
```

## 🎨 实际项目示例

### Dashboard 布局示例

```tsx
// src/app/(main)/app/page.tsx
<Grid container spacing={3}>
  {/* Welcome Card - 占据主要区域 */}
  <Grid size={{ xs: 12, md: 8 }}>
    <WelcomeCard />
  </Grid>

  {/* Featured App - 侧边栏 */}
  <Grid size={{ xs: 12, md: 4 }}>
    <FeaturedAppCard />
  </Grid>

  {/* Stats Cards - 三列布局 */}
  {stats.map((stat, index) => (
    <Grid key={index} size={{ xs: 12, md: 4 }}>
      <StatsCard {...stat} />
    </Grid>
  ))}

  {/* Charts - 响应式宽度 */}
  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
    <CurrentDownloadCard />
  </Grid>

  <Grid size={{ xs: 12, md: 6, lg: 8 }}>
    <AreaInstalledCard />
  </Grid>
</Grid>
```

**视觉效果：**

**手机 (xs: < 600px)**
```
┌────────────────┐
│  Welcome Card  │ 100%
├────────────────┤
│  Featured App  │ 100%
├────────────────┤
│  Stat Card 1   │ 100%
├────────────────┤
│  Stat Card 2   │ 100%
└────────────────┘
```

**平板 (md: 900-1199px)**
```
┌─────────┬──────┐
│ Welcome │Feat. │ 67% | 33%
│  Card   │ App  │
├─────┬───┴──┬───┤
│Stat1│Stat2 │St3│ 33% | 33% | 33%
└─────┴──────┴───┘
```

**桌面 (lg: >= 1200px)**
```
┌──────────┬────┬────┐
│ Welcome  │Fea.│Char│ 67% | 16.5% | 16.5%
│   Card   │App │Down│
├───┬───┬──┴────┴────┤
│St1│St2│St3  Area   │ 25% | 25% | 50%
└───┴───┴────────────┘
```

## 🚀 性能优化建议

### 1. 使用 useMediaQuery 时避免过度渲染

```tsx
// ✅ 好的做法：缓存结果
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

// ❌ 避免：在 render 中重复调用
{useMediaQuery(theme.breakpoints.down('md')) && <MobileComponent />}
```

### 2. 合理使用 Grid

```tsx
// ✅ 推荐：使用 Grid2 的 size prop
<Grid size={{ xs: 12, md: 6 }}>

// ❌ 旧版本写法（已废弃）
<Grid xs={12} md={6}>
```

### 3. 避免过度嵌套

```tsx
// ✅ 扁平化结构
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>Content</Grid>
</Grid>

// ❌ 过度嵌套
<Grid container>
  <Grid size={12}>
    <Grid container>
      <Grid size={{ xs: 12, md: 6 }}>Content</Grid>
    </Grid>
  </Grid>
</Grid>
```

## 🔗 相关文件

- **主题配置**: `./createTheme.ts`
- **主题类型**: `./types.ts`
- **布局配置**: `./themeConfig.ts`
- **响应式字体**: `./core/typography.ts`

## 📚 参考资源

- [MUI Breakpoints 官方文档](https://mui.com/material-ui/customization/breakpoints/)
- [MUI Grid 系统](https://mui.com/material-ui/react-grid/)
- [MUI useMediaQuery](https://mui.com/material-ui/react-use-media-query/)

## 💡 最佳实践总结

1. ✅ **使用移动优先设计**：从 xs 开始定义样式
2. ✅ **避免跳跃式断点**：按顺序使用 xs → sm → md → lg → xl
3. ✅ **使用 sx prop**：更简洁的响应式样式
4. ✅ **测试所有断点**：确保在所有屏幕尺寸下都能正常显示
5. ✅ **保持一致性**：团队统一使用相同的断点策略
6. ❌ **不要混用单位**：统一使用 px（MUI 默认）
7. ❌ **不要硬编码尺寸**：使用断点系统而不是固定像素值

---

**注意**: 本项目使用 MUI v5+ 默认断点配置，未进行自定义。如需修改断点值，请在 `createTheme.ts` 中配置。
