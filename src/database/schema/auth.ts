import { pgTable, varchar, timestamp, text, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users';

// 角色表
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  description: text('description'),
  is_system: boolean('is_system').default(false).notNull(), // 系统角色不可删除
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 权限表
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).unique().notNull(), // 权限代码，如 'user:write'
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  resource: varchar('resource', { length: 50 }), // 资源类型 (users, meals, etc.)
  action: varchar('action', { length: 50 }), // 操作类型 (create, read, update, delete)
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 用户角色关联表
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role_id: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  assigned_by: uuid('assigned_by').references(() => users.id),
  assigned_at: timestamp('assigned_at').defaultNow().notNull(),
  expires_at: timestamp('expires_at'), // 角色过期时间，null表示永不过期
});

// 角色权限关联表
export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  role_id: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  permission_id: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 用户会员信息表
export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 20 }).default('basic').notNull(), // basic, premium, vip
  points: integer('points').default(0).notNull(),
  start_date: timestamp('start_date').defaultNow().notNull(),
  end_date: timestamp('end_date'), // 会员到期时间，null表示永不过期
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 用户偏好设置表
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  theme: varchar('theme', { length: 20 }).default('system'), // light, dark, system
  language: varchar('language', { length: 10 }).default('zh-CN'),
  font_size: varchar('font_size', { length: 20 }).default('medium'), // small, medium, large
  notifications: boolean('notifications').default(true),
  vibration: boolean('vibration').default(true),
  animations: boolean('animations').default(true),
  compact_mode: boolean('compact_mode').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 用户健康目标表
export const healthGoals = pgTable('health_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  objective: varchar('objective', { length: 20 }).default('maintain').notNull(), // lose, maintain, gain
  target_weight: integer('target_weight'), // 目标体重 (kg * 10, 存储为整数)
  target_date: timestamp('target_date'),
  daily_calories: integer('daily_calories').default(2000).notNull(),
  activity_level: varchar('activity_level', { length: 20 }).default('moderate'), // sedentary, light, moderate, active, very-active
  protein_ratio: integer('protein_ratio').default(25), // 蛋白质比例 (%)
  carbs_ratio: integer('carbs_ratio').default(50), // 碳水化合物比例 (%)
  fat_ratio: integer('fat_ratio').default(25), // 脂肪比例 (%)
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertRoleSchema = createInsertSchema(roles);
export const selectRoleSchema = createSelectSchema(roles);

export const insertPermissionSchema = createInsertSchema(permissions);
export const selectPermissionSchema = createSelectSchema(permissions);

export const insertUserRoleSchema = createInsertSchema(userRoles);
export const selectUserRoleSchema = createSelectSchema(userRoles);

export const insertMembershipSchema = createInsertSchema(memberships);
export const selectMembershipSchema = createSelectSchema(memberships);

export const insertUserPreferencesSchema = createInsertSchema(userPreferences);
export const selectUserPreferencesSchema = createSelectSchema(userPreferences);

export const insertHealthGoalsSchema = createInsertSchema(healthGoals);
export const selectHealthGoalsSchema = createSelectSchema(healthGoals);

// 类型导出
export type Role = z.infer<typeof selectRoleSchema>;
export type NewRole = z.infer<typeof insertRoleSchema>;

export type Permission = z.infer<typeof selectPermissionSchema>;
export type NewPermission = z.infer<typeof insertPermissionSchema>;

export type UserRole = z.infer<typeof selectUserRoleSchema>;
export type NewUserRole = z.infer<typeof insertUserRoleSchema>;

export type Membership = z.infer<typeof selectMembershipSchema>;
export type NewMembership = z.infer<typeof insertMembershipSchema>;

export type UserPreferences = z.infer<typeof selectUserPreferencesSchema>;
export type NewUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type HealthGoals = z.infer<typeof selectHealthGoalsSchema>;
export type NewHealthGoals = z.infer<typeof insertHealthGoalsSchema>;