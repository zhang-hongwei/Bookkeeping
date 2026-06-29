import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getConnectionString } from "../client";
import * as schema from "../schema";

const globalForSupabase = globalThis as unknown as {
  db?: ReturnType<typeof drizzle>;
  client?: postgres.Sql;
};

/**
 * Supabase 优化的数据库客户端
 * 使用 postgres-js 驱动，针对 Supabase 连接池优化
 */
export function getDb() {
  if (!globalForSupabase.db) {
    // 为 Supabase 优化的连接配置
    const client = postgres(getConnectionString(), {
      // Supabase 连接池优化设置
      max: 10, // 最大连接数
      idle_timeout: 20, // 空闲超时
      connect_timeout: 10, // 连接超时
      // Supabase 推荐的设置
      prepare: false, // 禁用预处理语句缓存
    });
    
    globalForSupabase.client = client;
    globalForSupabase.db = drizzle(client, { 
      schema,
      logger: process.env.NODE_ENV === 'development' 
    });
  }
  
  return globalForSupabase.db;
}

/**
 * 获取原始 postgres 客户端（用于高级操作）
 */
export function getPostgresClient() {
  if (!globalForSupabase.client) {
    getDb(); // 初始化客户端
  }
  return globalForSupabase.client!;
}