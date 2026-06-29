/**
 * Finance API 认证辅助。
 *
 * 契约（contracts/api.md）：finance 全部 API 需认证，userId 取自会话，请求体不携带 userId。
 *
 * 项目使用 **Supabase Auth**（@supabase/ssr）：route handler 经 createSupabaseServerClient
 * 从 cookie 读会话；src/middleware.ts 负责刷新会话 cookie 并保护 /finance 页面（未登录跳 /signin）。
 * 未认证 → 401。
 */
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/** 从 Supabase 会话取 userId；未登录返回 null。 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    // Supabase 未配置或无会话上下文时，视为未认证
    return null;
  }
}

/**
 * 要求登录。返回登录用户的 userId，或一个可直接 return 的 401 响应。
 *
 * 用法：
 * ```ts
 * const authed = await requireUserId();
 * if (authed instanceof NextResponse) return authed;
 * const userId: string = authed;
 * ```
 */
export async function requireUserId(): Promise<string | NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json(
      { error: '未认证', code: 'UNAUTHORIZED' },
      { status: 401 },
    );
  }
  return userId;
}
