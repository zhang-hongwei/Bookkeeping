---
name: database-dev
version: 1.0.0
description: Drizzle ORM 和 PostgreSQL 数据库开发规范
priority: high
dependencies: []
triggers:
  keywords: [database, drizzle, postgres, schema, query, migration, sql, table, 数据库, 表, 查询]
  files: ["database/**/*.ts", "*.sql", "drizzle.config.ts"]
  intents: ["create table", "add migration", "query data"]
---

# Database Development Skill

> Drizzle ORM + PostgreSQL + Neon 数据库开发最佳实践

> ⚠️ **重要提示**：本规范为项目标准，替代 `.claude/rules/drizzle-schema-style-guide.md` 和 `.claude/rules/define-database-model.md`。如有冲突，以本文件为准。

## 🚀 快速开始

创建新的数据库模型时：

1. **阅读架构指南** - 参考 [backend-architecture.md](../../rules/backend-architecture.md) 了解三层架构
2. **查看模板** - 参考 `src/database/models/_template.ts` 创建新模型
3. **使用 Repositories** - 如果操作涉及多个模型或复杂查询，考虑在 `src/database/repositories/` 中定义

---

## 📝 Schema 定义

### 🎯 本项目规范

**ID 策略**: 使用 `uuid().defaultRandom()`
**命名约定**:
- **数据库列名**: `snake_case`（如 `created_at`）
- **TypeScript 字段名**: `camelCase`（如 `createdAt`）
- **表名**: `snake_case` 复数形式（如 `meal_records`）

### 基础表结构

```typescript
// database/schema/products.ts
import { pgTable, text, timestamp, uuid, boolean, integer, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const products = pgTable('products', {
  // 主键 - 使用 UUID
  id: uuid('id').primaryKey().defaultRandom(),

  // 基本字段 - 数据库用 snake_case，TS 字段用 camelCase
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: integer('price').notNull(), // 以分为单位
  isActive: boolean('is_active').default(true),

  // 外键
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // 时间戳 - 数据库用 snake_case
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // 软删除
});

// 类型导出
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Zod schemas
export const insertProductSchema = createInsertSchema(products, {
  name: z.string().min(1).max(255),
  price: z.number().int().min(0),
});

export const selectProductSchema = createSelectSchema(products);
```

### 关系定义

```typescript
// database/schema/posts.ts
import { pgTable, text, uuid, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content'),
  views: integer('views').default(0),

  // 外键
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// database/schema/relations.ts
import { relations } from 'drizzle-orm';
import { users, posts, comments } from './index';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));
```

### 索引定义

```typescript
// database/schema/posts.ts
import { pgTable, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  // ... 字段定义
}, (table) => ({
  // 普通索引
  userIdIdx: index('posts_user_id_idx').on(table.userId),
  createdAtIdx: index('posts_created_at_idx').on(table.createdAt),

  // 复合索引
  userCreatedIdx: index('posts_user_created_idx')
    .on(table.userId, table.createdAt),

  // 唯一索引
  slugIdx: uniqueIndex('posts_slug_idx').on(table.slug),
}));
```

## 🔍 查询操作

### 基础查询

```typescript
// database/queries/user.queries.ts
import { db } from '@/database/clients/db';
import { users, posts } from '@/database/schema';
import { eq, and, or, like, gte, desc, asc, sql } from 'drizzle-orm';

// 简单查询
export async function getUsers() {
  return await db.select().from(users);
}

// 条件查询
export async function getUserByEmail(email: string) {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return results[0] || null;
}

// 复合条件
export async function getActiveAdmins() {
  return await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.role, 'admin'),
        eq(users.isActive, true)
      )
    );
}

// 模糊搜索
export async function searchUsers(keyword: string) {
  return await db
    .select()
    .from(users)
    .where(
      or(
        like(users.name, `%${keyword}%`),
        like(users.email, `%${keyword}%`)
      )
    )
    .orderBy(desc(users.createdAt));
}
```

### 关联查询

```typescript
// 使用 join
export async function getUsersWithPosts() {
  return await db
    .select({
      user: users,
      post: posts,
    })
    .from(users)
    .leftJoin(posts, eq(users.id, posts.userId));
}

// 使用 relations（推荐）
export async function getUserWithRelations(userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      posts: {
        orderBy: desc(posts.createdAt),
        limit: 10,
      },
      comments: true,
    },
  });
}

// 嵌套关系
export async function getPostWithDetails(postId: string) {
  return await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: {
      author: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      comments: {
        with: {
          user: true,
        },
        orderBy: desc(comments.createdAt),
      },
    },
  });
}
```

### 聚合查询

```typescript
// 统计查询
export async function getUserStats(userId: string) {
  const stats = await db
    .select({
      postCount: sql<number>`count(*)::int`,
      totalViews: sql<number>`sum(${posts.views})::int`,
      avgViews: sql<number>`avg(${posts.views})::float`,
      latestPost: sql<Date>`max(${posts.createdAt})`,
    })
    .from(posts)
    .where(eq(posts.userId, userId));

  return stats[0] || {
    postCount: 0,
    totalViews: 0,
    avgViews: 0,
    latestPost: null,
  };
}

// 分组查询
export async function getPostsByMonth() {
  return await db
    .select({
      month: sql<string>`to_char(${posts.createdAt}, 'YYYY-MM')`,
      count: sql<number>`count(*)::int`,
    })
    .from(posts)
    .groupBy(sql`to_char(${posts.createdAt}, 'YYYY-MM')`)
    .orderBy(desc(sql`to_char(${posts.createdAt}, 'YYYY-MM')`));
}
```

## 📝 数据操作

### 插入操作

```typescript
// 单条插入
export async function createUser(data: InsertUser) {
  const [user] = await db
    .insert(users)
    .values(data)
    .returning();

  return user;
}

// 批量插入
export async function createUsers(data: InsertUser[]) {
  return await db
    .insert(users)
    .values(data)
    .returning();
}

// 冲突处理
export async function upsertUser(data: InsertUser) {
  return await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: data.name,
        updatedAt: new Date(),
      },
    })
    .returning();
}
```

### 更新操作

```typescript
// 简单更新
export async function updateUser(id: string, data: Partial<InsertUser>) {
  const [updated] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return updated;
}

// 条件更新
export async function deactivateInactiveUsers(days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await db
    .update(users)
    .set({ isActive: false })
    .where(
      and(
        eq(users.isActive, true),
        lte(users.updatedAt, cutoffDate)
      )
    )
    .returning();
}
```

### 删除操作

```typescript
// 硬删除
export async function deleteUser(id: string) {
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning();

  return deleted;
}

// 软删除（推荐）
export async function softDeleteUser(id: string) {
  const [deleted] = await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return deleted;
}

// 批量删除
export async function deleteInactivePosts() {
  return await db
    .delete(posts)
    .where(eq(posts.isActive, false))
    .returning();
}
```

## 🔄 事务处理

```typescript
// database/transactions/order.transaction.ts
export async function createOrder(
  orderData: InsertOrder,
  items: InsertOrderItem[]
) {
  return await db.transaction(async (tx) => {
    // 1. 创建订单
    const [order] = await tx
      .insert(orders)
      .values(orderData)
      .returning();

    // 2. 创建订单项
    const orderItems = await tx
      .insert(orderItems)
      .values(
        items.map(item => ({
          ...item,
          orderId: order.id,
        }))
      )
      .returning();

    // 3. 更新库存
    for (const item of items) {
      const [product] = await tx
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId))
        .returning();

      if (product.stock < 0) {
        throw new Error(`库存不足: ${product.name}`);
      }
    }

    return { order, items: orderItems };
  });
}

// 使用 savepoint
export async function complexTransaction() {
  return await db.transaction(async (tx) => {
    const user = await tx.insert(users).values({...}).returning();

    const sp = await tx.savepoint('sp1');
    try {
      // 可能失败的操作
      await riskyOperation(tx);
    } catch (error) {
      await sp.rollback();
      // 继续其他操作
    }

    return user;
  });
}
```

## 🔧 迁移管理

### 创建迁移

```bash
# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 推送到数据库（开发环境）
pnpm db:push
```

### 迁移文件示例

```sql
-- database/migrations/0001_add_posts_table.sql
CREATE TABLE IF NOT EXISTS "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "content" text,
  "user_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "posts_user_id_idx" ON "posts" ("user_id");
CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts" ("created_at");

ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
```

## ⚡ 性能优化

### 1. 使用索引

```typescript
// 为常用查询字段添加索引
pgTable('posts', {
  // 字段...
}, (table) => ({
  // 单字段索引
  userIdIdx: index().on(table.userId),

  // 复合索引（注意字段顺序）
  userStatusIdx: index().on(table.userId, table.status),
}));
```

### 2. 查询优化

```typescript
// ✅ 只选择需要的字段
const users = await db
  .select({
    id: users.id,
    name: users.name,
  })
  .from(users);

// ✅ 使用 limit
const recentPosts = await db
  .select()
  .from(posts)
  .orderBy(desc(posts.createdAt))
  .limit(10);

// ✅ 使用预编译语句
const prepared = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare();

const user = await prepared.execute({ userId: '123' });
```

### 3. 批量操作

```typescript
// ✅ 批量插入而非循环插入
await db.insert(users).values(userArray);

// ✅ 批量更新
await db
  .update(posts)
  .set({ status: 'published' })
  .where(inArray(posts.id, postIds));
```

## 📚 更多资源

详细指南请查看 `resources/` 目录：

### 📐 设计和开发

- **[schema-design.md](resources/schema-design.md)** - 表结构设计、关系定义、索引和约束
- **[query-patterns.md](resources/query-patterns.md)** - CRUD、关联查询、聚合统计和高级查询
- **[migration-guide.md](resources/migration-guide.md)** - Drizzle Kit 迁移工作流和最佳实践

### ⚡ 优化和测试

- **[performance.md](resources/performance.md)** - 索引优化、连接池配置和查询优化
- **[testing.md](resources/testing.md)** - 数据库测试环境、Fixtures 和集成测试