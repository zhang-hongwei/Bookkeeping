/**
 * 浏览器端 Supabase 客户端（基于 @supabase/ssr 的 cookie 存储）。
 *
 * 用于客户端组件中的登录/注册/登出与会话监听。
 * 会话令牌存在 cookie 中（由 @supabase/ssr 管理），服务端组件可直接读取。
 */
import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

export function createSupabaseBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      '缺少 Supabase 环境变量：请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
