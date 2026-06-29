---
description: 构建、部署和生产环境准备
---

# /build 命令

## 构建前检查

### 1. 环境准备

```bash
# 检查 Node 版本
node --version  # 需要 >= 18.17

# 清理之前的构建
rm -rf .next
rm -rf out

# 安装生产依赖
pnpm install --frozen-lockfile
```

### 2. 代码质量检查

```bash
# TypeScript 类型检查
pnpm type-check

# Lint 检查
pnpm lint

# 运行测试
pnpm test --run

# 检查未提交的更改
git status
```

### 3. 环境变量验证

确保所有必需的环境变量已设置：

```typescript
// scripts/check-env.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const missing = requiredEnvVars.filter(
  key => !process.env[key]
);

if (missing.length > 0) {
  console.error('缺少环境变量:', missing);
  process.exit(1);
}
```

## 生产构建

### 1. 标准构建

```bash
# 生产构建
pnpm build

# 构建输出分析
Next.js build output:
├─ ● (SSG)     静态生成页面
├─ λ (SSR)     服务端渲染页面
├─ ○ (Static)  静态资源
└─ ƒ (Dynamic) 动态路由
```

### 2. 优化构建

```bash
# 使用 SWC 编译器（更快）
pnpm build

# 分析 bundle 大小
ANALYZE=true pnpm build

# 生成站点地图
pnpm build && pnpm postbuild
```

### 3. Docker 构建

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 依赖安装
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 生产阶段
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

## 部署准备

### 1. 数据库迁移

```bash
# 生成迁移文件
pnpm db:generate

# 在生产环境执行迁移
DATABASE_URL=production_url pnpm db:migrate

# 验证 schema
pnpm db:check
```

### 2. 静态资源优化

```bash
# 图片优化
npm install -g @squoosh/cli
squoosh-cli --webp auto public/images/**

# 字体子集化
pip install fonttools
pyftsubset font.ttf --text-file=chars.txt --output-file=font-subset.woff2
```

### 3. 安全检查

```bash
# 依赖漏洞扫描
pnpm audit

# 检查敏感信息
grep -r "password\|secret\|key" src/ --exclude="*.test.*"

# Headers 安全配置
# next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## 部署选项

### 1. Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 生产部署
vercel --prod
```

### 2. Docker 部署

```bash
# 构建镜像
docker build -t myapp:latest .

# 运行容器
docker run -p 3000:3000 --env-file .env.production myapp:latest

# 使用 Docker Compose
docker-compose up -d
```

### 3. 自托管部署

```bash
# PM2 部署
npm install -g pm2

# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'myapp',
    script: 'npm',
    args: 'start',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

# 启动
pm2 start ecosystem.config.js --env production
```

## 监控和日志

### 1. 健康检查端点

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // 检查数据库连接
    await db.select().from(users).limit(1);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    );
  }
}
```

### 2. 性能监控

```typescript
// 集成 Sentry
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 3. 日志配置

```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

## 回滚策略

### 快速回滚

```bash
# Vercel 回滚
vercel rollback

# Docker 回滚
docker run -p 3000:3000 myapp:previous

# Git 回滚
git revert HEAD
git push origin main

# 数据库回滚
pnpm db:rollback
```

### 灾难恢复

1. 保持上一个稳定版本的备份
2. 数据库定期备份
3. 配置文件版本控制
4. 监控告警及时响应

## 构建优化建议

### 减小 Bundle 大小

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
          },
        },
      };
    }
    return config;
  },
};
```

### 提升构建速度

```bash
# 使用缓存
NEXT_TELEMETRY_DISABLED=1 pnpm build

# 并行构建
pnpm build --parallel

# 增量构建
pnpm build --incremental
```