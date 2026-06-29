import { pgTable, uuid, varchar, timestamp, primaryKey, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { roles, permissions } from './auth';

// 资源表（可选，用于细粒度权限控制）
export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).notNull(), // 资源类型，如 'document', 'project'
  resource_id: varchar('resource_id', { length: 255 }).notNull(), // 具体资源ID
  owner_id: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueResource: unique().on(table.type, table.resource_id),
}));

// 用户权限（直接赋予，绕过角色）
export const userPermissions = pgTable('user_permissions', {
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  permission_id: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
  resource_id: uuid('resource_id').references(() => resources.id, { onDelete: 'cascade' }),
  granted_at: timestamp('granted_at').defaultNow().notNull(),
  granted_by: uuid('granted_by').references(() => users.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.user_id, table.permission_id] }),
}));