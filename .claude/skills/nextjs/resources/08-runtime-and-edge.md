# 运行时与边缘渲染

## 什么是 Runtime？

Next.js 支持两种运行时环境，每种都有不同的能力和限制：

| Runtime | 执行环境 | 性能 | API 支持 | 启动速度 | 使用场景 |
|---------|---------|------|---------|---------|----------|
| **Node.js** | 完整 Node.js 环境 | 标准 | 完整 | 较慢 | 复杂业务逻辑、数据库操作 |
| **Edge** | 轻量级 JavaScript 运行时 | 快 | 受限 | 极快 | 简单路由、A/B 测试、地理位置 |

---

## Runtime 配置

### 路由段配置

在 `page.tsx`、`layout.tsx` 或 `route.ts` 中指定 runtime：

```typescript
// app/api/data/route.ts
export const runtime = 'edge';  // 'nodejs' | 'edge'

export async function GET() {
  return Response.json({ message: 'Running on Edge' });
}
```

### 默认行为

**Next.js 16 默认**:
- Routes: `nodejs` runtime
- Middleware: 仍在 Edge runtime（即将弃用）
- proxy.ts: `nodejs` runtime（新推荐）

**未来 (Next.js 17)**:
- 可能将 Edge runtime 作为默认选项（根据社区反馈决定）

---

## Node.js Runtime

### 特点

✅ **优势**:
- 完整的 Node.js API 访问
- 支持所有 npm 包
- 数据库驱动器（PostgreSQL、MongoDB 等）
- 文件系统操作
- 加密库和复杂计算

❌ **劣势**:
- 冷启动较慢
- 不在边缘运行（延迟较高）
- 资源消耗较多

### 使用示例

```typescript
// app/api/users/route.ts
export const runtime = 'nodejs';  // 默认值，可省略

import { db } from '@/lib/db';
import crypto from 'crypto';  // Node.js 核心模块

export async function POST(request: Request) {
  const body = await request.json();

  // ✅ 使用数据库
  const user = await db.users.create({
    email: body.email,
    // ✅ 使用 Node.js crypto
    password: crypto.createHash('sha256').update(body.password).digest('hex'),
  });

  return Response.json({ user });
}
```

### 适用场景

- ✅ 复杂业务逻辑
- ✅ 数据库操作
- ✅ 文件上传/处理
- ✅ 第三方 API 集成
- ✅ 密码学操作
- ✅ 使用任意 npm 包

---

## Edge Runtime

### 特点

✅ **优势**:
- 极快的冷启动（<1ms）
- 在全球边缘节点运行（低延迟）
- 自动地理位置分布
- 更低的成本

❌ **劣势**:
- 受限的 API（无 Node.js 核心模块）
- 不支持所有 npm 包
- 无文件系统访问
- 受限的执行时间和内存

### Edge Runtime API 限制

**✅ 支持的 Web API**:
```typescript
// 标准 Web APIs
fetch()
Request
Response
Headers
URL
URLSearchParams
TextEncoder
TextDecoder
AbortController
ReadableStream
WritableStream
crypto.subtle  // Web Crypto API
```

**❌ 不支持的 Node.js API**:
```typescript
// ❌ Node.js 核心模块
import fs from 'fs';           // 错误！
import path from 'path';       // 错误！
import crypto from 'crypto';   // 错误！（但可用 crypto.subtle）
import buffer from 'buffer';   // 错误！

// ❌ 原生模块
import bcrypt from 'bcrypt';   // 错误！（有原生依赖）
```

### 使用示例

```typescript
// app/api/geo/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  // ✅ 获取地理位置信息（Vercel Edge）
  const geo = request.headers.get('x-vercel-ip-country');
  const city = request.headers.get('x-vercel-ip-city');

  // ✅ 使用 Web Crypto API
  const uuid = crypto.randomUUID();

  // ✅ 简单的 fetch
  const data = await fetch('https://api.example.com/data');

  return Response.json({
    country: geo,
    city,
    requestId: uuid,
  });
}
```

### 适用场景

- ✅ 简单的 API 路由
- ✅ A/B 测试和功能标记
- ✅ 地理位置重定向
- ✅ 认证令牌验证（JWT）
- ✅ 速率限制
- ✅ 简单的代理和重写

---

## 运行时选择指南

### 决策树

```
是否需要以下功能？
├─ Node.js 核心模块 → Node.js Runtime
├─ 数据库操作 → Node.js Runtime
├─ 文件系统访问 → Node.js Runtime
├─ 原生 npm 包（如 bcrypt） → Node.js Runtime
│
└─ 简单逻辑 + 需要低延迟？
    ├─ 是 → Edge Runtime
    └─ 否 → Node.js Runtime
```

### 场景对照表

| 使用场景 | 推荐 Runtime | 原因 |
|---------|-------------|------|
| 数据库查询 | Node.js | 需要数据库驱动 |
| 复杂计算 | Node.js | 完整计算能力 |
| 文件上传 | Node.js | 需要文件系统 |
| A/B 测试 | Edge | 简单逻辑，低延迟 |
| 地理重定向 | Edge | 边缘位置信息 |
| JWT 验证 | Edge | 使用 Web Crypto |
| 简单 API 代理 | Edge | 低延迟转发 |
| 密码哈希（bcrypt） | Node.js | 需要原生模块 |
| 速率限制 | Edge | 快速响应 |
| WebSocket | Node.js | Edge 不支持 |

---

## Middleware Runtime 变化

### Next.js 15.x 及之前

Middleware 只能运行在 Edge Runtime：

```typescript
// middleware.ts (旧版)
// 自动运行在 Edge Runtime
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url));
}
```

### Next.js 16+

**Middleware → proxy.ts 变化**：

```typescript
// proxy.ts (新版 - Next.js 16+)
// 运行在 Node.js Runtime
import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url));
}
```

**迁移命令**：
```bash
npx @next/codemod@canary middleware-to-proxy .
```

**middleware.ts 仍可用于 Edge Runtime（已弃用）**：
```typescript
// middleware.ts (Edge Runtime - 已弃用)
export const config = {
  runtime: 'edge',  // 显式指定
};

export function middleware(request: NextRequest) {
  // Edge Runtime 代码
}
```

### Node.js Middleware (Next.js 15.5+ 稳定)

从 Next.js 15.5 开始，Middleware 支持 Node.js Runtime：

```typescript
// middleware.ts
export const config = {
  runtime: 'nodejs',  // 使用 Node.js Runtime
};

import { db } from '@/lib/db';

export async function middleware(request: NextRequest) {
  // ✅ 现在可以使用数据库
  const user = await db.users.findByToken(token);

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

---

## Edge Runtime 限制详解

### 1. 内存限制

```typescript
// ❌ 不好 - 可能超出内存限制
export const runtime = 'edge';

export async function GET() {
  const largeArray = new Array(10_000_000).fill('data');  // 可能失败
  return Response.json(largeArray);
}

// ✅ 好 - 使用流式响应
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      for (let i = 0; i < 10_000_000; i++) {
        controller.enqueue(`data-${i}\n`);
      }
      controller.close();
    },
  });

  return new Response(stream);
}
```

### 2. 执行时间限制

```typescript
// ❌ Edge Runtime - 执行时间限制（通常 < 30s）
export const runtime = 'edge';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 60000));  // 可能超时
  return Response.json({ done: true });
}

// ✅ Node.js Runtime - 更长的执行时间
export const runtime = 'nodejs';

export async function GET() {
  await longRunningTask();  // 可以运行更长时间
  return Response.json({ done: true });
}
```

### 3. 动态代码执行限制

```typescript
// ❌ Edge Runtime 不支持
export const runtime = 'edge';

export async function GET() {
  const code = 'console.log("test")';
  eval(code);  // 错误！
  new Function('return 1')();  // 错误！
}
```

---

## 实战案例

### 案例 1：地理位置重定向（Edge）

```typescript
// app/api/redirect/route.ts
export const runtime = 'edge';

export function GET(request: Request) {
  const country = request.headers.get('x-vercel-ip-country');

  // 根据地理位置重定向
  const url = new URL(request.url);

  if (country === 'CN') {
    url.pathname = '/zh-cn';
  } else if (country === 'JP') {
    url.pathname = '/ja';
  } else {
    url.pathname = '/en';
  }

  return Response.redirect(url);
}
```

### 案例 2：JWT 验证（Edge）

```typescript
// app/api/verify/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ✅ 使用 Web Crypto API 验证 JWT
    const payload = await verifyJWT(token);
    return Response.json({ user: payload });
  } catch (error) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
}

async function verifyJWT(token: string) {
  // 使用 crypto.subtle 实现 JWT 验证
  // Web Crypto API 在 Edge Runtime 中可用
}
```

### 案例 3：数据库操作（Node.js）

```typescript
// app/api/posts/route.ts
export const runtime = 'nodejs';  // 默认值

import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';

export async function GET() {
  // ✅ 使用数据库
  const allPosts = await db.select().from(posts).limit(10);

  return Response.json(allPosts);
}

export async function POST(request: Request) {
  const body = await request.json();

  // ✅ 数据库插入
  const newPost = await db.insert(posts).values(body).returning();

  return Response.json(newPost, { status: 201 });
}
```

---

## 性能对比

### 冷启动时间

```
Edge Runtime:    <1ms      ⚡⚡⚡⚡⚡
Node.js Runtime: 50-200ms  ⚡⚡
```

### 执行延迟（全球平均）

```
Edge Runtime:    <50ms   （边缘节点）
Node.js Runtime: 100-500ms （区域数据中心）
```

### 成本

```
Edge Runtime:    $$$      （按请求计费）
Node.js Runtime: $$$$$    （按实例/时间计费）
```

---

## 最佳实践

### 1. 合理选择 Runtime

```typescript
// ✅ 好 - 简单逻辑使用 Edge
export const runtime = 'edge';
export async function GET() {
  return Response.json({ status: 'ok' });
}

// ✅ 好 - 复杂逻辑使用 Node.js
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const data = await request.json();
  await db.process(data);  // 数据库操作
  return Response.json({ success: true });
}
```

### 2. 避免在 Edge 中使用不支持的包

```typescript
// ❌ 错误
export const runtime = 'edge';
import bcrypt from 'bcrypt';  // bcrypt 需要原生模块

// ✅ 正确 - 使用兼容 Edge 的替代品
export const runtime = 'edge';
import { hash } from '@edge-runtime/primitives';
```

### 3. 测试两种 Runtime

```typescript
// 使用环境变量切换 Runtime 进行测试
export const runtime = process.env.USE_EDGE === 'true' ? 'edge' : 'nodejs';
```

---

## 检测当前 Runtime

```typescript
// 运行时检测
export async function GET() {
  const isEdge = typeof EdgeRuntime !== 'undefined';
  const isNode = typeof process !== 'undefined' && process.versions?.node;

  return Response.json({
    runtime: isEdge ? 'edge' : 'nodejs',
    environment: isNode ? `Node.js ${process.versions.node}` : 'Edge Runtime',
  });
}
```

---

## 常见陷阱

### ❌ 错误 1：在 Edge 中使用 Node.js API

```typescript
// ❌ 错误
export const runtime = 'edge';
import fs from 'fs';  // 编译错误！

// ✅ 正确 - 使用 Node.js Runtime
export const runtime = 'nodejs';
import fs from 'fs';
```

### ❌ 错误 2：在 Edge 中执行长时间任务

```typescript
// ❌ 错误 - Edge 有执行时间限制
export const runtime = 'edge';
export async function GET() {
  await expensiveComputation();  // 可能超时
}

// ✅ 正确 - 使用 Node.js
export const runtime = 'nodejs';
export async function GET() {
  await expensiveComputation();
}
```

### ❌ 错误 3：假设包在 Edge 中可用

```typescript
// ❌ 错误 - 需要检查兼容性
export const runtime = 'edge';
import somePackage from 'some-package';  // 可能不兼容

// ✅ 正确 - 检查包的 Edge 兼容性
// 或使用 Node.js Runtime
export const runtime = 'nodejs';
```

---

## 快速参考

```typescript
// Runtime 配置
export const runtime = 'edge';     // Edge Runtime
export const runtime = 'nodejs';   // Node.js Runtime（默认）

// Edge Runtime 支持
✅ fetch, Request, Response
✅ Headers, URL, URLSearchParams
✅ crypto.subtle (Web Crypto)
✅ TextEncoder, TextDecoder
✅ ReadableStream, WritableStream

// Edge Runtime 不支持
❌ Node.js 核心模块 (fs, path, crypto, etc.)
❌ 原生模块 (bcrypt, canvas, etc.)
❌ 文件系统访问
❌ 长时间运行任务
❌ eval, new Function
```

---

## 下一步

- [Middleware 与 Proxy](./09-middleware-and-proxy.md) - 深入理解 proxy.ts
- [性能优化](./07-performance-optimization.md) - Runtime 性能优化
- [部署](./12-deployment-and-ci.md) - Edge 和 Node.js 部署策略

---

**相关资源**
- [Next.js Edge Runtime 文档](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
- [Edge Runtime API](https://edge-runtime.vercel.app)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
