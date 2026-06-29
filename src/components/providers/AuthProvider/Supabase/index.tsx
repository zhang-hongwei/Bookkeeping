'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createContext, useContext, memo, useMemo, type PropsWithChildren } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import UserUpdater from './UserUpdater';

/**
 * Supabase 认证提供者。
 *
 * - 在客户端创建一个共享的 Supabase 浏览器客户端并经 React context 暴露。
 * - 挂载 UserUpdater 把会话同步进全局 user store。
 * - 会话令牌存于 cookie（由 @supabase/ssr 管理），服务端组件可直接读取。
 */
const SupabaseContext = createContext<SupabaseClient | null>(null);

export function useSupabaseClient(): SupabaseClient {
  const client = useContext(SupabaseContext);
  if (!client) {
    throw new Error('useSupabaseClient 必须在 <Supabase> 提供者内部使用');
  }
  return client;
}

const Supabase = memo(({ children }: PropsWithChildren) => {
  const client = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    <SupabaseContext.Provider value={client}>
      {children}
      <UserUpdater client={client} />
    </SupabaseContext.Provider>
  );
});

Supabase.displayName = 'SupabaseAuthProvider';

export default Supabase;
