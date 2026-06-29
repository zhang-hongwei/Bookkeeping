/**
 * 认证提供者相关的类型定义
 */

import { PropsWithChildren } from 'react';

/**
 * 支持的认证类型
 */
export type AuthType = 'clerk' | 'nextauth' | 'none';

/**
 * 认证提供者基础 Props
 */
export interface BaseAuthProviderProps extends PropsWithChildren {
  /**
   * 认证类型
   */
  authType?: AuthType;
}

/**
 * Clerk 认证配置
 */
export interface ClerkAuthConfig {
  /**
   * 是否启用注册功能
   */
  enableSignUp: boolean;
  
  /**
   * 登录页面路径
   */
  signInUrl: string;
  
  /**
   * 注册页面路径  
   */
  signUpUrl: string;
  
  /**
   * Clerk 发布密钥
   */
  publishableKey: string;
}

/**
 * NextAuth 认证配置
 */
export interface NextAuthConfig {
  /**
   * OAuth 基础路径
   */
  basePath: string;
  
  /**
   * NextAuth 密钥
   */
  secret: string;
  
  /**
   * 支持的 SSO 提供商
   */
  ssoProviders: string[];
}

/**
 * 无认证模式配置
 */
export interface NoAuthConfig {
  /**
   * 是否启用匿名用户模式
   */
  enableAnonymous: boolean;
  
  /**
   * 默认匿名用户信息
   */
  anonymousUser?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * 认证环境配置
 */
export interface AuthEnvironment {
  /**
   * 是否启用 Clerk 认证
   */
  enableClerk: boolean;
  
  /**
   * 是否启用 NextAuth 认证
   */
  enableNextAuth: boolean;
  
  /**
   * Clerk 配置
   */
  clerk?: ClerkAuthConfig;
  
  /**
   * NextAuth 配置
   */
  nextAuth?: NextAuthConfig;
  
  /**
   * 无认证模式配置
   */
  noAuth?: NoAuthConfig;
}

/**
 * 用户认证状态
 */
export interface AuthState {
  /**
   * 是否已加载认证状态
   */
  isLoaded: boolean;
  
  /**
   * 是否已登录
   */
  isSignedIn: boolean;
  
  /**
   * 当前用户信息
   */
  user: User | null;
}

/**
 * 用户信息接口
 */
export interface User {
  /**
   * 用户 ID
   */
  id: string;
  
  /**
   * 用户名
   */
  name: string;
  
  /**
   * 邮箱
   */
  email: string;
  
  /**
   * 头像 URL
   */
  avatar?: string;
  
  /**
   * 用户角色
   */
  role?: string;
  
  /**
   * 其他用户属性
   */
  [key: string]: unknown;
}