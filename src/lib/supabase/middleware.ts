/**
 * 中间件：刷新 Supabase 会话 cookie + 路由保护。
 *
 * 适配自 Supabase 官方 @supabase/ssr 的 Next.js 模式（参考 ai-project 的会话刷新思路，
 * 但改为 cookie 传输以适配 Next.js 全栈 SSR）。
 *
 * 关键约束：createServerClient 与 supabase.auth.getUser() 之间不要插入任何业务逻辑，
 * 否则可能破坏会话刷新。
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './constants';

/** 受保护路径前缀：未登录访问将被重定向到 /signin。 */
const PROTECTED_PREFIXES = ['/dashboard', '/finance', '/app'];

/** 公开路径（未登录可访问）。 */
const PUBLIC_PATHS = ['/', '/signin', '/signup'];

export async function updateSession(request: NextRequest) {
  // 未配置 Supabase 时不做认证处理，避免开发期阻塞。
  if (!isSupabaseConfigured) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // 重要：这里不要插入逻辑。getUser() 会触发会话刷新。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublic = PUBLIC_PATHS.includes(pathname);

  // 受保护路径未登录 → 跳转登录
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 已登录访问登录/注册页 → 跳回应用首页
  if (user && (pathname === '/signin' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // 未启用保护时公开路径放行
  void isPublic;
  return supabaseResponse;
}
