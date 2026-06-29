import { PropsWithChildren, memo } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/constants";
import { authEnv } from "@/config/auth";
import NextAuth from "./NextAuth";
import NoAuth from "./NoAuth";
import Supabase from "./Supabase";

/**
 * 认证提供者组件
 *
 * 根据环境变量自动选择对应的认证方案（优先级）：
 * - Supabase: 如果配置了 NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY（推荐）
 * - NextAuth: 如果配置了 NEXT_PUBLIC_ENABLE_NEXT_AUTH
 * - NoAuth: 默认无认证模式
 *
 * @param children - 子组件
 */
interface AuthProviderProps extends PropsWithChildren {}

const AuthProvider = memo<AuthProviderProps>(({ children }) => {
  // 根据环境变量自动选择认证方案
  if (isSupabaseConfigured) return <Supabase>{children}</Supabase>;
  if (authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH)
    return <NextAuth>{children}</NextAuth>;

  // 默认使用无认证模式
  return <NoAuth>{children}</NoAuth>;
});

AuthProvider.displayName = "AuthProvider";

export default AuthProvider;
