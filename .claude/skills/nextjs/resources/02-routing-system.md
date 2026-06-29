# Next.js 路由系统

## 文件系统路由

Next.js 使用文件系统作为路由的基础，app 目录中的文件夹结构直接映射到 URL 路径。

### 基本路由

```
app/
├── page.tsx                → /
├── about/
│   └── page.tsx            → /about
├── blog/
│   ├── page.tsx            → /blog
│   └── [slug]/
│       └── page.tsx        → /blog/[slug]
└── dashboard/
    ├── page.tsx            → /dashboard
    ├── settings/
    │   └── page.tsx        → /dashboard/settings
    └── analytics/
        └── page.tsx        → /dashboard/analytics
```

---

## 特殊文件

Next.js 定义了一组特殊文件来构建应用的不同部分：

| 文件 | 用途 | 必需 |
|------|------|------|
| `page.tsx` | 路由的唯一 UI，使路径可公开访问 | ✅ 是 |
| `layout.tsx` | 共享的 UI 布局，在导航时保持状态 | ❌ 否 |
| `template.tsx` | 类似 layout，但在导航时重新创建 | ❌ 否 |
| `loading.tsx` | 加载 UI，使用 Suspense 包裹 | ❌ 否 |
| `error.tsx` | 错误 UI，使用 Error Boundary 包裹 | ❌ 否 |
| `not-found.tsx` | 404 Not Found UI | ❌ 否 |

### 文件层级结构

```typescript
app/
├── layout.tsx              # 根布局（必需）
├── page.tsx                # 首页
├── loading.tsx             # 首页加载状态
├── error.tsx               # 首页错误处理
└── dashboard/
    ├── layout.tsx          # Dashboard 布局
    ├── page.tsx            # /dashboard
    ├── loading.tsx         # Dashboard 加载状态
    └── settings/
        └── page.tsx        # /dashboard/settings
```

---

## 动态路由

### 单个动态段

```
app/blog/[slug]/page.tsx    → /blog/hello-world
                            → /blog/nextjs-guide
```

```typescript
// app/blog/[slug]/page.tsx
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return <Article post={post} />;
}

// 生成静态路径（SSG）
export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

### 多个动态段

```
app/shop/[category]/[product]/page.tsx
→ /shop/clothing/t-shirt
→ /shop/electronics/laptop
```

```typescript
interface PageProps {
  params: Promise<{
    category: string;
    product: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { category, product } = await params;

  return <Product category={category} product={product} />;
}
```

### Catch-all 段

```
app/docs/[...slug]/page.tsx → /docs/a
                            → /docs/a/b
                            → /docs/a/b/c
```

```typescript
interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;  // ['a', 'b', 'c']
  const doc = await getDocByPath(slug.join('/'));

  return <Documentation doc={doc} />;
}
```

### 可选 Catch-all 段

```
app/shop/[[...slug]]/page.tsx → /shop
                              → /shop/clothing
                              → /shop/clothing/t-shirt
```

---

## Route Groups

使用括号 `()` 创建路由组，不影响 URL 路径，用于组织代码：

```
app/
├── (marketing)/            # 营销页面组
│   ├── layout.tsx          # 营销布局
│   ├── page.tsx            → /
│   ├── about/
│   │   └── page.tsx        → /about
│   └── contact/
│       └── page.tsx        → /contact
│
└── (shop)/                 # 商店页面组
    ├── layout.tsx          # 商店布局
    ├── products/
    │   └── page.tsx        → /products
    └── cart/
        └── page.tsx        → /cart
```

**使用场景**：
1. **不同布局** - 不同区域使用不同的布局
2. **逻辑分组** - 按功能组织路由，便于维护
3. **多个根布局** - 创建多个根级布局

```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}

// app/(shop)/layout.tsx
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ShopNav />
      <main>{children}</main>
      <ShopFooter />
    </div>
  );
}
```

---

## 并行路由 (Parallel Routes)

使用 `@folder` 语法同时渲染多个页面：

```
app/
└── dashboard/
    ├── layout.tsx
    ├── page.tsx
    ├── @analytics/
    │   └── page.tsx
    └── @team/
        └── page.tsx
```

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div>
      <div>{children}</div>
      <div className="grid grid-cols-2 gap-4">
        <div>{analytics}</div>
        <div>{team}</div>
      </div>
    </div>
  );
}
```

**使用场景**：
- 条件渲染（根据用户权限显示不同内容）
- 模态框和弹出层
- 复杂的仪表盘布局

---

## 拦截路由 (Intercepting Routes)

拦截导航并在当前布局中显示内容：

```
app/
├── feed/
│   └── page.tsx
├── photo/
│   └── [id]/
│       └── page.tsx
└── feed/
    └── (..)photo/          # 拦截 /photo/[id]
        └── [id]/
            └── page.tsx
```

**拦截约定**：
- `(.)` - 匹配同级
- `(..)` - 匹配上一级
- `(..)(..)` - 匹配上两级
- `(...)` - 匹配根目录

```typescript
// app/feed/(..)photo/[id]/page.tsx
export default function PhotoModal({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <PhotoDetail id={params.id} />
    </Modal>
  );
}
```

**使用场景**：
- 图片画廊模态框
- 登录弹窗
- 购物车侧边栏

---

## Layouts

布局是多个页面之间共享的 UI，在导航时保持状态。

### 根布局（必需）

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### 嵌套布局

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
```

**Layout 特性**：
- ✅ 可以嵌套
- ✅ 在导航时保持状态
- ✅ 可以获取数据
- ❌ 不能访问路由参数（使用 page 代替）

---

## Templates

Template 类似 Layout，但在导航时重新创建：

```typescript
// app/dashboard/template.tsx
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AnimatedTransition>
        {children}
      </AnimatedTransition>
    </div>
  );
}
```

**Template vs Layout**：

| 特性 | Layout | Template |
|------|--------|----------|
| 导航时状态 | 保持 | 重置 |
| 重新挂载 | 否 | 是 |
| 重新执行 effects | 否 | 是 |
| 使用场景 | 持久 UI | 动画、进入/退出效果 |

---

## 元数据和 SEO

### 静态元数据

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Post',
  description: 'Read our latest blog post',
};

export default function BlogPost() {
  return <Article />;
}
```

### 动态元数据

```typescript
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}
```

---

## 导航

### Link 组件

```typescript
import Link from 'next/link';

// 基本用法
<Link href="/about">关于我们</Link>

// 动态路由
<Link href={`/blog/${post.slug}`}>
  {post.title}
</Link>

// 带查询参数
<Link href={{ pathname: '/blog', query: { page: 1 } }}>
  博客
</Link>

// 预取禁用
<Link href="/dashboard" prefetch={false}>
  仪表盘
</Link>
```

### useRouter Hook

```typescript
'use client';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  return (
    <button onClick={() => {
      router.push('/dashboard');        // 导航
      router.replace('/dashboard');     // 替换历史
      router.refresh();                  // 刷新当前路由
      router.back();                     // 后退
      router.forward();                  // 前进
    }}>
      导航
    </button>
  );
}
```

### usePathname 和 useSearchParams

```typescript
'use client';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();            // '/blog/hello-world'
  const searchParams = useSearchParams();   // URLSearchParams

  const page = searchParams.get('page');    // 获取查询参数

  return (
    <nav>
      <Link
        href="/about"
        className={pathname === '/about' ? 'active' : ''}
      >
        关于
      </Link>
    </nav>
  );
}
```

---

## 路由处理器 (Route Handlers)

在 `app` 目录中创建自定义请求处理器：

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/posts
export async function GET(request: NextRequest) {
  const posts = await db.posts.findMany();
  return NextResponse.json(posts);
}

// POST /api/posts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const post = await db.posts.create(body);
  return NextResponse.json(post, { status: 201 });
}
```

### 动态路由处理器

```typescript
// app/api/posts/[id]/route.ts
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  const post = await db.posts.findById(id);

  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(post);
}
```

---

## 最佳实践

### 1. 路由组织

```
app/
├── (marketing)/            # 公共页面
│   ├── page.tsx
│   ├── about/
│   └── pricing/
├── (app)/                  # 应用功能
│   ├── dashboard/
│   └── settings/
└── api/                    # API 路由
    ├── auth/
    └── posts/
```

### 2. 使用 Route Groups 分离关注点

```typescript
// app/(marketing)/layout.tsx - 公共页面布局
export default function MarketingLayout({ children }) {
  return (
    <>
      <PublicNav />
      {children}
      <MarketingFooter />
    </>
  );
}

// app/(app)/layout.tsx - 应用布局
export default function AppLayout({ children }) {
  return (
    <>
      <AppNav />
      <Sidebar />
      {children}
    </>
  );
}
```

### 3. 避免过深的嵌套

```
// ❌ 不好 - 太深的嵌套
app/admin/dashboard/users/settings/notifications/email/page.tsx

// ✅ 好 - 扁平化
app/admin/user-email-settings/page.tsx
```

### 4. 合理使用 Loading 和 Error

```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}

// app/dashboard/error.tsx
'use client';
export default function DashboardError({ error, reset }) {
  return (
    <div>
      <h2>出错了！</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

---

## 常见陷阱

### ❌ 错误 1：忘记导出 page.tsx

```typescript
// ❌ 错误 - 路由不会生效
function Page() {
  return <div>Hello</div>;
}

// ✅ 正确
export default function Page() {
  return <div>Hello</div>;
}
```

### ❌ 错误 2：Layout 访问动态参数

```typescript
// ❌ 错误 - Layout 无法访问 params
export default function Layout({ params }) {  // params 不可用
  return <div>{params.id}</div>;
}

// ✅ 正确 - 使用 page
export default async function Page({ params }) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

### ❌ 错误 3：不正确的动态路由命名

```typescript
// ❌ 错误
app/blog/$id/page.tsx        // 错误的语法
app/blog/:id/page.tsx        // 不是 Next.js 语法

// ✅ 正确
app/blog/[id]/page.tsx       // 单个动态段
app/docs/[...slug]/page.tsx  // Catch-all
```

---

## 快速参考

```typescript
// 路由模式
/app/page.tsx                          → /
/app/about/page.tsx                    → /about
/app/blog/[slug]/page.tsx             → /blog/:slug
/app/docs/[...slug]/page.tsx          → /docs/*
/app/shop/[[...slug]]/page.tsx        → /shop, /shop/*

// 导航
<Link href="/about">About</Link>
router.push('/dashboard')
router.replace('/login')

// 获取路由信息
const pathname = usePathname()         // '/blog/hello'
const searchParams = useSearchParams() // ?page=1
const params = await params            // { slug: 'hello' }
```

---

## 下一步

- [布局系统详解](./layout-system.md) - 深入理解 Layouts 和 Templates
- [Server/Client Components](./server-client-components.md) - 组件架构
- [数据获取策略](./data-fetching.md) - 在路由中获取数据

---

**相关资源**
- [Next.js Routing 文档](https://nextjs.org/docs/app/building-your-application/routing)
- [文件系统路由最佳实践](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
