# Streaming 与 Suspense

## 什么是 Streaming？

Streaming 允许你渐进式地将 UI 从服务器发送到客户端，而不是等待所有数据加载完成。

### 传统 SSR vs Streaming

**传统 SSR**:
```
客户端请求
  ↓
等待所有数据加载...
  ↓
渲染完整 HTML
  ↓
发送到客户端
  ↓
hydration
```

**Streaming**:
```
客户端请求
  ↓
立即发送 HTML shell
  ↓ (客户端开始看到内容)
并行加载数据
  ↓
流式发送组件
  ↓ (客户端逐步看到更多内容)
完成
```

---

## React Suspense

### 基本概念

Suspense 允许你定义组件的加载边界和 fallback UI。

```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>我的页面</h1>

      {/* 立即显示 */}
      <StaticContent />

      {/* 延迟加载，显示 fallback */}
      <Suspense fallback={<LoadingSkeleton />}>
        <AsyncComponent />
      </Suspense>
    </div>
  );
}

async function AsyncComponent() {
  const data = await fetchData();
  return <DataDisplay data={data} />;
}
```

### 工作流程

```
1. 页面开始加载
   ↓
2. 立即渲染 <StaticContent />
   ↓
3. 遇到 Suspense，显示 fallback: <LoadingSkeleton />
   ↓
4. 后台加载 <AsyncComponent />
   ↓
5. 数据返回后，替换 fallback 为实际内容
```

---

## 多个 Suspense 边界

### 并行加载

```typescript
export default function DashboardPage() {
  return (
    <div>
      <h1>仪表盘</h1>

      {/* 三个组件并行加载 */}
      <div className="grid grid-cols-3 gap-4">
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart />
        </Suspense>

        <Suspense fallback={<ListSkeleton />}>
          <RecentOrders />
        </Suspense>

        <Suspense fallback={<StatsSkeleton />}>
          <UserStats />
        </Suspense>
      </div>
    </div>
  );
}
```

### 嵌套 Suspense

```typescript
export default function BlogPage() {
  return (
    <div>
      <Header />

      {/* 外层 Suspense */}
      <Suspense fallback={<PageSkeleton />}>
        <BlogContent>
          {/* 内层 Suspense - 更细粒度的加载 */}
          <Suspense fallback={<CommentsSkeleton />}>
            <Comments />
          </Suspense>
        </BlogContent>
      </Suspense>

      <Footer />
    </div>
  );
}
```

---

## loading.tsx 文件

### 基本用法

Next.js 提供 `loading.tsx` 文件来自动创建 Suspense 边界：

```
app/
├── dashboard/
│   ├── page.tsx          # 页面内容
│   └── loading.tsx       # 加载 UI
```

```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}
```

### loading.tsx vs Suspense

| 特性 | loading.tsx | Suspense |
|------|------------|----------|
| 作用范围 | 整个页面 | 特定组件 |
| 粒度 | 粗粒度 | 细粒度 |
| 配置 | 文件级别 | 组件级别 |
| 灵活性 | 低 | 高 |
| 使用场景 | 简单页面 | 复杂布局 |

```typescript
// ✅ 使用 loading.tsx - 简单场景
app/blog/
├── page.tsx
└── loading.tsx

// ✅ 使用 Suspense - 复杂场景
export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
    </>
  );
}
```

---

## Streaming 模式

### 1. 全页面 Streaming

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // 整个页面在数据加载完成后发送
  const data = await fetchAllData();

  return <Dashboard data={data} />;
}
```

### 2. 渐进式 Streaming

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      {/* 立即显示 */}
      <DashboardHeader />

      {/* 流式加载 */}
      <Suspense fallback={<Skeleton />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <Chart />
      </Suspense>
    </div>
  );
}
```

### 3. 瀑布式加载

```typescript
export default function Page() {
  return (
    <>
      {/* 立即显示 */}
      <Header />

      <Suspense fallback={<UserSkeleton />}>
        {/* 先加载用户 */}
        <UserProfile>
          <Suspense fallback={<PostsSkeleton />}>
            {/* 再加载文章 */}
            <UserPosts />
          </Suspense>
        </UserProfile>
      </Suspense>
    </>
  );
}
```

---

## 实战示例

### 电商产品页

```typescript
// app/products/[id]/page.tsx
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  // 静态产品信息 - 快速加载
  const product = await getProduct(id);

  return (
    <div>
      {/* 立即显示 - 静态信息 */}
      <ProductInfo product={product} />

      {/* 动态价格 - 可能较慢 */}
      <Suspense fallback={<PriceSkeleton />}>
        <ProductPrice productId={id} />
      </Suspense>

      {/* 库存信息 */}
      <Suspense fallback={<StockSkeleton />}>
        <StockStatus productId={id} />
      </Suspense>

      {/* 评论 - 最慢的部分 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={id} />
      </Suspense>
    </div>
  );
}

// 动态组件
async function ProductPrice({ productId }: { productId: string }) {
  const price = await fetchPrice(productId);
  return <div className="text-2xl font-bold">${price}</div>;
}

async function StockStatus({ productId }: { productId: string }) {
  const stock = await fetchStock(productId);
  return (
    <div>
      {stock > 0 ? `库存: ${stock}` : '缺货'}
    </div>
  );
}

async function ProductReviews({ productId }: { productId: string }) {
  const reviews = await fetchReviews(productId);
  return <ReviewList reviews={reviews} />;
}
```

### 用户仪表盘

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="p-6">
      {/* 页面标题 - 立即显示 */}
      <h1 className="text-3xl font-bold mb-6">仪表盘</h1>

      {/* 统计卡片 - 并行加载 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Suspense fallback={<StatCardSkeleton />}>
          <RevenueCard />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <OrdersCard />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <UsersCard />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <ProductsCard />
        </Suspense>
      </div>

      {/* 图表 - 较慢的数据 */}
      <div className="grid grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <OrdersChart />
        </Suspense>
      </div>

      {/* 最近活动 - 最慢的数据 */}
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}
```

---

## Skeleton 组件设计

### 基本 Skeleton

```typescript
// components/skeletons.tsx
export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 匹配实际布局

```typescript
// ✅ 好 - Skeleton 匹配实际组件
function ProductCardSkeleton() {
  return (
    <div className="border rounded-lg p-4">
      <div className="animate-pulse">
        <div className="bg-gray-200 h-48 w-full rounded mb-4" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

// 实际组件保持相同的结构
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border rounded-lg p-4">
      <img src={product.image} className="h-48 w-full rounded mb-4" />
      <h3 className="h-6 mb-2">{product.name}</h3>
      <p className="h-4 mb-4">${product.price}</p>
      <button className="h-10 w-full">添加到购物车</button>
    </div>
  );
}
```

---

## 错误处理

### 结合 Error Boundary

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export default function DashboardPage() {
  return (
    <div>
      <ErrorBoundary fallback={<ErrorMessage />}>
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

### error.tsx 文件

```typescript
// app/dashboard/error.tsx
'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">出错了！</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        重试
      </button>
    </div>
  );
}
```

---

## 性能优化

### 1. 合理设置 Suspense 边界

```typescript
// ❌ 不好 - 边界太细
<Suspense fallback={<LoadingText />}>
  <Text>Hello</Text>  {/* 不需要异步 */}
</Suspense>

// ✅ 好 - 只在必要时使用
<Suspense fallback={<DataSkeleton />}>
  <AsyncDataComponent />  {/* 真正需要异步的部分 */}
</Suspense>
```

### 2. 避免瀑布式请求

```typescript
// ❌ 不好 - 串行加载
<Suspense fallback={<Loading />}>
  <ParentComponent>
    <Suspense fallback={<Loading />}>
      <ChildComponent />  {/* 等待父组件完成后才开始 */}
    </Suspense>
  </ParentComponent>
</Suspense>

// ✅ 好 - 并行加载
<Suspense fallback={<Loading />}>
  <ParentComponent />
</Suspense>
<Suspense fallback={<Loading />}>
  <ChildComponent />  {/* 并行开始 */}
</Suspense>
```

### 3. 预加载数据

```typescript
// app/products/[id]/page.tsx
export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  // ✅ 并行预加载
  const productPromise = getProduct(id);
  const reviewsPromise = getReviews(id);

  const product = await productPromise;

  return (
    <div>
      <ProductInfo product={product} />
      <Suspense fallback={<ReviewsSkeleton />}>
        {/* 使用已经开始的 promise */}
        <Reviews reviewsPromise={reviewsPromise} />
      </Suspense>
    </div>
  );
}

async function Reviews({ reviewsPromise }: { reviewsPromise: Promise<Review[]> }) {
  const reviews = await reviewsPromise;
  return <ReviewList reviews={reviews} />;
}
```

---

## 最佳实践

### 1. 立即显示重要内容

```typescript
// ✅ 好 - 关键内容立即显示
export default function Page() {
  return (
    <>
      <PageHeader />  {/* 立即显示 */}
      <ImportantContent />  {/* 立即显示 */}
      <Suspense fallback={<Skeleton />}>
        <SecondaryContent />  {/* 延迟加载 */}
      </Suspense>
    </>
  );
}
```

### 2. 提供有意义的 Loading 状态

```typescript
// ❌ 不好 - 通用加载提示
<Suspense fallback={<div>Loading...</div>}>
  <ProductList />
</Suspense>

// ✅ 好 - 具体的 Skeleton
<Suspense fallback={<ProductListSkeleton />}>
  <ProductList />
</Suspense>
```

### 3. 考虑用户体验

```typescript
// 快速数据 - 不需要 Suspense
<UserAvatar userId={userId} />

// 慢速数据 - 使用 Suspense
<Suspense fallback={<CommentsSkeleton />}>
  <Comments postId={postId} />
</Suspense>

// 非常慢的数据 - 考虑分页或懒加载
<Suspense fallback={<InfiniteScrollSkeleton />}>
  <InfiniteCommentList postId={postId} />
</Suspense>
```

---

## 常见陷阱

### ❌ 错误 1：过度使用 Suspense

```typescript
// ❌ 不好 - 包裹静态内容
<Suspense fallback={<Loading />}>
  <StaticText>这是静态文本</StaticText>
</Suspense>

// ✅ 好 - 只包裹异步内容
<StaticText>这是静态文本</StaticText>
<Suspense fallback={<Loading />}>
  <AsyncData />
</Suspense>
```

### ❌ 错误 2：忘记 fallback

```typescript
// ❌ 错误 - 缺少 fallback
<Suspense>
  <AsyncComponent />
</Suspense>

// ✅ 正确
<Suspense fallback={<LoadingSkeleton />}>
  <AsyncComponent />
</Suspense>
```

### ❌ 错误 3：Skeleton 不匹配布局

```typescript
// ❌ 不好 - 布局跳动
function Skeleton() {
  return <div className="h-20 bg-gray-200" />;
}

function Content() {
  return <div className="h-40 bg-blue-500" />;  // 高度不同！
}

// ✅ 好 - 匹配尺寸
function Skeleton() {
  return <div className="h-40 bg-gray-200" />;
}
```

---

## 快速参考

```typescript
// 基本 Suspense
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>

// loading.tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <Skeleton />;
}

// 并行加载
<Suspense fallback={<S1 />}>
  <A1 />
</Suspense>
<Suspense fallback={<S2 />}>
  <A2 />
</Suspense>

// 嵌套 Suspense
<Suspense fallback={<S1 />}>
  <Parent>
    <Suspense fallback={<S2 />}>
      <Child />
    </Suspense>
  </Parent>
</Suspense>
```

---

## 下一步

- [渲染模式](./rendering-modes.md) - 理解 Streaming 在不同渲染模式中的作用
- [PPR 实践](./ppr-practice.md) - Partial Prerendering 实战
- [性能优化](./performance-optimization.md) - 优化 Streaming 性能

---

**相关资源**
- [Next.js Streaming 文档](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React Suspense 文档](https://react.dev/reference/react/Suspense)
