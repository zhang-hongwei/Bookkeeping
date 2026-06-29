import { eq, and, inArray, sql } from 'drizzle-orm';
import { getDb } from '@/database/client';
import {
  roles,
  permissions,
  userRoles,
  rolePermissions,
  type NewRole,
  type NewPermission,
  type Role,
  type Permission
} from '@/database/schema/auth';
import {
  userPermissions,
  resources
} from '@/database/schema/rbac-extra';

class RbacRepository {
  private db = getDb();

  // ========== 权限相关方法 ==========

  async createPermission(data: NewPermission): Promise<Permission> {
    const [permission] = await this.db.insert(permissions).values(data).returning();
    return permission;
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    const [permission] = await this.db.select().from(permissions).where(eq(permissions.id, id));
    return permission ?? null;
  }

  async getPermissionByCode(code: string): Promise<Permission | null> {
    const [permission] = await this.db.select().from(permissions).where(eq(permissions.code, code));
    return permission ?? null;
  }

  async listPermissions(): Promise<Permission[]> {
    return this.db.select().from(permissions).orderBy(permissions.created_at);
  }

  // ========== 角色权限关联 ==========

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await this.db.insert(rolePermissions).values({
      role_id: roleId,
      permission_id: permissionId,
    }).onConflictDoNothing();
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.db.delete(rolePermissions).where(
      and(
        eq(rolePermissions.role_id, roleId),
        eq(rolePermissions.permission_id, permissionId)
      )
    );
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    return this.db
      .select({
        id: permissions.id,
        code: permissions.code,
        name: permissions.name,
        resource: permissions.resource,
        action: permissions.action,
        description: permissions.description,
        created_at: permissions.created_at,
        updated_at: permissions.updated_at,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permission_id, permissions.id))
      .where(eq(rolePermissions.role_id, roleId));
  }

  // ========== 用户权限查询（组合） ==========

  async getUserPermissions(userId: string): Promise<string[]> {
    // 1. 获取用户的所有角色
    const userRolesList = await this.db
      .select({ id: roles.id, name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.role_id, roles.id))
      .where(eq(userRoles.user_id, userId));

    const roleIds = userRolesList.map(r => r.id);

    if (roleIds.length === 0) {
      // 如果用户没有角色，只返回直接权限
      const directPerms = await this.db
        .select({ code: permissions.code })
        .from(userPermissions)
        .innerJoin(permissions, eq(userPermissions.permission_id, permissions.id))
        .where(eq(userPermissions.user_id, userId));

      return directPerms.map(p => p.code);
    }

    // 2. 获取角色的权限
    const rolePerms = await this.db
      .select({ code: permissions.code })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permission_id, permissions.id))
      .where(inArray(rolePermissions.role_id, roleIds));

    // 3. 获取用户的直接权限
    const directPerms = await this.db
      .select({ code: permissions.code })
      .from(userPermissions)
      .innerJoin(permissions, eq(userPermissions.permission_id, permissions.id))
      .where(eq(userPermissions.user_id, userId));

    // 4. 合并并去重
    const allPermissions = new Set<string>();
    rolePerms.forEach(p => allPermissions.add(p.code));
    directPerms.forEach(p => allPermissions.add(p.code));

    // 5. 检查是否有超级管理员角色
    const isSuperAdmin = userRolesList.some(r => r.name === 'super_admin');
    if (isSuperAdmin) {
      return ['*']; // 返回所有权限通配符
    }

    return Array.from(allPermissions);
  }

  // ========== 用户直接权限 ==========

  async grantPermissionToUser(
    userId: string,
    permissionId: string,
    resourceId?: string,
    grantedBy?: string
  ): Promise<void> {
    await this.db.insert(userPermissions).values({
      user_id: userId,
      permission_id: permissionId,
      resource_id: resourceId,
      granted_by: grantedBy,
    }).onConflictDoNothing();
  }

  async revokePermissionFromUser(
    userId: string,
    permissionId: string,
    resourceId?: string
  ): Promise<void> {
    const conditions = [
      eq(userPermissions.user_id, userId),
      eq(userPermissions.permission_id, permissionId),
    ];

    if (resourceId) {
      conditions.push(eq(userPermissions.resource_id, resourceId));
    }

    await this.db.delete(userPermissions).where(and(...conditions));
  }

  // ========== 资源权限 ==========

  async createResource(
    type: string,
    resourceId: string,
    ownerId: string
  ) {
    const [resource] = await this.db.insert(resources).values({
      type,
      resource_id: resourceId,
      owner_id: ownerId,
    }).returning();
    return resource;
  }

  async getResourceOwner(type: string, resourceId: string): Promise<string | null> {
    const [resource] = await this.db
      .select({ owner_id: resources.owner_id })
      .from(resources)
      .where(
        and(
          eq(resources.type, type),
          eq(resources.resource_id, resourceId)
        )
      );
    return resource?.owner_id ?? null;
  }

  async checkUserPermission(
    userId: string,
    permissionCode: string,
    resourceType?: string,
    resourceId?: string
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);

    // 超级管理员
    if (userPermissions.includes('*')) {
      return true;
    }

    // 检查通配符权限
    const parts = permissionCode.split(':');
    if (parts.length > 1) {
      const wildcardPerm = parts[0] + ':*';
      if (userPermissions.includes(wildcardPerm)) {
        return true;
      }
    }

    // 标准权限检查
    if (userPermissions.includes(permissionCode)) {
      return true;
    }

    // 检查所有权限
    if (resourceType && resourceId) {
      const ownPermission = permissionCode + ':own';
      if (userPermissions.includes(ownPermission)) {
        const ownerId = await this.getResourceOwner(resourceType, resourceId);
        return ownerId === userId;
      }
    }

    return false;
  }
}

export const rbacRepository = new RbacRepository();