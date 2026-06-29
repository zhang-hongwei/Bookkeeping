/**
 * NextAuth.js v5 主配置文件
 *
 * 位置要求：
 * - 必须放在项目根目录（NextAuth.js v5 约定）
 * - 被 middleware.ts 和 API 路由引用
 *
 * 功能：
 * 1. 重新导出 NextAuth 核心函数
 * 2. 提供 TypeScript 类型扩展
 */

// 导出 NextAuth 配置（实际配置在 src/lib/nextAuth 中）
export { handlers, auth, signIn, signOut } from "./src/lib/nextAuth";

// TypeScript 类型扩展
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      provider?: string;
    };
  }

  interface User {
    provider?: string;
  }
}
