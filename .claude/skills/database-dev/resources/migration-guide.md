# 迁移最佳实践

> Drizzle Kit 数据库迁移管理指南

## 📋 目录

- [迁移基础](#迁移基础)
- [Drizzle Kit 命令](#drizzle-kit-命令)
- [迁移工作流](#迁移工作流)
- [常见迁移场景](#常见迁移场景)
- [回滚策略](#回滚策略)
- [生产环境最佳实践](#生产环境最佳实践)
- [数据迁移](#数据迁移)
- [故障排查](#故障排查)

---

## 迁移基础

### 什么是数据库迁移

数据库迁移是一种版本控制系统,用于管理数据库 schema 的变更历史。每次 schema 修改都会生成一个迁移文件,记录变更内容。

**优点**:
- 版本控制:追踪所有 schema 变更
- 可重现:在不同环境中应用相同变更
- 可回滚:出错时能够恢复到之前状态
- 团队协作:多人开发时避免冲突

### 项目配置

```typescript
// drizzle.config.ts
import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

let connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === "test") {
  connectionString = process.env.DATABASE_TEST_URL;
}

if (!connectionString) {
  throw new Error("`DATABASE_URL` not found in environment");
}

export default {
  dbCredentials: {
    url: connectionString,
  },
  dialect: "postgresql",
  // 迁移文件输出目录
  out: "./src/database/migrations",
  // Schema 文件路径
  schema: ["./src/database/schema"],
  // 严格模式:检测潜在问题
  strict: true,
  // 详细日志
  verbose: true,
} satisfies Config;
```

### Package.json 脚本

```json
{
  "scripts": {
    // 生成迁移文件
    "db:generate": "drizzle-kit generate",

    // 执行迁移
    "db:migrate": "tsx src/database/migrate.ts",

    // 推送 schema 到数据库(开发环境)
    "db:push": "drizzle-kit push",

    // 删除数据库并重建(危险!)
    "db:drop": "drizzle-kit drop",

    // 查看迁移状态
    "db:check": "drizzle-kit check",

    // 打开 Drizzle Studio
    "db:studio": "drizzle-kit studio",

    // 生成内省 schema
    "db:introspect": "drizzle-kit introspect"
  }
}
```

---

## Drizzle Kit 命令

### generate - 生成迁移

```bash
# 基本用法
pnpm db:generate

# 指定配置文件
drizzle-kit generate --config=drizzle.config.ts

# 自定义迁移名称
drizzle-kit generate --name=add_user_roles

# 生成时检查破坏性变更
drizzle-kit generate --breakpoints
```

**生成的文件**:
```
src/database/migrations/
├── 0000_nifty_cannonball.sql
├── 0001_add_posts_table.sql
├── 0002_add_user_roles.sql
└── meta/
    ├── _journal.json
    └── 0000_snapshot.json
```

### migrate - 执行迁移

```typescript
// src/database/migrate.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log('⏳ Running migrations...');

  try {
    await migrate(db, {
      migrationsFolder: './src/database/migrations',
    });

    console.log('✅ Migrations completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  await pool.end();
}

runMigration();
```

```bash
# 执行迁移
pnpm db:migrate

# 使用 tsx 直接运行
tsx src/database/migrate.ts
```

### push - 推送 Schema (开发环境)

```bash
# 直接将 schema 推送到数据库(不生成迁移文件)
pnpm db:push

# ⚠️ 警告:此命令会直接修改数据库,仅用于开发环境
# 生产环境必须使用 generate + migrate
```

**适用场景**:
- 快速原型开发
- 本地实验性修改
- 开发环境快速迭代

**不适用场景**:
- 生产环境
- 需要版本控制的变更
- 团队协作环境

### introspect - 内省现有数据库

```bash
# 从现有数据库生成 schema
drizzle-kit introspect

# 生成的 schema 文件位于 drizzle/ 目录
```

**适用场景**:
- 迁移现有项目到 Drizzle
- 同步外部数据库变更
- 生成初始 schema

### studio - Drizzle Studio

```bash
# 启动可视化数据库管理工具
pnpm db:studio

# 访问 https://local.drizzle.studio
```

---

## 迁移工作流

### 开发环境工作流

```bash
# 1. 修改 schema 文件
# src/database/schema/users.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  // 新增字段
  phoneNumber: varchar('phone_number', { length: 20 }),
});

# 2. 生成迁移文件
pnpm db:generate

# 3. 检查生成的 SQL
cat src/database/migrations/0003_add_phone_number.sql

# 4. 执行迁移
pnpm db:migrate

# 5. 验证变更
pnpm db:studio
```

### 团队协作工作流

```bash
# 开发者 A: 创建新功能
git checkout -b feat/add-comments
# 修改 schema
pnpm db:generate
pnpm db:migrate
git add src/database/
git commit -m "feat: add comments table"
git push

# 开发者 B: 同步变更
git pull origin main
pnpm db:migrate  # 应用新迁移
```

### 生产环境工作流

```bash
# 1. 在 staging 环境测试
git checkout staging
pnpm db:migrate

# 2. 运行测试
pnpm test

# 3. 备份生产数据库
pg_dump -h prod-db -U user -d database > backup.sql

# 4. 部署到生产环境
git checkout main
git merge staging

# 5. 执行迁移(使用 CI/CD 或手动)
NODE_ENV=production pnpm db:migrate

# 6. 验证
# 检查应用是否正常运行
# 验证数据完整性
```

---

## 常见迁移场景

### 添加表

```typescript
// src/database/schema/posts.ts
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

```bash
pnpm db:generate
# 生成的 SQL:
# CREATE TABLE "posts" (...)
```

### 添加列

```typescript
// 添加可选列(无默认值)
export const users = pgTable('users', {
  // 现有字段...
  bio: text('bio'), // 新增
});

// 添加必填列(需提供默认值)
export const users = pgTable('users', {
  // 现有字段...
  status: varchar('status', { length: 20 })
    .notNull()
    .default('active'), // 新增
});
```

```sql
-- 生成的 SQL
ALTER TABLE "users" ADD COLUMN "bio" text;
ALTER TABLE "users" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;
```

### 删除列

```typescript
// ⚠️ 注意:删除列是破坏性操作

// 1. 首先标记为可选
export const users = pgTable('users', {
  // oldColumn: text('old_column'), // 注释掉
});

// 2. 生成迁移
pnpm db:generate

// 3. 手动编辑迁移文件添加 DROP COLUMN
-- ALTER TABLE "users" DROP COLUMN "old_column";
```

**最佳实践**:
```typescript
// 方案1: 软删除(推荐)
export const users = pgTable('users', {
  oldColumn: text('old_column'), // 保留,但不再使用
  // 在应用代码中忽略此字段
});

// 方案2: 分阶段删除
// 第一次部署:停止写入
// 第二次部署:停止读取
// 第三次部署:删除列
```

### 重命名列

```typescript
// ⚠️ Drizzle 无法自动检测重命名,需手动处理

// 方案1: 创建新列 + 数据迁移 + 删除旧列
export const users = pgTable('users', {
  // old_name: varchar('old_name', { length: 255 }),
  newName: varchar('new_name', { length: 255 }), // 新增
});

// 生成迁移后,手动编辑 SQL
```

```sql
-- 手动编辑迁移文件
ALTER TABLE "users" ADD COLUMN "new_name" varchar(255);

-- 复制数据
UPDATE "users" SET "new_name" = "old_name";

-- 删除旧列
ALTER TABLE "users" DROP COLUMN "old_name";
```

### 修改列类型

```typescript
// varchar -> text
export const posts = pgTable('posts', {
  // title: varchar('title', { length: 255 }),
  title: text('title'), // 修改类型
});
```

```sql
-- 生成的 SQL
ALTER TABLE "posts" ALTER COLUMN "title" SET DATA TYPE text;
```

**注意事项**:
```sql
-- 某些类型转换需要 USING 子句
ALTER TABLE "users" ALTER COLUMN "age" SET DATA TYPE integer USING "age"::integer;

-- 可能导致数据丢失的转换
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(50); -- 截断!
```

### 添加索引

```typescript
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  status: varchar('status', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // 新增索引
  userIdIdx: index('posts_user_id_idx').on(table.userId),
  statusIdx: index('posts_status_idx').on(table.status),
  createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
}));
```

```sql
-- 生成的 SQL
CREATE INDEX "posts_user_id_idx" ON "posts" ("user_id");
CREATE INDEX "posts_status_idx" ON "posts" ("status");
CREATE INDEX "posts_created_at_idx" ON "posts" ("created_at");

-- 并发创建索引(推荐用于生产环境)
CREATE INDEX CONCURRENTLY "posts_user_id_idx" ON "posts" ("user_id");
```

### 添加外键

```typescript
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  // 添加外键
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});
```

```sql
-- 生成的 SQL
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
```

### 添加约束

```typescript
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  price: integer('price').notNull(),
  discountPrice: integer('discount_price'),
}, (table) => ({
  // CHECK 约束
  priceCheck: check('products_price_check', sql`${table.price} > 0`),
  discountCheck: check(
    'products_discount_check',
    sql`${table.discountPrice} IS NULL OR ${table.discountPrice} < ${table.price}`
  ),

  // 唯一约束
  skuUnq: unique('products_sku_unq').on(table.sku),
}));
```

---

## 回滚策略

### 方案1: 创建反向迁移

```typescript
// 迁移: 0003_add_posts_table.sql
CREATE TABLE "posts" (...);

// 手动创建回滚迁移: 0004_rollback_posts_table.sql
DROP TABLE "posts";
```

```bash
# 执行回滚
pnpm db:migrate
```

### 方案2: 从备份恢复

```bash
# 1. 备份数据库
pg_dump -h localhost -U user -d database > backup_before_migration.sql

# 2. 执行迁移
pnpm db:migrate

# 3. 如果出错,从备份恢复
psql -h localhost -U user -d database < backup_before_migration.sql
```

### 方案3: 删除迁移记录

```sql
-- 查看已执行的迁移
SELECT * FROM drizzle.__drizzle_migrations;

-- 删除最后一次迁移记录
DELETE FROM drizzle.__drizzle_migrations
WHERE id = (SELECT MAX(id) FROM drizzle.__drizzle_migrations);

-- 手动回滚 schema 变更
DROP TABLE "posts";
```

### 防止需要回滚

```typescript
// ✅ 使用事务执行迁移
async function runMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await migrate(db, {
      migrationsFolder: './src/database/migrations',
    });

    await client.query('COMMIT');
    console.log('✅ Migration completed');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed, rolled back:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
```

---

## 生产环境最佳实践

### 1. 始终备份

```bash
# 自动备份脚本
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "Creating backup: $BACKUP_FILE"
pg_dump $DATABASE_URL > $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "✅ Backup successful"

  # 执行迁移
  pnpm db:migrate
else
  echo "❌ Backup failed, aborting migration"
  exit 1
fi
```

### 2. 在 Staging 环境测试

```bash
# 1. Staging 环境测试
DATABASE_URL=$STAGING_DATABASE_URL pnpm db:migrate

# 2. 运行集成测试
pnpm test

# 3. 验证数据完整性
pnpm db:studio

# 4. 确认无误后部署生产环境
```

### 3. 使用迁移锁

```typescript
// src/database/migrate.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function runMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  const client = await pool.connect();

  try {
    // 获取咨询锁,防止并发迁移
    const lockId = 123456789;
    await client.query('SELECT pg_advisory_lock($1)', [lockId]);

    console.log('🔒 Migration lock acquired');

    await migrate(db, {
      migrationsFolder: './src/database/migrations',
    });

    console.log('✅ Migration completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // 释放锁
    await client.query('SELECT pg_advisory_unlock($1)', [123456789]);
    client.release();
    await pool.end();
  }
}

runMigration();
```

### 4. 零停机迁移

```typescript
// 方案: 扩展-迁移-收缩模式

// 阶段1: 添加新列(可选)
export const users = pgTable('users', {
  oldColumn: text('old_column'),
  newColumn: text('new_column'), // 新增
});

// 部署 v1: 应用写入两列
await db.insert(users).values({
  oldColumn: value,
  newColumn: value, // 同时写入
});

// 阶段2: 数据迁移
UPDATE users SET new_column = old_column WHERE new_column IS NULL;

// 阶段3: 应用切换读取
// 部署 v2: 应用读取新列
const user = await db.select({
  value: users.newColumn, // 读取新列
}).from(users);

// 阶段4: 删除旧列
// 部署 v3: 删除 oldColumn
```

### 5. 监控迁移

```typescript
// src/database/migrate.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function runMigration() {
  const startTime = Date.now();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    console.log('⏳ Starting migration...');

    await migrate(db, {
      migrationsFolder: './src/database/migrations',
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Migration completed in ${duration}ms`);

    // 发送成功通知(Slack, 邮件等)
    await notifySuccess({ duration });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Migration failed after ${duration}ms:`, error);

    // 发送失败告警
    await notifyFailure({ error, duration });

    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
```

---

## 数据迁移

### 简单数据迁移

```sql
-- src/database/migrations/0005_migrate_user_data.sql

-- 迁移现有数据
UPDATE users
SET status = 'active'
WHERE status IS NULL;

-- 计算派生字段
UPDATE posts
SET word_count = LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1
WHERE word_count IS NULL;
```

### 复杂数据迁移

```typescript
// src/database/scripts/migrate-user-roles.ts
import { db } from '@/database/client';
import { users, userRoles, roles } from '@/database/schema';
import { eq } from 'drizzle-orm';

async function migrateUserRoles() {
  console.log('⏳ Migrating user roles...');

  // 获取所有用户
  const allUsers = await db.select().from(users);

  // 获取角色映射
  const [userRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, 'user'))
    .limit(1);

  const [adminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, 'admin'))
    .limit(1);

  // 批量插入角色关联
  const roleAssignments = allUsers.map(user => ({
    userId: user.id,
    roleId: user.isAdmin ? adminRole.id : userRole.id,
  }));

  // 分批插入(每批 500 条)
  const BATCH_SIZE = 500;
  for (let i = 0; i < roleAssignments.length; i += BATCH_SIZE) {
    const batch = roleAssignments.slice(i, i + BATCH_SIZE);
    await db.insert(userRoles).values(batch);
    console.log(`✅ Processed ${i + batch.length}/${roleAssignments.length}`);
  }

  console.log('✅ Migration completed!');
}

migrateUserRoles();
```

```bash
# 执行数据迁移脚本
tsx src/database/scripts/migrate-user-roles.ts
```

### 迁移大量数据

```typescript
// src/database/scripts/migrate-large-dataset.ts
import { db } from '@/database/client';
import { oldTable, newTable } from '@/database/schema';

async function migrateLargeDataset() {
  const BATCH_SIZE = 1000;
  let offset = 0;
  let processed = 0;

  console.log('⏳ Starting large dataset migration...');

  while (true) {
    // 分批读取
    const batch = await db
      .select()
      .from(oldTable)
      .limit(BATCH_SIZE)
      .offset(offset);

    if (batch.length === 0) break;

    // 转换数据
    const transformed = batch.map(row => ({
      id: row.id,
      // 数据转换逻辑
      newField: transformData(row.oldField),
    }));

    // 批量插入
    await db.insert(newTable).values(transformed);

    processed += batch.length;
    offset += BATCH_SIZE;

    console.log(`✅ Processed ${processed} records`);

    // 避免内存溢出
    if (global.gc) {
      global.gc();
    }
  }

  console.log(`✅ Migration completed! Total: ${processed} records`);
}

migrateLargeDataset();
```

---

## 故障排查

### 迁移卡住

```bash
# 检查是否有锁
SELECT * FROM pg_locks WHERE NOT granted;

# 查看当前活动查询
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle';

# 终止阻塞查询
SELECT pg_terminate_backend(pid);
```

### 迁移失败但已部分执行

```sql
-- 查看迁移状态
SELECT * FROM drizzle.__drizzle_migrations;

-- 手动清理失败的迁移
BEGIN;

-- 回滚部分变更
DROP TABLE IF EXISTS "problematic_table";

-- 删除迁移记录
DELETE FROM drizzle.__drizzle_migrations WHERE hash = 'xxx';

COMMIT;
```

### 外键约束冲突

```sql
-- 临时禁用外键检查(不推荐)
SET session_replication_role = 'replica';

-- 执行迁移
-- ...

-- 恢复外键检查
SET session_replication_role = 'origin';

-- 更好的方案:先创建表,再添加约束
CREATE TABLE "posts" (...);
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id");
```

### 索引创建超时

```sql
-- 使用 CONCURRENTLY 创建索引(不阻塞写入)
CREATE INDEX CONCURRENTLY "posts_user_id_idx" ON "posts" ("user_id");

-- 如果失败,先删除无效索引
DROP INDEX CONCURRENTLY IF EXISTS "posts_user_id_idx";
```

---

## 迁移检查清单

### 开发环境

- [ ] Schema 修改符合业务需求
- [ ] 生成迁移文件成功
- [ ] 检查生成的 SQL 语句
- [ ] 本地执行迁移成功
- [ ] 运行测试全部通过
- [ ] 提交代码(包含迁移文件)

### Staging 环境

- [ ] 备份数据库
- [ ] 执行迁移
- [ ] 验证 schema 变更
- [ ] 运行集成测试
- [ ] 检查应用功能
- [ ] 验证性能影响

### 生产环境

- [ ] 创建数据库快照/备份
- [ ] 通知团队维护窗口
- [ ] 执行迁移(使用迁移锁)
- [ ] 监控应用日志和错误
- [ ] 验证关键功能
- [ ] 检查数据完整性
- [ ] 监控性能指标
- [ ] 准备回滚方案

---

## 相关资源

- [schema-design.md](./schema-design.md) - Schema 设计模式
- [query-patterns.md](./query-patterns.md) - 查询模式大全
- [performance.md](./performance.md) - 性能优化指南
- [testing.md](./testing.md) - 数据库测试策略
