export * from "./client";
export * as schema from "./schema";
// Queries have been moved to services and repositories
// Use: import { userService } from '@/services/user.service'

// 为了兼容原来的 @/db 引用，导出 db 实例和 users schema
import { getDb } from "./client";
export const db = getDb();

// 直接导出 users 相关的 schema 以便于引用
export { users, sessions, accounts, verificationTokens, insertUserSchema, selectUserSchema, type User, type NewUser } from "./schema/users";
