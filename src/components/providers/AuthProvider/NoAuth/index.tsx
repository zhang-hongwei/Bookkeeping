'use client';

import { PropsWithChildren, memo, useEffect } from 'react';
import { useUserStore, type UserInfo } from '@/store/user';

/**
 * 无认证提供者组件
 *
 * 用于不需要认证的场景，仅设置用户 store 的基础状态
 * - 设置为未登录状态
 * - 可以在此添加匿名用户的默认设置
 */
interface NoAuthProviderProps extends PropsWithChildren {
  /**
   * 是否启用匿名用户模式
   * @default false
   */
  enableAnonymous?: boolean;
}

const NoAuthProvider = memo<NoAuthProviderProps>(({ children, enableAnonymous = false }) => {
  // 如果启用匿名用户模式，可以设置默认的匿名用户信息
  useEffect(() => {
    const userStore = useUserStore.getState();

    if (enableAnonymous && !userStore.isLoggedIn) {
      // 设置匿名用户信息
      const anonymousUser: UserInfo = {
        id: 'anonymous',
        username: 'Anonymous',
        name: 'Anonymous User',
        email: 'anonymous@example.com',
        avatar: '',
        phone: '',
        role: 'guest',
        permissions: [],
        lastLoginTime: new Date().toISOString(),
        status: 'active',
      };

      userStore.updateUserInfo(anonymousUser);
    }
  }, [enableAnonymous]);

  return <>{children}</>;
});

NoAuthProvider.displayName = 'NoAuthProvider';

export default NoAuthProvider;