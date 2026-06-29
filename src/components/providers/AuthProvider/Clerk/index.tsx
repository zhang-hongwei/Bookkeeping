'use client';

// Conditional import for ClerkProvider
let ClerkProvider: any = null;

try {
  const clerkNext = require('@clerk/nextjs');
  ClerkProvider = clerkNext.ClerkProvider;
} catch (error) {
  // @clerk/nextjs not available, create a fallback
  console.warn('Clerk Next.js package not available, using fallback');
  ClerkProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
}

import { PropsWithChildren, memo, useEffect, useMemo, useState, useTransition } from 'react';

// Feature flag can be controlled via environment variables or props
// For now, we'll use a simple default or prop-based approach

import UserUpdater from './UserUpdater';
import { useAppearance } from './useAppearance';

/**
 * Clerk 认证提供者组件
 * 
 * 基于 Clerk 的认证方案
 * - 提供 ClerkProvider 上下文
 * - 集成多语言支持
 * - 自适应主题外观
 * - 根据配置控制注册功能
 */
interface ClerkAuthProps extends PropsWithChildren {
  /**
   * 是否强制禁用注册功能
   * @default false
   */
  disableSignUp?: boolean;
  
  /**
   * 是否启用注册功能（通过环境变量或配置）
   * @default true
   */
  enableSignUp?: boolean;
  
  /**
   * 自定义登录 URL
   * @default '/login'
   */
  signInUrl?: string;
  
  /**
   * 自定义注册 URL
   * @default '/signup'
   */
  signUpUrl?: string;
}

const Clerk = memo<ClerkAuthProps>(({ 
  children, 
  disableSignUp = false,
  enableSignUp = true,
  signInUrl = '/login',
  signUpUrl = '/signup'
}) => {
  // Use environment variable or prop to control sign-up feature
  const envEnableSignUp = process.env.NEXT_PUBLIC_ENABLE_CLERK_SIGNUP !== 'false';
  const appearance = useAppearance();

  // 修复 SSR 与客户端主题不一致问题
  // Clerk 内部会重新应用 SSR props，覆盖客户端 props
  // 参考：https://github.com/clerk/javascript/blob/main/packages/nextjs/src/app-router/client/ClerkProvider.tsx
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    if (count || isPending) return;
    startTransition(() => {
      setCount((prevCount) => prevCount + 1);
    });
  }, [count, isPending]);

  // 计算是否应该显示注册功能
  const shouldShowSignUp = envEnableSignUp && enableSignUp && !disableSignUp;

  const updatedAppearance = useMemo(
    () => ({
      ...appearance,
      elements: {
        ...appearance.elements,
        // 如果禁用注册，隐藏注册相关UI元素
        ...(!shouldShowSignUp ? { footerAction: { display: 'none' } } : {}),
      },
    }),
    [appearance, shouldShowSignUp],
  );

  // 动态设置注册 URL，如果禁用则重定向到登录
  const finalSignUpUrl = shouldShowSignUp ? signUpUrl : signInUrl;

  return (
    <ClerkProvider
      appearance={updatedAppearance}
      signInUrl={signInUrl}
      signUpUrl={finalSignUpUrl}
    >
      {children}
      <UserUpdater />
    </ClerkProvider>
  );
});

Clerk.displayName = 'ClerkAuthProvider';

export default Clerk;