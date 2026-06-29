# Next.js 数据获取策略

## 数据获取概览

Next.js 提供多种数据获取方式，每种都适用于不同场景。

| 方法 | 位置 | 使用场景 | 缓存 |
|------|------|---------|------|
| `fetch()` | Server Component | 服务端数据获取 | 可配置 |
| Server Actions | Server/Client | 表单提交、数据变更 | 否 |
| Route Handlers | API Routes | RESTful API | 可配置 |
| SWR/React Query | Client Component | 客户端数据获取 | 是 |
| Database | Server Component | 直接数据库查询 | 否 |

---

## 1. fetch() API

### 基本用法

```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await fetch('https://api.example.com/posts').then(res => res.json());

  return (
    <div>
      {posts.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### 缓存配置

```typescript
// 1. 强制缓存（SSG）
const data = await fetch(url, {
  cache: 'force-cache',  // 默认行为（Next.js 15 及之前）
});

// 2. 禁用缓存（SSR）
const data = await fetch(url, {
  cache: 'no-store',  // 每次请求都获取新数据
});

// 3. 定时重新验证（ISR）
const data = await fetch(url, {
  next: {
    revalidate: 3600,  // 3600 秒后重新验证
  },
});

// 4. 标签化缓存（可按需重新验证）
const data = await fetch(url, {
  next: {
    tags: ['posts', 'featured'],  // 添加缓存标签
    revalidate: 3600,
  },
});
```

### 并行数据获取

```typescript
// ✅ 好 - 并行请求
export default async function Page() {
  const [user, posts, comments] = await Promise.all([
    fetch('https://api.example.com/user'),
    fetch('https://api.example.com/posts'),
    fetch('https://api.example.com/comments'),
  ]).then(responses => Promise.all(responses.map(r => r.json())));

  return <Content user={user} posts={posts} comments={comments} />;
}

// ❌ 不好 - 串行请求
export default async function Page() {
  const user = await fetch('https://api.example.com/user').then(r => r.json());
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  const comments = await fetch('https://api.example.com/comments').then(r => r.json());
  // 总时间 = 时间1 + 时间2 + 时间3
}
```

### 数据去重

Next.js 自动去重相同的 fetch 请求：

```typescript
// app/page.tsx
async function getUser() {
  return fetch('https://api.example.com/user').then(r => r.json());
}

export default async function Page() {
  const user = await getUser();  // 请求1
  const userAgain = await getUser();  // 不会发送请求，使用缓存

  return <div>{user.name}</div>;
}
```

---

## 2. Server Actions

### 概念

Server Actions 允许你在组件中直接调用服务端函数，无需创建 API 端点。

### 基本用法

```typescript
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // 数据库操作
  await db.posts.create({
    title,
    content,
  });

  // 重新验证缓存
  revalidatePath('/blog');

  return { success: true };
}
```

### 在表单中使用

```typescript
// app/blog/new/page.tsx
import { createPost } from '@/app/actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="标题" required />
      <textarea name="content" placeholder="内容" required />
      <button type="submit">发布</button>
    </form>
  );
}
```

### 在 Client Component 中使用

```typescript
// components/CreatePostForm.tsx
'use client';

import { useTransition } from 'react';
import { createPost } from '@/app/actions';

export default function CreatePostForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createPost(formData);
      if (result.success) {
        alert('发布成功！');
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <input name="title" placeholder="标题" required />
      <textarea name="content" placeholder="内容" required />
      <button type="submit" disabled={isPending}>
        {isPending ? '发布中...' : '发布'}
      </button>
    </form>
  );
}
```

### 返回值和错误处理

```typescript
'use server';

export async function createPost(formData: FormData) {
  try {
    const title = formData.get('title') as string;

    // 验证
    if (!title || title.length < 3) {
      return { success: false, error: '标题至少3个字符' };
    }

    // 创建文章
    const post = await db.posts.create({ title });

    // 重新验证
    revalidatePath('/blog');

    return { success: true, post };
  } catch (error) {
    console.error('创建失败:', error);
    return { success: false, error: '创建失败' };
  }
}
```

### 使用 useFormStatus

```typescript
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}

export default function Form() {
  return (
    <form action={createPost}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
```

---

## 3. Route Handlers (API Routes)

### 基本用法

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

### 动态路由处理

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

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  const body = await request.json();

  const post = await db.posts.update(id, body);

  return NextResponse.json(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  await db.posts.delete(id);

  return new NextResponse(null, { status: 204 });
}
```

### 请求处理

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 获取查询参数
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');

  // 获取请求头
  const userAgent = request.headers.get('user-agent');

  // 获取 cookies
  const token = request.cookies.get('token');

  const results = await search(query, page);

  // 设置响应头和 cookies
  const response = NextResponse.json(results);
  response.headers.set('X-Custom-Header', 'value');
  response.cookies.set('last-search', query);

  return response;
}
```

### 错误处理

```typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const post = await db.posts.findById(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 4. 客户端数据获取 (SWR/React Query)

### 使用 SWR

```typescript
// app/dashboard/client-posts.tsx
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ClientPosts() {
  const { data, error, isLoading, mutate } = useSWR('/api/posts', fetcher, {
    revalidateOnFocus: true,  // 窗口聚焦时重新验证
    refreshInterval: 3000,     // 每3秒刷新
  });

  if (error) return <div>加载失败</div>;
  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      {data.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <button onClick={() => mutate()}>刷新</button>
    </div>
  );
}
```

### 乐观更新

```typescript
'use client';

import useSWR from 'swr';

export default function PostList() {
  const { data, mutate } = useSWR('/api/posts', fetcher);

  const handleDelete = async (id: string) => {
    // 乐观更新 - 立即从 UI 移除
    mutate(
      data.filter((post: Post) => post.id !== id),
      false  // 不重新验证
    );

    try {
      // 发送删除请求
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });

      // 重新验证数据
      mutate();
    } catch (error) {
      // 如果失败，恢复数据
      mutate();
      alert('删除失败');
    }
  };

  return (
    <div>
      {data?.map((post: Post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <button onClick={() => handleDelete(post.id)}>删除</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 5. 直接数据库查询

### Drizzle ORM 示例

```typescript
// app/posts/page.tsx
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export default async function PostsPage() {
  // 直接查询数据库
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(10);

  return (
    <div>
      {allPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### 复杂查询

```typescript
import { and, eq, like, gt } from 'drizzle-orm';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const results = await db
    .select()
    .from(posts)
    .where(
      and(
        q ? like(posts.title, `%${q}%`) : undefined,
        category ? eq(posts.category, category) : undefined,
        gt(posts.publishedAt, new Date('2024-01-01'))
      )
    )
    .orderBy(desc(posts.publishedAt));

  return <SearchResults results={results} />;
}
```

---

## 6. 缓存重新验证

### revalidatePath

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(data: PostData) {
  await db.posts.create(data);

  // 重新验证特定路径
  revalidatePath('/blog');  // 重新验证 /blog
  revalidatePath('/blog/[id]', 'page');  // 重新验证所有 /blog/[id] 页面
  revalidatePath('/blog', 'layout');  // 重新验证布局
}
```

### revalidateTag

```typescript
// 在 fetch 中添加标签
const data = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts', 'featured'] },
});

// 按标签重新验证
'use server';

import { revalidateTag } from 'next/cache';

export async function refreshPosts() {
  revalidateTag('posts');  // 重新验证所有标记为 'posts' 的请求
}
```

### Next.js 16+ 新 API

```typescript
'use server';

import { updateTag, revalidateTag, refresh } from 'next/cache';

// updateTag - 立即更新（读取-写入一致性）
export async function updatePost(id: string, data: PostData) {
  await db.posts.update(id, data);
  updateTag(`post-${id}`);  // 立即看到更新
}

// revalidateTag - 后台重新验证（SWR 模式）
export async function triggerBackgroundRefresh() {
  revalidateTag('all-posts');  // 标记为陈旧，后台更新
}

// refresh - 刷新非缓存数据
export async function markAsRead(id: string) {
  await db.notifications.markAsRead(id);
  refresh();  // 只刷新动态部分
}
```

---

## 数据获取策略

### 决策树

```
数据在哪里获取？
├─ 服务端
│   ├─ 静态数据 → fetch() with cache: 'force-cache'
│   ├─ 定期更新 → fetch() with revalidate
│   ├─ 实时数据 → fetch() with cache: 'no-store'
│   └─ 数据库 → 直接查询
│
└─ 客户端
    ├─ 需要缓存 → SWR / React Query
    └─ 不需要缓存 → useEffect + fetch
```

### 场景对照表

| 场景 | 推荐方法 | 原因 |
|------|---------|------|
| 博客文章列表 | Server Component + fetch | 静态，SEO |
| 用户仪表盘 | Server Component + DB | 实时，用户特定 |
| 表单提交 | Server Actions | 简单，类型安全 |
| RESTful API | Route Handlers | 标准 API |
| 实时更新 | SWR/React Query | 自动刷新 |
| 搜索功能 | Client + SWR | 交互频繁 |

---

## 最佳实践

### 1. 尽量在服务端获取数据

```typescript
// ✅ 好 - Server Component
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <Content data={data} />;
}

// ❌ 不好 - 不必要的客户端获取
'use client';
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('https://api.example.com/data').then(r => r.json()).then(setData);
  }, []);
}
```

### 2. 合理使用缓存

```typescript
// ✅ 静态内容 - 强制缓存
const staticData = await fetch(url, { cache: 'force-cache' });

// ✅ 定期更新 - 增量重新验证
const newsData = await fetch(url, { next: { revalidate: 3600 } });

// ✅ 实时数据 - 禁用缓存
const liveData = await fetch(url, { cache: 'no-store' });
```

### 3. 错误处理

```typescript
export default async function Page() {
  try {
    const data = await fetch('https://api.example.com/data');

    if (!data.ok) {
      throw new Error('Failed to fetch');
    }

    const json = await data.json();
    return <Content data={json} />;
  } catch (error) {
    console.error('Error fetching data:', error);
    return <ErrorDisplay />;
  }
}
```

### 4. 加载状态

```typescript
// app/blog/page.tsx
import { Suspense } from 'react';

export default function BlogPage() {
  return (
    <div>
      <h1>博客</h1>
      <Suspense fallback={<PostListSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  );
}

async function PostList() {
  const posts = await fetch('https://api.example.com/posts');
  return <PostsDisplay posts={posts} />;
}
```

---

## 常见陷阱

### ❌ 错误 1：在 Client Component 中使用 async

```typescript
// ❌ 错误 - Client Component 不能是 async
'use client';
export default async function ClientPage() {  // 错误！
  const data = await fetch('/api/data');
  return <div>{data}</div>;
}

// ✅ 正确 - 使用 useEffect 或 SWR
'use client';
export default function ClientPage() {
  const { data } = useSWR('/api/data', fetcher);
  return <div>{data}</div>;
}
```

### ❌ 错误 2：忘记错误处理

```typescript
// ❌ 错误 - 没有错误处理
const data = await fetch(url).then(r => r.json());

// ✅ 正确
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
const data = await response.json();
```

### ❌ 错误 3：过度使用 Server Actions

```typescript
// ❌ 不好 - 简单读取使用 Server Action
'use server';
export async function getPosts() {
  return await db.posts.findMany();
}

// ✅ 好 - 直接在 Server Component 中获取
export default async function Page() {
  const posts = await db.posts.findMany();
  return <PostList posts={posts} />;
}
```

---

## 快速参考

```typescript
// Server Component - fetch
const data = await fetch(url, {
  cache: 'force-cache',  // SSG
  cache: 'no-store',     // SSR
  next: { revalidate: 60 },  // ISR
  next: { tags: ['posts'] }, // 标签化缓存
});

// Server Actions
'use server';
export async function createPost(formData: FormData) {
  await db.posts.create(...);
  revalidatePath('/blog');
}

// Route Handlers
export async function GET(request: NextRequest) {
  return NextResponse.json(data);
}

// Client - SWR
const { data, error } = useSWR('/api/posts', fetcher);

// 直接数据库
const posts = await db.select().from(posts);
```

---

## 下一步

- [Server Actions 详解](./server-actions.md) - 深入 Server Actions
- [缓存策略](./caching-strategies.md) - 缓存最佳实践
- [性能优化](./performance-optimization.md) - 数据获取优化

---

**相关资源**
- [Next.js Data Fetching 文档](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [SWR 文档](https://swr.vercel.app)
