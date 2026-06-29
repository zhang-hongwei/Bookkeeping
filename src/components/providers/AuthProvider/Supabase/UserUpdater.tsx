'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { memo, useEffect } from 'react';

import { useUserStore } from '@/store/user';
import type { UserInfo } from '@/store/user/types';

/**
 * 监听 Supabase 认证状态，把当前用户同步进全局 user store。
 * 这样应用其余部分仍通过 useUserStore 读取用户（与 NextAuth provider 一致）。
 */
const UserUpdater = memo<{ client: SupabaseClient }>(({ client }) => {
  useEffect(() => {
    let active = true;

    const sync = async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!active) return;

      const store = useUserStore.getState();

      if (user) {
        const username = user.user_metadata?.['username'] as
          | string
          | undefined;
        const name = user.user_metadata?.['name'] as string | undefined;
        const avatar =
          (user.user_metadata?.['avatar_url'] as string | undefined) ||
          (user.user_metadata?.['picture'] as string | undefined) ||
          '';

        const userInfo: UserInfo = {
          id: user.id,
          username: username || user.email || 'User',
          name: name || user.email || '',
          email: user.email ?? '',
          avatar,
          phone: user.phone ?? '',
          role: 'user',
          permissions: [],
          lastLoginTime: new Date().toISOString(),
          status: 'active',
        };

        store.internal_setUserInfo(userInfo);
        store.login('supabase-session', {
          id: user.id,
          email: user.email ?? '',
        });
      } else {
        store.logout();
      }
    };

    sync();

    // 会话变化（登录/登出/刷新）时重新同步
    const { data: sub } = client.auth.onAuthStateChange(() => {
      sync();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [client]);

  return null;
});

UserUpdater.displayName = 'SupabaseUserUpdater';

export default UserUpdater;
