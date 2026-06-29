---
description: 快速启动开发环境和常用开发操作
---

# /dev 命令

## 启动开发环境

1. **检查环境**
   - 验证 Node.js 版本（需要 18+）
   - 检查 pnpm 是否安装
   - 验证数据库连接

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **设置环境变量**
   - 检查 `.env.local` 文件
   - 确保必要的环境变量已设置：
     - `DATABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **数据库准备**
   ```bash
   # 生成数据库客户端
   pnpm db:generate

   # 执行迁移
   pnpm db:migrate

   # （可选）填充测试数据
   pnpm db:seed
   ```

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

## 常用开发任务

### 类型检查
```bash
pnpm type-check
```

### 运行测试
```bash
# 运行所有测试
pnpm test

# 运行特定文件测试
pnpm test --run --silent='passed-only' 'user.test.ts'

# 测试覆盖率
pnpm test --coverage
```

### 代码质量
```bash
# Lint 检查
pnpm lint

# 格式化代码
pnpm format
```

### 构建检查
```bash
pnpm build
```

## 开发服务器信息

- **前端**: http://localhost:3000
- **API**: http://localhost:3000/api
- **数据库管理**: 使用 Drizzle Studio

## 故障排除

### 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程
kill -9 [PID]
```

### 清理缓存
```bash
# 清理 Next.js 缓存
rm -rf .next

# 清理 node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 数据库问题
```bash
# 重置数据库
pnpm db:push

# 检查数据库连接
pnpm db:check
```

## 有用的别名

在你的 shell 配置中添加：

```bash
alias pd="pnpm dev"
alias pt="pnpm test"
alias ptc="pnpm type-check"
alias pb="pnpm build"
```