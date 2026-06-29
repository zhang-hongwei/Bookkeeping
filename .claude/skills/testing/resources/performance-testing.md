# 性能测试

> 负载测试、压力测试、基准测试和性能分析

## 📋 目录

- [性能测试基础](#性能测试基础)
- [基准测试](#基准测试)
- [负载测试](#负载测试)
- [压力测试](#压力测试)
- [性能分析和优化](#性能分析和优化)
- [前端性能测试](#前端性能测试)

## 性能测试基础

### 性能指标

```typescript
// __tests__/performance/metrics.ts
export interface PerformanceMetrics {
  // 响应时间
  responseTime: {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };

  // 吞吐量
  throughput: {
    requestsPerSecond: number;
    totalRequests: number;
    duration: number;
  };

  // 错误率
  errorRate: {
    total: number;
    percentage: number;
    byType: Record<string, number>;
  };

  // 资源使用
  resources: {
    cpu: number;
    memory: number;
    network: number;
  };
}

/**
 * 性能指标收集器
 */
export class MetricsCollector {
  private responseTimes: number[] = [];
  private errors: string[] = [];
  private startTime: number = 0;

  start() {
    this.startTime = Date.now();
  }

  recordResponse(time: number) {
    this.responseTimes.push(time);
  }

  recordError(error: string) {
    this.errors.push(error);
  }

  getMetrics(): PerformanceMetrics {
    const sorted = this.responseTimes.sort((a, b) => a - b);
    const totalRequests = this.responseTimes.length;
    const duration = (Date.now() - this.startTime) / 1000;

    return {
      responseTime: {
        min: Math.min(...sorted),
        max: Math.max(...sorted),
        avg: sorted.reduce((a, b) => a + b, 0) / sorted.length,
        p50: this.percentile(sorted, 50),
        p95: this.percentile(sorted, 95),
        p99: this.percentile(sorted, 99),
      },
      throughput: {
        requestsPerSecond: totalRequests / duration,
        totalRequests,
        duration,
      },
      errorRate: {
        total: this.errors.length,
        percentage: (this.errors.length / totalRequests) * 100,
        byType: this.groupErrors(),
      },
      resources: {
        cpu: 0, // 需要外部工具测量
        memory: process.memoryUsage().heapUsed / 1024 / 1024,
        network: 0,
      },
    };
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[index];
  }

  private groupErrors(): Record<string, number> {
    return this.errors.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  reset() {
    this.responseTimes = [];
    this.errors = [];
    this.startTime = 0;
  }
}
```

## 基准测试

### Vitest Bench

```typescript
// __tests__/benchmarks/array-operations.bench.ts
import { bench, describe } from 'vitest';

describe('数组操作性能', () => {
  const sizes = [100, 1000, 10000];

  sizes.forEach((size) => {
    describe(`数组大小: ${size}`, () => {
      const array = Array.from({ length: size }, (_, i) => i);

      bench('for 循环', () => {
        let sum = 0;
        for (let i = 0; i < array.length; i++) {
          sum += array[i];
        }
      });

      bench('forEach', () => {
        let sum = 0;
        array.forEach((n) => (sum += n));
      });

      bench('reduce', () => {
        array.reduce((sum, n) => sum + n, 0);
      });

      bench('for...of', () => {
        let sum = 0;
        for (const n of array) {
          sum += n;
        }
      });
    });
  });
});
```

### 函数性能基准

```typescript
// __tests__/benchmarks/string-operations.bench.ts
import { bench, describe } from 'vitest';

describe('字符串操作性能', () => {
  const text = 'Hello World '.repeat(1000);

  bench('String.split', () => {
    text.split(' ');
  });

  bench('正则表达式 split', () => {
    text.split(/\s+/);
  });

  bench('indexOf 循环', () => {
    const words: string[] = [];
    let start = 0;
    let index = text.indexOf(' ', start);

    while (index !== -1) {
      words.push(text.substring(start, index));
      start = index + 1;
      index = text.indexOf(' ', start);
    }
  });
});

describe('对象操作性能', () => {
  const obj = Object.fromEntries(
    Array.from({ length: 1000 }, (_, i) => [`key${i}`, i])
  );

  bench('Object.keys', () => {
    Object.keys(obj);
  });

  bench('Object.values', () => {
    Object.values(obj);
  });

  bench('Object.entries', () => {
    Object.entries(obj);
  });

  bench('for...in', () => {
    const keys = [];
    for (const key in obj) {
      keys.push(key);
    }
  });
});
```

### React 组件性能基准

```typescript
// __tests__/benchmarks/component.bench.tsx
import { bench, describe } from 'vitest';
import { render } from '@testing-library/react';
import { UserList } from '@/components/UserList';
import { UserCard } from '@/components/UserCard';

describe('组件渲染性能', () => {
  const users = Array.from({ length: 100 }, (_, i) => ({
    id: `${i}`,
    name: `用户 ${i}`,
    email: `user${i}@example.com`,
  }));

  bench('渲染 UserList（100 项）', () => {
    const { unmount } = render(<UserList users={users} />);
    unmount();
  });

  bench('渲染单个 UserCard', () => {
    const { unmount } = render(<UserCard user={users[0]} />);
    unmount();
  });

  bench('批量渲染 UserCard', () => {
    const elements = users.map((user) => <UserCard key={user.id} user={user} />);
    const { unmount } = render(<>{elements}</>);
    unmount();
  });
});
```

### 算法性能比较

```typescript
// __tests__/benchmarks/algorithms.bench.ts
import { bench, describe } from 'vitest';

describe('排序算法性能', () => {
  const sizes = [100, 1000, 5000];

  sizes.forEach((size) => {
    const array = Array.from({ length: size }, () => Math.random());

    bench(`原生 sort - ${size} 项`, () => {
      [...array].sort((a, b) => a - b);
    });

    bench(`快速排序 - ${size} 项`, () => {
      quickSort([...array]);
    });

    bench(`归并排序 - ${size} 项`, () => {
      mergeSort([...array]);
    });
  });
});

describe('搜索算法性能', () => {
  const sizes = [1000, 10000, 100000];

  sizes.forEach((size) => {
    const array = Array.from({ length: size }, (_, i) => i);
    const target = Math.floor(size / 2);

    bench(`线性搜索 - ${size} 项`, () => {
      array.indexOf(target);
    });

    bench(`二分搜索 - ${size} 项`, () => {
      binarySearch(array, target);
    });
  });
});

// 辅助函数
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter((x) => x < pivot);
  const middle = arr.filter((x) => x === pivot);
  const right = arr.filter((x) => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0,
    j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}

function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
```

## 负载测试

### API 负载测试

```typescript
// __tests__/load/api-load.test.ts
import { describe, it, expect } from 'vitest';
import { MetricsCollector } from '../performance/metrics';

describe('API 负载测试', () => {
  const baseURL = 'http://localhost:3000';
  const metrics = new MetricsCollector();

  it('应该处理 100 个并发请求', async () => {
    metrics.start();

    const requests = Array.from({ length: 100 }, async () => {
      const start = Date.now();
      try {
        const response = await fetch(`${baseURL}/api/users`);
        metrics.recordResponse(Date.now() - start);
        return response;
      } catch (error) {
        metrics.recordError((error as Error).message);
        throw error;
      }
    });

    await Promise.all(requests);

    const result = metrics.getMetrics();

    // 性能断言
    expect(result.responseTime.avg).toBeLessThan(1000); // 平均响应时间 < 1s
    expect(result.responseTime.p95).toBeLessThan(2000); // 95% 响应时间 < 2s
    expect(result.errorRate.percentage).toBeLessThan(5); // 错误率 < 5%
    expect(result.throughput.requestsPerSecond).toBeGreaterThan(10); // 吞吐量 > 10 rps

    console.log('负载测试结果:', result);
  }, 60000);

  it('应该处理持续负载（60秒）', async () => {
    const duration = 60 * 1000; // 60 秒
    const rps = 10; // 每秒 10 个请求
    const interval = 1000 / rps;

    metrics.start();

    const endTime = Date.now() + duration;

    while (Date.now() < endTime) {
      const start = Date.now();

      try {
        const response = await fetch(`${baseURL}/api/products`);
        metrics.recordResponse(Date.now() - start);
      } catch (error) {
        metrics.recordError((error as Error).message);
      }

      // 控制请求频率
      const elapsed = Date.now() - start;
      if (elapsed < interval) {
        await new Promise((resolve) => setTimeout(resolve, interval - elapsed));
      }
    }

    const result = metrics.getMetrics();

    expect(result.errorRate.percentage).toBeLessThan(1);
    expect(result.responseTime.avg).toBeLessThan(500);

    console.log('持续负载测试结果:', result);
  }, 120000);
});
```

### 数据库负载测试

```typescript
// __tests__/load/database-load.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/database/clients/db';
import { users } from '@/database/schema';
import { MetricsCollector } from '../performance/metrics';

describe('数据库负载测试', () => {
  const metrics = new MetricsCollector();

  beforeAll(async () => {
    // 清理测试数据
    await db.delete(users);
  });

  afterAll(async () => {
    // 清理测试数据
    await db.delete(users);
  });

  it('应该处理大量并发插入', async () => {
    metrics.start();

    const insertPromises = Array.from({ length: 1000 }, async (_, i) => {
      const start = Date.now();
      try {
        await db.insert(users).values({
          name: `用户 ${i}`,
          email: `user${i}@example.com`,
          passwordHash: 'hash',
        });
        metrics.recordResponse(Date.now() - start);
      } catch (error) {
        metrics.recordError((error as Error).message);
      }
    });

    await Promise.all(insertPromises);

    const result = metrics.getMetrics();

    expect(result.errorRate.percentage).toBeLessThan(5);
    expect(result.responseTime.avg).toBeLessThan(100);

    console.log('数据库插入负载测试结果:', result);
  }, 60000);

  it('应该处理大量并发查询', async () => {
    // 先插入测试数据
    const testUsers = Array.from({ length: 100 }, (_, i) => ({
      name: `查询用户 ${i}`,
      email: `query${i}@example.com`,
      passwordHash: 'hash',
    }));
    await db.insert(users).values(testUsers);

    metrics.reset();
    metrics.start();

    const queryPromises = Array.from({ length: 1000 }, async () => {
      const start = Date.now();
      try {
        await db.select().from(users).limit(10);
        metrics.recordResponse(Date.now() - start);
      } catch (error) {
        metrics.recordError((error as Error).message);
      }
    });

    await Promise.all(queryPromises);

    const result = metrics.getMetrics();

    expect(result.errorRate.percentage).toBeLessThan(1);
    expect(result.responseTime.avg).toBeLessThan(50);

    console.log('数据库查询负载测试结果:', result);
  }, 60000);

  it('应该处理复杂查询负载', async () => {
    metrics.reset();
    metrics.start();

    const complexQueryPromises = Array.from({ length: 100 }, async () => {
      const start = Date.now();
      try {
        // 复杂查询：联表、排序、分页
        await db
          .select()
          .from(users)
          .orderBy(users.createdAt)
          .limit(20)
          .offset(0);

        metrics.recordResponse(Date.now() - start);
      } catch (error) {
        metrics.recordError((error as Error).message);
      }
    });

    await Promise.all(complexQueryPromises);

    const result = metrics.getMetrics();

    expect(result.responseTime.p95).toBeLessThan(200);

    console.log('复杂查询负载测试结果:', result);
  }, 60000);
});
```

## 压力测试

### 逐步增压测试

```typescript
// __tests__/stress/ramp-up.test.ts
import { describe, it } from 'vitest';
import { MetricsCollector } from '../performance/metrics';

describe('逐步增压测试', () => {
  const baseURL = 'http://localhost:3000';

  it('应该承受逐步增加的负载', async () => {
    const stages = [
      { duration: 30000, rps: 10 }, // 30秒，10 rps
      { duration: 30000, rps: 50 }, // 30秒，50 rps
      { duration: 30000, rps: 100 }, // 30秒，100 rps
      { duration: 30000, rps: 200 }, // 30秒，200 rps
    ];

    const results: any[] = [];

    for (const stage of stages) {
      const metrics = new MetricsCollector();
      metrics.start();

      console.log(`开始阶段: ${stage.rps} rps, 持续 ${stage.duration / 1000}秒`);

      const endTime = Date.now() + stage.duration;
      const interval = 1000 / stage.rps;

      while (Date.now() < endTime) {
        const start = Date.now();

        try {
          await fetch(`${baseURL}/api/health`);
          metrics.recordResponse(Date.now() - start);
        } catch (error) {
          metrics.recordError((error as Error).message);
        }

        const elapsed = Date.now() - start;
        if (elapsed < interval) {
          await new Promise((resolve) => setTimeout(resolve, interval - elapsed));
        }
      }

      const result = metrics.getMetrics();
      results.push({ stage: `${stage.rps} rps`, ...result });

      console.log(`阶段完成:`, result);
    }

    console.log('增压测试完整结果:', results);
  }, 300000);
});
```

### 峰值压力测试

```typescript
// __tests__/stress/spike.test.ts
import { describe, it, expect } from 'vitest';
import { MetricsCollector } from '../performance/metrics';

describe('峰值压力测试', () => {
  const baseURL = 'http://localhost:3000';

  it('应该处理突发流量', async () => {
    const metrics = new MetricsCollector();
    metrics.start();

    // 突然发送 1000 个并发请求
    const requests = Array.from({ length: 1000 }, async () => {
      const start = Date.now();
      try {
        const response = await fetch(`${baseURL}/api/products`);
        metrics.recordResponse(Date.now() - start);
        return response.ok;
      } catch (error) {
        metrics.recordError((error as Error).message);
        return false;
      }
    });

    const results = await Promise.allSettled(requests);

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value
    ).length;

    const result = metrics.getMetrics();

    // 在峰值压力下，允许更高的响应时间和错误率
    expect(successCount / 1000).toBeGreaterThan(0.8); // 至少 80% 成功
    expect(result.responseTime.p99).toBeLessThan(5000); // 99% 响应 < 5s

    console.log('峰值压力测试结果:', {
      ...result,
      successRate: (successCount / 1000) * 100 + '%',
    });
  }, 120000);
});
```

### 极限压力测试

```typescript
// __tests__/stress/breaking-point.test.ts
import { describe, it } from 'vitest';
import { MetricsCollector } from '../performance/metrics';

describe('极限压力测试', () => {
  const baseURL = 'http://localhost:3000';

  it('应该找到系统崩溃点', async () => {
    let rps = 10;
    const maxRps = 1000;
    const stepSize = 10;
    const stepDuration = 10000; // 每步 10 秒

    while (rps <= maxRps) {
      const metrics = new MetricsCollector();
      metrics.start();

      console.log(`测试 ${rps} rps...`);

      const endTime = Date.now() + stepDuration;
      const interval = 1000 / rps;

      while (Date.now() < endTime) {
        const start = Date.now();

        try {
          await fetch(`${baseURL}/api/health`);
          metrics.recordResponse(Date.now() - start);
        } catch (error) {
          metrics.recordError((error as Error).message);
        }

        const elapsed = Date.now() - start;
        if (elapsed < interval) {
          await new Promise((resolve) => setTimeout(resolve, interval - elapsed));
        }
      }

      const result = metrics.getMetrics();

      console.log(`${rps} rps 结果:`, {
        avgResponse: result.responseTime.avg,
        errorRate: result.errorRate.percentage,
      });

      // 检查是否达到崩溃点
      if (
        result.errorRate.percentage > 50 ||
        result.responseTime.avg > 5000
      ) {
        console.log(`系统崩溃点: ${rps} rps`);
        break;
      }

      rps += stepSize;
    }
  }, 600000);
});
```

## 性能分析和优化

### 内存泄漏检测

```typescript
// __tests__/performance/memory-leak.test.ts
import { describe, it, expect } from 'vitest';

describe('内存泄漏检测', () => {
  it('应该检测内存使用增长', async () => {
    const iterations = 100;
    const memorySnapshots: number[] = [];

    for (let i = 0; i < iterations; i++) {
      // 执行可能泄漏的操作
      const largeArray = new Array(10000).fill('data');

      // 记录内存使用
      if (i % 10 === 0) {
        global.gc && global.gc(); // 手动触发 GC
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        memorySnapshots.push(memoryUsage);
      }

      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // 分析内存趋势
    const initialMemory = memorySnapshots[0];
    const finalMemory = memorySnapshots[memorySnapshots.length - 1];
    const growth = finalMemory - initialMemory;
    const growthRate = (growth / initialMemory) * 100;

    console.log('内存使用情况:', {
      initial: `${initialMemory.toFixed(2)} MB`,
      final: `${finalMemory.toFixed(2)} MB`,
      growth: `${growth.toFixed(2)} MB`,
      growthRate: `${growthRate.toFixed(2)}%`,
      snapshots: memorySnapshots,
    });

    // 内存增长不应超过 50%
    expect(growthRate).toBeLessThan(50);
  });
});
```

### CPU 性能分析

```typescript
// __tests__/performance/cpu-profiling.test.ts
import { describe, it } from 'vitest';

describe('CPU 性能分析', () => {
  it('应该分析 CPU 密集型操作', async () => {
    const startTime = Date.now();
    const startCpu = process.cpuUsage();

    // CPU 密集型操作
    const result = Array.from({ length: 1000000 }, (_, i) => i)
      .map((n) => n * 2)
      .filter((n) => n % 2 === 0)
      .reduce((sum, n) => sum + n, 0);

    const endCpu = process.cpuUsage(startCpu);
    const duration = Date.now() - startTime;

    const cpuTime = (endCpu.user + endCpu.system) / 1000; // 转换为毫秒

    console.log('CPU 性能分析:', {
      duration: `${duration}ms`,
      cpuTime: `${cpuTime.toFixed(2)}ms`,
      cpuUtilization: `${((cpuTime / duration) * 100).toFixed(2)}%`,
      result,
    });
  });
});
```

### 数据库查询优化

```typescript
// __tests__/performance/query-optimization.test.ts
import { describe, it, expect } from 'vitest';
import { db } from '@/database/clients/db';
import { users, posts } from '@/database/schema';

describe('数据库查询优化', () => {
  it('应该比较查询性能', async () => {
    // 方案 1: N+1 查询
    const start1 = Date.now();
    const allUsers = await db.select().from(users);
    for (const user of allUsers) {
      await db.select().from(posts).where(eq(posts.userId, user.id));
    }
    const time1 = Date.now() - start1;

    // 方案 2: JOIN 查询
    const start2 = Date.now();
    await db
      .select()
      .from(users)
      .leftJoin(posts, eq(users.id, posts.userId));
    const time2 = Date.now() - start2;

    console.log('查询性能比较:', {
      n_plus_1: `${time1}ms`,
      join: `${time2}ms`,
      improvement: `${(((time1 - time2) / time1) * 100).toFixed(2)}%`,
    });

    // JOIN 查询应该更快
    expect(time2).toBeLessThan(time1);
  });

  it('应该测试索引效果', async () => {
    // 无索引查询
    const start1 = Date.now();
    await db.select().from(users).where(eq(users.email, 'test@example.com'));
    const time1 = Date.now() - start1;

    // 有索引查询（假设 email 有索引）
    const start2 = Date.now();
    await db.select().from(users).where(eq(users.id, '1'));
    const time2 = Date.now() - start2;

    console.log('索引效果:', {
      withoutIndex: `${time1}ms`,
      withIndex: `${time2}ms`,
    });
  });
});
```

## 前端性能测试

### React 渲染性能

```typescript
// __tests__/performance/react-performance.test.tsx
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { ProductList } from '@/components/ProductList';

describe('React 渲染性能', () => {
  it('应该测量初始渲染时间', () => {
    const products = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      name: `商品 ${i}`,
      price: 100,
    }));

    const start = performance.now();
    const { unmount } = render(<ProductList products={products} />);
    const renderTime = performance.now() - start;

    console.log(`渲染 1000 个商品耗时: ${renderTime.toFixed(2)}ms`);

    unmount();

    // 渲染时间应该合理
    expect(renderTime).toBeLessThan(1000);
  });

  it('应该测量重新渲染时间', () => {
    const products = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      name: `商品 ${i}`,
      price: 100,
    }));

    const { rerender } = render(<ProductList products={products} />);

    const start = performance.now();
    rerender(<ProductList products={[...products, { id: '100', name: '新商品', price: 200 }]} />);
    const rerenderTime = performance.now() - start;

    console.log(`重新渲染耗时: ${rerenderTime.toFixed(2)}ms`);

    expect(rerenderTime).toBeLessThan(100);
  });
});
```

### 虚拟滚动性能

```typescript
// __tests__/performance/virtual-scroll.test.tsx
import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualList } from '@/components/VirtualList';

describe('虚拟滚动性能', () => {
  it('应该高效渲染大列表', () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: `${i}`,
      content: `项目 ${i}`,
    }));

    const start = performance.now();
    render(<VirtualList items={items} itemHeight={50} containerHeight={500} />);
    const renderTime = performance.now() - start;

    console.log(`虚拟滚动渲染 10000 项耗时: ${renderTime.toFixed(2)}ms`);

    // 虚拟滚动应该只渲染可见项，速度很快
    expect(renderTime).toBeLessThan(100);

    // 验证只渲染了可见项
    const renderedItems = screen.queryAllByTestId(/^item-/);
    expect(renderedItems.length).toBeLessThan(50); // 远少于 10000
  });
});
```

### Bundle 大小分析

```typescript
// __tests__/performance/bundle-size.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

describe('Bundle 大小分析', () => {
  it('应该检查 JavaScript Bundle 大小', () => {
    const bundlePath = join(process.cwd(), '.next/static/chunks');

    // 这是一个示例，实际需要根据构建输出调整
    const maxSizeKB = 500; // 最大 500KB

    // 读取 bundle 文件并检查大小
    // 实际实现需要遍历构建输出目录
    console.log('Bundle 大小检查...');

    // 模拟检查
    const mockBundleSize = 300; // KB
    expect(mockBundleSize).toBeLessThan(maxSizeKB);
  });

  it('应该检查 Gzip 压缩后的大小', () => {
    const code = 'console.log("test");'.repeat(1000);
    const buffer = Buffer.from(code);
    const compressed = gzipSync(buffer);

    const originalSize = buffer.length;
    const compressedSize = compressed.length;
    const compressionRatio = (compressedSize / originalSize) * 100;

    console.log('压缩分析:', {
      original: `${(originalSize / 1024).toFixed(2)} KB`,
      compressed: `${(compressedSize / 1024).toFixed(2)} KB`,
      ratio: `${compressionRatio.toFixed(2)}%`,
    });

    expect(compressionRatio).toBeLessThan(50);
  });
});
```

### Web Vitals 测试

```typescript
// __tests__/performance/web-vitals.test.ts
import { describe, it } from 'vitest';

describe('Web Vitals', () => {
  it('应该测量 Largest Contentful Paint (LCP)', async () => {
    // 使用 Playwright 或类似工具在真实浏览器中测试
    // 这里是伪代码示例

    const lcp = 2500; // 模拟 LCP 值（毫秒）

    console.log(`LCP: ${lcp}ms`);

    // LCP 应该小于 2.5 秒（良好）
    expect(lcp).toBeLessThan(2500);
  });

  it('应该测量 First Input Delay (FID)', async () => {
    const fid = 100; // 模拟 FID 值（毫秒）

    console.log(`FID: ${fid}ms`);

    // FID 应该小于 100ms（良好）
    expect(fid).toBeLessThan(100);
  });

  it('应该测量 Cumulative Layout Shift (CLS)', async () => {
    const cls = 0.1; // 模拟 CLS 值

    console.log(`CLS: ${cls}`);

    // CLS 应该小于 0.1（良好）
    expect(cls).toBeLessThan(0.1);
  });
});
```
