import NextAuth from "next-auth";
import { authService } from "@/services/auth.service";

// 导入配置和providers
import { enabledProviders } from "./providers";
import authConfig from "./auth.config";

/**
 * next-auth v5 配置
 *
 * 特性：
 * - 支持自建验证系统（用户名密码）
 * - 支持第三方 OAuth（GitHub、Google等）
 * - JWT 会话策略
 * - 自动用户数据同步
 */
export const nextAuth = NextAuth({
  ...authConfig,
  providers: enabledProviders,

  callbacks: {
    ...authConfig.callbacks,

    // 扩展 JWT 回调，处理 OAuth 用户数据
    async jwt({ token, user, account }) {
      // 调用基础配置的 JWT 回调
      token =
        (await authConfig.callbacks?.jwt?.({ token, user, account })) || token;

      // 处理 OAuth 用户数据同步到数据库
      if (account && user && account.provider !== "credentials") {
        try {
          const authUser = await authService.handleOAuthLogin({
            email: user.email!,
            name: user.name,
            image: user.image,
            provider: account.provider,
          });

          token.id = authUser.id;
          token.provider = authUser.provider;
        } catch (error) {
          console.error("OAuth login error:", error);
          // 如果处理失败，继续使用现有token
        }
      }

      return token;
    },
  },
});

// 导出 NextAuth 方法
export const { handlers, auth, signIn, signOut } = nextAuth;

export default nextAuth;
