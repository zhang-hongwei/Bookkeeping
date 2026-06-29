# 集成测试策略

> 端到端功能流程和跨模块集成测试

## 📋 目录

- [API 路由集成测试](#api-路由集成测试)
- [数据库集成测试](#数据库集成测试)
- [全功能流程测试](#全功能流程测试)
- [第三方服务集成](#第三方服务集成)
- [状态管理集成](#状态管理集成)

## API 路由集成测试

### Next.js 16 API Routes 测试

```typescript
// __tests__/api/users/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '@/app/api/users/route';
import { NextRequest } from 'next/server';
import { userService } from '@/services/user.service';

vi.mock('@/services/user.service');

describe('API /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('应该返回用户列表', async () => {
      const mockUsers = [
        { id: '1', name: '张三', email: 'zhangsan@example.com' },
        { id: '2', name: '李四', email: 'lisi@example.com' },
      ];

      vi.mocked(userService.getAll).mockResolvedValue(mockUsers);

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUsers);
      expect(userService.getAll).toHaveBeenCalledTimes(1);
    });

    it('应该支持分页查询', async () => {
      const mockUsers = [{ id: '1', name: '张三' }];
      vi.mocked(userService.getAll).mockResolvedValue(mockUsers);

      const request = new NextRequest(
        'http://localhost:3000/api/users?page=2&limit=10'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(userService.getAll).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
      });
    });

    it('应该支持搜索过滤', async () => {
      const mockUsers = [{ id: '1', name: '张三' }];
      vi.mocked(userService.search).mockResolvedValue(mockUsers);

      const request = new NextRequest(
        'http://localhost:3000/api/users?search=张三'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUsers);
      expect(userService.search).toHaveBeenCalledWith('张三');
    });

    it('应该处理服务层错误', async () => {
      vi.mocked(userService.getAll).mockRejectedValue(
        new Error('数据库连接失败')
      );

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('数据库连接失败');
    });
  });

  describe('POST /api/users', () => {
    it('应该创建新用户', async () => {
      const newUser = { name: '王五', email: 'wangwu@example.com' };
      const createdUser = { id: '3', ...newUser };

      vi.mocked(userService.create).mockResolvedValue(createdUser);

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdUser);
      expect(userService.create).toHaveBeenCalledWith(newUser);
    });

    it('应该验证请求体', async () => {
      const invalidData = { name: '' }; // 缺少 email

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('验证失败');
    });

    it('应该处理邮箱重复错误', async () => {
      const duplicateUser = { name: '张三', email: 'zhangsan@example.com' };

      vi.mocked(userService.create).mockRejectedValue(
        new Error('邮箱已存在')
      );

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(duplicateUser),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain('邮箱已存在');
    });

    it('应该验证请求内容类型', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'text/plain' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('无效的请求格式');
    });
  });

  describe('PUT /api/users/[id]', () => {
    it('应该更新用户信息', async () => {
      const updateData = { name: '张三（更新）' };
      const updatedUser = { id: '1', name: '张三（更新）', email: 'test@example.com' };

      vi.mocked(userService.update).mockResolvedValue(updatedUser);

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith('1', updateData);
    });

    it('用户不存在应该返回 404', async () => {
      vi.mocked(userService.update).mockRejectedValue(
        new Error('用户不存在')
      );

      const request = new NextRequest('http://localhost:3000/api/users/999', {
        method: 'PUT',
        body: JSON.stringify({ name: '不存在' }),
      });

      const response = await PUT(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('用户不存在');
    });
  });

  describe('DELETE /api/users/[id]', () => {
    it('应该删除用户', async () => {
      vi.mocked(userService.delete).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });

      expect(response.status).toBe(204);
      expect(userService.delete).toHaveBeenCalledWith('1');
    });

    it('删除不存在的用户应该返回 404', async () => {
      vi.mocked(userService.delete).mockRejectedValue(
        new Error('用户不存在')
      );

      const request = new NextRequest('http://localhost:3000/api/users/999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('用户不存在');
    });
  });
});
```

### 认证授权集成测试

```typescript
// __tests__/api/protected-route.test.ts
import { GET } from '@/app/api/protected/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

vi.mock('next-auth');

describe('受保护的 API 路由', () => {
  describe('认证检查', () => {
    it('未登录应该返回 401', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/protected');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('未授权');
    });

    it('已登录用户应该能访问', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'user' },
      } as any);

      const request = new NextRequest('http://localhost:3000/api/protected');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('角色授权', () => {
    it('普通用户访问管理员路由应该返回 403', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'user@example.com', role: 'user' },
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('权限不足');
    });

    it('管理员应该能访问管理员路由', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });
});
```

## 数据库集成测试

### Drizzle ORM 集成测试

```typescript
// __tests__/database/user.repository.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '@/database/clients/db';
import { users } from '@/database/schema/users';
import { eq } from 'drizzle-orm';

// 使用测试数据库
const TEST_DB_URL = process.env.TEST_DATABASE_URL;

describe('用户数据库操作', () => {
  beforeAll(async () => {
    // 初始化测试数据库
    await db.execute('BEGIN');
  });

  afterAll(async () => {
    // 清理测试数据
    await db.execute('ROLLBACK');
  });

  beforeEach(async () => {
    // 清空用户表
    await db.delete(users);
  });

  describe('创建用户', () => {
    it('应该成功创建用户', async () => {
      const userData = {
        name: '张三',
        email: 'zhangsan@example.com',
        passwordHash: 'hashed_password',
      };

      const [newUser] = await db.insert(users).values(userData).returning();

      expect(newUser).toMatchObject({
        name: userData.name,
        email: userData.email,
      });
      expect(newUser.id).toBeDefined();
      expect(newUser.createdAt).toBeInstanceOf(Date);
    });

    it('邮箱重复应该失败', async () => {
      const userData = {
        name: '张三',
        email: 'duplicate@example.com',
        passwordHash: 'hashed_password',
      };

      // 先插入一条记录
      await db.insert(users).values(userData);

      // 尝试插入相同邮箱
      await expect(
        db.insert(users).values({ ...userData, name: '李四' })
      ).rejects.toThrow();
    });

    it('应该自动设置时间戳', async () => {
      const before = new Date();

      const [newUser] = await db
        .insert(users)
        .values({
          name: '王五',
          email: 'wangwu@example.com',
          passwordHash: 'hashed_password',
        })
        .returning();

      const after = new Date();

      expect(newUser.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(newUser.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(newUser.updatedAt).toEqual(newUser.createdAt);
    });
  });

  describe('查询用户', () => {
    beforeEach(async () => {
      // 插入测试数据
      await db.insert(users).values([
        { name: '张三', email: 'zhangsan@example.com', passwordHash: 'hash1' },
        { name: '李四', email: 'lisi@example.com', passwordHash: 'hash2' },
        { name: '王五', email: 'wangwu@example.com', passwordHash: 'hash3' },
      ]);
    });

    it('应该查询所有用户', async () => {
      const allUsers = await db.select().from(users);
      expect(allUsers).toHaveLength(3);
    });

    it('应该根据 ID 查询用户', async () => {
      const [firstUser] = await db.select().from(users).limit(1);

      const [foundUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, firstUser.id));

      expect(foundUser).toEqual(firstUser);
    });

    it('应该根据邮箱查询用户', async () => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, 'zhangsan@example.com'));

      expect(user.name).toBe('张三');
    });

    it('查询不存在的用户应该返回空数组', async () => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, 'notexist@example.com'));

      expect(result).toHaveLength(0);
    });
  });

  describe('更新用户', () => {
    it('应该更新用户信息', async () => {
      const [user] = await db
        .insert(users)
        .values({
          name: '原名',
          email: 'original@example.com',
          passwordHash: 'hash',
        })
        .returning();

      const [updated] = await db
        .update(users)
        .set({ name: '新名字' })
        .where(eq(users.id, user.id))
        .returning();

      expect(updated.name).toBe('新名字');
      expect(updated.email).toBe('original@example.com');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(updated.createdAt.getTime());
    });

    it('应该支持部分更新', async () => {
      const [user] = await db
        .insert(users)
        .values({
          name: '张三',
          email: 'zhangsan@example.com',
          passwordHash: 'hash',
        })
        .returning();

      const [updated] = await db
        .update(users)
        .set({ email: 'newemail@example.com' })
        .where(eq(users.id, user.id))
        .returning();

      expect(updated.name).toBe('张三');
      expect(updated.email).toBe('newemail@example.com');
    });
  });

  describe('删除用户', () => {
    it('应该删除用户', async () => {
      const [user] = await db
        .insert(users)
        .values({
          name: '待删除',
          email: 'delete@example.com',
          passwordHash: 'hash',
        })
        .returning();

      await db.delete(users).where(eq(users.id, user.id));

      const result = await db.select().from(users).where(eq(users.id, user.id));
      expect(result).toHaveLength(0);
    });

    it('删除不存在的用户不应该报错', async () => {
      await expect(
        db.delete(users).where(eq(users.id, 'nonexistent'))
      ).resolves.not.toThrow();
    });
  });
});
```

### 事务测试

```typescript
// __tests__/database/transactions.test.ts
import { db } from '@/database/clients/db';
import { users, orders } from '@/database/schema';

describe('数据库事务', () => {
  it('应该在事务中创建用户和订单', async () => {
    await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          name: '张三',
          email: 'zhangsan@example.com',
          passwordHash: 'hash',
        })
        .returning();

      const [order] = await tx
        .insert(orders)
        .values({
          userId: user.id,
          totalAmount: 100,
          status: 'pending',
        })
        .returning();

      expect(order.userId).toBe(user.id);
    });
  });

  it('事务失败应该回滚所有更改', async () => {
    const initialUserCount = await db.select().from(users).then(r => r.length);

    await expect(
      db.transaction(async (tx) => {
        await tx.insert(users).values({
          name: '张三',
          email: 'zhangsan@example.com',
          passwordHash: 'hash',
        });

        // 故意抛出错误
        throw new Error('事务失败');
      })
    ).rejects.toThrow('事务失败');

    const finalUserCount = await db.select().from(users).then(r => r.length);
    expect(finalUserCount).toBe(initialUserCount);
  });
});
```

## 全功能流程测试

### 用户注册登录流程

```typescript
// __tests__/features/auth.flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpPage } from '@/app/(auth)/signup/page';
import { SignInPage } from '@/app/(auth)/signin/page';
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('用户认证流程', () => {
  describe('注册流程', () => {
    it('应该完成完整的注册流程', async () => {
      const user = userEvent.setup();

      render(<SignUpPage />);

      // 1. 填写注册表单
      await user.type(screen.getByLabelText(/用户名/i), '张三');
      await user.type(screen.getByLabelText(/邮箱/i), 'zhangsan@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'Password123!');
      await user.type(screen.getByLabelText(/确认密码/i), 'Password123!');

      // 2. 同意服务条款
      await user.click(screen.getByLabelText(/同意服务条款/i));

      // 3. 提交注册
      await user.click(screen.getByRole('button', { name: /注册/i }));

      // 4. 验证注册成功
      expect(await screen.findByText(/注册成功/i)).toBeInTheDocument();

      // 5. 验证自动跳转到登录页面
      await waitFor(() => {
        expect(window.location.pathname).toBe('/signin');
      });
    });

    it('应该验证密码强度', async () => {
      const user = userEvent.setup();
      render(<SignUpPage />);

      const passwordInput = screen.getByLabelText(/^密码/i);

      // 弱密码
      await user.type(passwordInput, 'weak');
      expect(await screen.findByText(/密码强度：弱/i)).toBeInTheDocument();

      // 中等密码
      await user.clear(passwordInput);
      await user.type(passwordInput, 'Medium123');
      expect(await screen.findByText(/密码强度：中/i)).toBeInTheDocument();

      // 强密码
      await user.clear(passwordInput);
      await user.type(passwordInput, 'Strong123!@#');
      expect(await screen.findByText(/密码强度：强/i)).toBeInTheDocument();
    });
  });

  describe('登录流程', () => {
    it('应该完成完整的登录流程', async () => {
      const user = userEvent.setup();

      server.use(
        rest.post('/api/auth/signin', (req, res, ctx) => {
          return res(
            ctx.json({
              user: { id: '1', name: '张三', email: 'zhangsan@example.com' },
              token: 'mock_token',
            })
          );
        })
      );

      render(<SignInPage />);

      // 1. 输入凭证
      await user.type(screen.getByLabelText(/邮箱/i), 'zhangsan@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'Password123!');

      // 2. 登录
      await user.click(screen.getByRole('button', { name: /登录/i }));

      // 3. 验证登录成功
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      });
    });

    it('登录失败应该显示错误', async () => {
      const user = userEvent.setup();

      server.use(
        rest.post('/api/auth/signin', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ error: '邮箱或密码错误' })
          );
        })
      );

      render(<SignInPage />);

      await user.type(screen.getByLabelText(/邮箱/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /登录/i }));

      expect(await screen.findByText(/邮箱或密码错误/i)).toBeInTheDocument();
    });
  });

  describe('忘记密码流程', () => {
    it('应该完成密码重置流程', async () => {
      const user = userEvent.setup();
      const { container } = render(<SignInPage />);

      // 1. 点击忘记密码
      await user.click(screen.getByText(/忘记密码/i));

      // 2. 输入邮箱
      const emailInput = screen.getByLabelText(/邮箱/i);
      await user.type(emailInput, 'zhangsan@example.com');

      // 3. 发送重置链接
      await user.click(screen.getByRole('button', { name: /发送重置链接/i }));

      // 4. 验证成功提示
      expect(
        await screen.findByText(/重置链接已发送到您的邮箱/i)
      ).toBeInTheDocument();
    });
  });
});
```

### 电商购物流程

```typescript
// __tests__/features/shopping.flow.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductListPage } from '@/app/products/page';
import { CartPage } from '@/app/cart/page';
import { CheckoutPage } from '@/app/checkout/page';

describe('电商购物流程', () => {
  it('应该完成从浏览到结账的完整流程', async () => {
    const user = userEvent.setup();

    // 1. 浏览商品列表
    const { unmount } = render(<ProductListPage />);

    await screen.findByRole('heading', { name: /商品列表/i });
    const products = screen.getAllByTestId('product-card');
    expect(products.length).toBeGreaterThan(0);

    // 2. 添加商品到购物车
    const firstProduct = products[0];
    const addToCartButton = within(firstProduct).getByRole('button', {
      name: /加入购物车/i,
    });
    await user.click(addToCartButton);

    // 3. 验证购物车图标更新
    expect(await screen.findByText(/购物车 \(1\)/i)).toBeInTheDocument();

    // 4. 查看购物车
    unmount();
    render(<CartPage />);

    await screen.findByRole('heading', { name: /购物车/i });
    const cartItems = screen.getAllByTestId('cart-item');
    expect(cartItems).toHaveLength(1);

    // 5. 更新商品数量
    const quantityInput = within(cartItems[0]).getByLabelText(/数量/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');

    // 6. 验证总价更新
    expect(await screen.findByText(/总计: ¥200/i)).toBeInTheDocument();

    // 7. 前往结账
    await user.click(screen.getByRole('button', { name: /去结账/i }));

    // 8. 填写收货信息
    unmount();
    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/收货人/i), '张三');
    await user.type(screen.getByLabelText(/手机号/i), '13800138000');
    await user.type(
      screen.getByLabelText(/详细地址/i),
      '北京市朝阳区某某街道'
    );

    // 9. 选择支付方式
    await user.click(screen.getByLabelText(/微信支付/i));

    // 10. 提交订单
    await user.click(screen.getByRole('button', { name: /提交订单/i }));

    // 11. 验证订单成功
    expect(await screen.findByText(/订单创建成功/i)).toBeInTheDocument();
    expect(await screen.findByText(/订单号:/i)).toBeInTheDocument();
  });

  it('应该验证库存不足情况', async () => {
    const user = userEvent.setup();

    server.use(
      rest.post('/api/cart/add', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ error: '库存不足' })
        );
      })
    );

    render(<ProductListPage />);

    const addButton = (await screen.findAllByRole('button', {
      name: /加入购物车/i,
    }))[0];

    await user.click(addButton);

    expect(await screen.findByText(/库存不足/i)).toBeInTheDocument();
  });
});
```

## 第三方服务集成

### 支付服务集成测试

```typescript
// __tests__/integrations/payment.test.ts
import { paymentService } from '@/services/payment.service';
import { mockStripe } from '@/mocks/stripe';

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}));

describe('支付服务集成', () => {
  it('应该创建支付意图', async () => {
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: 10000,
      currency: 'cny',
      orderId: 'order_123',
    });

    expect(paymentIntent).toHaveProperty('id');
    expect(paymentIntent).toHaveProperty('client_secret');
    expect(paymentIntent.amount).toBe(10000);
  });

  it('应该处理支付成功回调', async () => {
    const webhook = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          amount: 10000,
          metadata: { orderId: 'order_123' },
        },
      },
    };

    await paymentService.handleWebhook(webhook);

    // 验证订单状态已更新
    const order = await orderService.getById('order_123');
    expect(order.status).toBe('paid');
  });
});
```

### 邮件服务集成测试

```typescript
// __tests__/integrations/email.test.ts
import { emailService } from '@/services/email.service';
import { mockSendGrid } from '@/mocks/sendgrid';

vi.mock('@sendgrid/mail', () => ({
  default: mockSendGrid,
}));

describe('邮件服务集成', () => {
  it('应该发送欢迎邮件', async () => {
    const result = await emailService.sendWelcomeEmail({
      to: 'user@example.com',
      name: '张三',
    });

    expect(result.sent).toBe(true);
    expect(mockSendGrid.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: '欢迎加入',
        html: expect.stringContaining('张三'),
      })
    );
  });

  it('应该处理发送失败', async () => {
    mockSendGrid.send.mockRejectedValueOnce(new Error('发送失败'));

    await expect(
      emailService.sendWelcomeEmail({
        to: 'invalid@example.com',
        name: '张三',
      })
    ).rejects.toThrow('发送失败');
  });
});
```

## 状态管理集成

### Zustand Store 集成测试

```typescript
// __tests__/stores/cart.store.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '@/stores/cart.store';

describe('购物车 Store', () => {
  beforeEach(() => {
    // 重置 store
    useCartStore.setState({ items: [], total: 0 });
  });

  it('应该添加商品到购物车', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        name: '商品1',
        price: 100,
        quantity: 1,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(100);
  });

  it('添加已存在商品应该增加数量', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        name: '商品1',
        price: 100,
        quantity: 1,
      });

      result.current.addItem({
        id: '1',
        name: '商品1',
        price: 100,
        quantity: 1,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.total).toBe(200);
  });

  it('应该移除商品', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        name: '商品1',
        price: 100,
        quantity: 1,
      });

      result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('应该清空购物车', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        name: '商品1',
        price: 100,
        quantity: 1,
      });

      result.current.addItem({
        id: '2',
        name: '商品2',
        price: 200,
        quantity: 1,
      });

      result.current.clear();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });
});
```
