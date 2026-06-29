# Testing - 后端测试指南

Next.js 16 API Routes、Services 和 Repositories 的测试最佳实践。

## Table of Contents

- [测试原则](#测试原则)
- [测试 API Routes](#测试-api-routes)
- [测试 Services](#测试-services)
- [测试 Repositories](#测试-repositories)
- [Mock 数据库](#mock-数据库)
- [集成测试](#集成测试)
- [测试组织](#测试组织)
- [最佳实践](#最佳实践)

---

## 测试原则

### 核心原则

1. **独立性**：每个测试独立运行，不依赖其他测试
2. **可重复性**：测试结果应该是确定的和可重复的
3. **快速执行**：测试应该快速执行
4. **清晰性**：测试应该容易理解和维护
5. **覆盖关键路径**：优先测试核心业务逻辑

### 测试金字塔

```
        E2E 测试 (少量)
           /\
          /  \
         /    \
   集成测试 (适量)
       /      \
      /        \
     /          \
单元测试 (大量)
```

### AAA 模式

```typescript
it('should create user with valid data', async () => {
  // Arrange (准备) - 设置测试数据和环境
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
  };

  // Act (执行) - 执行被测试的代码
  const user = await userService.create(userData);

  // Assert (断言) - 验证结果
  expect(user.name).toBe('Test User');
  expect(user.email).toBe('test@example.com');
});
```

---

## 测试 API Routes

### 基础 API Route 测试

```typescript
// __tests__/api/users/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '@/app/api/users/route';
import { NextRequest } from 'next/server';
import { userService } from '@/services/user.service';

// Mock Service 层
vi.mock('@/services/user.service');

describe('API /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return users list', async () => {
      // Arrange
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@test.com' },
        { id: '2', name: 'User 2', email: 'user2@test.com' },
      ];
      vi.mocked(userService.getAll).mockResolvedValue(mockUsers);

      // Act
      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(mockUsers);
      expect(userService.getAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      vi.mocked(userService.getAll).mockRejectedValue(new Error('Database error'));

      // Act
      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('错误');
    });
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const newUser = { name: 'New User', email: 'new@test.com' };
      const createdUser = { id: '3', ...newUser, created_at: new Date() };
      vi.mocked(userService.create).mockResolvedValue(createdUser);

      // Act
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual(createdUser);
      expect(userService.create).toHaveBeenCalledWith(newUser);
    });

    it('should validate request body', async () => {
      // Arrange
      const invalidData = { name: '' }; // 缺少 email

      // Act
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('验证失败');
      expect(userService.create).not.toHaveBeenCalled();
    });

    it('should handle duplicate email error', async () => {
      // Arrange
      const existingUser = { name: 'Test', email: 'existing@test.com' };
      vi.mocked(userService.create).mockRejectedValue(
        new ConflictError('该邮箱已被注册')
      );

      // Act
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(existingUser),
      });
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(data.error).toContain('邮箱已被注册');
    });
  });
});
```

### 动态路由测试

```typescript
// __tests__/api/users/[id]/route.test.ts
import { GET, PUT, DELETE } from '@/app/api/users/[id]/route';
import { NextRequest } from 'next/server';

describe('API /api/users/[id]', () => {
  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      // Arrange
      const mockUser = { id: '1', name: 'Test User', email: 'test@test.com' };
      vi.mocked(userService.getById).mockResolvedValue(mockUser);

      // Act
      const request = new NextRequest('http://localhost:3000/api/users/1');
      const response = await GET(request, { params: { id: '1' } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
      expect(userService.getById).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent user', async () => {
      // Arrange
      vi.mocked(userService.getById).mockResolvedValue(null);

      // Act
      const request = new NextRequest('http://localhost:3000/api/users/999');
      const response = await GET(request, { params: { id: '999' } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toContain('不存在');
    });

    it('should validate UUID format', async () => {
      // Act
      const request = new NextRequest('http://localhost:3000/api/users/invalid-id');
      const response = await GET(request, { params: { id: 'invalid-id' } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('无效');
      expect(userService.getById).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      const updatedUser = { id: '1', name: 'Updated Name', email: 'test@test.com' };
      vi.mocked(userService.update).mockResolvedValue(updatedUser);

      // Act
      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith('1', updateData);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      // Arrange
      vi.mocked(userService.delete).mockResolvedValue(undefined);

      // Act
      const request = new NextRequest('http://localhost:3000/api/users/1');
      const response = await DELETE(request, { params: { id: '1' } });

      // Assert
      expect(response.status).toBe(204);
      expect(userService.delete).toHaveBeenCalledWith('1');
    });
  });
});
```

### Query 参数测试

```typescript
// __tests__/api/users/search.test.ts
import { GET } from '@/app/api/users/route';

describe('API /api/users with query params', () => {
  it('should handle pagination params', async () => {
    // Arrange
    const mockResult = {
      users: [],
      total: 0,
      page: 2,
      limit: 20,
    };
    vi.mocked(userService.list).mockResolvedValue(mockResult);

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/users?page=2&limit=20'
    );
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(userService.list).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
    });
  });

  it('should handle search query', async () => {
    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/users?search=john'
    );
    await GET(request);

    // Assert
    expect(userService.list).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'john',
      })
    );
  });
});
```

---

## 测试 Services

### Service 层单元测试

```typescript
// __tests__/services/user.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '@/services/user.service';
import { userRepository } from '@/repositories/user.repository';
import { ConflictError, NotFoundError } from '@/utils/errors';

// Mock Repository 层
vi.mock('@/repositories/user.repository');

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const createdUser = { id: '1', ...userData, created_at: new Date() };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.create).mockResolvedValue(createdUser);

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(result).toEqual(createdUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: userData.name,
          email: userData.email,
        })
      );
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const userData = {
        name: 'Test',
        email: 'existing@test.com',
        password: 'password123',
      };
      vi.mocked(userRepository.findByEmail).mockResolvedValue({
        id: '1',
        email: userData.email,
      } as any);

      // Act & Assert
      await expect(userService.create(userData)).rejects.toThrow(
        ConflictError
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      // Arrange
      const userData = {
        name: 'Test',
        email: 'test@test.com',
        password: 'plaintext',
      };
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.create).mockResolvedValue({} as any);

      // Act
      await userService.create(userData);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.not.stringContaining('plaintext'),
        })
      );
    });
  });

  describe('getById', () => {
    it('should return user when exists', async () => {
      // Arrange
      const mockUser = { id: '1', name: 'Test', email: 'test@test.com' };
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser as any);

      // Act
      const user = await userService.getById('1');

      // Assert
      expect(user).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getById('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      const existingUser = { id: '1', name: 'Old Name', email: 'test@test.com' };
      const updatedUser = { ...existingUser, ...updateData };

      vi.mocked(userRepository.findById).mockResolvedValue(existingUser as any);
      vi.mocked(userRepository.update).mockResolvedValue(updatedUser as any);

      // Act
      const result = await userService.update('1', updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(userRepository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should validate email uniqueness when updating email', async () => {
      // Arrange
      const existingUser = { id: '1', email: 'old@test.com' };
      const updateData = { email: 'new@test.com' };

      vi.mocked(userRepository.findById).mockResolvedValue(existingUser as any);
      vi.mocked(userRepository.findByEmail).mockResolvedValue({
        id: '2',
        email: 'new@test.com',
      } as any);

      // Act & Assert
      await expect(userService.update('1', updateData)).rejects.toThrow(
        ConflictError
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      // Arrange
      vi.mocked(userRepository.findById).mockResolvedValue({
        id: '1',
        name: 'Test',
      } as any);
      vi.mocked(userRepository.delete).mockResolvedValue(undefined);

      // Act
      await userService.delete('1');

      // Assert
      expect(userRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error if user does not exist', async () => {
      // Arrange
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(userService.delete('999')).rejects.toThrow(NotFoundError);
      expect(userRepository.delete).not.toHaveBeenCalled();
    });
  });
});
```

### 测试业务逻辑

```typescript
// __tests__/services/order.service.test.ts
import { orderService } from '@/services/order.service';
import { productRepository } from '@/repositories/product.repository';

describe('OrderService', () => {
  describe('createOrder', () => {
    it('should create order with valid items', async () => {
      // Arrange
      const items = [
        { productId: '1', quantity: 2, price: 100 },
        { productId: '2', quantity: 1, price: 50 },
      ];

      vi.mocked(productRepository.checkStock).mockResolvedValue(true);
      vi.mocked(orderRepository.create).mockResolvedValue({
        id: '1',
        total: 250,
        items,
      } as any);

      // Act
      const order = await orderService.createOrder('user1', items);

      // Assert
      expect(order.total).toBe(250);
      expect(order.items).toHaveLength(2);
    });

    it('should throw error when product is out of stock', async () => {
      // Arrange
      const items = [{ productId: '1', quantity: 100 }];
      vi.mocked(productRepository.checkStock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        orderService.createOrder('user1', items)
      ).rejects.toThrow('库存不足');
    });

    it('should calculate total correctly', async () => {
      // Arrange
      const items = [
        { productId: '1', quantity: 2, price: 10.5 },
        { productId: '2', quantity: 3, price: 5.25 },
      ];

      // Act
      const total = orderService.calculateTotal(items);

      // Assert
      expect(total).toBe(36.75); // (2 * 10.5) + (3 * 5.25)
    });
  });
});
```

---

## 测试 Repositories

### Repository 层测试

```typescript
// __tests__/repositories/user.repository.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userRepository } from '@/repositories/user.repository';
import { db } from '@/database/client';
import { users } from '@/database/schema';

describe('UserRepository', () => {
  // 使用真实数据库进行集成测试
  beforeEach(async () => {
    // 清理测试数据
    await db.delete(users);
  });

  afterEach(async () => {
    // 清理
    await db.delete(users);
  });

  describe('create', () => {
    it('should create user in database', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashed_password',
      };

      // Act
      const user = await userRepository.create(userData);

      // Assert
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.created_at).toBeInstanceOf(Date);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      // Arrange
      const created = await userRepository.create({
        name: 'Test',
        email: 'test@test.com',
        password: 'pass',
      });

      // Act
      const found = await userRepository.findById(created.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe(created.email);
    });

    it('should return null for non-existent id', async () => {
      // Act
      const found = await userRepository.findById('non-existent-id');

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('list', () => {
    beforeEach(async () => {
      // 创建测试数据
      await userRepository.create({
        name: 'User 1',
        email: 'user1@test.com',
        password: 'pass',
      });
      await userRepository.create({
        name: 'User 2',
        email: 'user2@test.com',
        password: 'pass',
      });
      await userRepository.create({
        name: 'User 3',
        email: 'user3@test.com',
        password: 'pass',
      });
    });

    it('should list users with pagination', async () => {
      // Act
      const users = await userRepository.list({
        offset: 0,
        limit: 2,
      });

      // Assert
      expect(users).toHaveLength(2);
    });

    it('should search users by name', async () => {
      // Act
      const users = await userRepository.list({
        search: 'User 1',
      });

      // Assert
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('User 1');
    });

    it('should sort users by created_at desc', async () => {
      // Act
      const users = await userRepository.list({
        orderBy: 'created_at',
        order: 'desc',
      });

      // Assert
      expect(users[0].name).toBe('User 3'); // 最后创建的
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      // Arrange
      const created = await userRepository.create({
        name: 'Original',
        email: 'original@test.com',
        password: 'pass',
      });

      // Act
      const updated = await userRepository.update(created.id, {
        name: 'Updated',
      });

      // Assert
      expect(updated?.name).toBe('Updated');
      expect(updated?.email).toBe('original@test.com'); // 未修改
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      // Arrange
      const created = await userRepository.create({
        name: 'To Delete',
        email: 'delete@test.com',
        password: 'pass',
      });

      // Act
      await userRepository.delete(created.id);

      // Assert
      const found = await userRepository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});
```

### 测试复杂查询

```typescript
// __tests__/repositories/user.repository.complex.test.ts
describe('UserRepository Complex Queries', () => {
  describe('getUserWithStats', () => {
    it('should return user with post and comment counts', async () => {
      // Arrange
      const user = await userRepository.create({
        name: 'Test',
        email: 'test@test.com',
        password: 'pass',
      });

      await postRepository.create({ userId: user.id, title: 'Post 1' });
      await postRepository.create({ userId: user.id, title: 'Post 2' });
      await commentRepository.create({ userId: user.id, text: 'Comment 1' });

      // Act
      const stats = await userRepository.getUserWithStats(user.id);

      // Assert
      expect(stats).toBeDefined();
      expect(stats.postCount).toBe(2);
      expect(stats.commentCount).toBe(1);
    });
  });

  describe('deleteWithRelations', () => {
    it('should delete user and all related data', async () => {
      // Arrange
      const user = await userRepository.create({
        name: 'Test',
        email: 'test@test.com',
        password: 'pass',
      });

      const post = await postRepository.create({
        userId: user.id,
        title: 'Post',
      });
      await commentRepository.create({
        userId: user.id,
        postId: post.id,
        text: 'Comment',
      });

      // Act
      await userRepository.deleteWithRelations(user.id);

      // Assert
      expect(await userRepository.findById(user.id)).toBeNull();
      expect(await postRepository.findById(post.id)).toBeNull();
      expect(await commentRepository.countByUser(user.id)).toBe(0);
    });
  });
});
```

---

## Mock 数据库

### Mock Drizzle ORM

```typescript
// __tests__/services/user.service.mock.test.ts
import { vi } from 'vitest';
import * as db from '@/database/client';

// Mock 整个数据库模块
vi.mock('@/database/client', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

describe('UserService with mocked DB', () => {
  it('should mock select query', async () => {
    // Arrange
    const mockUsers = [{ id: '1', name: 'Test' }];

    vi.mocked(db.db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(mockUsers),
        }),
      }),
    } as any);

    // Act
    const users = await userService.getAll();

    // Assert
    expect(users).toEqual(mockUsers);
  });

  it('should mock insert query', async () => {
    // Arrange
    const newUser = { name: 'New', email: 'new@test.com' };
    const createdUser = { id: '1', ...newUser };

    vi.mocked(db.db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([createdUser]),
      }),
    } as any);

    // Act
    const user = await userService.create(newUser);

    // Assert
    expect(user).toEqual(createdUser);
  });
});
```

### 测试数据库事务

```typescript
describe('Repository with transactions', () => {
  it('should rollback on error', async () => {
    // Arrange
    const mockTx = {
      insert: vi.fn().mockImplementation(() => {
        throw new Error('Database error');
      }),
    };

    vi.mocked(db.db.transaction).mockImplementation(async (callback) => {
      return await callback(mockTx as any);
    });

    // Act & Assert
    await expect(
      userRepository.createWithRelations({})
    ).rejects.toThrow('Database error');
  });
});
```

---

## 集成测试

### API 集成测试

```typescript
// __tests__/integration/users.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase } from '@/tests/setup';

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should create, read, update, and delete user', async () => {
    // Create
    const createRequest = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Integration Test User',
        email: 'integration@test.com',
        password: 'password123',
      }),
    });

    const createResponse = await POST(createRequest);
    const createdUser = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(createdUser.id).toBeDefined();

    // Read
    const readRequest = new NextRequest(
      `http://localhost:3000/api/users/${createdUser.id}`
    );
    const readResponse = await GET(readRequest, {
      params: { id: createdUser.id },
    });
    const readUser = await readResponse.json();

    expect(readResponse.status).toBe(200);
    expect(readUser.email).toBe('integration@test.com');

    // Update
    const updateRequest = new NextRequest(
      `http://localhost:3000/api/users/${createdUser.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }
    );
    const updateResponse = await PUT(updateRequest, {
      params: { id: createdUser.id },
    });
    const updatedUser = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(updatedUser.name).toBe('Updated Name');

    // Delete
    const deleteRequest = new NextRequest(
      `http://localhost:3000/api/users/${createdUser.id}`
    );
    const deleteResponse = await DELETE(deleteRequest, {
      params: { id: createdUser.id },
    });

    expect(deleteResponse.status).toBe(204);
  });
});
```

---

## 测试组织

### 测试文件结构

```
__tests__/
├── api/                      # API Routes 测试
│   ├── users/
│   │   ├── route.test.ts
│   │   └── [id]/
│   │       └── route.test.ts
│   └── posts/
│       └── route.test.ts
├── services/                 # Service 层测试
│   ├── user.service.test.ts
│   └── order.service.test.ts
├── repositories/            # Repository 层测试
│   ├── user.repository.test.ts
│   └── product.repository.test.ts
├── integration/             # 集成测试
│   └── users.integration.test.ts
└── utils/                   # 工具函数测试
    ├── validation.test.ts
    └── errors.test.ts
```

### 测试辅助工具

```typescript
// tests/helpers.ts

/**
 * 创建测试用户
 */
export async function createTestUser(overrides = {}) {
  return await userRepository.create({
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    ...overrides,
  });
}

/**
 * 清理测试数据
 */
export async function cleanupTestData() {
  await db.delete(comments);
  await db.delete(posts);
  await db.delete(users);
}

/**
 * Mock NextRequest
 */
export function createMockRequest(url: string, options: RequestInit = {}) {
  return new NextRequest(url, options);
}

/**
 * 验证错误响应
 */
export function expectErrorResponse(response: Response, status: number, message?: string) {
  expect(response.status).toBe(status);
  if (message) {
    const data = response.json();
    expect(data.error).toContain(message);
  }
}
```

---

## 最佳实践

### ✅ 推荐做法

1. **测试隔离**：每个测试独立，使用 `beforeEach` 清理
2. **AAA 模式**：Arrange, Act, Assert 结构清晰
3. **Mock 外部依赖**：API Route 测试 mock Service，Service 测试 mock Repository
4. **描述性测试名**：清楚说明测试内容和预期结果
5. **测试边界情况**：正常流程、错误流程、边界值
6. **使用测试辅助函数**：减少重复代码
7. **集成测试覆盖关键流程**：端到端测试核心业务

### ❌ 避免的做法

1. **测试依赖顺序**：测试不应该依赖其他测试的执行顺序
2. **过度 Mock**：不要 mock 所有东西，保留必要的真实逻辑
3. **测试实现细节**：测试行为，不是实现
4. **忽略异步**：确保使用 `await` 和 `async`
5. **不清理测试数据**：可能影响其他测试
6. **模糊的断言**：`toBeTruthy()` 不如 `toBe(true)` 清晰

### 测试命名约定

```typescript
// ✅ 好的命名
describe('UserService', () => {
  describe('create', () => {
    it('should create user with valid data', () => {});
    it('should throw ConflictError when email exists', () => {});
    it('should hash password before saving', () => {});
  });
});

// ❌ 不好的命名
describe('test', () => {
  it('works', () => {});
  it('error case', () => {});
});
```

---

## 相关资源

- [Error Handling](./error-handling.md) - 错误处理测试
- [Validation](./validation.md) - 验证逻辑测试
- [Service Patterns](./service-patterns.md) - Service 层设计
- [Repository Patterns](./repository-patterns.md) - Repository 层设计
