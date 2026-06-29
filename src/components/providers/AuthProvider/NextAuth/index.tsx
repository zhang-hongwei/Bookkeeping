"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren, memo } from "react";

import UserUpdater from "./UserUpdater";

/**
 * NextAuth 认证提供者组件
 *
 * 基于 NextAuth.js 的认证方案
 * - 提供 SessionProvider 上下文
 * - 集成 UserUpdater 组件同步用户状态到 Zustand store
 */
interface NextAuthProps extends PropsWithChildren {
  /**
   * 自定义的 basePath，用于 OAuth 端点
   * @default '/api/auth'
   */
  basePath?: string;
}

const NextAuth = memo<NextAuthProps>(({ children, basePath = "/api/auth" }) => {
  return (
    <SessionProvider basePath={basePath}>
      {children}
      <UserUpdater />
    </SessionProvider>
  );
});

NextAuth.displayName = "NextAuthProvider";

export default NextAuth;
