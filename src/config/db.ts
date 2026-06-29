import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * 数据库提供商类型
 *
 * - `none`: 无数据库模式（用于纯前端项目或开发环境）
 * - `local`: 本地 PostgreSQL 数据库
 * - `supabase`: Supabase 托管数据库
 * - `neon`: NeonSQL Serverless 数据库
 */
export type DatabaseProvider = 'none' | 'local' | 'supabase' | 'neon';

/**
 * 数据库配置环境变量
 *
 * ## 配置优先级
 * 1. DATABASE_URL（主要配置，适用于所有环境）
 * 2. DATABASE_PROVIDER（选择数据库提供商）
 * 3. 特定环境URL（DATABASE_LOCAL_URL / DATABASE_PRODUCTION_URL）
 *
 * ## 提供商配置指南
 *
 * ### 无数据库模式 (none)
 * ```env
 * DATABASE_PROVIDER=none
 * # 不需要 DATABASE_URL
 * ```
 *
 * ### 本地 PostgreSQL (local)
 * ```env
 * DATABASE_PROVIDER=local
 * DATABASE_URL=postgresql://user:password@localhost:5432/dbname
 * ```
 *
 * ### Supabase (supabase)
 * ```env
 * DATABASE_PROVIDER=supabase
 * DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
 * ```
 *
 * ### NeonSQL (neon)
 * ```env
 * DATABASE_PROVIDER=neon
 * DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
 * ```
 */
export const getServerDBConfig = () => {
  return createEnv({
    client: {
      NEXT_PUBLIC_ENABLED_SERVER_SERVICE: z.boolean(),
    },
    runtimeEnv: {
      // 主数据库配置
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_TEST_URL: process.env.DATABASE_TEST_URL,

      // 数据库提供商选择：none | local | supabase | neon
      // 默认为 'none'（未设置或为空时）
      DATABASE_PROVIDER: process.env.DATABASE_PROVIDER?.trim() || 'none',

      // 环境配置
      NODE_ENV: process.env.NODE_ENV || 'development',

      // 可选：特定环境的数据库URL
      DATABASE_LOCAL_URL: process.env.DATABASE_LOCAL_URL,
      DATABASE_PRODUCTION_URL: process.env.DATABASE_PRODUCTION_URL,

      KEY_VAULTS_SECRET: process.env.KEY_VAULTS_SECRET,

      NEXT_PUBLIC_ENABLED_SERVER_SERVICE: process.env.NEXT_PUBLIC_SERVICE_MODE === 'server',

      REMOVE_GLOBAL_FILE: process.env.DISABLE_REMOVE_GLOBAL_FILE !== '0',
    },
    server: {
      // 主数据库连接（当 provider 为 'none' 时可为空）
      DATABASE_URL: z.string().optional(),
      DATABASE_TEST_URL: z.string().optional(),

      // 数据库提供商：无数据库、本地、Supabase、Neon
      DATABASE_PROVIDER: z.enum(['none', 'local', 'supabase', 'neon']).default('none'),

      // 环境变量
      NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

      // 可选的特定环境URL
      DATABASE_LOCAL_URL: z.string().optional(),
      DATABASE_PRODUCTION_URL: z.string().optional(),

      KEY_VAULTS_SECRET: z.string().optional(),

      REMOVE_GLOBAL_FILE: z.boolean().optional(),
    },
  });
};

export const serverDBEnv = getServerDBConfig();

/**
 * 检查是否启用了数据库
 */
export function isDatabaseEnabled(): boolean {
  return serverDBEnv.DATABASE_PROVIDER !== 'none';
}

/**
 * 获取当前数据库提供商
 */
export function getDatabaseProvider(): DatabaseProvider {
  return serverDBEnv.DATABASE_PROVIDER as DatabaseProvider;
}
