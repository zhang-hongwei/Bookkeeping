# Mock 策略

> Vitest + MSW Mock 最佳实践和模式

## 📋 目录

- [Vitest Mock 基础](#vitest-mock-基础)
- [MSW API Mock](#msw-api-mock)
- [模块 Mock](#模块-mock)
- [数据库 Mock](#数据库-mock)
- [第三方服务 Mock](#第三方服务-mock)
- [Spy 和监控](#spy-和监控)

## Vitest Mock 基础

### 基础 Mock 函数

```typescript
// __tests__/mocks/basic.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('基础 Mock', () => {
  it('应该创建 Mock 函数', () => {
    const mockFn = vi.fn();

    mockFn('hello');
    mockFn('world');

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('hello');
    expect(mockFn).toHaveBeenCalledWith('world');
  });

  it('应该设置返回值', () => {
    const mockFn = vi.fn().mockReturnValue(42);

    expect(mockFn()).toBe(42);
    expect(mockFn()).toBe(42);
  });

  it('应该设置一次性返回值', () => {
    const mockFn = vi
      .fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValue(3);

    expect(mockFn()).toBe(1);
    expect(mockFn()).toBe(2);
    expect(mockFn()).toBe(3);
    expect(mockFn()).toBe(3);
  });

  it('应该 Mock 异步函数', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');

    const result = await mockFn();
    expect(result).toBe('success');
  });

  it('应该 Mock 异步错误', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('失败'));

    await expect(mockFn()).rejects.toThrow('失败');
  });

  it('应该 Mock 实现', () => {
    const mockFn = vi.fn().mockImplementation((a: number, b: number) => a + b);

    expect(mockFn(1, 2)).toBe(3);
    expect(mockFn(5, 10)).toBe(15);
  });

  it('应该检查调用参数', () => {
    const mockFn = vi.fn();

    mockFn('arg1', 'arg2');
    mockFn({ key: 'value' });

    // 检查第一次调用
    expect(mockFn.mock.calls[0]).toEqual(['arg1', 'arg2']);

    // 检查第二次调用
    expect(mockFn.mock.calls[1]).toEqual([{ key: 'value' }]);

    // 检查调用次数
    expect(mockFn.mock.calls.length).toBe(2);
  });
});
```

### Mock 返回值模式

```typescript
// __tests__/mocks/return-values.test.ts
import { vi } from 'vitest';

describe('Mock 返回值模式', () => {
  it('链式调用不同返回值', () => {
    const mockFn = vi
      .fn()
      .mockReturnValueOnce('第一次')
      .mockReturnValueOnce('第二次')
      .mockReturnValue('默认值');

    expect(mockFn()).toBe('第一次');
    expect(mockFn()).toBe('第二次');
    expect(mockFn()).toBe('默认值');
    expect(mockFn()).toBe('默认值');
  });

  it('混合同步和异步返回值', async () => {
    const mockFn = vi
      .fn()
      .mockReturnValueOnce('同步')
      .mockResolvedValueOnce('异步');

    expect(mockFn()).toBe('同步');
    expect(await mockFn()).toBe('异步');
  });

  it('条件返回值', () => {
    const mockFn = vi.fn().mockImplementation((type: string) => {
      switch (type) {
        case 'success':
          return { status: 200, data: 'ok' };
        case 'error':
          return { status: 500, error: '错误' };
        default:
          return { status: 400, error: '未知类型' };
      }
    });

    expect(mockFn('success')).toEqual({ status: 200, data: 'ok' });
    expect(mockFn('error')).toEqual({ status: 500, error: '错误' });
    expect(mockFn('unknown')).toEqual({ status: 400, error: '未知类型' });
  });

  it('基于参数的动态返回值', () => {
    const getUserName = vi.fn().mockImplementation((id: string) => {
      const users: Record<string, string> = {
        '1': '张三',
        '2': '李四',
        '3': '王五',
      };
      return users[id] || '未知用户';
    });

    expect(getUserName('1')).toBe('张三');
    expect(getUserName('2')).toBe('李四');
    expect(getUserName('999')).toBe('未知用户');
  });
});
```

## MSW API Mock

### MSW 设置

```typescript
// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// 测试设置
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### REST API Handlers

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // GET 请求
  rest.get('/api/users', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';

    return res(
      ctx.status(200),
      ctx.json({
        data: [
          { id: '1', name: '张三', email: 'zhangsan@example.com' },
          { id: '2', name: '李四', email: 'lisi@example.com' },
        ],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 100,
        },
      })
    );
  }),

  // 单个用户
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;

    if (id === '999') {
      return res(
        ctx.status(404),
        ctx.json({ error: '用户不存在' })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        id,
        name: '张三',
        email: 'zhangsan@example.com',
      })
    );
  }),

  // POST 请求
  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json();

    // 验证数据
    if (!body.email || !body.name) {
      return res(
        ctx.status(400),
        ctx.json({ error: '缺少必填字段' })
      );
    }

    // 模拟邮箱重复
    if (body.email === 'duplicate@example.com') {
      return res(
        ctx.status(409),
        ctx.json({ error: '邮箱已存在' })
      );
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: '3',
        ...body,
      })
    );
  }),

  // PUT 请求
  rest.put('/api/users/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();

    return res(
      ctx.status(200),
      ctx.json({
        id,
        ...body,
      })
    );
  }),

  // DELETE 请求
  rest.delete('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;

    if (id === '999') {
      return res(
        ctx.status(404),
        ctx.json({ error: '用户不存在' })
      );
    }

    return res(ctx.status(204));
  }),
];
```

### 高级 MSW 模式

```typescript
// mocks/advanced-handlers.ts
import { rest } from 'msw';

// 延迟响应
export const delayedHandler = rest.get('/api/slow', (req, res, ctx) => {
  return res(
    ctx.delay(2000), // 延迟 2 秒
    ctx.json({ message: '慢速响应' })
  );
});

// 流式响应
export const streamHandler = rest.get('/api/stream', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.set('Content-Type', 'text/event-stream'),
    ctx.body('data: Hello\n\ndata: World\n\n')
  );
});

// 带认证的请求
export const authHandler = rest.get('/api/protected', (req, res, ctx) => {
  const authorization = req.headers.get('Authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res(
      ctx.status(401),
      ctx.json({ error: '未授权' })
    );
  }

  const token = authorization.replace('Bearer ', '');

  if (token === 'invalid') {
    return res(
      ctx.status(401),
      ctx.json({ error: 'Token 无效' })
    );
  }

  return res(
    ctx.status(200),
    ctx.json({ message: '受保护的数据' })
  );
});

// 分页处理
export const paginationHandler = rest.get('/api/posts', (req, res, ctx) => {
  const page = parseInt(req.url.searchParams.get('page') || '1');
  const limit = parseInt(req.url.searchParams.get('limit') || '10');

  const allPosts = Array.from({ length: 100 }, (_, i) => ({
    id: (i + 1).toString(),
    title: `文章 ${i + 1}`,
  }));

  const start = (page - 1) * limit;
  const end = start + limit;
  const posts = allPosts.slice(start, end);

  return res(
    ctx.json({
      data: posts,
      pagination: {
        page,
        limit,
        total: allPosts.length,
        totalPages: Math.ceil(allPosts.length / limit),
      },
    })
  );
});

// 搜索过滤
export const searchHandler = rest.get('/api/search', (req, res, ctx) => {
  const query = req.url.searchParams.get('q') || '';

  const allItems = [
    { id: '1', name: '苹果手机' },
    { id: '2', name: '华为手机' },
    { id: '3', name: '苹果电脑' },
  ];

  const results = allItems.filter((item) =>
    item.name.includes(query)
  );

  return res(ctx.json({ results }));
});

// 文件上传
export const uploadHandler = rest.post('/api/upload', async (req, res, ctx) => {
  const contentType = req.headers.get('Content-Type') || '';

  if (!contentType.includes('multipart/form-data')) {
    return res(
      ctx.status(400),
      ctx.json({ error: '需要 multipart/form-data' })
    );
  }

  return res(
    ctx.status(200),
    ctx.json({
      url: 'https://example.com/uploads/file.pdf',
      name: 'file.pdf',
    })
  );
});
```

### 动态 Handler 覆盖

```typescript
// __tests__/api/dynamic-handlers.test.ts
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('动态 Handler', () => {
  it('应该临时覆盖 Handler', async () => {
    // 临时覆盖响应
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: '服务器错误' })
        );
      })
    );

    const response = await fetch('/api/users');
    expect(response.status).toBe(500);
  });

  it('下一个测试应该使用原始 Handler', async () => {
    const response = await fetch('/api/users');
    expect(response.status).toBe(200);
  });

  it('应该模拟网络错误', async () => {
    server.use(
      rest.get('/api/users', (req, res) => {
        return res.networkError('网络连接失败');
      })
    );

    await expect(fetch('/api/users')).rejects.toThrow();
  });

  it('应该模拟超时', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.delay('infinite') // 无限延迟
        );
      })
    );

    // 使用 AbortController 测试超时
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 100);

    await expect(
      fetch('/api/users', { signal: controller.signal })
    ).rejects.toThrow();
  });
});
```

## 模块 Mock

### 完整模块 Mock

```typescript
// __tests__/mocks/module.test.ts
import { vi } from 'vitest';

// Mock 整个模块
vi.mock('@/services/user.service', () => ({
  userService: {
    getAll: vi.fn().mockResolvedValue([
      { id: '1', name: '张三' },
      { id: '2', name: '李四' },
    ]),
    getById: vi.fn().mockResolvedValue({ id: '1', name: '张三' }),
    create: vi.fn().mockResolvedValue({ id: '3', name: '王五' }),
    update: vi.fn().mockResolvedValue({ id: '1', name: '张三（更新）' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

// 使用 Mock
import { userService } from '@/services/user.service';

describe('模块 Mock', () => {
  it('应该使用 Mock 的 userService', async () => {
    const users = await userService.getAll();
    expect(users).toHaveLength(2);
    expect(userService.getAll).toHaveBeenCalled();
  });
});
```

### 部分模块 Mock

```typescript
// __tests__/mocks/partial-module.test.ts
import { vi } from 'vitest';

// 部分 Mock，保留其他真实实现
vi.mock('@/utils/helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/helpers')>();
  return {
    ...actual,
    // 只 Mock calculatePrice
    calculatePrice: vi.fn().mockReturnValue(100),
  };
});

import { calculatePrice, formatDate } from '@/utils/helpers';

describe('部分模块 Mock', () => {
  it('calculatePrice 使用 Mock 实现', () => {
    expect(calculatePrice(10, 20)).toBe(100);
  });

  it('formatDate 使用真实实现', () => {
    // formatDate 是真实的实现
    const date = new Date('2024-01-01');
    expect(formatDate(date)).toBeTruthy();
  });
});
```

### 条件 Mock

```typescript
// __tests__/mocks/conditional.test.ts
import { vi } from 'vitest';

const shouldMock = process.env.NODE_ENV === 'test';

if (shouldMock) {
  vi.mock('@/lib/analytics', () => ({
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
  }));
}

describe('条件 Mock', () => {
  it('测试环境使用 Mock', async () => {
    const { trackEvent } = await import('@/lib/analytics');

    if (shouldMock) {
      trackEvent('test_event');
      expect(trackEvent).toHaveBeenCalledWith('test_event');
    }
  });
});
```

### 自动 Mock

```typescript
// __tests__/mocks/auto-mock.test.ts
import { vi } from 'vitest';

// 自动 Mock 所有导出
vi.mock('@/services/payment.service');

import { paymentService } from '@/services/payment.service';

describe('自动 Mock', () => {
  it('所有方法都是 Mock 函数', () => {
    expect(vi.isMockFunction(paymentService.createPayment)).toBe(true);
    expect(vi.isMockFunction(paymentService.processPayment)).toBe(true);
  });

  it('可以配置 Mock 行为', async () => {
    vi.mocked(paymentService.createPayment).mockResolvedValue({
      id: 'payment_123',
      status: 'pending',
    });

    const payment = await paymentService.createPayment({
      amount: 100,
    });

    expect(payment.id).toBe('payment_123');
  });
});
```

## 数据库 Mock

### Drizzle ORM Mock

```typescript
// __tests__/mocks/database.test.ts
import { vi } from 'vitest';
import { db } from '@/database/clients/db';

// Mock 数据库客户端
vi.mock('@/database/clients/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
  },
}));

describe('数据库 Mock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该 Mock SELECT 查询', async () => {
    const mockUsers = [
      { id: '1', name: '张三' },
      { id: '2', name: '李四' },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(mockUsers),
        }),
      }),
    } as any);

    // 模拟查询
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, '1'))
      .limit(10);

    expect(users).toEqual(mockUsers);
  });

  it('应该 Mock INSERT 操作', async () => {
    const newUser = { id: '3', name: '王五', email: 'wangwu@example.com' };

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([newUser]),
      }),
    } as any);

    const [user] = await db
      .insert(usersTable)
      .values({ name: '王五', email: 'wangwu@example.com' })
      .returning();

    expect(user).toEqual(newUser);
  });

  it('应该 Mock UPDATE 操作', async () => {
    const updatedUser = { id: '1', name: '张三（更新）' };

    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updatedUser]),
        }),
      }),
    } as any);

    const [user] = await db
      .update(usersTable)
      .set({ name: '张三（更新）' })
      .where(eq(usersTable.id, '1'))
      .returning();

    expect(user).toEqual(updatedUser);
  });

  it('应该 Mock DELETE 操作', async () => {
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: '1' }]),
      }),
    } as any);

    const result = await db
      .delete(usersTable)
      .where(eq(usersTable.id, '1'))
      .returning();

    expect(result).toHaveLength(1);
  });

  it('应该 Mock 事务', async () => {
    const mockTransaction = vi.fn(async (callback) => {
      return await callback({
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: '1' }]),
          }),
        }),
      });
    });

    vi.mocked(db).transaction = mockTransaction as any;

    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({ name: '张三' }).returning();
    });

    expect(mockTransaction).toHaveBeenCalled();
  });
});
```

### 内存数据库 Mock

```typescript
// __tests__/mocks/in-memory-db.ts
class InMemoryDatabase {
  private data: Map<string, any[]> = new Map();

  constructor() {
    this.data.set('users', []);
    this.data.set('products', []);
  }

  select(table: string) {
    return this.data.get(table) || [];
  }

  insert(table: string, record: any) {
    const records = this.data.get(table) || [];
    const newRecord = { ...record, id: Date.now().toString() };
    records.push(newRecord);
    this.data.set(table, records);
    return newRecord;
  }

  update(table: string, id: string, updates: any) {
    const records = this.data.get(table) || [];
    const index = records.findIndex((r) => r.id === id);
    if (index >= 0) {
      records[index] = { ...records[index], ...updates };
      this.data.set(table, records);
      return records[index];
    }
    return null;
  }

  delete(table: string, id: string) {
    const records = this.data.get(table) || [];
    const filtered = records.filter((r) => r.id !== id);
    this.data.set(table, filtered);
    return filtered.length < records.length;
  }

  clear(table?: string) {
    if (table) {
      this.data.set(table, []);
    } else {
      this.data.clear();
    }
  }
}

export const mockDb = new InMemoryDatabase();
```

## 第三方服务 Mock

### 认证服务 Mock

```typescript
// __tests__/mocks/auth.mock.ts
import { vi } from 'vitest';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

import { getServerSession } from 'next-auth';
import { auth, currentUser } from '@clerk/nextjs';

export const mockAuth = {
  // 模拟已登录用户
  asUser: (user: any) => {
    vi.mocked(getServerSession).mockResolvedValue({
      user,
      expires: '2024-12-31',
    } as any);

    vi.mocked(auth).mockReturnValue({
      userId: user.id,
      sessionId: 'session_123',
    } as any);

    vi.mocked(currentUser).mockResolvedValue(user);
  },

  // 模拟未登录
  asGuest: () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(auth).mockReturnValue({ userId: null } as any);
    vi.mocked(currentUser).mockResolvedValue(null);
  },

  // 模拟管理员
  asAdmin: () => {
    mockAuth.asUser({
      id: 'admin_1',
      email: 'admin@example.com',
      role: 'admin',
    });
  },
};
```

### 支付服务 Mock

```typescript
// __tests__/mocks/payment.mock.ts
import { vi } from 'vitest';

vi.mock('stripe', () => {
  return {
    default: vi.fn(() => ({
      paymentIntents: {
        create: vi.fn().mockResolvedValue({
          id: 'pi_123',
          client_secret: 'secret_123',
          amount: 10000,
          status: 'requires_payment_method',
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'pi_123',
          status: 'succeeded',
        }),
      },
      webhooks: {
        constructEvent: vi.fn().mockReturnValue({
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_123',
              amount: 10000,
            },
          },
        }),
      },
    })),
  };
});
```

### 邮件服务 Mock

```typescript
// __tests__/mocks/email.mock.ts
import { vi } from 'vitest';

export const mockSendGrid = {
  setApiKey: vi.fn(),
  send: vi.fn().mockResolvedValue([
    {
      statusCode: 202,
      body: '',
      headers: {},
    },
  ]),
};

vi.mock('@sendgrid/mail', () => ({
  default: mockSendGrid,
}));

// 使用示例
describe('邮件服务', () => {
  it('应该发送邮件', async () => {
    await emailService.send({
      to: 'user@example.com',
      subject: '测试邮件',
      html: '<p>测试内容</p>',
    });

    expect(mockSendGrid.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: '测试邮件',
      })
    );
  });
});
```

### 云存储服务 Mock

```typescript
// __tests__/mocks/storage.mock.ts
import { vi } from 'vitest';

export const mockS3 = {
  upload: vi.fn().mockReturnValue({
    promise: vi.fn().mockResolvedValue({
      Location: 'https://example.com/file.pdf',
      Key: 'uploads/file.pdf',
    }),
  }),
  getObject: vi.fn().mockReturnValue({
    promise: vi.fn().mockResolvedValue({
      Body: Buffer.from('file content'),
    }),
  }),
  deleteObject: vi.fn().mockReturnValue({
    promise: vi.fn().mockResolvedValue({}),
  }),
};

vi.mock('aws-sdk', () => ({
  S3: vi.fn(() => mockS3),
}));
```

## Spy 和监控

### 方法 Spy

```typescript
// __tests__/spy/method-spy.test.ts
import { vi } from 'vitest';

describe('方法 Spy', () => {
  it('应该监控方法调用', () => {
    const calculator = {
      add: (a: number, b: number) => a + b,
      multiply: (a: number, b: number) => a * b,
    };

    const addSpy = vi.spyOn(calculator, 'add');

    calculator.add(1, 2);
    calculator.add(3, 4);

    expect(addSpy).toHaveBeenCalledTimes(2);
    expect(addSpy).toHaveBeenCalledWith(1, 2);
    expect(addSpy).toHaveBeenCalledWith(3, 4);
    expect(addSpy).toHaveReturnedWith(3);
  });

  it('Spy 可以改变实现', () => {
    const obj = {
      getValue: () => 'original',
    };

    const spy = vi.spyOn(obj, 'getValue').mockReturnValue('mocked');

    expect(obj.getValue()).toBe('mocked');
    expect(spy).toHaveBeenCalled();

    // 恢复原始实现
    spy.mockRestore();
    expect(obj.getValue()).toBe('original');
  });

  it('监控 console 方法', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    console.log('测试消息');
    console.log('另一条消息');

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith('测试消息');

    consoleSpy.mockRestore();
  });
});
```

### Timer Mock

```typescript
// __tests__/mocks/timer.test.ts
import { vi } from 'vitest';

describe('Timer Mock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该模拟 setTimeout', () => {
    const callback = vi.fn();

    setTimeout(callback, 1000);

    expect(callback).not.toHaveBeenCalled();

    // 快进 1 秒
    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalled();
  });

  it('应该模拟 setInterval', () => {
    const callback = vi.fn();

    setInterval(callback, 1000);

    vi.advanceTimersByTime(3500);

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('应该跳到下一个 Timer', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    setTimeout(callback1, 1000);
    setTimeout(callback2, 2000);

    vi.runOnlyPendingTimers();

    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();

    vi.runOnlyPendingTimers();

    expect(callback2).toHaveBeenCalled();
  });

  it('应该运行所有 Timer', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    setTimeout(callback1, 1000);
    setTimeout(callback2, 2000);

    vi.runAllTimers();

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });
});
```

### Date Mock

```typescript
// __tests__/mocks/date.test.ts
import { vi } from 'vitest';

describe('Date Mock', () => {
  it('应该 Mock 当前时间', () => {
    const mockDate = new Date('2024-01-01T00:00:00.000Z');
    vi.setSystemTime(mockDate);

    expect(new Date()).toEqual(mockDate);
    expect(Date.now()).toBe(mockDate.getTime());

    vi.useRealTimers();
  });

  it('应该测试时间相关逻辑', () => {
    vi.setSystemTime(new Date('2024-01-01'));

    const isNewYear = () => {
      const today = new Date();
      return today.getMonth() === 0 && today.getDate() === 1;
    };

    expect(isNewYear()).toBe(true);

    vi.setSystemTime(new Date('2024-01-02'));
    expect(isNewYear()).toBe(false);

    vi.useRealTimers();
  });
});
```

### 环境变量 Mock

```typescript
// __tests__/mocks/env.test.ts
import { vi } from 'vitest';

describe('环境变量 Mock', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('应该 Mock 环境变量', () => {
    process.env.NODE_ENV = 'production';
    process.env.API_URL = 'https://api.example.com';

    expect(process.env.NODE_ENV).toBe('production');
    expect(process.env.API_URL).toBe('https://api.example.com');
  });

  it('应该测试不同环境配置', () => {
    process.env.NODE_ENV = 'development';

    const getApiUrl = () => {
      return process.env.NODE_ENV === 'production'
        ? 'https://api.example.com'
        : 'http://localhost:3000/api';
    };

    expect(getApiUrl()).toBe('http://localhost:3000/api');

    process.env.NODE_ENV = 'production';
    expect(getApiUrl()).toBe('https://api.example.com');
  });
});
```
