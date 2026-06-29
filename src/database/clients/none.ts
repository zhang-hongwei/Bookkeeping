/**
 * 无数据库客户端
 *
 * 当 DATABASE_PROVIDER 设置为 'none' 或未设置时使用
 * 用于不需要数据库的场景，如纯前端项目或演示环境
 */

// 输出警告信息（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '\n' +
    '⚠️  [Database] No database enabled\n' +
    '   DATABASE_PROVIDER is set to "none" or not configured.\n' +
    '   To enable database, set DATABASE_PROVIDER to: local, supabase, or neon\n'
  );
}

/**
 * 获取数据库实例（始终抛出错误）
 *
 * @throws {Error} 提示用户数据库未启用
 */
export function getDb(): never {
  throw new Error(
    'Database is not enabled. ' +
    'DATABASE_PROVIDER is set to "none" or not configured. ' +
    'Please set DATABASE_PROVIDER to: local, supabase, or neon to enable database access.'
  );
}
