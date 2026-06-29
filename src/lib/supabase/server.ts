/**
 * 服务端 Supabase 客户端（App Router Server Components / Route Handlers）。
 *
 * 基于 @supabase/ssr 的 createServerClient，从 next/headers 的 cookie 读取会话。
 * Next.js 16 的 cookies() 为异步，需 await。
 *
 * setAll 在 Server Component 中会被调用但无法写回（只读上下文），
 * 此时安全忽略——中间件会负责刷新会话 cookie。
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

export async function createSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      '缺少 Supabase 环境变量：请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // 在 Server Component 中调用 set 会抛错（只读），安全忽略；
          // 会话刷新由 src/middleware.ts 负责。
        }
      },
    },
  });
}
