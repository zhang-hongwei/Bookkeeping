# Middleware 与 Proxy

## 重大变化：middleware.ts → proxy.ts

Next.js 16 引入了重要的概念变更：**middleware.ts** 被 **proxy.ts** 替代。

### 为什么改名？

**问题**：
- middleware.ts 容易与 Express.js middleware 混淆
- 开发者误以为可以放置复杂业务逻辑
- 实际用途被误解为"万能中间件"

**解决方案**：
- proxy.ts 明确其用途：**网络边界代理**
- 专注于：路由、重写、重定向
- **不应用于**：业务逻辑、认证、数据库操作

---

## proxy.ts (Next.js 16+)

### 基本用法

```typescript
// proxy.ts (根目录)
import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 简单的路由逻辑
  if (pathname.startsWith('/api/old')) {
    return NextResponse.rewrite(new URL('/api/new', request.url));
  }

  return NextResponse.next();
}

// 配置匹配器
export const config = {
  matcher: [
    // 排除静态文件和 API 路由
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 运行时

proxy.ts 默认运行在 **Node.js Runtime**：

```typescript
// proxy.ts
// 自动运行在 Node.js Runtime
import { db } from '@/lib/db';  // ✅ 可以使用（但不推荐）

export default async function proxy(request: NextRequest) {
  // ✅ 可以访问数据库（但应该避免）
  const user = await db.users.findByToken(token);

  return NextResponse.next();
}
```

---

## 迁移：middleware.ts → proxy.ts

### 迁移步骤

**1. 使用自动迁移工具（推荐）**：
```bash
npx @next/codemod@canary middleware-to-proxy .
```

**2. 手动迁移**：

**之前 (middleware.ts)**:
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url));
}

export const config = {
  matcher: '/about/:path*',
};
```

**之后 (proxy.ts)**:
```typescript
// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url));
}

export const config = {
  matcher: '/about/:path*',
};
```

**关键变化**：
- ✅ 文件名：`middleware.ts` → `proxy.ts`
- ✅ 函数名：`middleware` → `proxy`
- ✅ 导出方式：`export function` → `export default function`

---

## proxy.ts 推荐用途

### ✅ 推荐使用场景

#### 1. URL 重写

```typescript
// proxy.ts
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 版本重写
  if (pathname.startsWith('/api/v1')) {
    return NextResponse.rewrite(
      new URL(pathname.replace('/api/v1', '/api/v2'), request.url)
    );
  }

  return NextResponse.next();
}
```

#### 2. 重定向

```typescript
// proxy.ts
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 旧路径重定向
  if (pathname === '/old-page') {
    return NextResponse.redirect(new URL('/new-page', request.url));
  }

  // 永久重定向
  if (pathname === '/legacy') {
    return NextResponse.redirect(new URL('/modern', request.url), 301);
  }

  return NextResponse.next();
}
```

#### 3. 地理位置路由

```typescript
// proxy.ts
export default function proxy(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country');

  if (country === 'CN') {
    return NextResponse.rewrite(new URL('/zh-cn', request.url));
  } else if (country === 'JP') {
    return NextResponse.rewrite(new URL('/ja', request.url));
  }

  return NextResponse.next();
}
```

#### 4. A/B 测试

```typescript
// proxy.ts
export default function proxy(request: NextRequest) {
  const bucket = request.cookies.get('ab-test')?.value || 'A';

  if (bucket === 'B') {
    return NextResponse.rewrite(new URL('/experiment-b', request.url));
  }

  return NextResponse.next();
}
```

### ❌ 不推荐使用场景

#### 1. ❌ 身份验证（应移到 API Routes）

```typescript
// ❌ 不好 - 在 proxy.ts 中
export default async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const user = await verifyToken(token);  // 业务逻辑！

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// ✅ 好 - 在 Server Component 或 API Route 中
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <Dashboard user={user} />;
}
```

#### 2. ❌ 数据库查询

```typescript
// ❌ 不好
export default async function proxy(request: NextRequest) {
  const user = await db.users.find({ token });  // 不应在这里！
  return NextResponse.next();
}

// ✅ 好 - 在 Server Component 中
export default async function Page() {
  const user = await db.users.find({ token });
  return <UserProfile user={user} />;
}
```

#### 3. ❌ 复杂业务逻辑

```typescript
// ❌ 不好
export default async function proxy(request: NextRequest) {
  const body = await request.json();
  await processPayment(body);  // 复杂逻辑！
  return NextResponse.next();
}

// ✅ 好 - 在 API Route 中
export async function POST(request: Request) {
  const body = await request.json();
  await processPayment(body);
  return Response.json({ success: true });
}
```

---

## Rewrite vs Redirect

### Rewrite（重写）

URL 不变，内部路由到不同页面：

```typescript
// proxy.ts
export default function proxy(request: NextRequest) {
  // 用户看到的 URL: /products/123
  // 实际渲染的页面: /items/123
  return NextResponse.rewrite(new URL('/items/123', request.url));
}
```

**使用场景**：
- URL 美化
- API 版本管理
- A/B 测试
- 多语言路由

### Redirect（重定向）

URL 改变，浏览器跳转：

```typescript
// proxy.ts
export default function proxy(request: NextRequest) {
  // 用户 URL 从 /old 变为 /new
  return NextResponse.redirect(new URL('/new', request.url));
}
```

**使用场景**：
- 旧链接迁移
- 登录重定向
- 域名更换
- 规范化 URL

---

## Matcher 配置

### 基本语法

```typescript
export const config = {
  matcher: '/about/:path*',
};
```

### 多个路径

```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
  ],
};
```

### 排除路径

```typescript
export const config = {
  matcher: [
    // 排除 API、静态文件、图片
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 条件匹配

```typescript
export const config = {
  matcher: [
    // 只匹配 /api 开头，但不包括 /api/public
    {
      source: '/api/:path*',
      has: [{ type: 'header', key: 'x-api-key' }],
      missing: [{ type: 'query', key: 'public' }],
    },
  ],
};
```

---

## 请求与响应操作

### 读取请求信息

```typescript
export default function proxy(request: NextRequest) {
  // URL 信息
  const { pathname, searchParams } = request.nextUrl;

  // Headers
  const userAgent = request.headers.get('user-agent');
  const country = request.headers.get('x-vercel-ip-country');

  // Cookies
  const token = request.cookies.get('token')?.value;

  // 请求方法
  const method = request.method;

  return NextResponse.next();
}
```

### 修改响应

```typescript
export default function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // 设置 Header
  response.headers.set('x-custom-header', 'value');

  // 设置 Cookie
  response.cookies.set('session', 'abc123', {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7,  // 7 天
  });

  return response;
}
```

---

## 实战案例

### 案例 1：国际化路由

```typescript
// proxy.ts
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检测语言 cookie
  const locale = request.cookies.get('locale')?.value || 'en';

  // 如果 URL 没有语言前缀，添加一个
  if (!pathname.startsWith(`/${locale}`)) {
    return NextResponse.rewrite(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}
```

### 案例 2：维护模式

```typescript
// proxy.ts
export default function proxy(request: NextRequest) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  // 维护模式，但允许特定 IP 访问
  if (maintenanceMode) {
    const ip = request.headers.get('x-forwarded-for');
    const allowedIPs = ['127.0.0.1', '192.168.1.1'];

    if (!allowedIPs.includes(ip || '')) {
      return NextResponse.rewrite(new URL('/maintenance', request.url));
    }
  }

  return NextResponse.next();
}
```

### 案例 3：速率限制（简单版）

```typescript
// proxy.ts
const requestCounts = new Map<string, number>();

export default function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  // 简单计数
  const count = requestCounts.get(ip) || 0;
  requestCounts.set(ip, count + 1);

  // 超过限制
  if (count > 100) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  return NextResponse.next();
}

// 注意：这只是演示，生产环境应使用专业的速率限制服务
```

### 案例 4：旧 API 兼容

```typescript
// proxy.ts
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 将旧 API 路径重写到新路径
  const rewrites = {
    '/api/v1/users': '/api/v2/users',
    '/api/v1/posts': '/api/v2/posts',
  };

  const newPath = rewrites[pathname as keyof typeof rewrites];

  if (newPath) {
    return NextResponse.rewrite(new URL(newPath, request.url));
  }

  return NextResponse.next();
}
```

---

## next.config.ts 中的 Rewrites/Redirects

除了 proxy.ts，也可以在配置文件中定义静态规则：

### Rewrites

```typescript
// next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/blog/:slug',
        destination: '/posts/:slug',  // 内部重写
      },
      {
        source: '/api/:path*',
        destination: 'https://external-api.com/:path*',  // 代理到外部
      },
    ];
  },
};
```

### Redirects

```typescript
// next.config.ts
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true,  // 301 重定向
      },
      {
        source: '/temp',
        destination: '/new',
        permanent: false,  // 302 重定向
      },
    ];
  },
};
```

### proxy.ts vs next.config.ts

| 特性 | proxy.ts | next.config.ts |
|------|----------|----------------|
| 动态逻辑 | ✅ 是 | ❌ 否 |
| 请求信息访问 | ✅ 是 | ❌ 否 |
| 运行时条件 | ✅ 是 | ❌ 否 |
| 性能 | 较慢（每次执行） | 快（构建时生成） |
| 使用场景 | 复杂逻辑 | 简单静态规则 |

---

## middleware.ts (Edge Runtime - 已弃用)

虽然已弃用，但 middleware.ts 仍可用于需要 Edge Runtime 的场景：

```typescript
// middleware.ts (仍可用，但已弃用)
export const config = {
  runtime: 'edge',  // 显式指定 Edge Runtime
};

export function middleware(request: NextRequest) {
  // Edge Runtime 代码
  const geo = request.geo;  // Vercel Edge 信息

  return NextResponse.next();
}
```

**何时使用 middleware.ts**：
- 需要 Edge Runtime 的极低延迟
- 使用 Vercel Edge 特性（如 `request.geo`）
- 但建议逐步迁移到 proxy.ts

---

## 最佳实践

### 1. 保持 proxy.ts 简单

```typescript
// ✅ 好 - 简单的路由逻辑
export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/old') {
    return NextResponse.redirect(new URL('/new', request.url));
  }
  return NextResponse.next();
}

// ❌ 不好 - 复杂的业务逻辑
export default async function proxy(request: NextRequest) {
  const data = await complexBusinessLogic();  // 不应在这里
  return NextResponse.next();
}
```

### 2. 使用 next.config.ts 处理静态规则

```typescript
// ✅ 好 - 简单重定向用配置文件
// next.config.ts
const nextConfig = {
  async redirects() {
    return [
      { source: '/old', destination: '/new', permanent: true },
    ];
  },
};

// proxy.ts 只处理动态逻辑
export default function proxy(request: NextRequest) {
  const locale = detectLocale(request);  // 动态检测
  return NextResponse.rewrite(new URL(`/${locale}`, request.url));
}
```

### 3. 正确处理身份验证

```typescript
// ✅ 好 - 简单的令牌检查
export default function proxy(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// 复杂验证逻辑放在 Server Component 或 API Route 中
```

---

## 常见陷阱

### ❌ 错误 1：在 proxy.ts 中执行复杂逻辑

```typescript
// ❌ 错误
export default async function proxy(request: NextRequest) {
  await sendEmail();  // 不应该！
  await updateDatabase();  // 不应该！
  return NextResponse.next();
}
```

### ❌ 错误 2：忘记返回响应

```typescript
// ❌ 错误
export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/redirect') {
    NextResponse.redirect(new URL('/home', request.url));
    // 忘记 return！
  }
  // 没有返回值
}

// ✅ 正确
export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/redirect') {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  return NextResponse.next();
}
```

### ❌ 错误 3：Matcher 配置错误

```typescript
// ❌ 错误 - 匹配所有路径，包括静态文件
export const config = {
  matcher: '/:path*',
};

// ✅ 正确 - 排除静态文件
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
```

---

## 快速参考

```typescript
// proxy.ts 基本结构
import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  // Rewrite（URL 不变）
  return NextResponse.rewrite(new URL('/new', request.url));

  // Redirect（URL 改变）
  return NextResponse.redirect(new URL('/new', request.url));

  // 继续
  return NextResponse.next();
}

// Matcher 配置
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// 推荐用途
✅ URL 重写和重定向
✅ 地理位置路由
✅ A/B 测试
✅ 简单的路由逻辑

// 不推荐用途
❌ 身份验证
❌ 数据库操作
❌ 复杂业务逻辑
❌ 数据处理
```

---

## 下一步

- [运行时与边缘渲染](./08-runtime-and-edge.md) - 理解 proxy.ts 的运行环境
- [配置与环境管理](./11-configuration-and-env.md) - next.config.ts 配置
- [部署](./12-deployment-and-ci.md) - proxy.ts 部署注意事项

---

**相关资源**
- [Next.js proxy.ts 文档](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Middleware 迁移指南](https://nextjs.org/docs/messages/middleware-upgrade-guide)
- [Next.js 16 变更](https://nextjs.org/blog/next-16)
