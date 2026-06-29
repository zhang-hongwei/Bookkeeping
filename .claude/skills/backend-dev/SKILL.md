---
name: backend-dev
version: 1.0.0
description: Next.js 16 API 路由和服务层开发规范
priority: high
dependencies: [database-dev]
triggers:
  keywords: [api, backend, service, endpoint, server, route, repository, 后端, 接口, 服务]
  files: ["app/api/**/*.ts", "services/**/*.ts", "repositories/**/*.ts"]
  intents: ["create api", "add endpoint", "implement service"]
---

# Backend Development Skill

> Next.js 16 API Routes + Service Layer + Repository Pattern 后端开发规范

> ⚠️ **重要提示**：本规范为项目标准，替代 `.claude/rules/backend-architecture.md`。如有冲突，以本文件为准。

## 🏗️ 三层架构

```
请求流程：
Client → API Route → Service → Repository/Database → PostgreSQL
                ↓
        Server Component
```

### 目录结构

```
src/
├── app/api/           # API 路由层
├── services/          # 业务逻辑层
├── repositories/      # 数据仓库层（复杂查询）
└── database/          # 数据库层
    ├── schema/        # Drizzle ORM 表定义
    └── clients/       # 数据库客户端
```

## 📝 API Route 开发

### 基础结构

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import { z } from 'zod';

// GET 请求
export async function GET(request: NextRequest) {
  try {
    const users = await userService.getAll();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}

// POST 请求
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['user', 'admin']).default('user')
});

export async function POST(request: NextRequest) {
  try {
    // 1. 解析和验证请求体
    const body = await request.json();
    const data = createUserSchema.parse(body);

    // 2. 调用服务层
    const user = await userService.create(data);

    // 3. 返回响应
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    );
  }
}
```

### 动态路由

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await userService.getById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: '获取用户失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const user = await userService.update(params.id, data);

    return NextResponse.json(user);
  } catch (error) {
    // 错误处理...
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await userService.delete(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // 错误处理...
  }
}
```

## 🔧 Service 层开发

### Service 类结构

```typescript
// services/user.service.ts
import { db } from '@/database/clients/db';
import { users, type InsertUser } from '@/database/schema';
import { UserRepository } from '@/repositories/user.repository';
import { eq } from 'drizzle-orm';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  // 简单查询：直接使用数据库层
  async getAll() {
    return await db.select().from(users);
  }

  async getById(id: string) {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return results[0] || null;
  }

  // 复杂操作：使用 Repository
  async getUserWithStats(userId: string) {
    return await this.repository.getUserWithStats(userId);
  }

  // 业务逻辑
  async create(data: InsertUser) {
    // 1. 业务验证
    const existingUser = await this.checkEmailExists(data.email);
    if (existingUser) {
      throw new Error('邮箱已存在');
    }

    // 2. 数据转换
    const userData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 3. 创建用户
    const [user] = await db.insert(users).values(userData).returning();

    // 4. 发送欢迎邮件（异步）
    this.sendWelcomeEmail(user.email).catch(console.error);

    return user;
  }

  async update(id: string, data: Partial<InsertUser>) {
    const [updated] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      throw new Error('用户不存在');
    }

    return updated;
  }

  async delete(id: string) {
    // 使用 Repository 处理关联删除
    return await this.repository.deleteWithRelations(id);
  }

  // 私有方法
  private async checkEmailExists(email: string) {
    const results = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return results.length > 0;
  }

  private async sendWelcomeEmail(email: string) {
    // 邮件发送逻辑
  }
}

// 导出单例
export const userService = new UserService();
```

## 🗄️ Repository 层开发

### Repository 使用场景

```typescript
// repositories/user.repository.ts
import { db } from '@/database/clients/db';
import { users, posts, comments } from '@/database/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

export class UserRepository {
  // 复杂查询：多表关联
  async getUserWithStats(userId: string) {
    const result = await db
      .select({
        user: users,
        postCount: sql<number>`count(distinct ${posts.id})`,
        commentCount: sql<number>`count(distinct ${comments.id})`,
        lastPostDate: sql<Date>`max(${posts.createdAt})`
      })
      .from(users)
      .leftJoin(posts, eq(posts.userId, users.id))
      .leftJoin(comments, eq(comments.userId, users.id))
      .where(eq(users.id, userId))
      .groupBy(users.id);

    return result[0] || null;
  }

  // 事务处理：关联删除
  async deleteWithRelations(userId: string) {
    return await db.transaction(async (tx) => {
      // 1. 删除用户的评论
      await tx.delete(comments).where(eq(comments.userId, userId));

      // 2. 删除用户的文章
      await tx.delete(posts).where(eq(posts.userId, userId));

      // 3. 删除用户
      const [deleted] = await tx
        .delete(users)
        .where(eq(users.id, userId))
        .returning();

      return deleted;
    });
  }

  // 复杂统计
  async getUserActivity(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await db
      .select({
        date: sql<string>`date(${posts.createdAt})`,
        postCount: sql<number>`count(*)`,
        avgViews: sql<number>`avg(${posts.views})`
      })
      .from(posts)
      .where(
        and(
          eq(posts.userId, userId),
          sql`${posts.createdAt} >= ${startDate}`
        )
      )
      .groupBy(sql`date(${posts.createdAt})`)
      .orderBy(desc(sql`date(${posts.createdAt})`));
  }
}
```

## ⚡ 最佳实践

### 1. 错误处理

```typescript
// utils/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

// 在 API Route 中使用
export async function POST(request: NextRequest) {
  try {
    // ...业务逻辑
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
```

### 2. 请求验证

```typescript
// utils/validate.ts
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(
        '请求参数无效',
        400,
        'VALIDATION_ERROR'
      );
    }
    throw error;
  }
}

// 使用
const data = validateRequest(createUserSchema, body);
```

### 3. 认证中间件

```typescript
// middleware/auth.ts
import { auth } from '@clerk/nextjs/server';

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new APIError('未授权', 401, 'UNAUTHORIZED');
  }

  return userId;
}

// 在 API Route 中使用
export async function GET(request: NextRequest) {
  const userId = await requireAuth();
  // 继续处理...
}
```

### 4. 响应格式统一

```typescript
// utils/response.ts
export class APIResponse {
  static success<T>(data: T, message?: string) {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    });
  }

  static error(message: string, status = 500, code?: string) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        code,
        timestamp: new Date().toISOString()
      },
      { status }
    );
  }

  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number
  ) {
    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      },
      timestamp: new Date().toISOString()
    });
  }
}
```

## 🔄 数据流最佳实践

### 删除操作顺序

```typescript
// ✅ 推荐：先数据库，后文件
async deleteResource(id: string) {
  // 1. 先删除数据库记录
  const deleted = await repository.delete(id);

  // 2. 再删除相关文件
  if (deleted.fileUrl) {
    await fileService.deleteFile(deleted.fileUrl);
  }
}
```

### Repository 封装原则

```typescript
// ✅ 推荐：连续的数据库操作封装到 Repository
class OrderRepository {
  async createWithItems(orderData, items) {
    return await db.transaction(async (tx) => {
      // 1. 创建订单
      const [order] = await tx.insert(orders).values(orderData).returning();

      // 2. 创建订单项
      const orderItems = await tx.insert(orderItems).values(
        items.map(item => ({ ...item, orderId: order.id }))
      ).returning();

      // 3. 更新库存
      for (const item of items) {
        await tx.update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      return { order, items: orderItems };
    });
  }
}
```

## 📚 更多资源

详细指南请查看 `resources/` 目录：

### 🏗️ 架构和设计

- **[architecture-overview.md](resources/architecture-overview.md)** - 三层架构总览和请求流程
- **[routing-and-controllers.md](resources/routing-and-controllers.md)** - API Routes 和控制器模式
- **[service-patterns.md](resources/service-patterns.md)** - Service 层业务逻辑模式
- **[repository-patterns.md](resources/repository-patterns.md)** - Repository 数据访问模式

### ⚙️ 核心功能

- **[validation.md](resources/validation.md)** - Zod 验证模式和最佳实践
- **[error-handling.md](resources/error-handling.md)** - 错误处理策略和自定义错误类

### 🧪 测试

- **[testing.md](resources/testing.md)** - 后端测试指南（API Routes、Services、Repositories）