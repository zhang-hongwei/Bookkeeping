# 性能优化指南

> Drizzle ORM + PostgreSQL 性能优化最佳实践

## 📋 目录

- [索引优化](#索引优化)
- [查询优化](#查询优化)
- [连接池管理](#连接池管理)
- [缓存策略](#缓存策略)
- [批量操作优化](#批量操作优化)
- [数据库配置](#数据库配置)
- [监控与分析](#监控与分析)
- [常见性能问题](#常见性能问题)

---

## 索引优化

### 何时创建索引

```typescript
// ✅ 应该创建索引的场景

// 1. WHERE 子句中的过滤字段
export const posts = pgTable('posts', {
  status: varchar('status', { length: 20 }),
  userId: uuid('user_id'),
}, (table) => ({
  statusIdx: index('posts_status_idx').on(table.status),
  userIdIdx: index('posts_user_id_idx').on(table.userId),
}));

// 2. JOIN 连接字段
export const posts = pgTable('posts', {
  userId: uuid('user_id').references(() => users.id),
}, (table) => ({
  userIdIdx: index('posts_user_id_idx').on(table.userId), // 加速 JOIN
}));

// 3. ORDER BY 排序字段
export const posts = pgTable('posts', {
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
}));

// 4. 唯一约束字段
export const users = pgTable('users', {
  email: varchar('email', { length: 255 }).unique(),
  // unique() 会自动创建唯一索引
});

// 5. 外键字段(推荐)
export const comments = pgTable('comments', {
  postId: uuid('post_id').references(() => posts.id),
}, (table) => ({
  postIdIdx: index('comments_post_id_idx').on(table.postId),
}));
```

### 复合索引优化

```typescript
// 索引字段顺序很重要!

// ✅ 推荐：高选择性字段在前
export const orders = pgTable('orders', {
  userId: uuid('user_id'),
  status: varchar('status', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // 复合索引：(userId, status, createdAt)
  userStatusIdx: index('orders_user_status_created_idx')
    .on(table.userId, table.status, table.createdAt.desc()),
}));

// 该索引可用于以下查询：
// ✅ WHERE user_id = ? AND status = ? ORDER BY created_at DESC
// ✅ WHERE user_id = ? ORDER BY created_at DESC
// ✅ WHERE user_id = ?
// ❌ WHERE status = ? (无法使用索引)
// ❌ WHERE created_at > ? (无法使用索引)

// 索引顺序规则：
// 1. 等值查询字段 (WHERE col = ?)
// 2. 范围查询字段 (WHERE col > ?)
// 3. 排序字段 (ORDER BY col)
```

### 部分索引（条件索引）

```typescript
// 仅为部分数据创建索引，节省空间和提升性能

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: varchar('status', { length: 20 }),
  publishedAt: timestamp('published_at'),
}, (table) => ({
  // 仅为已发布文章创建索引
  publishedIdx: index('posts_published_idx')
    .on(table.publishedAt)
    .where(sql`${table.status} = 'published'`),

  // 仅为未删除记录创建索引
  activeIdx: index('posts_active_idx')
    .on(table.createdAt)
    .where(sql`${table.deletedAt} IS NULL`),
}));

// 使用场景：
// - 软删除表（索引仅覆盖未删除记录）
// - 状态字段（索引仅覆盖活跃状态）
// - 时间范围（索引仅覆盖最近数据）
```

### 表达式索引

```typescript
// 为计算表达式创建索引

export const users = pgTable('users', {
  email: varchar('email', { length: 255 }),
}, (table) => ({
  // 不区分大小写的邮箱查询
  emailLowerIdx: index('users_email_lower_idx')
    .on(sql`LOWER(${table.email})`),
}));

// 查询时必须使用相同表达式
const user = await db
  .select()
  .from(users)
  .where(sql`LOWER(${users.email}) = LOWER('User@Example.com')`);

// 其他场景：
// - JSONB 字段中的特定键
// - 日期的年月部分
// - 字符串的子串
```

### 全文搜索索引

```typescript
// PostgreSQL GIN 索引用于全文搜索

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title'),
  content: text('content'),
  // tsvector 列存储分词结果
  searchVector: text('search_vector'),
}, (table) => ({
  // GIN 索引
  searchIdx: index('articles_search_idx')
    .using('gin', sql`to_tsvector('english', ${table.title} || ' ' || ${table.content})`),
}));

// 全文搜索查询
const results = await db
  .select()
  .from(articles)
  .where(
    sql`to_tsvector('english', ${articles.title} || ' ' || ${articles.content})
        @@ to_tsquery('english', 'postgresql & performance')`
  );
```

### 索引维护

```sql
-- 查看索引使用情况
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- 查找未使用的索引
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey';

-- 重建索引
REINDEX INDEX CONCURRENTLY posts_user_id_idx;

-- 删除无用索引
DROP INDEX CONCURRENTLY posts_unused_idx;
```

---

## 查询优化

### SELECT 优化

```typescript
// ❌ 避免：SELECT *
const users = await db.select().from(users);

// ✅ 推荐：只选择需要的字段
const users = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
  })
  .from(users);

// 性能提升：
// - 减少网络传输
// - 减少内存占用
// - 加快序列化速度
```

### WHERE 优化

```typescript
// ❌ 避免：在索引列上使用函数
const users = await db
  .select()
  .from(users)
  .where(sql`LOWER(${users.email}) = 'user@example.com'`);

// ✅ 推荐：避免函数包裹索引列
const users = await db
  .select()
  .from(users)
  .where(eq(users.email, 'user@example.com'));

// ❌ 避免：OR 条件（可能无法使用索引）
const users = await db
  .select()
  .from(users)
  .where(
    or(
      eq(users.status, 'active'),
      eq(users.status, 'pending')
    )
  );

// ✅ 推荐：使用 IN
const users = await db
  .select()
  .from(users)
  .where(inArray(users.status, ['active', 'pending']));
```

### JOIN 优化

```typescript
// ❌ 避免：多次查询（N+1 问题）
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

// JOIN 顺序优化：小表在前，大表在后
// PostgreSQL 查询规划器会自动优化，但可以手动提示
```

### LIMIT 优化

```typescript
// ✅ 始终使用 LIMIT
const recentPosts = await db
  .select()
  .from(posts)
  .orderBy(desc(posts.createdAt))
  .limit(10);

// ❌ 避免：大 OFFSET（性能差）
const page100 = await db
  .select()
  .from(posts)
  .limit(20)
  .offset(2000); // 需要扫描 2020 行

// ✅ 推荐：游标分页
const page = await db
  .select()
  .from(posts)
  .where(lt(posts.id, lastId))
  .orderBy(desc(posts.id))
  .limit(20);
```

### 聚合查询优化

```typescript
// ❌ 避免：在应用层聚合
const posts = await db.select().from(posts);
const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0);

// ✅ 推荐：在数据库层聚合
const [{ totalViews }] = await db
  .select({
    totalViews: sum(posts.viewCount),
  })
  .from(posts);

// 使用物化视图缓存复杂聚合
// CREATE MATERIALIZED VIEW user_stats AS
// SELECT user_id, COUNT(*) as post_count, SUM(view_count) as total_views
// FROM posts
// GROUP BY user_id;
```

### 子查询优化

```typescript
// ❌ 避免：相关子查询（性能差）
const usersWithPostCount = await db
  .select({
    user: users,
    postCount: db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.userId, users.id)),
  })
  .from(users);

// ✅ 推荐：JOIN + GROUP BY
const usersWithPostCount = await db
  .select({
    userId: users.id,
    userName: users.name,
    postCount: count(posts.id),
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId))
  .groupBy(users.id, users.name);
```

### 预编译语句（Prepared Statements）

```typescript
// ✅ 对频繁执行的查询使用预编译语句

// 创建预编译语句
const getUserById = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('get_user_by_id');

// 多次执行（性能更好）
const user1 = await getUserById.execute({ userId: 'id1' });
const user2 = await getUserById.execute({ userId: 'id2' });
const user3 = await getUserById.execute({ userId: 'id3' });

// 性能提升：
// - 减少 SQL 解析时间
// - 减少查询规划时间
// - 适用于高频查询
```

---

## 连接池管理

### 连接池配置

```typescript
// src/database/clients/node.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // 最小连接数
  min: 2,

  // 最大连接数（根据数据库限制和应用负载调整）
  max: 10,

  // 连接空闲超时（毫秒）
  idleTimeoutMillis: 30000,

  // 连接超时（毫秒）
  connectionTimeoutMillis: 5000,

  // 查询超时（毫秒）
  query_timeout: 60000,

  // 语句超时（毫秒）
  statement_timeout: 60000,
});

export const db = drizzle(pool);

// 监听连接池事件
pool.on('connect', () => {
  console.log('New client connected to pool');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});
```

### Neon Serverless 优化

```typescript
// src/database/clients/neon.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Neon HTTP API（无连接池，适合 Serverless）
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Neon WebSocket（支持事务和连接池）
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

// 性能提示：
// - HTTP API：冷启动快，适合短查询
// - WebSocket：支持事务，适合复杂操作
```

### 连接池监控

```typescript
// 获取连接池状态
function getPoolStats(pool: Pool) {
  return {
    total: pool.totalCount,      // 总连接数
    idle: pool.idleCount,         // 空闲连接数
    waiting: pool.waitingCount,   // 等待连接的请求数
  };
}

// 定期监控
setInterval(() => {
  const stats = getPoolStats(pool);
  console.log('Pool stats:', stats);

  if (stats.waiting > 5) {
    console.warn('High connection wait queue!');
  }
}, 60000);
```

---

## 缓存策略

### 应用层缓存

```typescript
// 使用 LRU 缓存
import LRU from 'lru-cache';

const userCache = new LRU<string, User>({
  max: 500,           // 最多缓存 500 个用户
  ttl: 1000 * 60 * 5, // 5 分钟过期
});

async function getUserById(id: string): Promise<User | null> {
  // 检查缓存
  const cached = userCache.get(id);
  if (cached) {
    return cached;
  }

  // 查询数据库
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (user) {
    userCache.set(id, user);
  }

  return user || null;
}

// 更新时清除缓存
async function updateUser(id: string, data: Partial<User>) {
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();

  // 清除缓存
  userCache.delete(id);

  return updated;
}
```

### Redis 缓存

```typescript
// 使用 Redis 作为分布式缓存
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getUserById(id: string): Promise<User | null> {
  // 检查 Redis 缓存
  const cached = await redis.get(`user:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // 查询数据库
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (user) {
    // 缓存到 Redis（5 分钟过期）
    await redis.setex(
      `user:${id}`,
      300,
      JSON.stringify(user)
    );
  }

  return user || null;
}

// 批量缓存失效
async function invalidateUserCache(userId: string) {
  await redis.del(`user:${userId}`);
  await redis.del(`user:${userId}:posts`);
  await redis.del(`user:${userId}:stats`);
}
```

### 查询结果缓存

```typescript
// 缓存热门查询结果
const CACHE_TTL = 60 * 1000; // 1 分钟
const queryCache = new Map<string, { data: any; expires: number }>();

async function getCachedQuery<T>(
  key: string,
  query: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const now = Date.now();
  const cached = queryCache.get(key);

  if (cached && cached.expires > now) {
    return cached.data;
  }

  const data = await query();
  queryCache.set(key, {
    data,
    expires: now + ttl,
  });

  return data;
}

// 使用示例
const trendingPosts = await getCachedQuery(
  'trending-posts',
  () => db
    .select()
    .from(posts)
    .orderBy(desc(posts.viewCount))
    .limit(10)
);
```

---

## 批量操作优化

### 批量插入

```typescript
// ❌ 避免：循环插入
for (const user of users) {
  await db.insert(users).values(user);
}

// ✅ 推荐：批量插入
await db.insert(users).values(users);

// 大量数据分批插入
async function bulkInsert<T>(
  table: any,
  data: T[],
  batchSize: number = 500
) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await db.insert(table).values(batch);
    console.log(`Inserted ${i + batch.length}/${data.length}`);
  }
}

// 使用 COPY 命令（最快）
// COPY users (email, name) FROM STDIN WITH (FORMAT CSV);
```

### 批量更新

```typescript
// ❌ 避免：循环更新
for (const post of posts) {
  await db
    .update(posts)
    .set({ viewCount: post.viewCount + 1 })
    .where(eq(posts.id, post.id));
}

// ✅ 推荐：使用 CASE WHEN
const updates = [
  { id: 'id1', viewCount: 10 },
  { id: 'id2', viewCount: 20 },
];

await db.update(posts).set({
  viewCount: sql`CASE ${posts.id}
    ${sql.join(
      updates.map((u) => sql`WHEN ${u.id} THEN ${u.viewCount}`),
      sql` `
    )}
  END`,
}).where(inArray(posts.id, updates.map(u => u.id)));

// ✅ 或使用事务批量更新
await db.transaction(async (tx) => {
  for (const update of updates) {
    await tx
      .update(posts)
      .set({ viewCount: update.viewCount })
      .where(eq(posts.id, update.id));
  }
});
```

---

## 数据库配置

### PostgreSQL 配置优化

```sql
-- postgresql.conf

-- 共享内存（建议为系统内存的 25%）
shared_buffers = 4GB

-- 工作内存（每个连接的排序/哈希操作）
work_mem = 64MB

-- 维护内存（VACUUM, CREATE INDEX）
maintenance_work_mem = 1GB

-- 有效缓存大小（建议为系统内存的 50-75%）
effective_cache_size = 12GB

-- 并发连接数
max_connections = 100

-- WAL 配置
wal_buffers = 16MB
checkpoint_completion_target = 0.9

-- 查询规划器
random_page_cost = 1.1  # SSD
effective_io_concurrency = 200

-- 日志
log_min_duration_statement = 1000  # 记录慢查询(>1秒)
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

### Neon 特定优化

```typescript
// Neon 自动扩展，无需手动配置
// 但可以优化查询以减少计算单元消耗

// ✅ 使用分页减少数据传输
const posts = await db
  .select()
  .from(posts)
  .limit(100);

// ✅ 使用索引减少扫描
// Neon 按扫描的数据量计费

// ✅ 使用连接池减少连接开销
// Neon 支持连接池优化
```

---

## 监控与分析

### 慢查询分析

```sql
-- 启用慢查询日志
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- 查看慢查询统计
SELECT
  calls,
  total_exec_time,
  mean_exec_time,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 分析查询计划
EXPLAIN ANALYZE
SELECT * FROM posts WHERE user_id = 'xxx';
```

### EXPLAIN 分析

```typescript
// 在应用中分析查询
const plan = await db.execute(sql`
  EXPLAIN ANALYZE
  SELECT * FROM posts WHERE user_id = 'xxx'
`);

console.log(plan);

// 查看执行计划
// - Seq Scan: 全表扫描（慢）
// - Index Scan: 索引扫描（快）
// - Bitmap Heap Scan: 位图扫描（中等）
```

### 性能监控指标

```typescript
// 监控关键指标
interface DatabaseMetrics {
  // 查询性能
  avgQueryTime: number;
  slowQueries: number;

  // 连接池
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;

  // 缓存命中率
  cacheHitRate: number;

  // 索引使用率
  indexUsage: number;
}

async function collectMetrics(): Promise<DatabaseMetrics> {
  // 实现监控逻辑
  // ...
}

// 定期收集并报告
setInterval(async () => {
  const metrics = await collectMetrics();
  // 发送到监控系统（Prometheus, DataDog 等）
}, 60000);
```

---

## 常见性能问题

### 问题1: N+1 查询

```typescript
// ❌ 问题代码
const users = await db.select().from(users);
for (const user of users) {
  user.posts = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, user.id));
}

// ✅ 解决方案
const usersWithPosts = await db.query.users.findMany({
  with: { posts: true },
});
```

### 问题2: 缺少索引

```typescript
// ❌ 问题：WHERE 条件字段没有索引
const posts = await db
  .select()
  .from(posts)
  .where(eq(posts.status, 'published')); // status 没有索引

// ✅ 解决方案：添加索引
export const posts = pgTable('posts', {
  status: varchar('status', { length: 20 }),
}, (table) => ({
  statusIdx: index('posts_status_idx').on(table.status),
}));
```

### 问题3: 大 OFFSET 分页

```typescript
// ❌ 问题：大 offset 性能差
const page100 = await db
  .select()
  .from(posts)
  .limit(20)
  .offset(2000);

// ✅ 解决方案：游标分页
const page = await db
  .select()
  .from(posts)
  .where(lt(posts.id, lastId))
  .orderBy(desc(posts.id))
  .limit(20);
```

### 问题4: SELECT *

```typescript
// ❌ 问题：查询所有字段
const posts = await db.select().from(posts);

// ✅ 解决方案：只查询需要的字段
const posts = await db
  .select({
    id: posts.id,
    title: posts.title,
  })
  .from(posts);
```

### 问题5: 锁竞争

```typescript
// ❌ 问题：长事务持有锁
await db.transaction(async (tx) => {
  await heavyComputation(); // 阻塞其他事务
  await tx.update(posts).set({ status: 'published' });
});

// ✅ 解决方案：缩短事务时间
const result = await heavyComputation();
await db.transaction(async (tx) => {
  await tx.update(posts).set({ status: 'published' });
});
```

---

## 性能优化检查清单

### Schema 层面
- [ ] 为外键字段添加索引
- [ ] 为 WHERE/ORDER BY 字段添加索引
- [ ] 使用复合索引优化常见查询
- [ ] 定期清理无用索引
- [ ] 使用部分索引节省空间

### 查询层面
- [ ] 避免 SELECT *
- [ ] 使用 LIMIT 限制结果
- [ ] 使用 Relations 避免 N+1
- [ ] 使用预编译语句
- [ ] 避免在索引列上使用函数

### 应用层面
- [ ] 配置合理的连接池
- [ ] 实现缓存策略
- [ ] 使用批量操作
- [ ] 监控慢查询
- [ ] 定期分析查询计划

---

## 相关资源

- [schema-design.md](./schema-design.md) - Schema 设计模式
- [query-patterns.md](./query-patterns.md) - 查询模式大全
- [migration-guide.md](./migration-guide.md) - 迁移最佳实践
- [testing.md](./testing.md) - 数据库测试策略
