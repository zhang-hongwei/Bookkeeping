/**
 * 用户服务层
 * 处理所有用户相关的业务逻辑
 */

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { userRepository } from '@/repositories/user.repository';
import { roleRepository } from '@/repositories/role.repository';
import { permissionConfig } from '@/config/permissions.config';

// 验证schemas
export const registerSchema = z.object({
  email: z.string().email({ message: '邮箱格式不正确' }),
  password: z.string().min(6, { message: '密码至少6位' }),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: '邮箱格式不正确' }),
  password: z.string().min(1, { message: '密码不能为空' }),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  image: z.string().url({ message: '图片URL格式不正确' }).optional(),
  email: z.string().email({ message: '邮箱格式不正确' }).optional(),
});

// 服务响应类型
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

class UserService {
  /**
   * 用户注册
   */
  async register(data: z.infer<typeof registerSchema>): Promise<ServiceResponse> {
    try {
      // 1. 验证输入
      const validatedData = registerSchema.parse(data);
      const { email, password, name } = validatedData;

      // 2. 检查用户是否存在
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return {
          success: false,
          error: '该邮箱已被注册',
          code: 400,
        };
      }

      // 3. 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. 创建用户
      const newUser = await userRepository.create({
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      });

      // 5. 分配默认角色（如果启用了RBAC）
      if (permissionConfig.enabled) {
        // 检查是否为超级管理员邮箱
        const isSuperAdmin = permissionConfig.superAdminEmails.includes(email);
        const roleName = isSuperAdmin ? 'super_admin' : permissionConfig.defaultRole;
        
        const role = await roleRepository.findByName(roleName);
        if (role) {
          await roleRepository.assignToUser(newUser.id, role.id);
        }
      }

      // 6. 返回结果（不包含密码）
      const { password: _, ...userWithoutPassword } = newUser;
      
      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      // 处理验证错误
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.issues[0]?.message || '数据验证失败',
          code: 400,
        };
      }

      // 记录错误并返回通用错误消息
      console.error('Registration error:', error);
      return {
        success: false,
        error: '注册失败，请稍后重试',
        code: 500,
      };
    }
  }

  /**
   * 用户登录验证
   */
  async verifyCredentials(email: string, password: string): Promise<ServiceResponse> {
    try {
      // 1. 查找用户
      const user = await userRepository.findByEmail(email);
      if (!user || !user.password) {
        return {
          success: false,
          error: '邮箱或密码错误',
          code: 401,
        };
      }

      // 2. 验证密码
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return {
          success: false,
          error: '邮箱或密码错误',
          code: 401,
        };
      }

      // 3. 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Login verification error:', error);
      return {
        success: false,
        error: '登录失败，请稍后重试',
        code: 500,
      };
    }
  }

  /**
   * 获取用户信息
   */
  async getById(id: string): Promise<ServiceResponse> {
    try {
      const user = await userRepository.findById(id);
      
      if (!user) {
        return {
          success: false,
          error: '用户不存在',
          code: 404,
        };
      }

      const { password: _, ...userWithoutPassword } = user;
      
      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        error: '获取用户信息失败',
        code: 500,
      };
    }
  }

  /**
   * 更新用户信息
   */
  async update(id: string, data: z.infer<typeof updateUserSchema>): Promise<ServiceResponse> {
    try {
      // 1. 验证输入
      const validatedData = updateUserSchema.parse(data);

      // 2. 检查用户是否存在
      const existingUser = await userRepository.findById(id);
      if (!existingUser) {
        return {
          success: false,
          error: '用户不存在',
          code: 404,
        };
      }

      // 3. 如果更新邮箱，检查是否已被使用
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const emailTaken = await userRepository.findByEmail(validatedData.email);
        if (emailTaken) {
          return {
            success: false,
            error: '该邮箱已被使用',
            code: 400,
          };
        }
      }

      // 4. 更新用户
      const updatedUser = await userRepository.update(id, validatedData);
      
      if (!updatedUser) {
        return {
          success: false,
          error: '更新失败',
          code: 500,
        };
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      
      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.issues[0]?.message || '数据验证失败',
          code: 400,
        };
      }

      console.error('Update user error:', error);
      return {
        success: false,
        error: '更新用户信息失败',
        code: 500,
      };
    }
  }

  /**
   * 删除用户
   */
  async delete(id: string): Promise<ServiceResponse> {
    try {
      // 1. 检查用户是否存在
      const user = await userRepository.findById(id);
      if (!user) {
        return {
          success: false,
          error: '用户不存在',
          code: 404,
        };
      }

      // 2. 删除用户（会级联删除相关数据）
      await userRepository.delete(id);

      return {
        success: true,
        data: { message: '用户已删除' },
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        error: '删除用户失败',
        code: 500,
      };
    }
  }

  /**
   * 获取用户列表
   */
  async list(options?: { 
    page?: number; 
    limit?: number; 
    search?: string;
  }): Promise<ServiceResponse> {
    try {
      const { page = 1, limit = 10, search } = options || {};
      
      const users = await userRepository.list({
        offset: (page - 1) * limit,
        limit,
        search,
      });

      // 移除密码字段
      const usersWithoutPassword = users.map(({ password, ...user }) => user);

      return {
        success: true,
        data: {
          users: usersWithoutPassword,
          page,
          limit,
          total: await userRepository.count(search),
        },
      };
    } catch (error) {
      console.error('List users error:', error);
      return {
        success: false,
        error: '获取用户列表失败',
        code: 500,
      };
    }
  }

  /**
   * 创建OAuth用户（无密码）
   */
  async createOAuthUser(data: {
    email: string;
    name?: string;
    image?: string;
    provider: string;
  }): Promise<ServiceResponse> {
    try {
      // 1. 检查用户是否已存在
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          error: '用户已存在',
          code: 400,
        };
      }

      // 2. 创建用户（OAuth用户不需要密码）
      const newUser = await userRepository.create({
        email: data.email,
        name: data.name || data.email.split('@')[0],
        image: data.image,
        email_verified: new Date(), // OAuth用户自动验证邮箱
      });

      // 3. 分配默认角色
      if (permissionConfig.enabled) {
        const isSuperAdmin = permissionConfig.superAdminEmails.includes(data.email);
        const roleName = isSuperAdmin ? 'super_admin' : permissionConfig.defaultRole;
        
        const role = await roleRepository.findByName(roleName);
        if (role) {
          await roleRepository.assignToUser(newUser.id, role.id);
        }
      }

      // 4. 返回结果
      const { password: _, ...userWithoutPassword } = newUser;
      
      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Create OAuth user error:', error);
      return {
        success: false,
        error: '创建用户失败',
        code: 500,
      };
    }
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<any> {
    try {
      const user = await userRepository.findByEmail(email);
      return user;
    } catch (error) {
      console.error('Find user by email error:', error);
      return null;
    }
  }

  /**
   * 更新最后活动时间
   */
  async updateLastActivity(userId: string): Promise<void> {
    try {
      await userRepository.updateLastLogin(userId);
    } catch (error) {
      console.error('Update last activity error:', error);
    }
  }

  /**
   * 更改密码
   */
  async changePassword(
    userId: string, 
    oldPassword: string, 
    newPassword: string
  ): Promise<ServiceResponse> {
    try {
      // 1. 获取用户
      const user = await userRepository.findById(userId);
      if (!user || !user.password) {
        return {
          success: false,
          error: '用户不存在',
          code: 404,
        };
      }

      // 2. 验证旧密码
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        return {
          success: false,
          error: '原密码错误',
          code: 400,
        };
      }

      // 3. 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 4. 更新密码
      await userRepository.update(userId, { password: hashedPassword });

      return {
        success: true,
        data: { message: '密码已更新' },
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: '更改密码失败',
        code: 500,
      };
    }
  }
}

// 导出服务实例
export const userService = new UserService();