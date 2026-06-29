# 12. 部署与 CI/CD

> 生产环境部署、持续集成/持续部署、监控与运维

---

## 📋 目录

- [部署平台选择](#部署平台选择)
- [Vercel 部署](#vercel-部署)
- [Docker 容器化](#docker-容器化)
- [CI/CD 流程](#cicd-流程)
- [环境管理](#环境管理)
- [性能监控](#性能监控)
- [错误追踪](#错误追踪)
- [最佳实践](#最佳实践)

---

## 部署平台选择

### 1. Vercel (推荐)

**优势**：
- ✅ Next.js 原生支持，零配置部署
- ✅ 自动 CI/CD 集成
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 预览部署（每个 PR 自动生成预览环境）
- ✅ Edge Functions 支持
- ✅ 内置性能分析

**适用场景**：
- 中小型应用
- 快速迭代项目
- 需要边缘计算能力
- 团队协作开发

### 2. 自托管 (Docker)

**优势**：
- ✅ 完全控制基础设施
- ✅ 成本可控
- ✅ 支持复杂网络配置
- ✅ 私有部署

**适用场景**：
- 大型企业应用
- 数据安全要求高
- 已有云基础设施
- 需要特殊配置

### 3. 其他平台

- **AWS Amplify**: AWS 生态集成
- **Netlify**: 类似 Vercel
- **Railway**: 简单易用
- **Render**: 自动化部署
- **Cloudflare Pages**: 边缘优化

---

## Vercel 部署

### 基本部署流程

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
# 或
pnpm add -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 初始化项目

```bash
# 在项目根目录
vercel

# 回答配置问题
? Set up and deploy "~/project"? [Y/n] y
? Which scope? Your Name
? Link to existing project? [y/N] n
? What's your project's name? my-next-app
? In which directory is your code located? ./
```

#### 4. 部署到生产环境

```bash
# 部署到生产
vercel --prod

# 查看部署状态
vercel ls

# 查看域名
vercel domains ls
```

### GitHub 集成部署

#### 1. 连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Import Project"
3. 选择 GitHub 仓库
4. 配置构建设置

#### 2. 自动部署配置

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["sfo1", "hnd1"],
  "git": {
    "deploymentEnabled": {
      "main": true,
      "preview": true
    }
  }
}
```

#### 3. 环境变量配置

```bash
# 通过 CLI 设置
vercel env add NEXT_PUBLIC_API_URL production
vercel env add DATABASE_URL production

# 或在 Dashboard 中配置
# Settings > Environment Variables
```

### 部署配置优化

```typescript
// next.config.ts
const nextConfig = {
  // 输出模式
  output: 'standalone', // 适用于 Docker 部署

  // 压缩
  compress: true,

  // 严格模式
  reactStrictMode: true,

  // 性能分析
  productionBrowserSourceMaps: false, // 生产环境禁用 source maps

  // 图片优化
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Docker 容器化

### Dockerfile

```dockerfile
# ==================== 多阶段构建 ====================

# Stage 1: 依赖安装
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 复制包管理文件
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage 2: 构建应用
FROM node:20-alpine AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm build

# Stage 3: 生产镜像
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    env_file:
      - .env.production
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - app-network

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

### .dockerignore

```
# 依赖
node_modules
.pnp
.pnp.js

# 测试
coverage
*.log

# Next.js
.next/
out/

# 生产
build

# 其他
.DS_Store
*.pem

# 调试
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 本地环境文件
.env*.local
.env.development

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode
.idea
```

### 构建和运行

```bash
# 构建镜像
docker build -t my-next-app .

# 运行容器
docker run -p 3000:3000 my-next-app

# 使用 docker-compose
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

---

## CI/CD 流程

### GitHub Actions

#### 基础工作流

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test --run
        env:
          NODE_ENV: test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          NEXT_TELEMETRY_DISABLED: 1

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next
```

#### 部署工作流

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### Docker 部署工作流

```yaml
# .github/workflows/docker-deploy.yml
name: Docker Deploy

on:
  push:
    branches: [main]
    tags:
      - 'v*'

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app
            docker-compose pull
            docker-compose up -d
            docker-compose logs -f
```

---

## 环境管理

### 环境变量层次

```bash
# 1. 本地开发
.env.local           # 本地开发（不提交到 git）
.env.development     # 开发环境默认值

# 2. 测试环境
.env.test           # 测试环境

# 3. 预发布环境
.env.staging        # 预发布环境

# 4. 生产环境
.env.production     # 生产环境（敏感信息通过 CI/CD 注入）
```

### 环境配置示例

```bash
# .env.production
NODE_ENV=production

# 数据库
DATABASE_URL=postgresql://user:pass@host:5432/db

# API
NEXT_PUBLIC_API_URL=https://api.example.com
API_SECRET_KEY=***

# 认证
NEXTAUTH_URL=https://example.com
NEXTAUTH_SECRET=***

# 第三方服务
NEXT_PUBLIC_STRIPE_KEY=pk_live_***
STRIPE_SECRET_KEY=sk_live_***

# 监控
SENTRY_DSN=https://***@sentry.io/***
NEXT_PUBLIC_ANALYTICS_ID=G-***

# 缓存
REDIS_URL=redis://host:6379
```

### 环境变量验证

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(32),
  NEXTAUTH_SECRET: z.string().min(32),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_SECRET_KEY: process.env.API_SECRET_KEY,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
});

// 类型安全的环境变量
export type Env = z.infer<typeof envSchema>;
```

---

## 性能监控

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 自定义性能监控

```typescript
// lib/monitoring.ts
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const { id, name, label, value } = metric;

  // 发送到分析服务
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js Metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    });
  }

  // 或发送到自定义端点
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    });
  }

  console.log(metric);
}
```

```typescript
// app/layout.tsx
import { reportWebVitals } from '@/lib/monitoring';

export { reportWebVitals };
```

### 关键指标

```typescript
// lib/performance.ts
export const performanceMetrics = {
  // Core Web Vitals
  LCP: 'Largest Contentful Paint',     // < 2.5s
  FID: 'First Input Delay',             // < 100ms
  CLS: 'Cumulative Layout Shift',       // < 0.1

  // Next.js Metrics
  TTFB: 'Time to First Byte',           // < 600ms
  FCP: 'First Contentful Paint',        // < 1.8s
  INP: 'Interaction to Next Paint',     // < 200ms
};
```

---

## 错误追踪

### Sentry 集成

#### 1. 安装 Sentry

```bash
pnpm add @sentry/nextjs
```

#### 2. 配置 Sentry

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 采样率
  tracesSampleRate: 1.0,

  // 环境
  environment: process.env.NODE_ENV,

  // 忽略错误
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  // 面包屑
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'console') {
      return null;
    }
    return breadcrumb;
  },
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### 3. 错误边界

```typescript
// components/ErrorBoundary.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 发送错误到 Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div>
      <h2>出错了！</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### 日志管理

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// 使用
logger.info('Server started');
logger.error({ err: error }, 'Failed to fetch data');
```

---

## 最佳实践

### 1. 构建优化

```typescript
// next.config.ts
const nextConfig = {
  // 启用 SWC minification
  swcMinify: true,

  // 压缩
  compress: true,

  // 移除 console.log
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 严格模式
  reactStrictMode: true,

  // 实验性功能
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
};
```

### 2. 缓存策略

```typescript
// app/api/data/route.ts
export async function GET() {
  const data = await fetchData();

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

### 3. 安全头部

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 4. 健康检查端点

```typescript
// app/api/health/route.ts
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 检查数据库连接
    await db.execute('SELECT 1');

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

### 5. 部署检查清单

#### 构建前

- ✅ 运行类型检查：`pnpm type-check`
- ✅ 运行测试：`pnpm test --run`
- ✅ 运行 lint：`pnpm lint`
- ✅ 检查构建：`pnpm build`
- ✅ 环境变量验证
- ✅ 依赖安全扫描：`pnpm audit`

#### 部署后

- ✅ 验证健康检查端点
- ✅ 测试关键功能
- ✅ 检查错误追踪
- ✅ 监控性能指标
- ✅ 验证缓存策略
- ✅ 测试回滚流程

### 6. 回滚策略

```bash
# Vercel
vercel rollback [deployment-url]

# Docker
docker-compose down
docker-compose up -d --build --force-recreate
```

### 7. 零停机部署

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
```

---

## 监控仪表盘

### 关键指标

```typescript
// 部署监控指标
export const deploymentMetrics = {
  // 构建指标
  buildTime: 'Build duration',
  buildSize: 'Build output size',

  // 性能指标
  responseTime: 'API response time',
  throughput: 'Requests per second',
  errorRate: 'Error rate',

  // 资源使用
  cpuUsage: 'CPU usage',
  memoryUsage: 'Memory usage',
  diskUsage: 'Disk usage',

  // 用户指标
  activeUsers: 'Active users',
  pageViews: 'Page views',
  sessionDuration: 'Session duration',
};
```

---

## 故障排查

### 常见问题

#### 1. 构建失败

```bash
# 清理缓存
rm -rf .next node_modules
pnpm install
pnpm build

# 检查日志
pnpm build --debug
```

#### 2. 环境变量问题

```bash
# 验证环境变量
node -e "console.log(process.env.DATABASE_URL)"

# Vercel
vercel env pull .env.local
```

#### 3. 性能问题

```bash
# 分析包大小
pnpm build --analyze

# 性能追踪
NODE_OPTIONS='--inspect' pnpm dev
```

---

## 参考资源

### 官方文档
- [Vercel 部署文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)

### 工具
- [Sentry](https://sentry.io) - 错误追踪
- [Vercel Analytics](https://vercel.com/analytics) - 性能分析
- [GitHub Actions](https://github.com/features/actions) - CI/CD

---

**版本**: 1.0.0
**最后更新**: 2025-10-31
**状态**: ✅ 生产就绪
