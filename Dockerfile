# 接收构建参数：npm 镜像地址
ARG NPM_REGISTRY=https://registry.npmmirror.com

FROM docker.1ms.run/node:20-alpine AS base

# 配置 Alpine 使用阿里云镜像源（国内加速）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# 配置 pnpm 使用国内 npm 镜像
RUN corepack enable pnpm && \
    pnpm config set registry ${NPM_REGISTRY} && \
    pnpm i --frozen-lockfile

FROM base AS builder
# 继承 npm 镜像配置
ARG NPM_REGISTRY
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 配置并使用国内镜像构建
RUN corepack enable pnpm && \
    pnpm config set registry ${NPM_REGISTRY} && \
    pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
