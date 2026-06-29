/**
 * Supabase 公共环境变量（浏览器/服务端通用）。
 *
 * 这两个变量以 NEXT_PUBLIC_ 前缀暴露给客户端，运行时由 .env.local 提供：
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * 注意：服务端私有密钥（SUPABASE_SERVICE_ROLE_KEY）仅在后端、绝不带 NEXT_PUBLIC_ 前缀。
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Supabase 是否已配置（URL + anon key 都存在）。 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
