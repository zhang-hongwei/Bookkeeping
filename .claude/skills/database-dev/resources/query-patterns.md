# 查询模式大全

> Drizzle ORM 查询模式与最佳实践

## 📋 目录

- [基础查询](#基础查询)
- [条件查询](#条件查询)
- [关联查询](#关联查询)
- [聚合查询](#聚合查询)
- [分页查询](#分页查询)
- [事务操作](#事务操作)
- [批量操作](#批量操作)
- [高级查询](#高级查询)
- [查询优化](#查询优化)

---

## 基础查询

### SELECT 查询

```typescript
import { db } from '@/database/client';
import { users, posts } from '@/database/schema';
import { eq, desc } from 'drizzle-orm';

// 查询所有记录
const allUsers = await db.select().from(users);

// 选择特定字段
const userNames = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
  })
  .from(users);

// 查询单条记录
const user = await db
  .select()
  .from(users)
  .where(eq(users.id, userId))
  .limit(1);

// 更简洁的单条查询
const [user2] = await db
  .select()
  .from(users)
  .where(eq(users.id, userId));

// 查询并排序
const recentUsers = await db
  .select()
  .from(users)
  .orderBy(desc(users.createdAt))
  .limit(10);
```

### INSERT 插入

```typescript
// 单条插入
const [newUser] = await db
  .insert(users)
  .values({
    email: 'user@example.com',
    name: 'John Doe',
  })
  .returning();

// 批量插入
const newUsers = await db
  .insert(users)
  .values([
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
    { email: 'user3@example.com', name: 'User 3' },
  ])
  .returning();

// 插入并返回特定字段
const [user] = await db
  .insert(users)
  .values({ email: 'user@example.com', name: 'John' })
  .returning({ id: users.id, email: users.email });

// 条件插入（如果不存在则插入）
const [user] = await db
  .insert(users)
  .values({ email: 'user@example.com', name: 'John' })
  .onConflictDoNothing() // 冲突时不做任何操作
  .returning();

// Upsert（插入或更新）
const [user] = await db
  .insert(users)
  .values({ email: 'user@example.com', name: 'John Doe' })
  .onConflictDoUpdate({
    target: users.email,
    set: {
      name: 'John Doe Updated',
      updatedAt: new Date(),
    },
  })
  .returning();
```

### UPDATE 更新

```typescript
// 简单更新
const [updated] = await db
  .update(users)
  .set({
    name: 'Jane Doe',
    updatedAt: new Date(),
  })
  .where(eq(users.id, userId))
  .returning();

// 条件更新
await db
  .update(posts)
  .set({ status: 'archived' })
  .where(
    and(
      eq(posts.status, 'draft'),
      lt(posts.createdAt, new Date('2024-01-01'))
    )
  );

// 使用 SQL 表达式更新
await db
  .update(posts)
  .set({
    viewCount: sql`${posts.viewCount} + 1`,
  })
  .where(eq(posts.id, postId));

// 批量更新（使用 case when）
await db.update(users).set({
  role: sql`CASE
    WHEN ${users.id} = ${adminId} THEN 'admin'
    WHEN ${users.id} = ${modId} THEN 'moderator'
    ELSE 'user'
  END`,
});
```

### DELETE 删除

```typescript
// 简单删除
const [deleted] = await db
  .delete(users)
  .where(eq(users.id, userId))
  .returning();

// 条件删除
await db
  .delete(posts)
  .where(
    and(
      eq(posts.status, 'draft'),
      lt(posts.createdAt, new Date('2024-01-01'))
    )
  );

// 软删除（推荐）
const [softDeleted] = await db
  .update(users)
  .set({ deletedAt: new Date() })
  .where(eq(users.id, userId))
  .returning();
```

---

## 条件查询

### 比较操作符

```typescript
import { eq, ne, gt, gte, lt, lte, between, notBetween } from 'drizzle-orm';

// 等于
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, 'user@example.com'));

// 不等于
const users = await db
  .select()
  .from(users)
  .where(ne(users.status, 'deleted'));

// 大于
const recentPosts = await db
  .select()
  .from(posts)
  .where(gt(posts.createdAt, new Date('2024-01-01')));

// 大于等于
const adultUsers = await db
  .select()
  .from(users)
  .where(gte(users.age, 18));

// 小于
const drafts = await db
  .select()
  .from(posts)
  .where(lt(posts.viewCount, 100));

// 小于等于
const lowPriceProducts = await db
  .select()
  .from(products)
  .where(lte(products.price, 1000));

// BETWEEN
const posts = await db
  .select()
  .from(posts)
  .where(
    between(
      posts.createdAt,
      new Date('2024-01-01'),
      new Date('2024-12-31')
    )
  );
```

### 逻辑操作符

```typescript
import { and, or, not } from 'drizzle-orm';

// AND 条件
const activeAdmins = await db
  .select()
  .from(users)
  .where(
    and(
      eq(users.role, 'admin'),
      eq(users.isActive, true)
    )
  );

// OR 条件
const specialUsers = await db
  .select()
  .from(users)
  .where(
    or(
      eq(users.role, 'admin'),
      eq(users.role, 'moderator')
    )
  );

// NOT 条件
const notDeletedUsers = await db
  .select()
  .from(users)
  .where(not(eq(users.status, 'deleted')));

// 复杂组合
const results = await db
  .select()
  .from(users)
  .where(
    and(
      eq(users.isActive, true),
      or(
        eq(users.role, 'admin'),
        and(
          eq(users.role, 'user'),
          gte(users.points, 1000)
        )
      )
    )
  );
```

### 模糊匹配

```typescript
import { like, ilike, notLike, notIlike } from 'drizzle-orm';

// LIKE（区分大小写）
const users = await db
  .select()
  .from(users)
  .where(like(users.name, '%John%'));

// ILIKE（不区分大小写，PostgreSQL）
const users = await db
  .select()
  .from(users)
  .where(ilike(users.email, '%@gmail.com'));

// NOT LIKE
const users = await db
  .select()
  .from(users)
  .where(notLike(users.email, '%@temp.com'));

// 搜索功能示例
async function searchUsers(keyword: string) {
  return await db
    .select()
    .from(users)
    .where(
      or(
        ilike(users.name, `%${keyword}%`),
        ilike(users.email, `%${keyword}%`)
      )
    )
    .limit(20);
}
```

### 集合操作

```typescript
import { inArray, notInArray } from 'drizzle-orm';

// IN 操作
const selectedUsers = await db
  .select()
  .from(users)
  .where(inArray(users.id, [id1, id2, id3]));

// NOT IN 操作
const otherUsers = await db
  .select()
  .from(users)
  .where(notInArray(users.id, excludedIds));

// IN 子查询
const usersWithPosts = await db
  .select()
  .from(users)
  .where(
    inArray(
      users.id,
      db.select({ id: posts.userId }).from(posts)
    )
  );
```

### NULL 检查

```typescript
import { isNull, isNotNull } from 'drizzle-orm';

// IS NULL
const usersWithoutPhone = await db
  .select()
  .from(users)
  .where(isNull(users.phoneNumber));

// IS NOT NULL
const usersWithPhone = await db
  .select()
  .from(users)
  .where(isNotNull(users.phoneNumber));

// 查询未删除的记录
const activePosts = await db
  .select()
  .from(posts)
  .where(isNull(posts.deletedAt));
```

---

## 关联查询

### JOIN 查询

```typescript
import { leftJoin, rightJoin, innerJoin, fullJoin } from 'drizzle-orm';

// LEFT JOIN
const usersWithPosts = await db
  .select({
    userId: users.id,
    userName: users.name,
    postId: posts.id,
    postTitle: posts.title,
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId));

// INNER JOIN（仅匹配的记录）
const activeUserPosts = await db
  .select()
  .from(users)
  .innerJoin(posts, eq(users.id, posts.userId))
  .where(eq(users.isActive, true));

// 多表 JOIN
const data = await db
  .select({
    user: users,
    post: posts,
    category: categories,
  })
  .from(posts)
  .leftJoin(users, eq(posts.userId, users.id))
  .leftJoin(categories, eq(posts.categoryId, categories.id));

// JOIN 配合条件
const recentUserPosts = await db
  .select()
  .from(users)
  .leftJoin(
    posts,
    and(
      eq(users.id, posts.userId),
      gte(posts.createdAt, new Date('2024-01-01'))
    )
  );
```

### Relations 查询（推荐）

```typescript
// 定义 Relations（在 schema 文件中）
import { relations } from 'drizzle-orm';

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

// 使用 Relations 查询
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    posts: true,
    comments: true,
  },
});

// 嵌套 Relations
const post = await db.query.posts.findFirst({
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
      limit: 10,
    },
  },
});

// 条件加载 Relations
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    posts: {
      where: eq(posts.status, 'published'),
      orderBy: desc(posts.createdAt),
      limit: 5,
    },
  },
});

// 查询多条记录
const users = await db.query.users.findMany({
  where: eq(users.isActive, true),
  with: {
    posts: {
      limit: 3,
    },
  },
  limit: 10,
});
```

---

## 聚合查询

### COUNT 计数

```typescript
import { count, sql } from 'drizzle-orm';

// 简单计数
const [result] = await db
  .select({ count: count() })
  .from(users);

const userCount = result.count; // number

// 条件计数
const [result] = await db
  .select({ count: count() })
  .from(users)
  .where(eq(users.isActive, true));

// 使用 sql 标签
const [result] = await db
  .select({ count: sql<number>`count(*)::int` })
  .from(users);

// 分组计数
const postsByUser = await db
  .select({
    userId: posts.userId,
    postCount: count(),
  })
  .from(posts)
  .groupBy(posts.userId);
```

### SUM / AVG / MIN / MAX

```typescript
import { sum, avg, min, max } from 'drizzle-orm';

// SUM 求和
const [result] = await db
  .select({
    totalSales: sum(orders.amount),
  })
  .from(orders)
  .where(eq(orders.status, 'completed'));

// AVG 平均值
const [result] = await db
  .select({
    avgRating: avg(reviews.rating),
  })
  .from(reviews)
  .where(eq(reviews.productId, productId));

// MIN / MAX
const [result] = await db
  .select({
    minPrice: min(products.price),
    maxPrice: max(products.price),
    avgPrice: avg(products.price),
  })
  .from(products);

// 多个聚合
const stats = await db
  .select({
    userId: orders.userId,
    totalOrders: count(),
    totalAmount: sum(orders.amount),
    avgAmount: avg(orders.amount),
    minAmount: min(orders.amount),
    maxAmount: max(orders.amount),
  })
  .from(orders)
  .groupBy(orders.userId);
```

### GROUP BY 分组

```typescript
// 按单字段分组
const postsByStatus = await db
  .select({
    status: posts.status,
    count: count(),
  })
  .from(posts)
  .groupBy(posts.status);

// 按多字段分组
const ordersByUserAndStatus = await db
  .select({
    userId: orders.userId,
    status: orders.status,
    count: count(),
    totalAmount: sum(orders.amount),
  })
  .from(orders)
  .groupBy(orders.userId, orders.status);

// 分组 + 排序
const topUsers = await db
  .select({
    userId: posts.userId,
    postCount: count(),
  })
  .from(posts)
  .groupBy(posts.userId)
  .orderBy(desc(count()))
  .limit(10);

// HAVING 子句
const activeUsers = await db
  .select({
    userId: posts.userId,
    postCount: count(),
  })
  .from(posts)
  .groupBy(posts.userId)
  .having(({ postCount }) => gte(postCount, 10));
```

### 复杂聚合

```typescript
// 统计用户活跃度
const userStats = await db
  .select({
    userId: users.id,
    userName: users.name,
    postCount: sql<number>`count(DISTINCT ${posts.id})::int`,
    commentCount: sql<number>`count(DISTINCT ${comments.id})::int`,
    totalViews: sql<number>`sum(${posts.viewCount})::int`,
    avgPostViews: sql<number>`avg(${posts.viewCount})::float`,
    firstPostAt: sql<Date>`min(${posts.createdAt})`,
    lastPostAt: sql<Date>`max(${posts.createdAt})`,
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId))
  .leftJoin(comments, eq(users.id, comments.userId))
  .where(eq(users.isActive, true))
  .groupBy(users.id, users.name);

// 按时间维度统计
const postsByMonth = await db
  .select({
    month: sql<string>`to_char(${posts.createdAt}, 'YYYY-MM')`,
    count: sql<number>`count(*)::int`,
    uniqueAuthors: sql<number>`count(DISTINCT ${posts.userId})::int`,
  })
  .from(posts)
  .groupBy(sql`to_char(${posts.createdAt}, 'YYYY-MM')`)
  .orderBy(desc(sql`to_char(${posts.createdAt}, 'YYYY-MM')`));
```

---

## 分页查询

### 基础分页（OFFSET）

```typescript
interface PaginationParams {
  page: number; // 从 1 开始
  pageSize: number;
}

async function getUsers({ page, pageSize }: PaginationParams) {
  const offset = (page - 1) * pageSize;

  // 获取数据
  const users = await db
    .select()
    .from(users)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(users.createdAt));

  // 获取总数
  const [{ total }] = await db
    .select({ total: count() })
    .from(users);

  return {
    data: users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
```

### 游标分页（推荐）

```typescript
interface CursorParams {
  cursor?: string; // 最后一条记录的 ID
  limit: number;
}

async function getUsersCursor({ cursor, limit }: CursorParams) {
  let query = db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt), desc(users.id))
    .limit(limit + 1); // 多查一条判断是否有下一页

  if (cursor) {
    query = query.where(lt(users.id, cursor));
  }

  const results = await query;

  const hasNextPage = results.length > limit;
  const data = hasNextPage ? results.slice(0, -1) : results;
  const nextCursor = hasNextPage ? data[data.length - 1].id : null;

  return {
    data,
    nextCursor,
    hasNextPage,
  };
}

// 使用示例
const page1 = await getUsersCursor({ limit: 10 });
const page2 = await getUsersCursor({
  cursor: page1.nextCursor,
  limit: 10,
});
```

### Keyset 分页

```typescript
interface KeysetParams {
  lastCreatedAt?: Date;
  lastId?: string;
  limit: number;
}

async function getPostsKeyset({ lastCreatedAt, lastId, limit }: KeysetParams) {
  let query = db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(limit + 1);

  if (lastCreatedAt && lastId) {
    query = query.where(
      or(
        lt(posts.createdAt, lastCreatedAt),
        and(
          eq(posts.createdAt, lastCreatedAt),
          lt(posts.id, lastId)
        )
      )
    );
  }

  const results = await query;
  const hasNextPage = results.length > limit;
  const data = hasNextPage ? results.slice(0, -1) : results;

  return {
    data,
    nextPage: hasNextPage
      ? {
          lastCreatedAt: data[data.length - 1].createdAt,
          lastId: data[data.length - 1].id,
        }
      : null,
  };
}
```

---

## 事务操作

### 基础事务

```typescript
// 简单事务
const result = await db.transaction(async (tx) => {
  // 创建用户
  const [user] = await tx
    .insert(users)
    .values({ email: 'user@example.com', name: 'John' })
    .returning();

  // 创建用户配置
  await tx
    .insert(userSettings)
    .values({ userId: user.id, theme: 'dark' });

  return user;
});

// 事务内条件回滚
const result = await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ email: 'user@example.com' })
    .returning();

  const balance = await getBalance(user.id);
  if (balance < 100) {
    // 抛出错误会自动回滚
    throw new Error('余额不足');
  }

  await tx
    .update(accounts)
    .set({ balance: sql`${accounts.balance} - 100` })
    .where(eq(accounts.userId, user.id));

  return user;
});
```

### 复杂事务示例

```typescript
// 创建订单事务
async function createOrder(
  userId: string,
  items: Array<{ productId: string; quantity: number }>
) {
  return await db.transaction(async (tx) => {
    // 1. 创建订单
    const [order] = await tx
      .insert(orders)
      .values({
        userId,
        status: 'pending',
        totalAmount: 0, // 稍后计算
      })
      .returning();

    let totalAmount = 0;

    // 2. 处理订单项
    for (const item of items) {
      // 获取产品信息
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product) {
        throw new Error(`产品 ${item.productId} 不存在`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`产品 ${product.name} 库存不足`);
      }

      // 创建订单项
      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      // 扣减库存
      await tx
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));

      totalAmount += product.price * item.quantity;
    }

    // 3. 更新订单总额
    const [updatedOrder] = await tx
      .update(orders)
      .set({ totalAmount })
      .where(eq(orders.id, order.id))
      .returning();

    return updatedOrder;
  });
}
```

### Savepoint 使用

```typescript
const result = await db.transaction(async (tx) => {
  // 创建用户（一定会执行）
  const [user] = await tx
    .insert(users)
    .values({ email: 'user@example.com' })
    .returning();

  // 创建 savepoint
  const sp = await tx.savepoint('sp1');

  try {
    // 尝试可能失败的操作
    await riskyOperation(tx);
  } catch (error) {
    // 回滚到 savepoint
    await sp.rollback();
    console.log('Risky operation failed, rolled back to savepoint');
  }

  // 继续其他操作
  await tx.insert(logs).values({
    userId: user.id,
    action: 'created',
  });

  return user;
});
```

---

## 批量操作

### 批量插入

```typescript
// 小批量插入（< 1000 条）
const users = await db
  .insert(users)
  .values([
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
    // ...
  ])
  .returning();

// 大批量插入（分批处理）
async function bulkInsertUsers(data: Array<InsertUser>) {
  const BATCH_SIZE = 500;
  const results = [];

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const inserted = await db
      .insert(users)
      .values(batch)
      .returning();
    results.push(...inserted);
  }

  return results;
}
```

### 批量更新

```typescript
// 批量更新（相同值）
await db
  .update(posts)
  .set({ status: 'archived' })
  .where(inArray(posts.id, postIds));

// 批量更新（不同值）- 使用 CASE WHEN
const updates = [
  { id: 'id1', status: 'published' },
  { id: 'id2', status: 'archived' },
  { id: 'id3', status: 'draft' },
];

await db.update(posts).set({
  status: sql`CASE ${posts.id}
    ${sql.join(
      updates.map((u) => sql`WHEN ${u.id} THEN ${u.status}`),
      sql` `
    )}
  END`,
}).where(inArray(posts.id, updates.map(u => u.id)));

// 或使用事务分别更新
await db.transaction(async (tx) => {
  for (const update of updates) {
    await tx
      .update(posts)
      .set({ status: update.status })
      .where(eq(posts.id, update.id));
  }
});
```

### 批量删除

```typescript
// 批量删除
await db
  .delete(posts)
  .where(inArray(posts.id, postIds));

// 条件批量删除
await db
  .delete(posts)
  .where(
    and(
      eq(posts.status, 'draft'),
      lt(posts.createdAt, cutoffDate)
    )
  );
```

---

## 高级查询

### 子查询

```typescript
// SELECT 子查询
const usersWithPostCount = await db
  .select({
    user: users,
    postCount: db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.userId, users.id)),
  })
  .from(users);

// WHERE 子查询
const usersWithPosts = await db
  .select()
  .from(users)
  .where(
    exists(
      db
        .select()
        .from(posts)
        .where(eq(posts.userId, users.id))
    )
  );

// IN 子查询
const activeUsers = await db
  .select()
  .from(users)
  .where(
    inArray(
      users.id,
      db
        .select({ userId: posts.userId })
        .from(posts)
        .where(eq(posts.status, 'published'))
    )
  );
```

### UNION 查询

```typescript
// UNION（去重）
const allEmails = await db
  .select({ email: users.email })
  .from(users)
  .union(
    db.select({ email: subscribers.email }).from(subscribers)
  );

// UNION ALL（不去重，性能更好）
const allEmails = await db
  .select({ email: users.email })
  .from(users)
  .unionAll(
    db.select({ email: subscribers.email }).from(subscribers)
  );
```

### DISTINCT 查询

```typescript
// DISTINCT
const uniqueCategories = await db
  .selectDistinct({ category: posts.category })
  .from(posts);

// DISTINCT ON (PostgreSQL)
const latestPostPerUser = await db
  .selectDistinctOn([posts.userId], {
    userId: posts.userId,
    postId: posts.id,
    title: posts.title,
  })
  .from(posts)
  .orderBy(posts.userId, desc(posts.createdAt));
```

### 窗口函数

```typescript
// ROW_NUMBER
const rankedPosts = await db
  .select({
    id: posts.id,
    title: posts.title,
    userId: posts.userId,
    rank: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${posts.userId} ORDER BY ${posts.viewCount} DESC)`,
  })
  .from(posts);

// 累计统计
const cumulativeSales = await db
  .select({
    date: orders.createdAt,
    amount: orders.amount,
    cumulative: sql<number>`SUM(${orders.amount}) OVER (ORDER BY ${orders.createdAt})`,
  })
  .from(orders);
```

---

## 查询优化

### 预编译语句（Prepared Statements）

```typescript
// 创建预编译语句
const getUserById = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('get_user_by_id');

// 执行（性能更好）
const user1 = await getUserById.execute({ userId: 'id1' });
const user2 = await getUserById.execute({ userId: 'id2' });

// 带参数的复杂查询
const searchPosts = db
  .select()
  .from(posts)
  .where(
    and(
      ilike(posts.title, sql.placeholder('keyword')),
      eq(posts.status, sql.placeholder('status'))
    )
  )
  .orderBy(desc(posts.createdAt))
  .limit(sql.placeholder('limit'))
  .prepare('search_posts');

const results = await searchPosts.execute({
  keyword: '%typescript%',
  status: 'published',
  limit: 20,
});
```

### 只查询需要的字段

```typescript
// ❌ 避免：查询所有字段
const users = await db.select().from(users);

// ✅ 推荐：只查询需要的字段
const users = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
  })
  .from(users);

// ✅ Relations 查询时限制字段
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  columns: {
    id: true,
    name: true,
    email: true,
  },
  with: {
    posts: {
      columns: {
        id: true,
        title: true,
        createdAt: true,
      },
      limit: 5,
    },
  },
});
```

### 使用 LIMIT

```typescript
// ✅ 始终使用 limit
const recentPosts = await db
  .select()
  .from(posts)
  .orderBy(desc(posts.createdAt))
  .limit(10);

// ✅ 检查是否存在
const exists = await db
  .select({ id: users.id })
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

const userExists = exists.length > 0;
```

### 避免 N+1 查询

```typescript
// ❌ 避免：N+1 查询
const users = await db.select().from(users);
for (const user of users) {
  user.posts = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, user.id));
}

// ✅ 推荐：使用 Relations 一次查询
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true,
  },
});

// ✅ 或使用 JOIN
const usersWithPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId));
```

---

## 实用查询模式

### 搜索功能

```typescript
async function searchPosts(keyword: string, options: {
  status?: string;
  userId?: string;
  limit?: number;
}) {
  let query = db
    .select()
    .from(posts)
    .where(
      or(
        ilike(posts.title, `%${keyword}%`),
        ilike(posts.content, `%${keyword}%`)
      )
    );

  if (options.status) {
    query = query.where(eq(posts.status, options.status));
  }

  if (options.userId) {
    query = query.where(eq(posts.userId, options.userId));
  }

  return await query
    .orderBy(desc(posts.createdAt))
    .limit(options.limit || 20);
}
```

### 排行榜查询

```typescript
// 用户积分排行榜
async function getUserRankings(limit: number = 10) {
  return await db
    .select({
      rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${users.points} DESC)`,
      id: users.id,
      name: users.name,
      points: users.points,
    })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(desc(users.points))
    .limit(limit);
}
```

### 时间范围统计

```typescript
// 获取最近 N 天的统计
async function getRecentStats(days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await db
    .select({
      date: sql<string>`DATE(${posts.createdAt})`,
      count: count(),
      uniqueAuthors: sql<number>`COUNT(DISTINCT ${posts.userId})::int`,
    })
    .from(posts)
    .where(gte(posts.createdAt, startDate))
    .groupBy(sql`DATE(${posts.createdAt})`)
    .orderBy(sql`DATE(${posts.createdAt})`);
}
```

---

## 相关资源

- [schema-design.md](./schema-design.md) - Schema 设计模式
- [migration-guide.md](./migration-guide.md) - 迁移最佳实践
- [performance.md](./performance.md) - 性能优化指南
- [testing.md](./testing.md) - 数据库测试策略
