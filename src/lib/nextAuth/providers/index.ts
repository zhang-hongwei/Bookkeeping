import type { Provider } from "next-auth/providers";

// 导入各个提供商
import credentialsProvider from "./credentials";
import githubProvider from "./github";
import googleProvider from "./google";

export interface AuthProvider {
  id: string;
  provider: Provider;
  enabled: boolean;
}

// 统一管理所有认证提供商
export const authProviders: AuthProvider[] = [
  credentialsProvider,
  githubProvider,
  googleProvider,
].filter((p) => p.enabled); // 只返回启用的提供商

// 导出启用的提供商
export const enabledProviders = authProviders.map((p) => p.provider);

export default enabledProviders;
