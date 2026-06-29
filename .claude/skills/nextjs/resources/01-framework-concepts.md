# Next.js 框架概念

## 什么是 Next.js？

Next.js 是基于 React 的全栈框架，由 Vercel 开发和维护，提供生产级应用所需的所有功能。

### 核心特性

1. **混合渲染** - 在同一应用中支持多种渲染策略
2. **文件系统路由** - 基于文件结构自动生成路由
3. **零配置** - 开箱即用的 TypeScript、ESLint、Tailwind CSS 支持
4. **自动优化** - 图片、字体、脚本的自动优化
5. **全栈能力** - API Routes、Server Actions、数据库集成
6. **边缘计算** - 支持 Edge Runtime 部署

---

## Next.js vs React

| 特性 | React | Next.js |
|------|-------|---------|
| **类型** | UI 库 | 全栈框架 |
| **路由** | 需要 React Router | 内置文件系统路由 |
| **渲染** | 仅客户端 | SSG/ISR/SSR/PPR/CSR |
| **API** | 需要单独后端 | 内置 API Routes |
| **优化** | 手动配置 | 自动优化 |
| **部署** | 需要额外配置 | 优化的部署流程 |

### 代码对比

**React (with React Router)**
```jsx
// 需要手动配置路由
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog/:id" element={<BlogPost />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Next.js (App Router)**
```typescript
// 自动基于文件结构生成路由
app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
└── blog/
    └── [id]/
        └── page.tsx      → /blog/:id
```

---

## Next.js vs Vite

| 特性 | Vite | Next.js |
|------|------|---------|
| **定位** | 构建工具 | 全栈框架 |
| **开发体验** | 极快的 HMR | 快速的 Fast Refresh |
| **生产构建** | Rollup | Turbopack (Next.js 16+) |
| **SSR 支持** | 需要插件 | 原生支持 |
| **路由** | 需要第三方库 | 内置路由系统 |
| **API** | 不支持 | 原生支持 |
| **适用场景** | SPA、库开发 | 全栈应用、SEO 优先 |

---

## Next.js 的核心价值

### 1. 性能优化自动化

```typescript
import Image from 'next/image';

// ✅ 自动优化：
// - 响应式图片
// - 懒加载
// - 现代格式 (WebP, AVIF)
// - 占位符
<Image
  src="/hero.jpg"
  width={800}
  height={600}
  alt="Hero"
  priority  // 预加载关键图片
/>
```

### 2. 灵活的渲染策略

```typescript
// 静态生成 - 营销页面
export default async function MarketingPage() {
  const content = await fetchContent();
  return <MarketingContent data={content} />;
}

// 服务端渲染 - 用户仪表盘
export default async function Dashboard() {
  const user = await getCurrentUser();  // 每次请求都执行
  return <DashboardUI user={user} />;
}

// 混合渲染 - 产品页面
export default function ProductPage() {
  return (
    <>
      {/* 静态部分 */}
      <ProductInfo />

      {/* 动态部分 */}
      <Suspense fallback={<Loading />}>
        <DynamicPricing />
      </Suspense>
    </>
  );
}
```

### 3. 全栈开发一体化

```typescript
// Server Actions - 无需创建 API 端点
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  const post = await db.posts.create({ title });
  revalidatePath('/blog');
  return { success: true, post };
}

// 在客户端组件中使用
'use client';
export function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">创建</button>
    </form>
  );
}
```

---

## 何时使用 Next.js？

### ✅ 适合 Next.js

- **内容驱动的网站** - 博客、文档、新闻网站
- **电商平台** - 产品列表、详情页、购物车
- **SaaS 应用** - 用户仪表盘、管理后台
- **营销网站** - Landing Page、公司官网
- **需要 SEO 的应用** - 任何需要搜索引擎可见性的网站

### ❌ 不太适合 Next.js

- **纯客户端应用** - 不需要 SSR 的工具类应用
- **实时协作工具** - WebSocket 密集型应用（虽然可以，但不是最优选择）
- **静态资源服务** - 简单的静态文件托管
- **组件库开发** - 纯 UI 组件库（使用 Vite 更合适）

---

## Next.js 版本演进

### Pages Router (Next.js 12 及之前)

```typescript
// pages/blog/[id].tsx
export async function getStaticProps({ params }) {
  const post = await fetchPost(params.id);
  return { props: { post } };
}

export default function BlogPost({ post }) {
  return <Article post={post} />;
}
```

### App Router (Next.js 13+)

```typescript
// app/blog/[id]/page.tsx
export default async function BlogPost({ params }) {
  const post = await fetchPost(params.id);
  return <Article post={post} />;
}
```

**主要改进**：
- 更简洁的数据获取语法
- Server Components 默认
- 嵌套布局支持
- 流式渲染原生支持
- 更好的代码分割

---

## 快速开始

### 创建新项目

```bash
# 使用官方脚手架
npx create-next-app@latest my-app

# 或使用模板
npx create-next-app@latest --example blog-starter
```

### 项目结构

```
my-app/
├── app/                    # App Router 目录
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   └── api/                # API 路由
├── public/                 # 静态资源
├── components/             # 共享组件
├── lib/                    # 工具函数
├── styles/                 # 全局样式
├── next.config.ts          # Next.js 配置
├── package.json
└── tsconfig.json
```

---

## 核心概念预览

### 1. 文件系统路由

```
app/
├── page.tsx                → /
├── about/page.tsx          → /about
├── blog/
│   ├── page.tsx            → /blog
│   └── [slug]/
│       └── page.tsx        → /blog/[slug]
└── (marketing)/            # Route Group (不影响 URL)
    └── pricing/
        └── page.tsx        → /pricing
```

### 2. Server 与 Client Components

```typescript
// Server Component (默认)
export default async function Page() {
  const data = await fetchData();  // 服务端执行
  return <ServerUI data={data} />;
}

// Client Component (需要交互)
'use client';
export default function InteractiveButton() {
  const [count, setCount] = useState(0);  // 客户端状态
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 3. 数据获取

```typescript
// 静态数据（构建时）
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
});

// 动态数据（每次请求）
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});

// 增量静态再生（定时更新）
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }  // 每小时重新验证
});
```

---

## 学习路径建议

### 第一阶段：基础概念
1. 理解文件系统路由
2. 掌握 Server/Client Components 区别
3. 学习基本的数据获取

### 第二阶段：渲染优化
1. 深入理解 SSG/ISR/SSR
2. 学习 Streaming 和 Suspense
3. 探索 PPR (Partial Prerendering)

### 第三阶段：全栈开发
1. API Routes 和 Server Actions
2. 表单处理和数据变更
3. 缓存策略和性能优化

### 第四阶段：生产部署
1. 环境变量管理
2. 错误处理和监控
3. 部署到 Vercel 或其他平台

---

## 常见问题

### Q: 我需要学习 React 才能使用 Next.js 吗？

A: 是的，Next.js 是基于 React 的。你需要了解 React 的基础概念（组件、props、状态、hooks）。

### Q: App Router 和 Pages Router 哪个更好？

A: App Router 是 Next.js 的未来方向，提供更好的性能和开发体验。新项目建议使用 App Router。

### Q: Next.js 可以用于构建 API 吗？

A: 可以。Next.js 提供 API Routes 和 Server Actions，适合构建中小型 API。对于复杂的后端逻辑，建议使用专门的后端框架。

### Q: Next.js 的性能如何？

A: Next.js 通过自动代码分割、图片优化、边缘缓存等技术，可以实现出色的性能。关键是选择合适的渲染策略。

---

## 下一步

- [渲染模式详解](./rendering-modes.md) - 深入理解 SSG/ISR/SSR/PPR/CSR
- [路由系统](./routing-system.md) - 掌握 Next.js 的路由机制
- [目录结构](./directory-structure.md) - 理解项目组织最佳实践

---

**相关资源**
- [Next.js 官方文档](https://nextjs.org/docs)
- [React 官方文档](https://react.dev)
- [Vercel 部署文档](https://vercel.com/docs)
