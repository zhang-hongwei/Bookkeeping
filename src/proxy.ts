/**
 * Next.js Proxy 入口（Next.js 16 将 middleware.ts 重命名为 proxy.ts）：
 * 委托给 Supabase 会话刷新 + 路由保护。
 */
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  /**
   * 匹配除静态资源外的所有路由，确保会话 cookie 始终被刷新。
   * 参考 Supabase 官方推荐 matcher。
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
