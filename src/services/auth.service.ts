/**
 * 认证服务层
 * 处理所有认证相关的业务逻辑
 */

import { userService, loginSchema } from './user.service';
import { rbacRepository } from '@/repositories/rbac.repository';
import type { User } from '@/database/schema/users';

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  provider?: string;
}

export interface AuthSession {
  user: AuthUser;
  permissions?: string[];
}

class AuthService {
  /**
   * 验证用户凭据（用于 credentials provider）
   */
  async validateCredentials(credentials: unknown): Promise<AuthUser | null> {
    try {
      // 1. 验证输入格式
      const validatedData = loginSchema.parse(credentials);
      const { email, password } = validatedData;
      
      // 2. 调用用户服务验证凭据
      const result = await userService.verifyCredentials(email, password);
      
      if (!result.success || !result.data) {
        return null;
      }
      
      // 3. 返回认证用户对象
      return {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name,
        image: result.data.image,
        provider: 'credentials',
      };
    } catch (error) {
      console.error('Credentials validation error:', error);
      return null;
    }
  }
  
  /**
   * 处理OAuth登录
   * 创建或更新用户信息
   */
  async handleOAuthLogin(profile: {
    email: string;
    name?: string;
    image?: string;
    provider: string;
  }): Promise<AuthUser> {
    try {
      // 1. 查找或创建用户
      const existingUser = await userService.findByEmail(profile.email);
      
      if (existingUser) {
        // 更新用户信息（如头像）
        if (profile.image && profile.image !== existingUser.image) {
          await userService.update(existingUser.id, {
            image: profile.image,
            name: profile.name || existingUser.name,
          });
        }
        
        return {
          id: existingUser.id,
          email: existingUser.email,
          name: profile.name || existingUser.name,
          image: profile.image || existingUser.image,
          provider: profile.provider,
        };
      }
      
      // 2. 创建新用户（OAuth用户不需要密码）
      const result = await userService.createOAuthUser({
        email: profile.email,
        name: profile.name,
        image: profile.image,
        provider: profile.provider,
      });
      
      if (!result.success || !result.data) {
        throw new Error('Failed to create OAuth user');
      }
      
      return {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name,
        image: result.data.image,
        provider: profile.provider,
      };
    } catch (error) {
      console.error('OAuth login error:', error);
      throw error;
    }
  }
  
  /**
   * 构建用户会话
   * 包含用户信息和权限
   */
  async buildSession(userId: string): Promise<AuthSession> {
    try {
      // 1. 获取用户信息
      const userResult = await userService.getById(userId);
      
      if (!userResult.success || !userResult.data) {
        throw new Error('User not found');
      }
      
      const user = userResult.data;
      
      // 2. 获取用户权限
      const permissions = await rbacRepository.getUserPermissions(userId);
      
      // 3. 构建会话对象
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
        permissions,
      };
    } catch (error) {
      console.error('Build session error:', error);
      throw error;
    }
  }
  
  /**
   * 刷新用户会话
   * 更新最后活动时间等
   */
  async refreshSession(userId: string): Promise<void> {
    try {
      await userService.updateLastActivity(userId);
    } catch (error) {
      console.error('Refresh session error:', error);
      // 不抛出错误，避免影响用户体验
    }
  }
  
  /**
   * 处理用户登出
   * 清理相关数据
   */
  async handleSignOut(userId: string): Promise<void> {
    try {
      // 可以在这里添加登出相关的清理逻辑
      // 如：清除缓存、记录日志等
      console.log(`User ${userId} signed out`);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
  
  /**
   * 验证会话是否有效
   */
  async validateSession(sessionToken: string): Promise<boolean> {
    try {
      // 这里可以添加会话验证逻辑
      // 如：检查token是否过期、是否在黑名单等
      return true;
    } catch (error) {
      console.error('Validate session error:', error);
      return false;
    }
  }
}

// 导出服务实例
export const authService = new AuthService();