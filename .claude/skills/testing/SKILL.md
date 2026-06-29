---
name: testing
version: 1.0.0
description: 单元测试和集成测试开发规范
priority: medium
dependencies: []
triggers:
  keywords: [test, spec, jest, vitest, testing, mock, assert, 测试, 单元测试]
  files: ["*.test.ts", "*.spec.ts", "*.test.tsx", "*.spec.tsx", "__tests__/**"]
  intents: ["write test", "add test", "test coverage"]
---

# Testing Skill

> Vitest + Testing Library + MSW 测试开发最佳实践

> ⚠️ **重要提示**：本规范为项目测试标准。CLAUDE.md 中提到的 `testing-guide/` 目录尚未创建，请以本文件为准。

## 🧪 测试结构

### 基础测试模板

```typescript
// __tests__/components/Button.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  // Setup 和 Teardown
  beforeEach(() => {
    // 每个测试前的设置
  });

  afterEach(() => {
    // 清理
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('should apply variant styles', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });
  });

  describe('interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
```

## 🎯 React 组件测试

### 表单组件测试

```typescript
// __tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/LoginForm';

describe('LoginForm', () => {
  it('should submit valid form data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    // 填写表单
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // 提交表单
    await user.click(screen.getByRole('button', { name: /login/i }));

    // 验证提交
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    // 提交空表单
    await user.click(screen.getByRole('button', { name: /login/i }));

    // 检查错误消息
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });
});
```

### 异步组件测试

```typescript
// __tests__/components/UserList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { UserList } from '@/components/UserList';
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('UserList', () => {
  it('should display loading state initially', () => {
    render(<UserList />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display users after loading', async () => {
    render(<UserList />);

    // 等待数据加载
    const users = await screen.findAllByRole('listitem');
    expect(users).toHaveLength(3);
  });

  it('should handle error state', async () => {
    // 模拟错误响应
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<UserList />);

    expect(await screen.findByText(/error loading users/i)).toBeInTheDocument();
  });
});
```

## 🔧 Service/API 测试

### Service 层测试

```typescript
// __tests__/services/user.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '@/services/user.service';
import * as db from '@/database/clients/db';

// Mock 数据库
vi.mock('@/database/clients/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('should return user when exists', async () => {
      const mockUser = { id: '1', name: 'Test User' };

      vi.mocked(db.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const user = await userService.getById('1');
      expect(user).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      vi.mocked(db.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const user = await userService.getById('999');
      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user with valid data', async () => {
      const newUser = { name: 'New User', email: 'new@test.com' };
      const createdUser = { id: '2', ...newUser };

      vi.mocked(db.db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdUser]),
        }),
      });

      const result = await userService.create(newUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw error for duplicate email', async () => {
      // Mock 邮箱已存在
      vi.mocked(db.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: '1' }]),
          }),
        }),
      });

      await expect(
        userService.create({ name: 'Test', email: 'existing@test.com' })
      ).rejects.toThrow('邮箱已存在');
    });
  });
});
```

### API Route 测试

```typescript
// __tests__/api/users.test.ts
import { describe, it, expect, vi } from 'vitest';
import { GET, POST } from '@/app/api/users/route';
import { NextRequest } from 'next/server';
import { userService } from '@/services/user.service';

vi.mock('@/services/user.service');

describe('API /api/users', () => {
  describe('GET', () => {
    it('should return users list', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];

      vi.mocked(userService.getAll).mockResolvedValue(mockUsers);

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUsers);
    });

    it('should handle errors', async () => {
      vi.mocked(userService.getAll).mockRejectedValue(new Error('DB Error'));

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST', () => {
    it('should create user with valid data', async () => {
      const newUser = { name: 'New User', email: 'new@test.com' };
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
    });

    it('should validate request body', async () => {
      const invalidData = { name: '' }; // 缺少 email

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('验证失败');
    });
  });
});
```

## 🎭 Mock 和 Stub

### Mock 函数

```typescript
// Mock 外部模块
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

// Mock 部分模块
vi.mock('@/utils/helpers', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    calculatePrice: vi.fn().mockReturnValue(100),
  };
});

// Spy on 方法
const spy = vi.spyOn(console, 'log');
expect(spy).toHaveBeenCalledWith('message');
```

### MSW 设置

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ])
    );
  }),

  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(201),
      ctx.json({ id: '3', ...body })
    );
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

## 📊 测试覆盖率

### 配置覆盖率

```typescript
// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '*.config.ts',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
};
```

### 运行覆盖率

```bash
# 运行测试并生成覆盖率
pnpm test --coverage

# 只运行特定文件的测试
pnpm test --run --silent='passed-only' 'user.test.ts'

# 监视模式
pnpm test --watch
```

## ⚡ 测试最佳实践

### 1. AAA 模式

```typescript
it('should calculate total price', () => {
  // Arrange（准备）
  const items = [
    { price: 10, quantity: 2 },
    { price: 20, quantity: 1 },
  ];

  // Act（执行）
  const total = calculateTotal(items);

  // Assert（断言）
  expect(total).toBe(40);
});
```

### 2. 描述性测试名称

```typescript
// ✅ 好的命名
describe('UserService.create', () => {
  it('should create a new user with valid data', () => {});
  it('should throw error when email already exists', () => {});
  it('should send welcome email after user creation', () => {});
});

// ❌ 不好的命名
describe('test', () => {
  it('works', () => {});
  it('error', () => {});
});
```

### 3. 独立测试

```typescript
// ✅ 每个测试独立
beforeEach(() => {
  // 重置状态
  vi.clearAllMocks();
  localStorage.clear();
});

// ❌ 避免测试间依赖
it('test 1', () => {
  globalVar = 'value'; // 不要这样做
});

it('test 2', () => {
  expect(globalVar).toBe('value'); // 依赖于 test 1
});
```

### 4. 测试边界情况

```typescript
describe('validateAge', () => {
  it('should accept minimum age', () => {
    expect(validateAge(18)).toBe(true);
  });

  it('should reject below minimum age', () => {
    expect(validateAge(17)).toBe(false);
  });

  it('should handle negative numbers', () => {
    expect(validateAge(-1)).toBe(false);
  });

  it('should handle null/undefined', () => {
    expect(validateAge(null)).toBe(false);
    expect(validateAge(undefined)).toBe(false);
  });
});
```

## 📚 更多资源

详细指南请查看 `resources/` 目录：

### 🧪 测试类型

- **[unit-testing.md](resources/unit-testing.md)** - React 组件、Hooks、Services 单元测试
- **[integration-testing.md](resources/integration-testing.md)** - API 路由、数据库和全功能流程测试
- **[e2e-testing.md](resources/e2e-testing.md)** - Playwright 端到端测试和 Page Object 模式

### 🎭 Mock 和性能

- **[mocking-strategies.md](resources/mocking-strategies.md)** - Vitest Mock、MSW、数据库 Mock 策略
- **[performance-testing.md](resources/performance-testing.md)** - 负载测试、压力测试和性能分析