import { serverDBEnv, isDatabaseEnabled, getDatabaseProvider } from "@/config/db";
import { getDb as getDbNode, getPgPool } from "./clients/node";
import { getDb as getDbNeon } from "./clients/neon";
import { getDb as getDbSupabase } from "./clients/supabase";
import { getDb as getDbNone } from "./clients/none";

/**
 * 获取数据库连接字符串
 *
 * 优先级策略：
 * 1. DATABASE_URL (主要配置)
 * 2. 根据环境选择特定URL
 * 3. 测试环境URL（兜底）
 *
 * @throws {Error} 当需要数据库但未配置连接字符串时抛出错误
 */
function getConnectionString(): string {
  const env = serverDBEnv;

  // 如果是 'none' 模式，直接返回空字符串（不需要连接）
  if (env.DATABASE_PROVIDER === 'none') {
    return '';
  }

  // 优先使用主要的 DATABASE_URL
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  // 根据环境选择对应的数据库
  if (env.NODE_ENV === 'development' && env.DATABASE_LOCAL_URL) {
    return env.DATABASE_LOCAL_URL;
  }

  if (env.NODE_ENV === 'production' && env.DATABASE_PRODUCTION_URL) {
    return env.DATABASE_PRODUCTION_URL;
  }

  // 测试环境或兜底
  if (env.DATABASE_TEST_URL) {
    return env.DATABASE_TEST_URL;
  }

  throw new Error(
    `No database connection string configured for environment: ${env.NODE_ENV}\n` +
    `Current provider: ${env.DATABASE_PROVIDER}\n` +
    `Please set DATABASE_URL or set DATABASE_PROVIDER=none to disable database.`
  );
}

/**
 * 统一的数据库连接获取器
 *
 * ## 提供商选择逻辑
 *
 * - `none`: 无数据库模式（抛出错误提示）
 * - `local`: 本地PostgreSQL，使用Node.js原生驱动 (pg.Pool)
 * - `supabase`: Supabase托管数据库，使用postgres-js驱动（针对Supabase优化）
 * - `neon`: NeonSQL Serverless数据库，使用 @neondatabase/serverless 驱动
 *
 * ## 使用示例
 *
 * ```typescript
 * import { db, isDatabaseEnabled } from '@/database/client';
 *
 * // 方式1: 检查数据库是否启用
 * if (isDatabaseEnabled()) {
 *   const users = await db.select().from(usersTable);
 * } else {
 *   console.log('Database is disabled');
 * }
 *
 * // 方式2: 使用 try-catch
 * try {
 *   const users = await db.select().from(usersTable);
 * } catch (error) {
 *   console.log('Database not available:', error);
 * }
 * ```
 */
export function getDb() {
  const provider = getDatabaseProvider();

  switch (provider) {
    case 'none':
      return getDbNone();
    case 'supabase':
      return getDbSupabase();
    case 'neon':
      return getDbNeon();
    case 'local':
      return getDbNode();
    default:
      // 类型安全：这个分支理论上永远不会执行
      console.warn(`Unknown database provider: ${provider}, falling back to 'none' mode`);
      return getDbNone();
  }
}

// 导出 db 实例（仅在数据库启用时才会有效）
// 如果 DATABASE_PROVIDER=none，访问 db 会抛出错误
// 建议使用 isDatabaseEnabled() 先检查
let _db: ReturnType<typeof getDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(target, prop) {
    if (!_db) {
      _db = getDb();
    }
    return (_db as any)[prop];
  }
});

// 导出工具函数
export { getPgPool, getConnectionString, isDatabaseEnabled, getDatabaseProvider };

// 导出类型
export type DB = ReturnType<typeof getDb>;
