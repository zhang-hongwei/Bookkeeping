# 单元测试详解

> Vitest + Testing Library 单元测试最佳实践

## 📋 目录

- [React 组件测试](#react-组件测试)
- [React Hooks 测试](#react-hooks-测试)
- [工具函数测试](#工具函数测试)
- [Service 层测试](#service-层测试)
- [测试组织和命名](#测试组织和命名)
- [断言最佳实践](#断言最佳实践)

## React 组件测试

### 基础组件测试

```typescript
// __tests__/components/Button.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该正确渲染按钮文本', () => {
      render(<Button>点击我</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('点击我');
    });

    it('应该应用正确的变体样式', () => {
      render(<Button variant="primary">主要按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('应该支持自定义 className', () => {
      render(<Button className="custom-class">按钮</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('应该渲染图标', () => {
      const Icon = () => <span data-testid="icon">icon</span>;
      render(<Button startIcon={<Icon />}>带图标</Button>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该处理点击事件', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>点击</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('禁用时不应触发点击事件', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>禁用</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toBeDisabled();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('应该支持键盘事件', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>按钮</Button>);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('状态测试', () => {
    it('加载状态下应该显示加载指示器', () => {
      render(<Button loading>加载中</Button>);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('加载状态下应该禁用按钮', () => {
      render(<Button loading>加载中</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('可访问性测试', () => {
    it('应该有正确的 ARIA 属性', () => {
      render(<Button aria-label="关闭对话框">X</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '关闭对话框');
    });

    it('禁用时应该有 aria-disabled 属性', () => {
      render(<Button disabled>禁用</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
```

### 表单组件测试

```typescript
// __tests__/components/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';

describe('LoginForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('表单渲染', () => {
    it('应该渲染所有表单字段', () => {
      render(<LoginForm {...defaultProps} />);

      expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    });

    it('应该显示记住我选项', () => {
      render(<LoginForm {...defaultProps} />);
      expect(screen.getByLabelText(/记住我/i)).toBeInTheDocument();
    });

    it('应该显示忘记密码链接', () => {
      render(<LoginForm {...defaultProps} />);
      expect(screen.getByText(/忘记密码/i)).toBeInTheDocument();
    });
  });

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      // 直接提交空表单
      await user.click(screen.getByRole('button', { name: /登录/i }));

      // 检查错误消息
      expect(await screen.findByText(/邮箱不能为空/i)).toBeInTheDocument();
      expect(await screen.findByText(/密码不能为空/i)).toBeInTheDocument();
    });

    it('应该验证邮箱格式', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/邮箱/i);
      await user.type(emailInput, '无效邮箱');
      await user.tab(); // 触发 blur 事件

      expect(await screen.findByText(/邮箱格式不正确/i)).toBeInTheDocument();
    });

    it('应该验证密码长度', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/密码/i);
      await user.type(passwordInput, '123');
      await user.tab();

      expect(await screen.findByText(/密码至少6位/i)).toBeInTheDocument();
    });

    it('错误修正后应该清除错误消息', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      // 先触发错误
      const emailInput = screen.getByLabelText(/邮箱/i);
      await user.type(emailInput, '无效邮箱');
      await user.tab();

      expect(await screen.findByText(/邮箱格式不正确/i)).toBeInTheDocument();

      // 修正错误
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/邮箱格式不正确/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('表单提交', () => {
    it('应该提交有效的表单数据', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      // 填写表单
      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'password123');

      // 提交表单
      await user.click(screen.getByRole('button', { name: /登录/i }));

      // 验证提交
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        });
      });
    });

    it('应该在提交时禁用按钮', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /登录/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it('应该处理提交错误', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(new Error('登录失败'));

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'password123');
      await user.click(screen.getByRole('button', { name: /登录/i }));

      expect(await screen.findByText(/登录失败/i)).toBeInTheDocument();
    });
  });

  describe('用户交互', () => {
    it('应该切换密码可见性', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/密码/i) as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /显示密码/i });

      expect(passwordInput.type).toBe('password');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });

    it('应该支持记住我功能', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      const rememberMeCheckbox = screen.getByLabelText(/记住我/i);
      await user.click(rememberMeCheckbox);

      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'password123');
      await user.click(screen.getByRole('button', { name: /登录/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ rememberMe: true })
        );
      });
    });
  });
});
```

### 异步组件测试

```typescript
// __tests__/components/UserList.test.tsx
import { render, screen, waitFor, within } from '@testing-library/react';
import { UserList } from '@/components/UserList';
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('UserList', () => {
  it('应该显示初始加载状态', () => {
    render(<UserList />);
    expect(screen.getByText(/加载中/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('加载完成后应该显示用户列表', async () => {
    render(<UserList />);

    // 等待数据加载
    const users = await screen.findAllByRole('listitem');
    expect(users).toHaveLength(3);

    // 验证用户信息
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
    expect(screen.getByText('王五')).toBeInTheDocument();
  });

  it('应该处理错误状态', async () => {
    // 模拟错误响应
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: '服务器错误' }));
      })
    );

    render(<UserList />);

    const errorMessage = await screen.findByText(/加载用户列表失败/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('应该支持重试功能', async () => {
    const user = userEvent.setup();
    let callCount = 0;

    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        callCount++;
        if (callCount === 1) {
          return res(ctx.status(500));
        }
        return res(ctx.json([{ id: '1', name: '张三' }]));
      })
    );

    render(<UserList />);

    // 等待错误出现
    await screen.findByText(/加载用户列表失败/i);

    // 点击重试按钮
    const retryButton = screen.getByRole('button', { name: /重试/i });
    await user.click(retryButton);

    // 验证重新加载成功
    expect(await screen.findByText('张三')).toBeInTheDocument();
  });

  it('应该显示空状态', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );

    render(<UserList />);

    expect(await screen.findByText(/暂无用户/i)).toBeInTheDocument();
  });

  it('应该支持搜索功能', async () => {
    const user = userEvent.setup();
    render(<UserList />);

    // 等待列表加载
    await screen.findAllByRole('listitem');

    // 输入搜索关键词
    const searchInput = screen.getByPlaceholderText(/搜索用户/i);
    await user.type(searchInput, '张三');

    // 验证过滤结果
    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByText('张三')).toBeInTheDocument();
    });
  });
});
```

## React Hooks 测试

### 基础 Hook 测试

```typescript
// __tests__/hooks/use-boolean.test.ts
import { act, renderHook } from '@testing-library/react';
import { useBoolean } from '@/hooks/use-boolean';

describe('useBoolean', () => {
  it('应该使用默认值初始化', () => {
    const { result } = renderHook(() => useBoolean());
    expect(result.current.value).toBe(false);
  });

  it('应该使用提供的初始值', () => {
    const { result } = renderHook(() => useBoolean(true));
    expect(result.current.value).toBe(true);
  });

  it('onTrue 应该将值设为 true', () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.onTrue();
    });

    expect(result.current.value).toBe(true);
  });

  it('onFalse 应该将值设为 false', () => {
    const { result } = renderHook(() => useBoolean(true));

    act(() => {
      result.current.onFalse();
    });

    expect(result.current.value).toBe(false);
  });

  it('onToggle 应该切换值', () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.onToggle();
    });
    expect(result.current.value).toBe(true);

    act(() => {
      result.current.onToggle();
    });
    expect(result.current.value).toBe(false);
  });

  it('setValue 应该设置任意值', () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.setValue(true);
    });
    expect(result.current.value).toBe(true);

    act(() => {
      result.current.setValue(false);
    });
    expect(result.current.value).toBe(false);
  });
});
```

### 带副作用的 Hook 测试

```typescript
// __tests__/hooks/use-local-storage.test.ts
import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { setStorage, getStorage, removeStorage } from '@/utils/local-storage';

vi.mock('@/utils/local-storage', () => ({
  setStorage: vi.fn(),
  getStorage: vi.fn(),
  removeStorage: vi.fn(),
}));

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getStorage as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
  });

  describe('初始化', () => {
    it('应该使用初始状态初始化', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      expect(result.current.state).toBe('initial');
    });

    it('如果存在存储值应该使用存储值', () => {
      (getStorage as ReturnType<typeof vi.fn>).mockReturnValue('stored');

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      expect(result.current.state).toBe('stored');
    });

    it('应该支持对象类型', () => {
      const initialObject = { name: 'test', value: 123 };
      const { result } = renderHook(() => useLocalStorage('test-key', initialObject));
      expect(result.current.state).toEqual(initialObject);
    });
  });

  describe('状态更新', () => {
    it('setState 应该更新状态并保存到存储', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current.setState('updated');
      });

      expect(result.current.state).toBe('updated');
      expect(setStorage).toHaveBeenCalledWith('test-key', 'updated');
    });

    it('应该支持函数式更新', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0));

      act(() => {
        result.current.setState(prev => prev + 1);
      });

      expect(result.current.state).toBe(1);
    });
  });

  describe('状态重置', () => {
    it('resetState 应该重置到初始值并清除存储', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current.setState('updated');
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.state).toBe('initial');
      expect(removeStorage).toHaveBeenCalledWith('test-key');
    });
  });
});
```

### 异步 Hook 测试

```typescript
// __tests__/hooks/use-fetch.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from '@/hooks/use-fetch';
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('useFetch', () => {
  it('应该返回初始加载状态', () => {
    const { result } = renderHook(() => useFetch<{ data: string }>('/api/test'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('成功获取数据后应该更新状态', async () => {
    const mockData = { data: 'test data' };

    server.use(
      rest.get('/api/test', (req, res, ctx) => {
        return res(ctx.json(mockData));
      })
    );

    const { result } = renderHook(() => useFetch<typeof mockData>('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('请求失败时应该设置错误状态', async () => {
    server.use(
      rest.get('/api/test', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: '服务器错误' }));
      })
    );

    const { result } = renderHook(() => useFetch('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('应该支持手动重新获取', async () => {
    let callCount = 0;

    server.use(
      rest.get('/api/test', (req, res, ctx) => {
        callCount++;
        return res(ctx.json({ count: callCount }));
      })
    );

    const { result } = renderHook(() => useFetch('/api/test'));

    await waitFor(() => {
      expect(result.current.data).toEqual({ count: 1 });
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ count: 2 });
    });
  });
});
```

## 工具函数测试

### 纯函数测试

```typescript
// __tests__/utils/transform-number.test.ts
import { fNumber, fPercent, fCurrency } from '@/utils/transform-number';

describe('fNumber', () => {
  it('应该格式化普通数字', () => {
    expect(fNumber(1234)).toBe('1,234');
    expect(fNumber(1234567)).toBe('1,234,567');
  });

  it('应该处理小数', () => {
    expect(fNumber(1234.56)).toBe('1,234.56');
    expect(fNumber(1234.567)).toBe('1,234.567');
  });

  it('应该处理负数', () => {
    expect(fNumber(-1234)).toBe('-1,234');
    expect(fNumber(-1234.56)).toBe('-1,234.56');
  });

  it('应该处理零', () => {
    expect(fNumber(0)).toBe('0');
  });

  it('应该处理边界值', () => {
    expect(fNumber(Number.MAX_SAFE_INTEGER)).toBeTruthy();
    expect(fNumber(Number.MIN_SAFE_INTEGER)).toBeTruthy();
  });

  it('应该处理无效输入', () => {
    expect(fNumber(NaN)).toBe('NaN');
    expect(fNumber(Infinity)).toBe('Infinity');
  });
});

describe('fPercent', () => {
  it('应该格式化百分比', () => {
    expect(fPercent(0.5)).toBe('50%');
    expect(fPercent(0.123)).toBe('12.3%');
  });

  it('应该处理整数百分比', () => {
    expect(fPercent(1)).toBe('100%');
    expect(fPercent(0)).toBe('0%');
  });

  it('应该处理负百分比', () => {
    expect(fPercent(-0.5)).toBe('-50%');
  });
});

describe('fCurrency', () => {
  it('应该格式化货币', () => {
    expect(fCurrency(1234.56)).toBe('$1,234.56');
    expect(fCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('应该支持不同货币符号', () => {
    expect(fCurrency(1234.56, '¥')).toBe('¥1,234.56');
    expect(fCurrency(1234.56, '€')).toBe('€1,234.56');
  });

  it('应该处理负金额', () => {
    expect(fCurrency(-1234.56)).toBe('-$1,234.56');
  });
});
```

### 带依赖的工具函数测试

```typescript
// __tests__/utils/color.test.ts
import { hexToRgbChannel, createPaletteChannel, varAlpha } from '@/utils/color';

describe('hexToRgbChannel', () => {
  it('应该将十六进制颜色转换为 RGB 通道', () => {
    expect(hexToRgbChannel('#C8FAD6')).toBe('200 250 214');
    expect(hexToRgbChannel('#00A76F')).toBe('0 167 111');
  });

  it('应该处理三位十六进制颜色', () => {
    expect(hexToRgbChannel('#FFF')).toBe('255 255 255');
    expect(hexToRgbChannel('#000')).toBe('0 0 0');
  });

  it('空值应该抛出错误', () => {
    expect(() => hexToRgbChannel('')).toThrow('Hex color is undefined!');
  });

  it('无效的十六进制颜色应该抛出错误', () => {
    expect(() => hexToRgbChannel('#ZZZZZZ')).toThrow('Invalid hex color: #ZZZZZZ');
    expect(() => hexToRgbChannel('invalid')).toThrow();
  });
});

describe('varAlpha', () => {
  it('应该为 RGB 通道添加透明度', () => {
    expect(varAlpha('200 250 214', 0.8)).toBe('rgba(200 250 214 / 80%)');
    expect(varAlpha('200 250 214', 0.5)).toBe('rgba(200 250 214 / 50%)');
  });

  it('应该支持百分比透明度', () => {
    expect(varAlpha('200 250 214', '48%')).toBe('rgba(200 250 214 / 48%)');
  });

  it('应该处理 CSS 变量', () => {
    expect(varAlpha('var(--palette-primary-channel)', 0.8)).toBe(
      'rgba(var(--palette-primary-channel) / 80%)'
    );
  });

  it('应该处理 currentColor', () => {
    expect(varAlpha('currentColor', 0.5)).toBe(
      'color-mix(in srgb, currentColor 50%, transparent)'
    );
  });

  it('无效透明度应该抛出错误', () => {
    expect(() => varAlpha('200 250 214', 1.5)).toThrow();
    expect(() => varAlpha('200 250 214', -0.1)).toThrow();
  });
});
```

## Service 层测试

### Service 方法测试

```typescript
// __tests__/services/user.service.test.ts
import { userService } from '@/services/user.service';
import * as db from '@/database/clients/db';

vi.mock('@/database/clients/db');

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('用户存在时应该返回用户', async () => {
      const mockUser = { id: '1', name: '张三', email: 'test@example.com' };

      vi.mocked(db.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      } as any);

      const user = await userService.getById('1');
      expect(user).toEqual(mockUser);
    });

    it('用户不存在时应该返回 null', async () => {
      vi.mocked(db.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const user = await userService.getById('999');
      expect(user).toBeNull();
    });

    it('数据库错误应该抛出异常', async () => {
      vi.mocked(db.db.select).mockImplementation(() => {
        throw new Error('数据库连接失败');
      });

      await expect(userService.getById('1')).rejects.toThrow('数据库连接失败');
    });
  });

  describe('create', () => {
    it('应该创建新用户', async () => {
      const newUser = { name: '李四', email: 'lisi@example.com' };
      const createdUser = { id: '2', ...newUser };

      // Mock 邮箱不存在检查
      vi.mocked(db.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Mock 插入操作
      vi.mocked(db.db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdUser]),
        }),
      } as any);

      const result = await userService.create(newUser);
      expect(result).toEqual(createdUser);
    });

    it('邮箱已存在应该抛出错误', async () => {
      const existingUser = { id: '1', name: '张三', email: 'test@example.com' };

      vi.mocked(db.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingUser]),
          }),
        }),
      } as any);

      await expect(
        userService.create({ name: '王五', email: 'test@example.com' })
      ).rejects.toThrow('邮箱已存在');
    });

    it('应该验证输入数据', async () => {
      await expect(
        userService.create({ name: '', email: 'test@example.com' })
      ).rejects.toThrow('用户名不能为空');

      await expect(
        userService.create({ name: '张三', email: 'invalid-email' })
      ).rejects.toThrow('邮箱格式不正确');
    });
  });

  describe('update', () => {
    it('应该更新用户信息', async () => {
      const updateData = { name: '张三（更新）' };
      const updatedUser = { id: '1', name: '张三（更新）', email: 'test@example.com' };

      vi.mocked(db.db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      } as any);

      const result = await userService.update('1', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('用户不存在应该抛出错误', async () => {
      vi.mocked(db.db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await expect(
        userService.update('999', { name: '不存在' })
      ).rejects.toThrow('用户不存在');
    });
  });

  describe('delete', () => {
    it('应该删除用户', async () => {
      vi.mocked(db.db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: '1' }]),
        }),
      } as any);

      await expect(userService.delete('1')).resolves.not.toThrow();
    });

    it('用户不存在应该抛出错误', async () => {
      vi.mocked(db.db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      await expect(userService.delete('999')).rejects.toThrow('用户不存在');
    });
  });
});
```

## 测试组织和命名

### 测试结构

```typescript
describe('功能/组件名称', () => {
  // 全局设置
  beforeAll(() => {
    // 所有测试前执行一次
  });

  afterAll(() => {
    // 所有测试后执行一次
  });

  // 每个测试的设置
  beforeEach(() => {
    // 每个测试前执行
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 每个测试后执行
    vi.restoreAllMocks();
  });

  // 按功能分组
  describe('渲染测试', () => {
    it('应该正确渲染基本内容', () => {
      // 测试代码
    });

    it('应该处理不同的 props', () => {
      // 测试代码
    });
  });

  describe('交互测试', () => {
    it('应该响应用户操作', () => {
      // 测试代码
    });
  });

  describe('边界情况', () => {
    it('应该处理空数据', () => {
      // 测试代码
    });

    it('应该处理错误情况', () => {
      // 测试代码
    });
  });
});
```

### 命名约定

```typescript
// ✅ 好的命名
describe('UserList', () => {
  it('应该在数据加载时显示加载指示器', () => {});
  it('应该在列表为空时显示空状态', () => {});
  it('应该在发生错误时显示错误消息', () => {});
});

// ❌ 不好的命名
describe('test', () => {
  it('works', () => {});
  it('test 2', () => {});
  it('should work', () => {}); // 太模糊
});
```

## 断言最佳实践

### 使用正确的断言

```typescript
// ✅ 推荐：使用语义化断言
expect(button).toBeDisabled();
expect(element).toBeInTheDocument();
expect(input).toHaveValue('test');

// ❌ 避免：使用底层断言
expect(button.disabled).toBe(true);
expect(document.body.contains(element)).toBe(true);
expect(input.value).toBe('test');
```

### AAA 模式

```typescript
it('应该计算总价', () => {
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

### 避免多重断言依赖

```typescript
// ✅ 每个测试独立验证一个行为
it('应该正确格式化日期', () => {
  const result = formatDate(new Date('2024-01-01'));
  expect(result).toBe('2024-01-01');
});

it('应该处理无效日期', () => {
  const result = formatDate(null);
  expect(result).toBe('');
});

// ❌ 避免在一个测试中验证多个不相关的行为
it('应该处理各种情况', () => {
  expect(formatDate(new Date('2024-01-01'))).toBe('2024-01-01');
  expect(formatDate(null)).toBe('');
  expect(formatDate(undefined)).toBe('');
  // 太多不相关的断言
});
```
