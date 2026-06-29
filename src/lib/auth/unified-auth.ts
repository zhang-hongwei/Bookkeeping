import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/lib/nextAuth";

/**
 * 统一身份验证助手
 * 支持 Cookie 和 Authorization Bearer Token 两种认证方式
 */

export interface AuthSession {
  user: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
    role?: string;
  };
}

/**
 * 获取用户会话 - 支持 Cookie 和 Authorization Bearer Token
 *
 * @param request NextRequest 对象（可选，如果提供则优先检查 Authorization header）
 * @returns 用户会话信息或 null
 */
export async function getAuthSession(
  request?: NextRequest
): Promise<AuthSession | null> {
  // 如果提供了 request，先尝试从 Authorization header 获取 token
  if (request) {
    try {
      // 使用 NextAuth 的 getToken 助手，它会自动检查：
      // 1. Authorization Bearer token
      // 2. Cookie 中的 session token
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (token) {
        return {
          user: {
            id: token.sub as string,
            email: token.email as string,
            name: token.name as string,
            image: token.picture as string,
            role: token.role as string,
          },
        };
      }
    } catch (error) {
      console.error("Token validation error:", error);
    }
  }

  // 如果没有 request 或者 token 验证失败，回退到传统的 session 检查
  try {
    const session = await auth();
    if (session?.user) {
      return {
        user: {
          id: session.user.id,
          email: session.user.email || undefined,
          name: session.user.name || undefined,
          image: session.user.image || undefined,
          role: session.user.role || undefined,
        },
      };
    }
  } catch (error) {
    console.error("Session validation error:", error);
  }

  return null;
}

/**
 * 验证请求的身份验证状态
 *
 * @param request NextRequest 对象
 * @returns 验证结果和用户信息
 */
export async function validateAuth(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  session: AuthSession | null;
  authMethod: "cookie" | "bearer" | null;
}> {
  // 检查 Authorization header
  const authHeader = request.headers.get("authorization");
  const hasBearerToken = authHeader?.startsWith("Bearer ");

  // 检查 Cookie
  const sessionCookie =
    request.cookies.get("nextAuth.session-token")?.value ||
    request.cookies.get("__Secure-nextAuth.session-token")?.value;

  const session = await getAuthSession(request);

  let authMethod: "cookie" | "bearer" | null = null;
  if (session) {
    authMethod = hasBearerToken ? "bearer" : sessionCookie ? "cookie" : null;
  }

  return {
    isAuthenticated: !!session,
    session,
    authMethod,
  };
}

/**
 * 提取 Bearer Token 从 Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}
