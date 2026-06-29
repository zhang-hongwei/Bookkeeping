# Next.js 性能优化指南

## 优化策略概览

| 优化类别 | 关键技术 | 性能提升 |
|---------|---------|---------|
| 渲染优化 | SSG, ISR, PPR | ⚡⚡⚡ 显著 |
| 代码分割 | 动态导入, Route Groups | ⚡⚡ 明显 |
| 资源优化 | next/image, next/font | ⚡⚡⚡ 显著 |
| 缓存策略 | fetch cache, revalidate | ⚡⚡ 明显 |
| 打包优化 | Turbopack, Bundle Analyzer | ⚡ 适度 |

---

## 1. 图片优化

### 使用 next/image

```typescript
import Image from 'next/image';

// ✅ 自动优化
export default function Page() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority  // 预加载关键图片
      placeholder="blur"  // 模糊占位符
      blurDataURL="data:image/..."  // Base64 图片
    />
  );
}
```

### 图片优化特性

- **自动格式转换** - WebP/AVIF
- **响应式图片** - srcset 自动生成
- **懒加载** - 默认启用
- **占位符** - 防止布局偏移
- **CDN 分发** - Vercel 自动优化

### 配置远程图片

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],  // 优先格式
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

---

## 2. 字体优化

### 使用 next/font

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

// Google Fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // 字体加载策略
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 本地字体

```typescript
import localFont from 'next/font/local';

const customFont = localFont({
  src: './fonts/CustomFont.woff2',
  display: 'swap',
  variable: '--font-custom',
});
```

### 字体优化特性

- **自动托管** - 无需外部请求
- **零布局偏移** - 使用 CSS `size-adjust`
- **预加载** - 关键字体自动预加载
- **字体子集** - 只加载需要的字符

---

## 3. 代码分割

### 动态导入

```typescript
import dynamic from 'next/dynamic';

// 延迟加载组件
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,  // 禁用 SSR（浏览器 API）
});

export default function Page() {
  return (
    <div>
      <LightweightContent />
      <HeavyChart data={data} />
    </div>
  );
}
```

### 条件加载

```typescript
import dynamic from 'next/dynamic';

const AdminPanel = dynamic(() => import('./AdminPanel'));

export default function Page({ user }: { user: User }) {
  return (
    <div>
      <MainContent />
      {user.isAdmin && <AdminPanel />}  {/* 只有管理员才加载 */}
    </div>
  );
}
```

### 命名导出

```typescript
const MyComponent = dynamic(
  () => import('./components').then((mod) => mod.MyComponent)
);
```

---

## 4. 渲染优化

### 选择合适的渲染模式

```typescript
// SSG - 最快（适合静态内容）
export default async function StaticPage() {
  const data = await fetch(url, { cache: 'force-cache' });
  return <Content data={data} />;
}

// ISR - 平衡性能和新鲜度
export default async function NewsPage() {
  const news = await fetch(url, { next: { revalidate: 60 } });
  return <NewsList news={news} />;
}

// PPR - 混合静态和动态
export default function ProductPage() {
  return (
    <>
      <StaticProductInfo />
      <Suspense fallback={<PriceSkeleton />}>
        <DynamicPrice />
      </Suspense>
    </>
  );
}
```

### React Server Components

```typescript
// ✅ 默认使用 Server Component
export default async function Page() {
  const data = await fetchData();
  return <Content data={data} />;  // 0kb JavaScript
}

// ❌ 避免不必要的 Client Component
'use client';
export default function Page({ data }: { data: Data }) {
  return <Content data={data} />;  // 额外的 JavaScript
}
```

---

## 5. 缓存策略

### fetch 缓存

```typescript
// 强制缓存
const static = await fetch(url, {
  cache: 'force-cache',
});

// 定时重新验证
const revalidated = await fetch(url, {
  next: { revalidate: 3600 },
});

// 禁用缓存
const dynamic = await fetch(url, {
  cache: 'no-store',
});

// 标签化缓存
const tagged = await fetch(url, {
  next: { tags: ['posts'] },
});
```

### 路由段配置

```typescript
// app/blog/page.tsx
export const revalidate = 3600;  // 每小时重新验证
export const dynamic = 'force-static';  // 强制静态
export const fetchCache = 'force-cache';  // 强制缓存所有 fetch

export default async function BlogPage() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
```

---

## 6. 打包优化

### Bundle Analyzer

```bash
npm install @next/bundle-analyzer
```

```typescript
// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer({
  // Next.js 配置
});
```

```bash
ANALYZE=true pnpm build
```

### 移除未使用的代码

```typescript
// ❌ 不好 - 导入整个库
import _ from 'lodash';
const result = _.uniq(array);

// ✅ 好 - 只导入需要的函数
import uniq from 'lodash/uniq';
const result = uniq(array);
```

### Tree Shaking

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/material'],
  },
};
```

---

## 7. Turbopack (Next.js 16+)

### 默认启用

Turbopack 在 Next.js 16 中默认启用，提供：

- **更快的开发构建** - 5-10x 更快的 Fast Refresh
- **更快的生产构建** - 2-5x 构建速度提升
- **增量编译** - 只编译变更的部分

### 文件系统缓存

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,  // 开发环境缓存
  },
};
```

---

## 8. 预加载与预取

### Link 预取

```typescript
import Link from 'next/link';

// ✅ 自动预取（默认）
<Link href="/dashboard">Dashboard</Link>

// 禁用预取
<Link href="/heavy-page" prefetch={false}>
  Heavy Page
</Link>
```

### 预加载关键资源

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <link
          rel="preload"
          href="/fonts/custom.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 9. 客户端性能

### 避免大型客户端包

```typescript
// ❌ 不好 - 大型客户端组件
'use client';
import { HugeLibrary } from 'huge-library';

export default function Page() {
  return <HugeLibrary />;
}

// ✅ 好 - 动态导入
import dynamic from 'next/dynamic';

const HugeLibrary = dynamic(() => import('huge-library'), {
  ssr: false,
});
```

### 使用 React.memo

```typescript
'use client';
import { memo } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  // 昂贵的计算或渲染
  return <div>{data}</div>;
});
```

---

## 10. 数据库查询优化

### 并行查询

```typescript
// ❌ 串行 - 慢
const user = await db.users.findById(id);
const posts = await db.posts.findByUserId(id);

// ✅ 并行 - 快
const [user, posts] = await Promise.all([
  db.users.findById(id),
  db.posts.findByUserId(id),
]);
```

### 只查询需要的字段

```typescript
// ❌ 查询所有字段
const users = await db.select().from(users);

// ✅ 只查询需要的字段
const users = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
  })
  .from(users);
```

---

## 性能检测工具

### 1. Lighthouse

```bash
# Chrome DevTools
# Lighthouse 标签 → 分析页面
```

### 2. Web Vitals

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Next.js Speed Insights

```typescript
// 自动收集 Web Vitals
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
    // 发送到分析服务
  });
}
```

---

## 性能优化清单

### 图片

- ✅ 使用 next/image
- ✅ 设置正确的尺寸
- ✅ 关键图片使用 priority
- ✅ 使用 blur placeholder
- ✅ 配置远程图片域名

### 字体

- ✅ 使用 next/font
- ✅ 预加载关键字体
- ✅ 使用 font-display: swap
- ✅ 字体子集化

### 代码

- ✅ 默认使用 Server Components
- ✅ 动态导入大型组件
- ✅ 移除未使用的代码
- ✅ 分析打包大小

### 渲染

- ✅ 优先使用 SSG/ISR
- ✅ 使用 Streaming 和 Suspense
- ✅ 考虑 PPR（混合渲染）
- ✅ 避免瀑布式请求

### 缓存

- ✅ 配置合理的 revalidate
- ✅ 使用标签化缓存
- ✅ 按需重新验证
- ✅ 禁用不必要的缓存

---

## 快速参考

```typescript
// 图片优化
import Image from 'next/image';
<Image src="/hero.jpg" width={1200} height={600} priority />

// 字体优化
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

// 代码分割
import dynamic from 'next/dynamic';
const Heavy = dynamic(() => import('./Heavy'));

// 渲染优化
export const revalidate = 3600;  // ISR
export const dynamic = 'force-static';  // SSG

// 动态导入
const Component = dynamic(() => import('./Component'), {
  ssr: false,
  loading: () => <Loading />,
});
```

---

## 下一步

- [渲染模式](./rendering-modes.md) - 选择最优渲染策略
- [数据获取](./data-fetching.md) - 优化数据加载
- [Streaming](./streaming-suspense.md) - 流式渲染优化

---

**相关资源**
- [Next.js 优化文档](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
