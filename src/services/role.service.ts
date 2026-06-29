import { roleRepository } from '@/repositories/role.repository';
import type { Role, NewRole } from '@/database/schema/auth';

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

class RoleService {
  async findById(id: string): Promise<ServiceResponse<Role>> {
    try {
      const role = await roleRepository.findById(id);

      if (!role) {
        return {
          success: false,
          error: '角色不存在',
          code: 404,
        };
      }

      return {
        success: true,
        data: role,
      };
    } catch (error) {
      console.error('Get role error:', error);
      return {
        success: false,
        error: '获取角色失败',
        code: 500,
      };
    }
  }

  async findByName(name: string): Promise<ServiceResponse<Role>> {
    try {
      const role = await roleRepository.findByName(name);

      if (!role) {
        return {
          success: false,
          error: '角色不存在',
          code: 404,
        };
      }

      return {
        success: true,
        data: role,
      };
    } catch (error) {
      console.error('Find role by name error:', error);
      return {
        success: false,
        error: '查找角色失败',
        code: 500,
      };
    }
  }

  async create(data: Omit<NewRole, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Role>> {
    try {
      // 检查角色名是否已存在
      const existingRole = await roleRepository.findByName(data.name);
      if (existingRole) {
        return {
          success: false,
          error: '角色名已存在',
          code: 400,
        };
      }

      const role = await roleRepository.create(data);

      return {
        success: true,
        data: role,
      };
    } catch (error) {
      console.error('Create role error:', error);
      return {
        success: false,
        error: '创建角色失败',
        code: 500,
      };
    }
  }

  async update(
    id: string,
    data: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<ServiceResponse<Role>> {
    try {
      // 检查角色是否存在
      const existingRole = await roleRepository.findById(id);
      if (!existingRole) {
        return {
          success: false,
          error: '角色不存在',
          code: 404,
        };
      }

      // 如果更新名称，检查是否与其他角色重复
      if (data.name && data.name !== existingRole.name) {
        const nameExists = await roleRepository.findByName(data.name);
        if (nameExists) {
          return {
            success: false,
            error: '角色名已存在',
            code: 400,
          };
        }
      }

      const updatedRole = await roleRepository.update(id, data);

      if (!updatedRole) {
        return {
          success: false,
          error: '更新失败',
          code: 500,
        };
      }

      return {
        success: true,
        data: updatedRole,
      };
    } catch (error) {
      console.error('Update role error:', error);
      return {
        success: false,
        error: '更新角色失败',
        code: 500,
      };
    }
  }

  async delete(id: string): Promise<ServiceResponse> {
    try {
      const role = await roleRepository.findById(id);
      if (!role) {
        return {
          success: false,
          error: '角色不存在',
          code: 404,
        };
      }

      if (role.is_system) {
        return {
          success: false,
          error: '不能删除系统角色',
          code: 400,
        };
      }

      await roleRepository.delete(id);

      return {
        success: true,
        data: { message: '角色已删除' },
      };
    } catch (error) {
      console.error('Delete role error:', error);
      return {
        success: false,
        error: '删除角色失败',
        code: 500,
      };
    }
  }

  async list(): Promise<ServiceResponse<Role[]>> {
    try {
      const roles = await roleRepository.list();

      return {
        success: true,
        data: roles,
      };
    } catch (error) {
      console.error('List roles error:', error);
      return {
        success: false,
        error: '获取角色列表失败',
        code: 500,
      };
    }
  }

  async assignToUser(userId: string, roleId: string, assignedBy?: string): Promise<ServiceResponse> {
    try {
      // 检查角色是否存在
      const role = await roleRepository.findById(roleId);
      if (!role) {
        return {
          success: false,
          error: '角色不存在',
          code: 404,
        };
      }

      await roleRepository.assignToUser(userId, roleId, assignedBy);

      return {
        success: true,
        data: { message: '角色分配成功' },
      };
    } catch (error) {
      console.error('Assign role to user error:', error);
      return {
        success: false,
        error: '分配角色失败',
        code: 500,
      };
    }
  }

  async removeFromUser(userId: string, roleId: string): Promise<ServiceResponse> {
    try {
      await roleRepository.removeFromUser(userId, roleId);

      return {
        success: true,
        data: { message: '角色移除成功' },
      };
    } catch (error) {
      console.error('Remove role from user error:', error);
      return {
        success: false,
        error: '移除角色失败',
        code: 500,
      };
    }
  }

  async getUserRoles(userId: string): Promise<ServiceResponse<Role[]>> {
    try {
      const roles = await roleRepository.getUserRoles(userId);

      return {
        success: true,
        data: roles,
      };
    } catch (error) {
      console.error('Get user roles error:', error);
      return {
        success: false,
        error: '获取用户角色失败',
        code: 500,
      };
    }
  }
}

export const roleService = new RoleService();