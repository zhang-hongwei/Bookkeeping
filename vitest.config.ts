import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vitest 配置。
 * - test 目录指向项目根的 tests/
 * - 复用 tsconfig 的路径别名 @/* → ./src/*
 * - environment=node（finance 测试是纯逻辑/DB 集成，无 DOM）
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
});
