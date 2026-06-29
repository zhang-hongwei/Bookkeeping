/**
 * 服务端认证助手：从 Supabase 会话获取当前用户。
 *
 * 用法（Route Handlers / Server Components）：
 *   const userId = await requireUserId(); // 未登录抛 UnauthorizedError
 *
 * userId = Supabase 用户 id（uuid 字符串），直接作为 finance 等业务数据的归属键
 * （沿用 accounts/transactions 等表的 user_id 文本列）。
 */
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** 未登录错误（调用方可在 API 层捕获并返回 401）。 */
export class UnauthorizedError extends Error {
  constructor(message = '未登录') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/** 获取当前 Supabase 用户；未登录返回 null（不抛错）。 */
export async function getSupabaseUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** 要求已登录并返回 userId；未登录抛 UnauthorizedError。 */
export async function requireUserId(): Promise<string> {
  const user = await getSupabaseUser();
  if (!user) throw new UnauthorizedError();
  return user.id;
}
