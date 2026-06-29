/**
 * 用户数据仓库层
 * 封装所有用户相关的数据库操作
 * 
 * 主要修复:
 * 1. 修复排序字段动态访问的类型安全问题，使用显式字段映射
 * 2. 使用 inArray() 替代原始 SQL 的数组查询，提升类型安全
 * 3. 确保数值类型转换的类型安全 (Number())
 * 4. 简化事务回调的类型定义，避免复杂类型推导错误
 * 5. 添加显式返回类型注解以提升类型检查
 */

import { eq, like, and, or, sql, inArray } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import { getDb, type DB } from '@/database/client';
import { users, type NewUser, type User } from '@/database/schema/users';

class UserRepository {
  private db = getDb();

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    return user ?? null;
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return user ?? null;
  }

  /**
   * 创建用户
   */
  async create(data: Omit<NewUser, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values(data)
      .returning();
    
    if (!user) {
      throw new Error('Failed to create user');
    }
    
    return user;
  }

  /**
   * 更新用户
   */
  async update(id: string, data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
    const [user] = await this.db
      .update(users)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return user ?? null;
  }

  /**
   * 删除用户
   */
  async delete(id: string): Promise<void> {
    await this.db
      .delete(users)
      .where(eq(users.id, id));
  }

  /**
   * 获取用户列表
   */
  async list(options?: {
    offset?: number;
    limit?: number;
    search?: string;
    orderBy?: 'created_at' | 'updated_at' | 'name' | 'email';
    order?: 'asc' | 'desc';
  }): Promise<User[]> {
    const { 
      offset = 0, 
      limit = 10, 
      search,
      orderBy = 'created_at',
      order = 'desc' 
    } = options || {};

    let query = this.db.select().from(users);

    // 搜索条件
    if (search) {
      query = query.where(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    // 排序 - 使用类型安全的方式
    if (orderBy === 'created_at') {
      query = order === 'desc' 
        ? query.orderBy(sql`${users.created_at} DESC`)
        : query.orderBy(users.created_at);
    } else if (orderBy === 'updated_at') {
      query = order === 'desc' 
        ? query.orderBy(sql`${users.updated_at} DESC`)
        : query.orderBy(users.updated_at);
    } else if (orderBy === 'name') {
      query = order === 'desc' 
        ? query.orderBy(sql`${users.name} DESC`)
        : query.orderBy(users.name);
    } else if (orderBy === 'email') {
      query = order === 'desc' 
        ? query.orderBy(sql`${users.email} DESC`)
        : query.orderBy(users.email);
    }

    // 分页
    query = query.limit(limit).offset(offset);

    return await query;
  }

  /**
   * 统计用户数量
   */
  async count(search?: string): Promise<number> {
    let query = this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    if (search) {
      query = query.where(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    const [result] = await query;
    return Number(result?.count) || 0;
  }

  /**
   * 批量查找用户
   */
  async findByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }

    return await this.db
      .select()
      .from(users)
      .where(inArray(users.id, ids));
  }

  /**
   * 检查邮箱是否存在
   */
  async emailExists(email: string): Promise<boolean> {
    const [result] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.email, email));
    
    return Number(result?.count || 0) > 0;
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        updated_at: new Date(),
      })
      .where(eq(users.id, id));
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(id: string): Promise<User | null> {
    const [user] = await this.db
      .update(users)
      .set({
        email_verified: new Date(),
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return user ?? null;
  }

  /**
   * 事务示例：创建用户并分配角色
   */
  async createWithTransaction(
    userData: Omit<NewUser, 'id' | 'created_at' | 'updated_at'>,
    callback?: (userId: string, tx: any) => Promise<void>
  ): Promise<User> {
    // Drizzle ORM 事务支持
    return await this.db.transaction(async (tx) => {
      // 1. 创建用户
      const [user] = await tx
        .insert(users)
        .values(userData)
        .returning();
      
      if (!user) {
        throw new Error('Failed to create user');
      }

      // 2. 执行额外操作（如分配角色）
      if (callback) {
        await callback(user.id, tx);
      }

      return user;
    });
  }
}

// 导出仓库实例
export const userRepository = new UserRepository();