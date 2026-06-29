# 数据库测试策略

> Drizzle ORM 数据库测试最佳实践

## 📋 目录

- [测试环境配置](#测试环境配置)
- [测试数据库设置](#测试数据库设置)
- [事务回滚模式](#事务回滚模式)
- [测试数据管理](#测试数据管理)
- [单元测试](#单元测试)
- [集成测试](#集成测试)
- [测试工具和库](#测试工具和库)
- [最佳实践](#最佳实践)

---

## 测试环境配置

### 环境变量配置

```bash
# .env.test
NODE_ENV=test

# 测试数据库连接
DATABASE_TEST_URL=postgresql://user:password@localhost:5432/testdb

# 或使用 Neon 测试分支
DATABASE_TEST_URL=postgresql://user:password@test-branch.neon.tech/testdb
```

### Drizzle 配置

```typescript
// drizzle.config.ts
import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

let connectionString = process.env.DATABASE_URL;

// 测试环境使用测试数据库
if (process.env.NODE_ENV === "test") {
  connectionString = process.env.DATABASE_TEST_URL;
}

if (!connectionString) {
  throw new Error("Database connection string not found");
}

export default {
  dbCredentials: {
    url: connectionString,
  },
  dialect: "postgresql",
  out: "./src/database/migrations",
  schema: ["./src/database/schema"],
  strict: true,
} satisfies Config;
```

### Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // 设置测试环境变量
    env: {
      NODE_ENV: 'test',
    },

    // 全局 setup 文件
    setupFiles: ['./tests/setup.ts'],

    // 测试超时时间
    testTimeout: 30000,

    // 并发测试（小心数据库竞争）
    threads: false,

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/database/migrations/**',
      ],
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## 测试数据库设置

### 方案1: 独立测试数据库

```typescript
// tests/setup.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { beforeAll, afterAll } from 'vitest';

let pool: Pool;
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  // 连接测试数据库
  pool = new Pool({
    connectionString: process.env.DATABASE_TEST_URL,
  });

  db = drizzle(pool);

  // 运行迁移
  await migrate(db, {
    migrationsFolder: './src/database/migrations',
  });

  console.log('✅ Test database initialized');
});

afterAll(async () => {
  // 清理并关闭连接
  await pool.end();
  console.log('✅ Test database closed');
});

export { db, pool };
```

### 方案2: Docker 测试数据库

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: testdb
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data  # 使用内存存储，测试更快
```

```bash
# package.json
{
  "scripts": {
    "test:db:up": "docker-compose -f docker-compose.test.yml up -d",
    "test:db:down": "docker-compose -f docker-compose.test.yml down",
    "test": "pnpm test:db:up && vitest run && pnpm test:db:down"
  }
}
```

### 方案3: Neon 测试分支

```bash
# 创建测试分支
neon branches create --name test-branch

# 获取连接字符串
# DATABASE_TEST_URL=postgresql://...@test-branch.neon.tech/db

# 测试完成后删除分支
neon branches delete test-branch
```

---

## 事务回滚模式

### 每个测试使用事务回滚

```typescript
// tests/helpers/transaction-wrapper.ts
import { db } from '@/database/client';
import { beforeEach, afterEach } from 'vitest';

let rollback: (() => Promise<void>) | null = null;

beforeEach(async () => {
  // 开始事务
  await new Promise<void>((resolve) => {
    db.transaction(async (tx) => {
      // 替换全局 db 为事务
      (global as any).testDb = tx;

      rollback = async () => {
        // 回滚事务
        throw new Error('Rollback');
      };

      resolve();

      // 保持事务打开
      return new Promise(() => {});
    }).catch(() => {
      // 预期的回滚错误
    });
  });
});

afterEach(async () => {
  if (rollback) {
    await rollback();
    rollback = null;
  }
});
```

### 简化版事务回滚

```typescript
// tests/helpers/db-test.ts
import { db } from '@/database/client';
import { beforeEach, afterEach } from 'vitest';

export function useDbTransaction() {
  let cleanup: (() => Promise<void>) | null = null;

  beforeEach(async () => {
    // 创建临时表或使用命名空间隔离
  });

  afterEach(async () => {
    // 清理测试数据
    if (cleanup) {
      await cleanup();
    }
  });

  return { db };
}
```

### 测试隔离示例

```typescript
// tests/users.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/database/client';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

describe('User CRUD', () => {
  const testUserIds: string[] = [];

  afterEach(async () => {
    // 清理测试数据
    if (testUserIds.length > 0) {
      await db.delete(users).where(
        inArray(users.id, testUserIds)
      );
      testUserIds.length = 0;
    }
  });

  it('should create user', async () => {
    const [user] = await db
      .insert(users)
      .values({
        email: 'test@example.com',
        name: 'Test User',
      })
      .returning();

    testUserIds.push(user.id);

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  it('should update user', async () => {
    // 创建测试用户
    const [user] = await db
      .insert(users)
      .values({
        email: 'test@example.com',
        name: 'Test User',
      })
      .returning();

    testUserIds.push(user.id);

    // 更新用户
    const [updated] = await db
      .update(users)
      .set({ name: 'Updated Name' })
      .where(eq(users.id, user.id))
      .returning();

    expect(updated.name).toBe('Updated Name');
  });
});
```

---

## 测试数据管理

### Factory 模式

```typescript
// tests/factories/user.factory.ts
import { db } from '@/database/client';
import { users, type InsertUser } from '@/database/schema';
import { faker } from '@faker-js/faker';

export class UserFactory {
  // 默认属性
  private attributes: Partial<InsertUser> = {};

  // 设置属性
  with(attributes: Partial<InsertUser>): this {
    this.attributes = { ...this.attributes, ...attributes };
    return this;
  }

  // 生成属性（不插入数据库）
  make(): InsertUser {
    return {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      ...this.attributes,
    };
  }

  // 创建单个记录
  async create(): Promise<typeof users.$inferSelect> {
    const [user] = await db
      .insert(users)
      .values(this.make())
      .returning();

    return user;
  }

  // 批量创建
  async createMany(count: number): Promise<Array<typeof users.$inferSelect>> {
    const data = Array.from({ length: count }, () => this.make());
    return await db.insert(users).values(data).returning();
  }
}

// 使用示例
const user = await new UserFactory()
  .with({ email: 'admin@example.com' })
  .create();

const users = await new UserFactory().createMany(10);
```

### Fixture 模式

```typescript
// tests/fixtures/users.fixture.ts
import { db } from '@/database/client';
import { users, posts } from '@/database/schema';

export async function seedTestData() {
  // 创建用户
  const [user1] = await db
    .insert(users)
    .values({
      email: 'user1@example.com',
      name: 'User 1',
    })
    .returning();

  const [user2] = await db
    .insert(users)
    .values({
      email: 'user2@example.com',
      name: 'User 2',
    })
    .returning();

  // 创建文章
  await db.insert(posts).values([
    {
      title: 'Post 1',
      userId: user1.id,
    },
    {
      title: 'Post 2',
      userId: user1.id,
    },
    {
      title: 'Post 3',
      userId: user2.id,
    },
  ]);

  return { user1, user2 };
}

// 使用示例
describe('Posts', () => {
  let fixtures: Awaited<ReturnType<typeof seedTestData>>;

  beforeEach(async () => {
    fixtures = await seedTestData();
  });

  it('should list user posts', async () => {
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, fixtures.user1.id));

    expect(userPosts).toHaveLength(2);
  });
});
```

### 测试数据清理

```typescript
// tests/helpers/cleanup.ts
import { db } from '@/database/client';
import { sql } from 'drizzle-orm';

export async function cleanupDatabase() {
  // 方案1: 删除所有数据（保留表结构）
  await db.execute(sql`TRUNCATE TABLE users CASCADE`);
  await db.execute(sql`TRUNCATE TABLE posts CASCADE`);

  // 方案2: 删除测试数据（保留其他数据）
  await db.execute(sql`DELETE FROM users WHERE email LIKE '%@test.com'`);

  // 方案3: 重置序列
  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
}

// 在测试后清理
afterAll(async () => {
  await cleanupDatabase();
});
```

---

## 单元测试

### 测试 Schema 定义

```typescript
// tests/schema/users.test.ts
import { describe, it, expect } from 'vitest';
import { users, insertUserSchema } from '@/database/schema';

describe('User Schema', () => {
  it('should have correct table name', () => {
    expect(users._.name).toBe('users');
  });

  it('should validate insert data', () => {
    const validData = {
      email: 'user@example.com',
      name: 'Test User',
    };

    const result = insertUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      name: 'Test User',
    };

    const result = insertUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

### 测试查询函数

```typescript
// src/database/queries/user.queries.ts
export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user || null;
}

export async function createUser(data: InsertUser) {
  const [user] = await db
    .insert(users)
    .values(data)
    .returning();

  return user;
}

// tests/queries/user.queries.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import { getUserByEmail, createUser } from '@/database/queries/user.queries';
import { db } from '@/database/client';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

describe('User Queries', () => {
  const testEmails: string[] = [];

  afterEach(async () => {
    // 清理测试数据
    for (const email of testEmails) {
      await db.delete(users).where(eq(users.email, email));
    }
    testEmails.length = 0;
  });

  describe('getUserByEmail', () => {
    it('should return user when exists', async () => {
      // Arrange
      const email = 'test@example.com';
      testEmails.push(email);

      await createUser({
        email,
        name: 'Test User',
      });

      // Act
      const user = await getUserByEmail(email);

      // Assert
      expect(user).not.toBeNull();
      expect(user?.email).toBe(email);
    });

    it('should return null when user does not exist', async () => {
      const user = await getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const email = 'newuser@example.com';
      testEmails.push(email);

      const user = await createUser({
        email,
        name: 'New User',
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for duplicate email', async () => {
      const email = 'duplicate@example.com';
      testEmails.push(email);

      await createUser({ email, name: 'User 1' });

      await expect(
        createUser({ email, name: 'User 2' })
      ).rejects.toThrow();
    });
  });
});
```

### 测试事务

```typescript
// src/database/transactions/order.transaction.ts
export async function createOrder(
  userId: string,
  items: Array<{ productId: string; quantity: number }>
) {
  return await db.transaction(async (tx) => {
    // 创建订单
    const [order] = await tx
      .insert(orders)
      .values({ userId, totalAmount: 0 })
      .returning();

    let totalAmount = 0;

    // 创建订单项并扣减库存
    for (const item of items) {
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product || product.stock < item.quantity) {
        throw new Error('库存不足');
      }

      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.quantity}` })
        .where(eq(products.id, item.productId));

      totalAmount += product.price * item.quantity;
    }

    // 更新订单总额
    const [updatedOrder] = await tx
      .update(orders)
      .set({ totalAmount })
      .where(eq(orders.id, order.id))
      .returning();

    return updatedOrder;
  });
}

// tests/transactions/order.transaction.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createOrder } from '@/database/transactions/order.transaction';
import { db } from '@/database/client';
import { users, products, orders, orderItems } from '@/database/schema';
import { eq } from 'drizzle-orm';

describe('Order Transaction', () => {
  let userId: string;
  let productId: string;
  const testIds = { orders: [], users: [], products: [] };

  beforeEach(async () => {
    // 创建测试用户
    const [user] = await db
      .insert(users)
      .values({ email: 'test@example.com', name: 'Test' })
      .returning();
    userId = user.id;
    testIds.users.push(userId);

    // 创建测试产品
    const [product] = await db
      .insert(products)
      .values({ name: 'Product 1', price: 100, stock: 10 })
      .returning();
    productId = product.id;
    testIds.products.push(productId);
  });

  afterEach(async () => {
    // 清理测试数据
    await db.delete(orderItems);
    for (const id of testIds.orders) {
      await db.delete(orders).where(eq(orders.id, id));
    }
    for (const id of testIds.products) {
      await db.delete(products).where(eq(products.id, id));
    }
    for (const id of testIds.users) {
      await db.delete(users).where(eq(users.id, id));
    }
  });

  it('should create order and deduct stock', async () => {
    // Act
    const order = await createOrder(userId, [
      { productId, quantity: 2 },
    ]);

    testIds.orders.push(order.id);

    // Assert
    expect(order).toBeDefined();
    expect(order.totalAmount).toBe(200);

    // 验证库存已扣减
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    expect(product.stock).toBe(8);
  });

  it('should rollback on insufficient stock', async () => {
    // Act & Assert
    await expect(
      createOrder(userId, [
        { productId, quantity: 20 }, // 库存不足
      ])
    ).rejects.toThrow('库存不足');

    // 验证库存未改变
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    expect(product.stock).toBe(10);

    // 验证订单未创建
    const orderCount = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.userId, userId));

    expect(orderCount[0].count).toBe(0);
  });
});
```

---

## 集成测试

### API 集成测试

```typescript
// tests/integration/api/users.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { db } from '@/database/client';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

describe('User API', () => {
  const testEmails: string[] = [];

  afterEach(async () => {
    for (const email of testEmails) {
      await db.delete(users).where(eq(users.email, email));
    }
    testEmails.length = 0;
  });

  describe('POST /api/users', () => {
    it('should create user', async () => {
      const email = 'newuser@example.com';
      testEmails.push(email);

      const response = await request(app)
        .post('/api/users')
        .send({
          email,
          name: 'New User',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        email,
        name: 'New User',
      });
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          name: 'User',
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user', async () => {
      const email = 'getuser@example.com';
      testEmails.push(email);

      const [user] = await db
        .insert(users)
        .values({ email, name: 'Get User' })
        .returning();

      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        email,
      });
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/non-existent-id')
        .expect(404);
    });
  });
});
```

---

## 测试工具和库

### 推荐工具

```json
// package.json
{
  "devDependencies": {
    // 测试框架
    "vitest": "^1.0.0",

    // 测试数据生成
    "@faker-js/faker": "^8.0.0",

    // API 测试
    "supertest": "^6.3.0",
    "@types/supertest": "^6.0.0",

    // 数据库测试
    "testcontainers": "^10.0.0"
  }
}
```

### Faker.js 集成

```typescript
// tests/factories/base.factory.ts
import { faker } from '@faker-js/faker';

export abstract class BaseFactory<T> {
  protected abstract make(): T;

  // 设置 locale
  static setLocale(locale: string) {
    faker.locale = locale;
  }

  // 设置随机种子（可重现测试）
  static setSeed(seed: number) {
    faker.seed(seed);
  }

  // 生成多个
  makeMany(count: number): T[] {
    return Array.from({ length: count }, () => this.make());
  }
}

// 使用示例
import { faker } from '@faker-js/faker';

const user = {
  email: faker.internet.email(),
  name: faker.person.fullName(),
  age: faker.number.int({ min: 18, max: 80 }),
  avatar: faker.image.avatar(),
  bio: faker.lorem.paragraph(),
};
```

### Testcontainers 集成

```typescript
// tests/setup-testcontainers.ts
import { PostgreSqlContainer } from 'testcontainers';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { beforeAll, afterAll } from 'vitest';

let container: PostgreSqlContainer;
let pool: Pool;
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  // 启动 PostgreSQL 容器
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('testdb')
    .withUsername('testuser')
    .withPassword('testpass')
    .start();

  // 连接数据库
  pool = new Pool({
    host: container.getHost(),
    port: container.getPort(),
    database: container.getDatabase(),
    user: container.getUsername(),
    password: container.getPassword(),
  });

  db = drizzle(pool);

  // 运行迁移
  await migrate(db, {
    migrationsFolder: './src/database/migrations',
  });

  console.log('✅ Test container started');
}, 60000); // 60 秒超时

afterAll(async () => {
  await pool.end();
  await container.stop();
  console.log('✅ Test container stopped');
});

export { db, pool };
```

---

## 最佳实践

### 1. 独立的测试数据库

```typescript
// ✅ 使用独立测试数据库
DATABASE_TEST_URL=postgresql://localhost/testdb

// ❌ 不要使用开发数据库
// DATABASE_URL=postgresql://localhost/devdb
```

### 2. 测试隔离

```typescript
// ✅ 每个测试清理自己的数据
afterEach(async () => {
  await cleanupTestData();
});

// ✅ 使用唯一标识符
const testEmail = `test-${Date.now()}@example.com`;

// ❌ 避免测试之间共享状态
let sharedUser; // 危险!
```

### 3. 使用 Factory 和 Fixture

```typescript
// ✅ 使用 Factory 创建测试数据
const user = await new UserFactory().create();

// ✅ 使用 Fixture 设置测试场景
const { user, posts } = await seedBlogFixture();

// ❌ 避免硬编码测试数据
const user = { id: '123', email: 'test@test.com' };
```

### 4. 测试真实场景

```typescript
// ✅ 测试完整业务流程
it('should complete order flow', async () => {
  const user = await createUser();
  const product = await createProduct();
  const order = await createOrder(user.id, [
    { productId: product.id, quantity: 1 },
  ]);
  expect(order.status).toBe('pending');
});

// ❌ 避免过度模拟
it('should create order', async () => {
  const mockDb = { insert: vi.fn() };
  // 模拟了所有逻辑，测试意义不大
});
```

### 5. 测试错误场景

```typescript
// ✅ 测试失败路径
it('should handle insufficient stock', async () => {
  await expect(
    createOrder(userId, [{ productId, quantity: 999 }])
  ).rejects.toThrow('库存不足');
});

it('should handle duplicate email', async () => {
  await createUser({ email: 'test@example.com' });
  await expect(
    createUser({ email: 'test@example.com' })
  ).rejects.toThrow();
});
```

### 6. 性能测试

```typescript
// 测试查询性能
it('should query users efficiently', async () => {
  // 创建大量数据
  await new UserFactory().createMany(1000);

  const start = Date.now();

  const users = await db
    .select()
    .from(users)
    .where(eq(users.status, 'active'))
    .limit(100);

  const duration = Date.now() - start;

  expect(users).toHaveLength(100);
  expect(duration).toBeLessThan(100); // 应在 100ms 内完成
});
```

### 7. 并发测试

```typescript
// 测试并发安全性
it('should handle concurrent updates', async () => {
  const [user] = await db
    .insert(users)
    .values({ email: 'test@example.com', points: 0 })
    .returning();

  // 并发增加积分
  await Promise.all([
    incrementPoints(user.id, 10),
    incrementPoints(user.id, 20),
    incrementPoints(user.id, 30),
  ]);

  const [updated] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  expect(updated.points).toBe(60);
});
```

---

## 测试覆盖率目标

```bash
# 运行测试并生成覆盖率报告
pnpm test --coverage

# 覆盖率目标
# - 语句覆盖率: > 80%
# - 分支覆盖率: > 75%
# - 函数覆盖率: > 80%
# - 行覆盖率: > 80%
```

---

## 相关资源

- [schema-design.md](./schema-design.md) - Schema 设计模式
- [query-patterns.md](./query-patterns.md) - 查询模式大全
- [migration-guide.md](./migration-guide.md) - 迁移最佳实践
- [performance.md](./performance.md) - 性能优化指南
