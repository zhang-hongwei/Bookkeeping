/**
 * RBAC系统种子数据
 * 初始化默认角色和权限
 */

import { db } from './client';
import { roles, permissions, rolePermissions } from './schema/auth';
import { PERMISSIONS, DEFAULT_ROLES } from '@/lib/auth/permissions';
import { getInitialPermissions, getInitialRoles } from '@/config/permissions.config';

export async function seedRBAC() {
  console.log('🌱 开始种子数据初始化...');
  
  try {
    // 1. 创建权限
    console.log('📝 创建权限...');
    const permissionData = await getInitialPermissions();
    const createdPermissions: Record<string, string> = {};
    
    for (const perm of permissionData) {
      // 检查权限是否已存在
      const existing = await db
        .select()
        .from(permissions)
        .where((p) => p.code === perm.code)
        .limit(1);
      
      if (existing.length === 0) {
        const [created] = await db
          .insert(permissions)
          .values({
            code: perm.code,
            name: perm.name,
            description: perm.description,
            resource: perm.resource,
            action: perm.action,
          })
          .returning();
        
        createdPermissions[perm.code] = created.id;
        console.log(`  ✅ 创建权限: ${perm.code}`);
      } else {
        createdPermissions[perm.code] = existing[0].id;
        console.log(`  ⏭️  权限已存在: ${perm.code}`);
      }
    }
    
    // 2. 创建角色
    console.log('👥 创建角色...');
    const roleData = await getInitialRoles();
    
    for (const roleInfo of roleData) {
      // 检查角色是否已存在
      const existingRole = await db
        .select()
        .from(roles)
        .where((r) => r.name === roleInfo.name)
        .limit(1);
      
      let roleId: string;
      
      if (existingRole.length === 0) {
        const [createdRole] = await db
          .insert(roles)
          .values({
            name: roleInfo.name,
            description: roleInfo.description,
            is_system: roleInfo.is_system,
          })
          .returning();
        
        roleId = createdRole.id;
        console.log(`  ✅ 创建角色: ${roleInfo.name}`);
      } else {
        roleId = existingRole[0].id;
        console.log(`  ⏭️  角色已存在: ${roleInfo.name}`);
        continue; // 如果角色已存在，跳过权限分配
      }
      
      // 3. 分配权限给角色
      console.log(`  📎 为角色 ${roleInfo.name} 分配权限...`);
      
      // 处理超级管理员的通配符权限
      if (roleInfo.permissions.includes('*')) {
        // 分配所有权限
        for (const [code, permId] of Object.entries(createdPermissions)) {
          await db
            .insert(rolePermissions)
            .values({
              role_id: roleId,
              permission_id: permId,
            })
            .onConflictDoNothing();
        }
        console.log(`    ✅ 分配了所有权限`);
      } else {
        // 分配指定权限
        for (const permCode of roleInfo.permissions) {
          const permId = createdPermissions[permCode];
          if (permId) {
            await db
              .insert(rolePermissions)
              .values({
                role_id: roleId,
                permission_id: permId,
              })
              .onConflictDoNothing();
            console.log(`    ✅ 分配权限: ${permCode}`);
          } else {
            console.log(`    ⚠️  权限未找到: ${permCode}`);
          }
        }
      }
    }
    
    console.log('✨ RBAC种子数据初始化完成！');
    
    // 4. 显示统计信息
    const roleCount = await db.select().from(roles);
    const permCount = await db.select().from(permissions);
    
    console.log('\n📊 统计信息:');
    console.log(`  - 角色总数: ${roleCount.length}`);
    console.log(`  - 权限总数: ${permCount.length}`);
    
  } catch (error) {
    console.error('❌ 种子数据初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此文件，执行种子数据初始化
if (require.main === module) {
  seedRBAC()
    .then(() => {
      console.log('✅ 种子数据初始化成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 种子数据初始化失败:', error);
      process.exit(1);
    });
}