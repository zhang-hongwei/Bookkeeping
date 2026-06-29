# Next.js 渲染模式完全指南

## 渲染模式概览

Next.js 提供多种渲染策略，每种都针对不同的使用场景优化。

| 模式 | 全称 | 执行时机 | 缓存 | SEO | 数据新鲜度 | 典型场景 |
|------|------|----------|------|-----|-----------|----------|
| **SSG** | Static Site Generation | 构建时 | ✅ CDN | ✅ 完美 | ❌ 过期 | 博客、文档、营销页 |
| **ISR** | Incremental Static Regeneration | 构建 + 定期 | ✅ 可更新 | ✅ 完美 | ⚡ 定时 | 新闻、电商产品列表 |
| **SSR** | Server-Side Rendering | 每次请求 | ❌ 否 | ✅ 完美 | ✅ 实时 | 用户仪表盘、个性化 |
| **PPR** | Partial Prerendering | 混合 | ✅+❌ 混合 | ✅ 完美 | ✅+⚡ 混合 | 产品详情（未来趋势） |
| **CSR** | Client-Side Rendering | 浏览器端 | ❌ 否 | ❌ 差 | ✅ 实时 | 管理后台、交互组件 |

---

## 1. SSG (Static Site Generation)

### 概念

在**构建时**生成 HTML，所有用户访问相同的预渲染页面。

### 特点

- ⚡ **极致性能** - 静态 HTML 文件，CDN 分发
- 💰 **成本低** - 无需服务器动态渲染
- 🎯 **SEO 完美** - 完整的 HTML 内容
- ❌ **数据陈旧** - 内容只在构建时更新

### 实现

```typescript
// app/blog/page.tsx
export default async function BlogPage() {
  // 构建时执行一次
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'force-cache',  // 强制缓存
  }).then(res => res.json());

  return (
    <div>
      <h1>博客</h1>
      {posts.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// 生成动态路由的静态页面
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(res => res.json());

  return posts.map((post: Post) => ({
    slug: post.slug,
  }));
}
```

### 使用场景

✅ **适合**:
- 博客文章
- 文档网站
- 营销页面
- Landing Page
- 内容很少变化的页面

❌ **不适合**:
- 用户个性化内容
- 实时数据展示
- 频繁更新的内容

---

## 2. ISR (Incremental Static Regeneration)

### 概念

构建时生成静态页面，但允许**定期重新生成**，无需完整重新构建。

### 特点

- ⚡ **快速响应** - 首次访问返回缓存版本
- 🔄 **定时更新** - 后台自动重新生成
- 💾 **节省资源** - 只在需要时重新生成
- ⚖️ **平衡性能和新鲜度**

### 实现

```typescript
// app/news/page.tsx
export default async function NewsPage() {
  const news = await fetch('https://api.example.com/news', {
    next: { revalidate: 60 },  // 每 60 秒重新验证
  }).then(res => res.json());

  return (
    <div>
      <h1>新闻</h1>
      {news.map((article: Article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

### ISR 工作流程

```
1. 用户请求 /news
   ↓
2. 返回缓存的静态页面（立即）
   ↓
3. 检查缓存是否过期（60秒）
   ↓
4. 如果过期：
   - 仍然返回旧页面给用户
   - 后台重新生成新页面
   ↓
5. 下次请求：返回新页面
```

### 按需重新验证

```typescript
// app/actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

// 重新验证特定路径
export async function revalidateNewsPage() {
  revalidatePath('/news');
  revalidatePath('/news/[id]', 'page');  // 重新验证动态路由
}

// 重新验证带标签的请求
export async function revalidateNewsByTag() {
  revalidateTag('news');  // 重新验证所有标记为 'news' 的请求
}
```

```typescript
// 使用标签
const news = await fetch('https://api.example.com/news', {
  next: {
    revalidate: 3600,  // 1 小时
    tags: ['news'],     // 添加标签
  },
});
```

### 使用场景

✅ **适合**:
- 新闻网站
- 电商产品列表
- 社交媒体动态
- 内容定期更新的网站

❌ **不适合**:
- 实时数据（股票、比分）
- 用户特定内容
- 安全敏感数据

---

## 3. SSR (Server-Side Rendering)

### 概念

在**每次请求**时在服务器上渲染页面，返回最新的 HTML。

### 特点

- 🎯 **数据实时** - 每次请求获取最新数据
- 👤 **个性化** - 可基于用户信息渲染
- 🔒 **安全** - 敏感数据不暴露给客户端
- 🐌 **较慢** - 每次请求都需要服务器处理

### 实现

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // 每次请求都执行
  const user = await getCurrentUser();
  const stats = await fetch('https://api.example.com/stats', {
    cache: 'no-store',  // 禁用缓存
  }).then(res => res.json());

  return (
    <div>
      <h1>欢迎, {user.name}</h1>
      <StatsDisplay stats={stats} />
    </div>
  );
}

// 或使用动态函数（自动变为 SSR）
export default async function DashboardPage() {
  const { cookies, headers } = await import('next/headers');

  const session = cookies().get('session');
  const userAgent = headers().get('user-agent');

  // 自动变为动态渲染
}
```

### 使用场景

✅ **适合**:
- 用户仪表盘
- 购物车
- 用户个人资料
- 搜索结果页
- 实时内容

❌ **不适合**:
- 静态内容
- 不需要 SEO 的页面
- 高流量页面（成本高）

---

## 4. PPR (Partial Prerendering) ⭐

### 概念

Next.js 14+ 引入的**实验性**渲染模式，在同一个路由中结合静态和动态渲染。

### PPR 如何工作

```
┌─────────────────────────────┐
│   Static Shell (立即加载)     │  ← 预渲染的静态外壳
│  ┌───────────────────────┐  │
│  │ Header (Static) ⚡     │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Dynamic Hole (流式)    │  │  ← 动态内容的"洞"
│  │ ╔═════════════════╗   │  │
│  │ ║ Loading...      ║   │  │  ← Suspense fallback
│  │ ╚═════════════════╝   │  │
│  │     ↓                  │  │
│  │ ┌─────────────────┐   │  │
│  │ │ 用户数据 (动态)  │   │  │  ← 流式替换
│  │ └─────────────────┘   │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Footer (Static) ⚡     │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### 启用 PPR

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    ppr: 'incremental',  // 渐进式采用
  },
};

export default nextConfig;
```

```typescript
// app/product/[id]/layout.tsx
export const experimental_ppr = true;  // 为这个路由启用 PPR

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
```

### PPR 实现示例

```typescript
// app/product/[id]/page.tsx
import { Suspense } from 'react';

export const experimental_ppr = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  // 静态产品信息 - 预渲染
  const product = await getProduct(id);

  return (
    <div>
      {/* 静态部分 - 立即显示 */}
      <ProductNav />

      <div className="product-container">
        {/* 静态产品信息 */}
        <div className="product-info">
          <h1>{product.name}</h1>
          <img src={product.image} alt={product.name} />
          <p>{product.description}</p>
        </div>

        {/* 动态价格 - Suspense 包裹 */}
        <Suspense fallback={<PriceSkeleton />}>
          <DynamicPricing productId={id} />
        </Suspense>

        {/* 动态库存 - Suspense 包裹 */}
        <Suspense fallback={<StockSkeleton />}>
          <DynamicStock productId={id} />
        </Suspense>

        {/* 动态评论 - Suspense 包裹 */}
        <Suspense fallback={<ReviewsSkeleton />}>
          <DynamicReviews productId={id} />
        </Suspense>
      </div>

      {/* 静态页脚 */}
      <ProductFooter />
    </div>
  );
}

// 动态组件
async function DynamicPricing({ productId }: { productId: string }) {
  const price = await fetch(`https://api.example.com/price/${productId}`, {
    cache: 'no-store',  // 动态获取
  }).then(res => res.json());

  return <div className="price">${price}</div>;
}
```

### PPR 的优势

1. **快速首屏** - 静态外壳立即加载
2. **并行加载** - 多个动态部分并行请求
3. **渐进式增强** - 静态内容先显示，动态内容逐步加载
4. **最佳 SEO** - 静态内容可被搜索引擎索引
5. **性能与新鲜度兼顾** - 结合两者优势

### 使用场景

✅ **适合**:
- 电商产品页（静态信息 + 动态价格/库存）
- 社交媒体主页（静态布局 + 动态动态）
- 仪表盘（静态图表 + 实时数据）
- 博客文章（静态内容 + 动态评论）

❌ **不适合**:
- 完全静态的页面（使用 SSG）
- 完全动态的页面（使用 SSR）
- 简单页面（增加复杂度）

---

## 5. CSR (Client-Side Rendering)

### 概念

在**浏览器端**使用 JavaScript 渲染内容。

### 特点

- ⚡ **交互性强** - 丰富的客户端逻辑
- 🎯 **实时更新** - 可频繁刷新数据
- ❌ **SEO 差** - 搜索引擎难以索引
- 🐌 **首屏慢** - 需要下载 JS 后才能渲染

### 实现

```typescript
// app/dashboard/client-stats.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ClientStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!stats) return <ErrorMessage />;

  return <StatsDisplay stats={stats} />;
}
```

### 使用场景

✅ **适合**:
- 管理后台
- 交互式工具
- 实时聊天
- 图表和可视化
- 不需要 SEO 的页面

❌ **不适合**:
- 需要 SEO 的页面
- 首屏性能关键的页面
- 内容型网站

---

## 渲染模式选择指南

### 决策树

```
是否需要 SEO？
├─ 否 → CSR（客户端渲染）
│
└─ 是 → 内容是否频繁变化？
    ├─ 否 → SSG（静态生成）
    │
    ├─ 定期变化 → ISR（增量静态再生）
    │
    ├─ 每次请求都变化 → 是否可以部分静态？
    │   ├─ 是 → PPR（部分预渲染）
    │   └─ 否 → SSR（服务端渲染）
    │
    └─ 用户特定 → SSR（服务端渲染）
```

### 场景对照表

| 场景 | 推荐模式 | 原因 |
|------|---------|------|
| 博客文章 | SSG | 内容静态，需要 SEO |
| 文档网站 | SSG | 内容静态，构建时生成 |
| 新闻网站 | ISR | 定期更新，需要 SEO |
| 电商产品列表 | ISR | 定期更新价格/库存 |
| 产品详情页 | PPR | 静态信息 + 动态价格 |
| 用户仪表盘 | SSR | 用户特定，实时数据 |
| 购物车 | SSR | 用户特定，需要最新 |
| 搜索结果 | SSR | 动态查询，需要 SEO |
| 管理后台 | CSR | 交互丰富，无需 SEO |
| 实时聊天 | CSR | 实时更新，无需 SEO |

---

## Next.js 16+ 缓存新模型

### 默认行为变化

**Next.js 15 及之前**:
- 默认缓存所有内容
- 需要显式 `cache: 'no-store'` 禁用缓存

**Next.js 16+**:
- **默认动态渲染** - 所有内容默认不缓存
- 需要显式 `"use cache"` 启用缓存
- 更可预测的行为

### 使用 `"use cache"` 指令

```typescript
// 组件级别缓存
'use cache';

export default async function CachedComponent() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}

// 页面级别缓存
'use cache';

export default async function CachedPage() {
  return <div>缓存的页面</div>;
}

// 函数级别缓存
async function getCachedData() {
  'use cache';
  return await fetch('https://api.example.com/data');
}
```

### 新缓存 API

```typescript
import { updateTag, revalidateTag, refresh } from 'next/cache';

// updateTag: 立即更新缓存（读取-写入一致性）
export async function updateProfile(data: ProfileData) {
  await db.updateProfile(data);
  updateTag('user-profile');  // 立即看到更新
}

// revalidateTag: 后台重新验证（SWR 模式）
export async function refreshCache() {
  revalidateTag('blog-posts');  // 标记为陈旧，后台更新
}

// refresh: 刷新非缓存数据
export async function markAsRead(id: string) {
  await db.markAsRead(id);
  refresh();  // 只刷新动态部分
}
```

---

## 性能对比

### 加载时间对比

```
SSG:     [===] 150ms   (最快)
ISR:     [====] 200ms  (快)
PPR:     [=====] 250ms (较快，混合)
SSR:     [=======] 400ms (慢)
CSR:     [=========] 600ms (最慢)
```

### 服务器成本对比

```
SSG:     $          (最低 - 静态文件)
ISR:     $$         (低 - 偶尔重新生成)
PPR:     $$$        (中等 - 部分动态)
SSR:     $$$$$      (高 - 每次请求)
CSR:     $$         (低 - 客户端渲染)
```

---

## 混合使用策略

实际项目中，通常组合使用多种渲染模式：

```
my-app/
├── (marketing)/         # SSG - 营销页面
│   ├── page.tsx         → SSG
│   ├── about/           → SSG
│   └── pricing/         → SSG
│
├── blog/                # ISR - 博客
│   ├── page.tsx         → ISR (revalidate: 3600)
│   └── [slug]/          → ISR
│
├── products/            # PPR - 产品页
│   └── [id]/            → PPR (静态信息 + 动态价格)
│
└── (app)/               # SSR/CSR - 应用功能
    ├── dashboard/       → SSR (用户特定)
    └── settings/        → SSR + CSR (混合)
```

---

## 最佳实践

### 1. 优先使用静态渲染

```typescript
// ✅ 默认静态
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <Content data={data} />;
}
```

### 2. 明确标记动态部分

```typescript
// ✅ 使用 Suspense 包裹动态内容
export default function Page() {
  return (
    <div>
      <StaticContent />
      <Suspense fallback={<Loading />}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}
```

### 3. 合理使用 ISR

```typescript
// ✅ 根据更新频率设置 revalidate
const data = await fetch('https://api.example.com/data', {
  next: {
    revalidate: 3600,  // 1小时 - 新闻
    // revalidate: 86400, // 24小时 - 博客
    // revalidate: 60,    // 1分钟 - 股票
  },
});
```

### 4. 避免过度优化

```typescript
// ❌ 不需要的复杂性
export const experimental_ppr = true;
export default function SimplePage() {
  return <div>简单静态页面</div>;  // 不需要 PPR
}

// ✅ 简单就好
export default function SimplePage() {
  return <div>简单静态页面</div>;  // 默认 SSG 足够
}
```

---

## 常见陷阱

### ❌ 错误 1：误用 CSR

```typescript
// ❌ 不必要的客户端渲染
'use client';
export default function BlogPost({ post }: { post: Post }) {
  return <Article post={post} />;  // 没有交互，不需要 'use client'
}

// ✅ 使用 Server Component
export default function BlogPost({ post }: { post: Post }) {
  return <Article post={post} />;
}
```

### ❌ 错误 2：ISR 设置过短

```typescript
// ❌ 过于频繁的重新验证
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 1 },  // 1秒 - 过于频繁！
});

// ✅ 合理的重新验证间隔
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 },  // 1分钟 - 合理
});
```

### ❌ 错误 3：静态页面中使用动态函数

```typescript
// ❌ 会导致整个页面变为动态
export default async function Page() {
  const { cookies } = await import('next/headers');
  const user = cookies().get('user');  // 使用了动态函数
  const staticData = await getStaticData();  // 这部分也会变动态！

  return <PageContent data={staticData} user={user} />;
}

// ✅ 分离静态和动态部分
export default function Page() {
  return (
    <>
      <StaticContent />
      <Suspense fallback={<Loading />}>
        <DynamicUserContent />
      </Suspense>
    </>
  );
}
```

---

## 快速参考

```typescript
// SSG - 静态生成
const data = await fetch(url, { cache: 'force-cache' });

// ISR - 增量静态再生
const data = await fetch(url, { next: { revalidate: 3600 } });

// SSR - 服务端渲染
const data = await fetch(url, { cache: 'no-store' });

// PPR - 部分预渲染
export const experimental_ppr = true;
<Suspense fallback={<Loading />}>
  <DynamicContent />
</Suspense>

// CSR - 客户端渲染
'use client';
useEffect(() => {
  fetch(url).then(res => res.json()).then(setData);
}, []);

// Next.js 16+ 缓存
'use cache';  // 启用缓存
updateTag('tag');  // 立即更新
revalidateTag('tag');  // 后台更新
```

---

## 下一步

- [Server/Client Components](./server-client-components.md) - 组件架构
- [数据获取策略](./data-fetching.md) - 深入数据获取
- [Streaming 与 Suspense](./streaming-suspense.md) - 流式渲染

---

**相关资源**
- [Next.js Rendering 文档](https://nextjs.org/docs/app/building-your-application/rendering)
- [Partial Prerendering](https://nextjs.org/learn/dashboard-app/partial-prerendering)
- [Caching in Next.js](https://nextjs.org/docs/app/building-your-application/caching)
