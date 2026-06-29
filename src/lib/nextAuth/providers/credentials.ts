import Credentials from "next-auth/providers/credentials";
import { authService } from "@/services/auth.service";

/**
 * Credentials Provider 配置
 * 使用 service 层处理认证逻辑
 */
const provider = {
  id: "credentials",
  enabled: true, // 自建验证系统默认启用
  provider: Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      // 调用认证服务验证凭据
      return await authService.validateCredentials(credentials);
    },
  }),
};

export default provider;
