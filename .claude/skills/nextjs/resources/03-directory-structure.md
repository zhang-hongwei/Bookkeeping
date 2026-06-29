# Next.js 目录结构规范

## 标准目录结构

```
my-nextjs-app/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── global.css          # 全局样式
│   ├── (routes)/           # 路由目录
│   └── api/                # API Routes
│
├── components/             # 共享组件
│   ├── ui/                 # UI 组件
│   ├── forms/              # 表单组件
│   └── layouts/            # 布局组件
│
├── lib/                    # 工具函数和配置
│   ├── db/                 # 数据库相关
│   ├── utils/              # 工具函数
│   └── constants.ts        # 常量
│
├── hooks/                  # 自定义 React Hooks
│   ├── use-auth.ts
│   └── use-modal.ts
│
├── types/                  # TypeScript 类型定义
│   ├── api.ts
│   └── models.ts
│
├── public/                 # 静态资源
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
├── styles/                 # 样式文件
│   └── globals.css
│
├── .env.local              # 环境变量
├── next.config.ts          # Next.js 配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.ts      # Tailwind CSS 配置
└── package.json
```

---

## app 目录详解

### 核心结构

```
app/
├── layout.tsx              # 根布局（必需）
├── page.tsx                # 首页
├── loading.tsx             # 全局加载状态
├── error.tsx               # 全局错误处理
├── not-found.tsx           # 404 页面
├── global.css              # 全局样式
│
├── (marketing)/            # Route Group: 营销页面
│   ├── layout.tsx
│   ├── page.tsx            → /
│   ├── about/
│   │   └── page.tsx        → /about
│   └── pricing/
│       └── page.tsx        → /pricing
│
├── (app)/                  # Route Group: 应用功能
│   ├── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx        → /dashboard
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── analytics/
│   │       └── page.tsx    → /dashboard/analytics
│   │
│   └── settings/
│       ├── page.tsx        → /settings
│       └── profile/
│           └── page.tsx    → /settings/profile
│
└── api/                    # API Routes
    ├── auth/
    │   └── route.ts        → /api/auth
    ├── posts/
    │   ├── route.ts        → /api/posts
    │   └── [id]/
    │       └── route.ts    → /api/posts/[id]
    └── webhooks/
        └── route.ts        → /api/webhooks
```

### 特殊文件说明

| 文件 | 作用 | 必需 | 约束 |
|------|------|------|------|
| `layout.tsx` | 共享布局 | 根布局必需 | 必须包含 `<html>` 和 `<body>` |
| `page.tsx` | 页面 UI | 是（使路由可访问） | 默认 Server Component |
| `loading.tsx` | 加载状态 | 否 | 自动用 Suspense 包裹 |
| `error.tsx` | 错误边界 | 否 | 必须是 Client Component |
| `not-found.tsx` | 404 UI | 否 | 调用 `notFound()` 时显示 |
| `template.tsx` | 导航时重新渲染的布局 | 否 | 类似 layout，但会重置状态 |
| `route.ts` | API 端点 | 否 | 不能与 page.tsx 同时存在 |

---

## components 目录组织

### 推荐结构

```
components/
├── ui/                     # 基础 UI 组件
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── modal.tsx
│   └── index.ts            # 统一导出
│
├── forms/                  # 表单组件
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── contact-form.tsx
│
├── layouts/                # 布局组件
│   ├── header.tsx
│   ├── footer.tsx
│   ├── sidebar.tsx
│   └── navigation.tsx
│
├── features/               # 功能组件
│   ├── auth/
│   │   ├── login-button.tsx
│   │   └── logout-button.tsx
│   ├── blog/
│   │   ├── post-list.tsx
│   │   └── post-card.tsx
│   └── dashboard/
│       ├── stat-card.tsx
│       └── chart.tsx
│
└── shared/                 # 共享组件
    ├── loading-spinner.tsx
    ├── error-message.tsx
    └── empty-state.tsx
```

### 组件命名约定

```typescript
// ✅ 好 - PascalCase, 描述性名称
components/ui/Button.tsx
components/forms/LoginForm.tsx
components/layouts/DashboardHeader.tsx

// ❌ 不好
components/ui/btn.tsx                // 缩写
components/forms/form1.tsx           // 无意义
components/layouts/component.tsx     // 太通用
```

---

## lib 目录组织

```
lib/
├── db/                     # 数据库相关
│   ├── schema.ts           # 数据库 schema
│   ├── queries.ts          # 查询函数
│   └── client.ts           # 数据库客户端
│
├── api/                    # API 客户端
│   ├── client.ts           # 基础 API 客户端
│   ├── posts.ts            # Posts API
│   └── users.ts            # Users API
│
├── utils/                  # 工具函数
│   ├── format.ts           # 格式化函数
│   ├── validation.ts       # 验证函数
│   └── helpers.ts          # 辅助函数
│
├── auth/                   # 认证相关
│   ├── config.ts
│   ├── session.ts
│   └── permissions.ts
│
└── constants.ts            # 全局常量
```

### 工具函数示例

```typescript
// lib/utils/format.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN').format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amount);
}

// lib/utils/validation.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// lib/constants.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const ITEMS_PER_PAGE = 20;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

---

## public 目录

```
public/
├── images/                 # 图片资源
│   ├── logo.svg
│   ├── hero.jpg
│   └── avatars/
│
├── fonts/                  # 字体文件
│   ├── custom-font.woff2
│   └── custom-font.woff
│
├── icons/                  # 图标
│   ├── icon-192x192.png
│   └── icon-512x512.png
│
├── favicon.ico             # 网站图标
├── robots.txt              # 爬虫配置
├── sitemap.xml             # 站点地图
└── manifest.json           # PWA 配置
```

### 静态资源引用

```typescript
import Image from 'next/image';

// ✅ 使用 /public 下的资源
<Image src="/images/logo.svg" alt="Logo" width={120} height={40} />

// ❌ 不要包含 public
<Image src="/public/images/logo.svg" alt="Logo" />  // 错误！
```

---

## 配置文件

### next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 图片配置
  images: {
    domains: ['example.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // 实验性功能
  experimental: {
    ppr: 'incremental',           // Partial Prerendering
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // 环境变量
  env: {
    CUSTOM_KEY: 'my-value',
  },

  // 重定向
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 路径别名配置

### 推荐别名

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],                      // 根目录
      "@/components/*": ["./components/*"], // 组件
      "@/lib/*": ["./lib/*"],              // 工具
      "@/types/*": ["./types/*"],          // 类型
      "@/hooks/*": ["./hooks/*"],          // Hooks
      "@/styles/*": ["./styles/*"]         // 样式
    }
  }
}
```

### 使用示例

```typescript
// ✅ 使用路径别名
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/format';
import { User } from '@/types/models';

// ❌ 避免相对路径
import { Button } from '../../../components/ui/button';
import { formatDate } from '../../../lib/utils/format';
```

---

## App Router vs Pages Router

### Pages Router (旧版)

```
pages/
├── _app.tsx                # 自定义 App
├── _document.tsx           # 自定义 Document
├── index.tsx               → /
├── about.tsx               → /about
├── blog/
│   ├── index.tsx           → /blog
│   └── [slug].tsx          → /blog/[slug]
└── api/
    └── hello.ts            → /api/hello
```

### App Router (推荐)

```
app/
├── layout.tsx              # 根布局
├── page.tsx                → /
├── about/
│   └── page.tsx            → /about
├── blog/
│   ├── page.tsx            → /blog
│   └── [slug]/
│       └── page.tsx        → /blog/[slug]
└── api/
    └── hello/
        └── route.ts        → /api/hello
```

---

## 大型项目结构

```
my-app/
├── app/                    # App Router
│   ├── (auth)/
│   ├── (marketing)/
│   └── (app)/
│
├── components/             # 共享组件
│   ├── ui/
│   ├── features/
│   └── layouts/
│
├── lib/                    # 核心库
│   ├── db/
│   ├── api/
│   └── utils/
│
├── features/               # 功能模块
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── blog/
│   └── dashboard/
│
├── hooks/                  # 全局 hooks
├── types/                  # 全局类型
├── config/                 # 配置文件
│   ├── site.ts
│   └── navigation.ts
│
├── public/
├── styles/
└── tests/                  # 测试文件
    ├── unit/
    └── e2e/
```

---

## 最佳实践

### 1. 保持结构扁平

```
// ❌ 不好 - 过深嵌套
components/features/dashboard/analytics/charts/bar/BarChart.tsx

// ✅ 好 - 扁平结构
components/features/dashboard/AnalyticsBarChart.tsx
```

### 2. 按功能分组

```
features/
├── auth/                   # 认证功能
│   ├── components/
│   ├── hooks/
│   ├── api/
│   └── types/
│
└── blog/                   # 博客功能
    ├── components/
    ├── hooks/
    ├── api/
    └── types/
```

### 3. 使用 index.ts 统一导出

```typescript
// components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Card } from './card';

// 使用
import { Button, Input, Card } from '@/components/ui';
```

### 4. 分离服务端和客户端代码

```
lib/
├── server/                 # 服务端专用（数据库、API 密钥）
│   ├── db.ts
│   └── auth.ts
│
└── client/                 # 客户端专用（浏览器 API）
    ├── storage.ts
    └── analytics.ts
```

---

## 环境变量管理

```
# .env.local（不提交到 git）
DATABASE_URL=postgresql://...
API_SECRET_KEY=xxx

# 客户端变量（NEXT_PUBLIC_ 前缀）
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

```typescript
// 服务端使用
const dbUrl = process.env.DATABASE_URL;
const secretKey = process.env.API_SECRET_KEY;

// 客户端使用
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## 常见陷阱

### ❌ 错误 1：在 public 目录使用 import

```typescript
// ❌ 错误
import logo from '../public/logo.svg';

// ✅ 正确 - 使用绝对路径
<Image src="/logo.svg" alt="Logo" width={120} height={40} />
```

### ❌ 错误 2：混淆 app 和 pages

```
// ❌ 错误 - 同时使用两种路由系统
my-app/
├── app/
│   └── page.tsx            # App Router
└── pages/
    └── index.tsx           # Pages Router - 冲突！

// ✅ 正确 - 只使用一种
my-app/
└── app/
    └── page.tsx            # 只使用 App Router
```

### ❌ 错误 3：错误的路径别名

```typescript
// ❌ 错误
import { Button } from '@components/ui/button';  // 缺少 /

// ✅ 正确
import { Button } from '@/components/ui/button';
```

---

## 快速参考

```
必需目录：
  app/                # 路由和页面

推荐目录：
  components/         # 共享组件
  lib/               # 工具函数
  public/            # 静态资源
  types/             # 类型定义

可选目录：
  hooks/             # 自定义 hooks
  styles/            # 样式文件
  features/          # 功能模块
  config/            # 配置文件
```

---

## 下一步

- [路由系统](./routing-system.md) - 理解 Next.js 路由
- [Server/Client Components](./server-client-components.md) - 组件架构
- [项目结构规范](./project-structure.md) - 大型项目最佳实践

---

**相关资源**
- [Next.js 项目结构文档](https://nextjs.org/docs/getting-started/project-structure)
- [TypeScript 配置](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
