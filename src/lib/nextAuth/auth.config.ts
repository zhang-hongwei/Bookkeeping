import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // 密钥配置
  secret: process.env.NEXT_AUTH_SECRET || process.env.AUTH_SECRET,

  // 会话配置
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30天
    updateAge: 24 * 60 * 60, // 24小时更新一次
  },

  // 页面路由
  pages: {
    signIn: "/signin",
    signOut: "/auth/signout",
    // error: "/error", // 注释掉，让错误在登录页面处理
    verifyRequest: "/auth/verify-request",
  },

  // Cookie配置
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // 调试配置
  debug: process.env.NODE_ENV === "development",

  // 信任主机
  trustHost: process.env.AUTH_TRUST_HOST === "true",

  // 回调配置
  callbacks: {
    async jwt({ token, user, account }) {
      // JWT处理逻辑
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }

      return token;
    },

    async session({ session, token }) {
      // Session处理逻辑
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.provider = token.provider as string;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // 重定向逻辑
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // 事件处理
  events: {
    async signIn({ user, account }) {
      console.log(`[AUTH] 用户登录: ${user.email} via ${account?.provider}`);
    },

    async signOut({ session }) {
      console.log(`[AUTH] 用户登出: ${session?.user?.email || "unknown"}`);
    },

    async createUser({ user }) {
      console.log(`[AUTH] 新用户创建: ${user.email}`);
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
