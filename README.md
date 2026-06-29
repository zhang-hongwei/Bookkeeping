This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. 数据库设置

此模板默认使用本地 PostgreSQL 数据库。请先设置数据库：

📖 **详细设置指南**: [docs/database-setup.md](./docs/database-setup.md)

**快速设置 (macOS)**:
```bash
# 安装 PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# 创建数据库
psql postgres -c "CREATE USER postgres WITH PASSWORD 'password';"
psql postgres -c "CREATE DATABASE nextjs_template_dev OWNER postgres;"

# 初始化数据库
pnpm db:generate && pnpm db:migrate
```

### 2. 启动开发服务器

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🔧 项目特性

### 🔐 身份验证和安全
- **NextAuth.js v5**: 完整的身份验证解决方案
- **Middleware 保护**: 自动路由保护和权限控制
- **安全头**: 自动添加安全相关的 HTTP 头

### 📊 数据库和存储  
- **多数据库支持**: 本地 PostgreSQL、Supabase、Neon
- **Drizzle ORM**: 类型安全的数据库操作
- **文件存储**: 统一的存储抽象层，支持多种存储服务

### 🎨 UI 和样式
- **Material-UI v7**: 现代化的 React UI 组件库
- **TypeScript**: 完整的类型安全支持
- **响应式设计**: 适配各种设备尺寸

## 📚 文档

- 📖 [数据库设置指南](./docs/database-setup.md)
- 🛡️ [Middleware 中间件文档](./docs/middleware.md)
- 🎯 [Middleware 作用说明](./docs/middleware-purpose.md)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
