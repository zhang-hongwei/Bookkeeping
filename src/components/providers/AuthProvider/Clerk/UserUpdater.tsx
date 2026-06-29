'use client';

// Conditional imports for Clerk hooks
let useClerk: any = () => ({});
let useUser: any = () => ({ isLoaded: true, user: null, isSignedIn: false });

try {
  const clerkNext = require('@clerk/nextjs');
  useClerk = clerkNext.useClerk || (() => ({}));
  useUser = clerkNext.useUser || (() => ({ isLoaded: true, user: null, isSignedIn: false }));
} catch (error) {
  // @clerk/nextjs not available, use fallbacks
  console.warn('Clerk Next.js hooks not available, using fallback');
}

import { memo, useEffect } from 'react';
import { useUserStore, type UserInfo } from '@/store/user';

// update the user data into the context
const UserUpdater = memo(() => {
  const { isLoaded, user, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    const store = useUserStore.getState();

    if (isSignedIn && user) {
      // 将 Clerk 用户信息映射到 store 的 UserInfo 类型
      const userInfo: UserInfo = {
        id: user.id,
        username: user.username || user.firstName || 'User',
        name: user.fullName || user.firstName || 'User',
        email: user.primaryEmailAddress?.emailAddress || '',
        avatar: user.imageUrl || '',
        phone: user.primaryPhoneNumber?.phoneNumber || '',
        role: 'user', // 默认角色
        permissions: [],
        lastLoginTime: new Date().toISOString(),
        status: 'active',
      };

      // 更新用户信息并标记为已登录
      store.internal_setUserInfo(userInfo);
      store.login('clerk-session', { id: user.id, email: userInfo.email });
    } else {
      // 用户未登录，清除状态
      store.logout();
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
});

UserUpdater.displayName = 'ClerkUserUpdater';

export default UserUpdater;
