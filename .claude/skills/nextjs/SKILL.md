---
name: nextjs
version: 2.0.0
description: Next.js 16 完整开发指南，涵盖框架概念、渲染模式、路由系统、数据获取、性能优化等核心主题
priority: high
dependencies: [frontend-dev]
triggers:
  keywords: [nextjs, next.js, server component, client component, app router, use client, page.tsx, layout.tsx, proxy.ts, cache components, use cache, ppr, streaming, suspense]
  files: ["app/**/*.tsx", "app/**/*.ts", "next.config.js", "next.config.ts", "proxy.ts"]
  intents: ["create page", "server component", "client component", "app router", "middleware", "caching", "rendering", "data fetching"]
---

# Next.js Development Skill

> Next.js 16 完整开发指南 - 从基础概念到高级优化

## 📚 文档索引

本技能文档包含 Next.js 开发的完整知识体系，按主题组织：

### 🎯 一、基础认知类

理解 Next.js 的核心运行机制：

1. **[框架概念](resources/01-framework-concepts.md)** - Next.js 是什么，与 React/Vite 的区别，核心价值
2. **[路由系统](resources/02-routing-system.md)** - 文件系统路由、动态路由、Route Groups、导航
3. **[目录结构](resources/03-directory-structure.md)** - 标准项目结构、特殊文件、配置管理
4. **[渲染模式](resources/04-rendering-modes.md)** - SSG/ISR/SSR/PPR/CSR 完整对比与选择指南

### ⚙️ 二、渲染与数据获取类

掌握 Next.js 的核心能力：

5. **[数据获取策略](resources/05-data-fetching.md)** - fetch API、Server Actions、Route Handlers、缓存重新验证
6. **[Streaming 与 Suspense](resources/06-streaming-suspense.md)** - 流式渲染、加载状态、Skeleton 设计

### 🚀 三、性能与优化类

7. **[性能优化](resources/07-performance-optimization.md)** - 图片/字体优化、代码分割、缓存策略、Turbopack
8. **[Runtime 与 Edge](resources/08-runtime-and-edge.md)** - Node.js Runtime、Edge Runtime、运行时选择与限制
9. **[Middleware 与 Proxy](resources/09-middleware-and-proxy.md)** - 中间件模式、请求拦截、proxy.ts 配置

### 🔧 四、配置与生产部署类

10. **[Metadata 与 SEO](resources/10-metadata-and-seo.md)** - 元数据 API、OpenGraph、Twitter Cards、结构化数据、SEO 最佳实践
11. **[配置与环境管理](resources/11-configuration-and-env.md)** - next.config.ts、环境变量、Turbopack、安全配置
12. **[部署与 CI/CD](resources/12-deployment-and-ci.md)** - Vercel 部署、Docker 容器化、GitHub Actions、监控与运维

---

## 🎯 核心原则

### 1. 默认 Server Components
除非需要交互，否则使用 Server Components

### 2. Client Components 标记边界
用 `"use client"` 标记，所有导入和子组件自动成为客户端

### 3. 数据序列化
Server → Client 传递的 props 必须可序列化（不能传函数）

### 4. 环境隔离
Server 端密钥安全，Client 端只能访问 `NEXT_PUBLIC_*` 变量

### 5. 缓存显式化 (Next.js 16+)
- 默认动态渲染：所有代码在请求时执行
- 显式缓存：使用 `"use cache"` 指令
- 精确控制：新的缓存 API (`updateTag`, `refresh`)

---

## 📝 快速开始

### 何时使用 Server Components

✅ **适合**:
- 数据获取（数据库、API）
- 使用敏感信息（API 密钥、tokens）
- 减少客户端 JavaScript 包
- 静态内容渲染
- SEO 友好内容

```typescript
// app/users/page.tsx - Server Component
export default async function UsersPage() {
  // ✅ 直接访问数据库
  const users = await db.select().from(usersTable);

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### 何时使用 Client Components

✅ **适合**:
- 交互（`onClick`, `onChange`, `useState`, `useEffect`）
- 浏览器 API（`localStorage`, `window`, `navigator`）
- 自定义 hooks
- Context providers
- 第三方交互式组件库

```typescript
// components/InteractiveButton.tsx - Client Component
"use client";

import { useState } from 'react';

export default function InteractiveButton() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      点击了 {count} 次
    </button>
  );
}
```

---

## 🏗️ 推荐模式：Server 外壳 + Client 交互

```typescript
// app/dashboard/page.tsx - Server Component
export default async function DashboardPage() {
  // Server 端获取数据
  const stats = await getStats();

  return (
    <div>
      {/* 静态内容 - 保持 Server Component */}
      <StaticHeader title="Dashboard" />

      {/* 交互内容 - 使用 Client Component */}
      <InteractiveChart initialData={stats} />

      {/* 静态页脚 */}
      <StaticFooter />
    </div>
  );
}

// components/InteractiveChart.tsx - Client Component
"use client";

export default function InteractiveChart({ initialData }: Props) {
  const [data, setData] = useState(initialData);

  return <Chart data={data} onUpdate={handleUpdate} />;
}
```

---

## 🌐 渲染模式速查

| 模式 | 触发方式 | 使用场景 |
|------|---------|----------|
| **SSG** | `cache: 'force-cache'` | 博客、文档、营销页 |
| **ISR** | `next: { revalidate: 3600 }` | 新闻、电商产品列表 |
| **SSR** | `cache: 'no-store'` | 用户仪表盘、实时内容 |
| **PPR** | `experimental_ppr = true` + Suspense | 混合型页面（静态+动态） |
| **CSR** | `'use client'` + useEffect | 交互组件、管理后台 |

详细说明请参阅 [渲染模式完整指南](resources/04-rendering-modes.md)

---

## 📡 数据获取速查

### Server Component 中

```typescript
// 静态生成
const data = await fetch(url, { cache: 'force-cache' });

// 增量静态再生
const data = await fetch(url, { next: { revalidate: 3600 } });

// 服务端渲染
const data = await fetch(url, { cache: 'no-store' });

// Next.js 16+ Cache Components
"use cache";
async function CachedComponent() {
  const data = await fetch('/api/data');
  return <div>{data}</div>;
}
```

### Server Actions

```typescript
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;

  await db.posts.create({ title });

  revalidatePath('/blog');

  return { success: true };
}
```

### Client Component 中

```typescript
'use client';
import useSWR from 'swr';

export default function UserList() {
  const { data, error } = useSWR('/api/users', fetcher);

  if (error) return <div>加载失败</div>;
  if (!data) return <Loading />;

  return <ul>{data.map(user => <UserItem key={user.id} user={user} />)}</ul>;
}
```

详细说明请参阅 [数据获取策略](resources/05-data-fetching.md)

---

## 🧩 PPR (Partial Prerendering) - 混合渲染 ⭐

PPR 是 Next.js 14+ 引入的实验性渲染模式，结合静态和动态渲染的优势。

### 启用 PPR

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    ppr: 'incremental',
  },
};

// app/dashboard/layout.tsx
export const experimental_ppr = true;
```

### PPR 实战示例

```typescript
// app/product/[id]/page.tsx
import { Suspense } from 'react';

export const experimental_ppr = true;

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <div>
      {/* 静态部分 - 立即显示 */}
      <h1>{product.name}</h1>
      <img src={product.image} alt={product.name} />

      {/* 动态价格 - 流式加载 */}
      <Suspense fallback={<PriceSkeleton />}>
        <DynamicPricing productId={id} />
      </Suspense>

      {/* 动态评论 - 流式加载 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <DynamicReviews productId={id} />
      </Suspense>
    </div>
  );
}
```

详细说明请参阅 [渲染模式 - PPR 章节](resources/04-rendering-modes.md#4-ppr-partial-prerendering-)

---

## 🆕 Next.js 16 新特性

### Cache Components

显式缓存系统，替代之前的隐式缓存：

```typescript
// 页面级别缓存
"use cache";
export default async function CachedPage() {
  return <div>缓存的内容</div>;
}

// 组件级别缓存
async function CachedUserList() {
  "use cache";
  const users = await db.select().from(users);
  return <UserList users={users} />;
}
```

### 新的缓存 API

```typescript
import { revalidateTag, updateTag, refresh } from 'next/cache';

// updateTag: 立即更新，读取-写入一致性
export async function updateProfile(data: ProfileData) {
  await db.updateProfile(data);
  updateTag('user-profile');  // 立即看到更新
}

// revalidateTag: 后台重新验证，SWR 模式
export async function refreshCache() {
  revalidateTag('blog-posts');
}

// refresh: 只刷新非缓存数据
export async function markNotificationRead(id: string) {
  await db.markAsRead(id);
  refresh();
}
```

### proxy.ts (替代 middleware.ts)

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.rewrite(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}
```

---

## ⚡ 性能优化

### 图片优化

```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  priority  // 预加载关键图片
  placeholder="blur"
  alt="Hero"
/>
```

### 字体优化

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 动态导入

```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

详细说明请参阅 [性能优化指南](resources/07-performance-optimization.md)

---

## 🔒 环境变量安全

```typescript
// ✅ Server Component
export default async function ServerPage() {
  const secretKey = process.env.API_KEY;          // ✅ 可用
  const publicKey = process.env.NEXT_PUBLIC_KEY;  // ✅ 可用
}

// ❌ Client Component
"use client";
export default function ClientComponent() {
  const secretKey = process.env.API_KEY;          // ❌ undefined!
  const publicKey = process.env.NEXT_PUBLIC_KEY;  // ✅ 可用
}
```

---

## ⚠️ 常见陷阱

### ❌ 错误 1：Server Component 使用 hooks

```typescript
// ❌ 错误
export default function ServerPage() {
  const [state, setState] = useState();  // 编译错误！
}

// ✅ 正确
"use client";
export default function ClientPage() {
  const [state, setState] = useState();
}
```

### ❌ 错误 2：传递不可序列化 props

```typescript
// ❌ 错误
export default function ServerPage() {
  const handleClick = () => console.log('clicked');
  return <ClientComponent onClick={handleClick} />;  // 错误！
}

// ✅ 正确 - 在 Client Component 中定义函数
export default function ServerPage() {
  return <ClientComponent />;
}

"use client";
function ClientComponent() {
  const handleClick = () => console.log('clicked');
  return <button onClick={handleClick}>Click</button>;
}
```

### ❌ 错误 3：Client 访问服务端环境变量

```typescript
// ❌ 错误
"use client";
export default function ClientComponent() {
  const secret = process.env.SECRET_KEY;  // undefined!
}

// ✅ 正确 - 通过 API Route 访问
"use client";
export default function ClientComponent() {
  const { data } = useSWR('/api/secret-data');
}
```

---

## ✅ 开发检查清单

### 基本选择

- ✅ **是否需要交互？** → Client Component
- ✅ **是否需要数据获取？** → Server Component
- ✅ **是否使用敏感信息？** → Server Component 或 API Route
- ✅ **props 是否可序列化？** → 不能传函数、Symbol
- ✅ **包大小是否合理？** → 考虑动态导入
- ✅ **是否需要 SEO？** → Server Component
- ✅ **是否使用浏览器 API？** → Client Component

### Next.js 16+ 特性

- ✅ **内容是否应该缓存？** → 考虑 `"use cache"`
- ✅ **需要立即看到更新？** → 使用 `updateTag()`
- ✅ **可以容忍延迟更新？** → 使用 `revalidateTag()`
- ✅ **需要网络拦截？** → 使用 `proxy.ts`
- ✅ **异步参数？** → 确保 `await params, await searchParams`

---

## 🚀 快速参考

```typescript
// ====== 组件类型 ======
// Server Component（默认）
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component
"use client";
export default function Page() {
  const [state, setState] = useState();
  return <button onClick={() => setState(val)}>Click</button>;
}

// ====== 渲染模式 ======
// SSG
const data = await fetch(url, { cache: 'force-cache' });

// ISR
const data = await fetch(url, { next: { revalidate: 3600 } });

// SSR
const data = await fetch(url, { cache: 'no-store' });

// PPR
export const experimental_ppr = true;
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>

// ====== Next.js 16+ ======
// 缓存
"use cache";
export default async function CachedPage() {
  return <div>Cached</div>;
}

// 缓存 API
updateTag('user-profile');      // 立即更新
revalidateTag('blog-posts');    // 后台更新
refresh();                       // 刷新动态数据

// ====== 性能优化 ======
// 图片
import Image from 'next/image';
<Image src="/hero.jpg" width={1200} height={600} priority />

// 字体
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

// 动态导入
import dynamic from 'next/dynamic';
const Heavy = dynamic(() => import('./Heavy'));
```

---

## 📚 深入学习

### 核心主题

1. **[框架概念](resources/01-framework-concepts.md)** - 理解 Next.js 的本质与价值
2. **[路由系统](resources/02-routing-system.md)** - 掌握文件系统路由、动态路由、导航
3. **[目录结构](resources/03-directory-structure.md)** - 标准项目组织与配置
4. **[渲染模式](resources/04-rendering-modes.md)** - SSG/ISR/SSR/PPR/CSR 完整指南
5. **[数据获取](resources/05-data-fetching.md)** - fetch、Server Actions、缓存策略
6. **[Streaming 与 Suspense](resources/06-streaming-suspense.md)** - 流式渲染与加载状态
7. **[性能优化](resources/07-performance-optimization.md)** - 图片、字体、代码分割
8. **[Runtime 与 Edge](resources/08-runtime-and-edge.md)** - Node.js 与 Edge Runtime
9. **[Middleware 与 Proxy](resources/09-middleware-and-proxy.md)** - 请求拦截与代理配置
10. **[Metadata 与 SEO](resources/10-metadata-and-seo.md)** - SEO 优化与元数据管理
11. **[配置与环境](resources/11-configuration-and-env.md)** - Next.js 配置与环境变量
12. **[部署与 CI/CD](resources/12-deployment-and-ci.md)** - 生产部署与持续集成

### 推荐学习路径

**第一阶段：基础概念**
- 理解文件系统路由
- 掌握 Server/Client Components 区别
- 学习基本的数据获取

**第二阶段：渲染优化**
- 深入理解 SSG/ISR/SSR
- 学习 Streaming 和 Suspense
- 探索 PPR (Partial Prerendering)

**第三阶段：全栈开发**
- API Routes 和 Server Actions
- 表单处理和数据变更
- 缓存策略和性能优化

**第四阶段：生产部署**
- 环境变量管理
- 错误处理和监控
- 部署到 Vercel 或其他平台

---

## 📚 相关资源

### 技能文件
- [frontend-dev skill](../frontend-dev/SKILL.md) - React/MUI 前端开发规范
- [backend-dev skill](../backend-dev/SKILL.md) - API Routes 和服务层开发
- [database-dev skill](../database-dev/SKILL.md) - Drizzle ORM 和数据库开发

### 官方文档
- [Next.js 官方文档](https://nextjs.org/docs)
- [App Router 指南](https://nextjs.org/docs/app)
- [Partial Prerendering](https://nextjs.org/learn/dashboard-app/partial-prerendering)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

**版本**: 2.0.0
**最后更新**: 2025-10-31
**状态**: ✅ 生产就绪
**Next.js 版本**: 16+
