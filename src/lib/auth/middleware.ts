import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/nextAuth";
import { rbacRepository } from "@/repositories/rbac.repository";
import { hasPermission } from "./permissions";

export interface AuthMiddlewareOptions {
  permissions?: string | string[];
  requireAll?: boolean;
  redirectTo?: string;
  checkOwnership?: boolean;
  resourceType?: string;
  resourceIdParam?: string;
}

/**
 * 创建认证中间件
 */
export function withAuth(options: AuthMiddlewareOptions = {}) {
  return async function middleware(request: NextRequest) {
    const session = await auth();

    // 检查是否登录
    if (!session?.user) {
      const redirectUrl = options.redirectTo || "/signin";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // 如果没有指定权限要求，只检查登录状态
    if (!options.permissions) {
      return NextResponse.next();
    }

    // 获取用户权限
    const userPermissions = await rbacRepository.getUserPermissions(
      session.user.id
    );

    // 检查权限
    const requiredPermissions = Array.isArray(options.permissions)
      ? options.permissions
      : [options.permissions];

    // 检查所有权（如果需要）
    if (
      options.checkOwnership &&
      options.resourceType &&
      options.resourceIdParam
    ) {
      const resourceId =
        request.nextUrl.searchParams.get(options.resourceIdParam) ||
        request.nextUrl.pathname.split("/").pop();

      if (resourceId) {
        const hasAccess = await rbacRepository.checkUserPermission(
          session.user.id,
          requiredPermissions[0],
          options.resourceType,
          resourceId
        );

        if (hasAccess) {
          return NextResponse.next();
        }
      }
    }

    // 标准权限检查
    const hasRequiredPermission = hasPermission(
      userPermissions,
      requiredPermissions,
      { requireAll: options.requireAll }
    );

    if (!hasRequiredPermission) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  };
}

/**
 * API路由权限装饰器
 */
export function withPermissions(
  permissions: string | string[],
  options?: Omit<AuthMiddlewareOptions, "permissions">
) {
  return function decorator<T extends (...args: any[]) => any>(handler: T): T {
    return (async (...args: Parameters<T>) => {
      const request = args[0] as NextRequest;
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Authentication required" },
          { status: 401 }
        );
      }

      const userPermissions = await rbacRepository.getUserPermissions(
        session.user.id
      );
      const requiredPermissions = Array.isArray(permissions)
        ? permissions
        : [permissions];

      // 检查所有权
      if (
        options?.checkOwnership &&
        options.resourceType &&
        options.resourceIdParam
      ) {
        const resourceId =
          request.nextUrl.searchParams.get(options.resourceIdParam) ||
          request.nextUrl.pathname.split("/").pop();

        if (resourceId) {
          const hasAccess = await rbacRepository.checkUserPermission(
            session.user.id,
            requiredPermissions[0],
            options.resourceType,
            resourceId
          );

          if (hasAccess) {
            return handler(...args);
          }
        }
      }

      // 标准权限检查
      const hasRequiredPermission = hasPermission(
        userPermissions,
        requiredPermissions,
        { requireAll: options?.requireAll }
      );

      if (!hasRequiredPermission) {
        return NextResponse.json(
          { error: "Forbidden", message: "Insufficient permissions" },
          { status: 403 }
        );
      }

      return handler(...args);
    }) as T;
  };
}

/**
 * 获取当前用户权限（用于API路由）
 */
export async function requirePermissions(
  permissions: string | string[],
  options?: {
    requireAll?: boolean;
    returnError?: boolean;
  }
): Promise<void | NextResponse> {
  const session = await auth();

  if (!session?.user) {
    const error = NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 }
    );

    if (options?.returnError) {
      return error;
    }
    throw error;
  }

  const userPermissions = await rbacRepository.getUserPermissions(
    session.user.id
  );
  const requiredPermissions = Array.isArray(permissions)
    ? permissions
    : [permissions];

  const hasRequiredPermission = hasPermission(
    userPermissions,
    requiredPermissions,
    { requireAll: options?.requireAll }
  );

  if (!hasRequiredPermission) {
    const error = NextResponse.json(
      { error: "Forbidden", message: "Insufficient permissions" },
      { status: 403 }
    );

    if (options?.returnError) {
      return error;
    }
    throw error;
  }
}

/**
 * 获取当前会话和权限
 */
export async function getSessionWithPermissions() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const permissions = await rbacRepository.getUserPermissions(session.user.id);

  return {
    ...session,
    permissions,
  };
}
