# 配置与环境管理

## next.config 概览

Next.js 16 支持 TypeScript 配置文件（`next.config.ts`），提供完整的类型安全。

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 配置选项
};

export default nextConfig;
```

---

## 1. 基础配置选项

### 常用配置

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 基础路径（用于子路径部署）
  basePath: '/docs',

  // 资源前缀（用于 CDN）
  assetPrefix: 'https://cdn.example.com',

  // 严格模式
  reactStrictMode: true,

  // 启用 SWC 压缩
  swcMinify: true,

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

  // 重写
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },

  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 2. 图片配置

### next/image 配置

```typescript
const nextConfig: NextConfig = {
  images: {
    // 远程图片域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],

    // 图片格式（优先级）
    formats: ['image/avif', 'image/webp'],

    // 设备尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // 图片尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // 禁用静态导入
    disableStaticImages: false,

    // 图片加载器
    loader: 'default',  // 'default' | 'imgix' | 'cloudinary' | 'custom'

    // 最小化缓存时间（秒）
    minimumCacheTTL: 60,
  },
};
```

### 自定义图片加载器

```typescript
const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
};

// lib/image-loader.ts
export default function customLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  return `https://cdn.example.com/${src}?w=${width}&q=${quality || 75}`;
}
```

---

## 3. Turbopack 配置

### Turbopack (Next.js 16 已稳定)

```typescript
const nextConfig: NextConfig = {
  // ✅ Next.js 16 - 顶级配置（不再是 experimental）
  turbopack: {
    // 开发环境文件系统缓存
    fileSystemCacheForDev: true,

    // 模块解析别名
    resolveAlias: {
      '@': './src',
      '@/components': './src/components',
    },

    // 排除的模块
    exclude: ['node_modules/**'],
  },
};
```

**Turbopack 特性**:
- ✅ 默认启用（Next.js 16）
- ✅ 5-10x 更快的开发构建
- ✅ 2-5x 更快的生产构建
- ✅ 增量编译
- ✅ 文件系统缓存

---

## 4. 实验性功能

### Next.js 16 实验性配置

```typescript
const nextConfig: NextConfig = {
  experimental: {
    // TypeScript 配置支持（需要 --experimental-next-config-strip-types 标志）
    typedRoutes: true,  // 类型安全路由

    // 构建适配器（Alpha）
    adapterPath: require.resolve('./my-adapter.js'),

    // Auth 中断
    authInterrupts: true,  // 启用 forbidden() 和 unauthorized()

    // 并行路由
    parallelServerBuildTraces: true,

    // 优化包导入
    optimizePackageImports: ['lucide-react', '@mui/material', 'lodash'],

    // 服务端组件 HMR
    serverComponentsHmrCache: true,
  },
};
```

### Cache Components (PPR)

```typescript
const nextConfig: NextConfig = {
  // ✅ Next.js 16 - Cache Components (替代 experimental.ppr)
  cacheComponents: true,

  // 或按路由启用
  experimental: {
    ppr: 'incremental',  // 已弃用，使用 cacheComponents
  },
};

// app/page.tsx
export const experimental_ppr = true;  // 按页面启用 PPR
```

---

## 5. Webpack 配置

### 自定义 Webpack

```typescript
const nextConfig: NextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 添加自定义规则
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // 添加插件
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.CUSTOM_VAR': JSON.stringify(process.env.CUSTOM_VAR),
      })
    );

    return config;
  },
};
```

---

## 6. 环境变量

### 环境文件类型

Next.js 支持 5 种环境文件（按优先级排序）：

```
.env                    # 所有环境
.env.local              # 所有环境（本地覆盖）- ❌ 不提交到 Git
.env.development        # next dev
.env.development.local  # next dev（本地覆盖）- ❌ 不提交到 Git
.env.production         # next build + next start
.env.production.local   # next build + next start（本地覆盖）- ❌ 不提交到 Git
.env.test               # 测试环境（不会加载 .env.local）
```

### 环境文件示例

```bash
# .env
# 所有环境共享的变量
DATABASE_URL=postgresql://localhost:5432/myapp
API_VERSION=v1

# .env.local (本地开发 - 不提交到 Git)
# 本地覆盖和敏感信息
DATABASE_URL=postgresql://localhost:5432/myapp_dev
SECRET_KEY=local-dev-secret-key-xyz
```

```bash
# .env.development
# 开发环境
NODE_ENV=development
API_URL=http://localhost:3000/api

# .env.production
# 生产环境
NODE_ENV=production
API_URL=https://api.example.com
```

### 加载优先级

```
.env.$(NODE_ENV).local > .env.local > .env.$(NODE_ENV) > .env
```

**示例**（`NODE_ENV=development`）:
1. `.env.development.local` ✅ 最高优先级
2. `.env.local`
3. `.env.development`
4. `.env` ✅ 最低优先级

---

## 7. 服务端与客户端变量

### NEXT_PUBLIC_ 前缀

```bash
# .env.local

# ❌ 仅服务端可用
DATABASE_URL=postgresql://localhost:5432/myapp
SECRET_KEY=your-secret-key

# ✅ 客户端和服务端都可用（会内联到 JavaScript bundle）
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=My App
```

### 使用示例

```typescript
// app/page.tsx (Server Component)
export default function Page() {
  // ✅ 服务端 - 可以访问所有变量
  const dbUrl = process.env.DATABASE_URL;
  const secretKey = process.env.SECRET_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return <ClientComponent />;
}

// components/ClientComponent.tsx
'use client';

export default function ClientComponent() {
  // ✅ 客户端 - 只能访问 NEXT_PUBLIC_ 变量
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // ✅ 可用
  const dbUrl = process.env.DATABASE_URL;  // ❌ undefined

  return <div>API URL: {apiUrl}</div>;
}
```

---

## 8. 内置环境变量

### Next.js 自动设置的变量

```typescript
// 自动可用的环境变量
process.env.NODE_ENV           // 'development' | 'production' | 'test'
process.env.NEXT_PUBLIC_VERCEL_URL  // Vercel 部署 URL
process.env.NEXT_RUNTIME       // 'nodejs' | 'edge'
```

### Vercel 环境变量

```typescript
// Vercel 自动注入（部署时）
process.env.VERCEL             // '1'
process.env.VERCEL_ENV         // 'production' | 'preview' | 'development'
process.env.VERCEL_URL         // 部署 URL
process.env.VERCEL_REGION      // 部署区域
process.env.VERCEL_GIT_COMMIT_SHA      // Git commit SHA
process.env.VERCEL_GIT_COMMIT_MESSAGE  // Git commit message
process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME  // Git 作者
```

---

## 9. 运行时配置

### 公共运行时配置（已弃用）

```typescript
// ❌ 已弃用 - 使用环境变量
const nextConfig: NextConfig = {
  publicRuntimeConfig: {
    apiUrl: process.env.API_URL,
  },
  serverRuntimeConfig: {
    secretKey: process.env.SECRET_KEY,
  },
};

// ✅ 推荐 - 使用环境变量
// .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
SECRET_KEY=your-secret-key
```

---

## 10. TypeScript 路径别名

### 配置路径别名

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"],
      "@/styles/*": ["./styles/*"]
    }
  }
}
```

### 使用别名

```typescript
// ❌ 相对路径 - 难以维护
import Button from '../../../components/ui/Button';
import { formatDate } from '../../../../lib/utils';

// ✅ 路径别名 - 清晰简洁
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
```

---

## 11. 安全最佳实践

### ✅ 环境变量安全

**1. 永远不要提交 `.env.local` 到 Git**

```bash
# .gitignore（Next.js 默认包含）
.env*.local
.env.local
.env.development.local
.env.production.local
```

**2. 敏感信息只放在服务端**

```bash
# ✅ 正确 - 服务端变量（不加 NEXT_PUBLIC_）
DATABASE_URL=postgresql://user:password@localhost:5432/db
SECRET_KEY=your-secret-key-xyz
STRIPE_SECRET_KEY=sk_test_xxx

# ❌ 错误 - 不要暴露敏感信息到客户端
NEXT_PUBLIC_DATABASE_URL=postgresql://...  # 危险！
NEXT_PUBLIC_SECRET_KEY=...  # 危险！
```

**3. 生产环境使用平台环境变量**

```bash
# Vercel Dashboard → Project Settings → Environment Variables
# 或使用 Vercel CLI
vercel env add SECRET_KEY
```

**4. 验证环境变量**

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SECRET_KEY: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SECRET_KEY: process.env.SECRET_KEY,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

// 使用
import { env } from '@/lib/env';
const dbUrl = env.DATABASE_URL;  // ✅ 类型安全 + 验证
```

---

## 12. 环境特定配置

### 按环境加载不同配置

```typescript
// next.config.ts
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // 开发环境配置
  reactStrictMode: isDev,

  // 生产环境配置
  compress: isProd,
  poweredByHeader: !isProd,

  // 条件性重定向
  async redirects() {
    if (isProd) {
      return [
        {
          source: '/admin',
          destination: '/login',
          permanent: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
```

---

## 13. 性能配置

### 优化配置

```typescript
const nextConfig: NextConfig = {
  // 压缩
  compress: true,

  // 移除 X-Powered-By header
  poweredByHeader: false,

  // 生成 ETags
  generateEtags: true,

  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 禁用 X-Powered-By
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],

  // 实验性优化
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/material'],
  },
};
```

---

## 14. 输出配置

### 独立输出（Docker/自托管）

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // 'standalone' | 'export'
};
```

**生成的结构**:
```
.next/standalone/
├── node_modules/        # 最小依赖
├── .next/
├── public/
├── package.json
└── server.js            # 入口文件
```

**Docker 使用**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

### 静态导出

```typescript
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,  // 静态导出需要
  },
};
```

```bash
pnpm build
# 输出到 out/ 目录
```

---

## 常见陷阱

### ❌ 错误 1：在客户端使用服务端变量

```typescript
// ❌ 错误
'use client';
export default function Page() {
  const dbUrl = process.env.DATABASE_URL;  // undefined！
}

// ✅ 正确 - 通过 Server Component 传递
export default function Page() {
  const data = await fetchData();  // 服务端调用
  return <ClientComponent data={data} />;
}
```

### ❌ 错误 2：提交敏感信息

```bash
# ❌ 错误 - 不要提交
git add .env.local

# ✅ 正确 - 确保在 .gitignore 中
.env*.local
```

### ❌ 错误 3：忘记重启开发服务器

```bash
# 修改 .env.local 后需要重启
# Ctrl+C 停止
pnpm dev  # 重新启动
```

### ❌ 错误 4：测试环境加载 .env.local

```bash
# ❌ 测试时 .env.local 不会加载
NODE_ENV=test pnpm test

# ✅ 使用 .env.test
# .env.test
DATABASE_URL=postgresql://localhost:5432/test_db
```

---

## 快速参考

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 基础
  reactStrictMode: true,
  swcMinify: true,

  // Turbopack（Next.js 16 稳定）
  turbopack: {
    fileSystemCacheForDev: true,
  },

  // Cache Components (PPR)
  cacheComponents: true,

  // 图片
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.example.com',
      },
    ],
  },

  // 实验性
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ['lodash', 'lucide-react'],
  },
};

export default nextConfig;
```

```bash
# .env.local
DATABASE_URL=postgresql://localhost:5432/myapp
SECRET_KEY=your-secret-key

# 客户端变量（NEXT_PUBLIC_ 前缀）
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=My App
```

---

## 下一步

- [部署与构建](./12-deployment-and-ci.md) - 生产环境配置
- [性能优化](./07-performance-optimization.md) - 性能配置选项
- [Runtime 与 Edge](./08-runtime-and-edge.md) - Runtime 配置

---

**相关资源**
- [Next.js Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js)
- [Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
- [TypeScript](https://nextjs.org/docs/app/guides/typescript)
