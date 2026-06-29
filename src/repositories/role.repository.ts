/**
 * 角色数据仓库层
 * 封装所有角色相关的数据库操作
 */

import { eq } from 'drizzle-orm';
import { getDb } from '@/database/client';
import { roles, userRoles } from '@/database/schema/auth';
import type { Role, NewRole } from '@/database/schema/auth';

class RoleRepository {
  private db = getDb();

  /**
   * 根据名称查找角色
   */
  async findByName(name: string): Promise<Role | null> {
    const [role] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);
    
    return role ?? null;
  }

  /**
   * 根据ID查找角色
   */
  async findById(id: string): Promise<Role | null> {
    const [role] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);
    
    return role ?? null;
  }

  /**
   * 分配角色给用户
   */
  async assignToUser(userId: string, roleId: string, assignedBy?: string): Promise<void> {
    await this.db
      .insert(userRoles)
      .values({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy,
      })
      .onConflictDoNothing(); // 避免重复分配
  }

  /**
   * 移除用户的角色
   */
  async removeFromUser(userId: string, roleId: string): Promise<void> {
    await this.db
      .delete(userRoles)
      .where(
        eq(userRoles.user_id, userId) && 
        eq(userRoles.role_id, roleId)
      );
  }

  /**
   * 获取用户的所有角色
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const result = await this.db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        is_system: roles.is_system,
        created_at: roles.created_at,
        updated_at: roles.updated_at,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.role_id, roles.id))
      .where(eq(userRoles.user_id, userId));
    
    return result;
  }

  /**
   * 创建角色
   */
  async create(data: Omit<NewRole, 'id' | 'created_at' | 'updated_at'>): Promise<Role> {
    const [role] = await this.db
      .insert(roles)
      .values(data)
      .returning();
    
    if (!role) {
      throw new Error('Failed to create role');
    }
    
    return role;
  }

  /**
   * 更新角色
   */
  async update(id: string, data: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>): Promise<Role | null> {
    const [role] = await this.db
      .update(roles)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();
    
    return role ?? null;
  }

  /**
   * 删除角色
   */
  async delete(id: string): Promise<void> {
    // 检查是否为系统角色
    const role = await this.findById(id);
    if (role?.is_system) {
      throw new Error('Cannot delete system role');
    }

    await this.db
      .delete(roles)
      .where(eq(roles.id, id));
  }

  /**
   * 获取所有角色
   */
  async list(): Promise<Role[]> {
    return await this.db
      .select()
      .from(roles)
      .orderBy(roles.created_at);
  }
}

// 导出仓库实例
export const roleRepository = new RoleRepository();