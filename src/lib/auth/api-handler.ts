import { NextRequest, NextResponse } from 'next/server';
import { rbacRepository } from '@/repositories/rbac.repository';
import { hasPermission } from './permissions';
import { getAuthSession, AuthSession } from './unified-auth';

type ApiHandler = (
  request: NextRequest,
  context?: { params: any }
) => Promise<NextResponse> | NextResponse;

interface AuthOptions {
  permissions?: string | string[];
  requireAll?: boolean;
  allowPublic?: boolean;
}

/**
 * 统一的 API 路由权限装饰器
 *
 * @example
 * export const GET = withAuth(
 *   async (request, { user, permissions }) => {
 *     // 业务逻辑，user 和 permissions 已经验证过
 *     return NextResponse.json({ data: 'success' });
 *   },
 *   { permissions: [PERMISSIONS.USER_VIEW] }
 * );
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: {
      params?: any;
      user: AuthSession['user'] | null;
      permissions: string[];
    }
  ) => Promise<NextResponse> | NextResponse,
  options: AuthOptions = {}
): ApiHandler {
  return async (request: NextRequest, context?: { params: any }) => {
    try {
      // 公开接口直接通过
      if (options.allowPublic) {
        const mockContext = {
          params: context?.params,
          user: null,
          permissions: []
        };
        return await handler(request, mockContext);
      }

      // 使用统一身份验证 - 支持 Cookie 和 Authorization Bearer Token
      const session = await getAuthSession(request);
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }

      // 检查权限
      let userPermissions: string[] = [];
      if (options.permissions) {
        userPermissions = await rbacRepository.getUserPermissions(session.user.id);
        const requiredPermissions = Array.isArray(options.permissions)
          ? options.permissions
          : [options.permissions];

        const hasRequiredPermission = hasPermission(
          userPermissions,
          requiredPermissions,
          { requireAll: options.requireAll }
        );

        if (!hasRequiredPermission) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // 执行业务逻辑
      const handlerContext = {
        params: context?.params,
        user: session.user,
        permissions: userPermissions
      };

      return await handler(request, handlerContext);

    } catch (error) {
      console.error('API handler error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

/**
 * 快捷权限装饰器
 */
export const withUserView = (handler: ApiHandler) =>
  withAuth(handler, { permissions: ['user:view'] });

export const withUserCreate = (handler: ApiHandler) =>
  withAuth(handler, { permissions: ['user:create'] });

export const withRoleManage = (handler: ApiHandler) =>
  withAuth(handler, { permissions: ['role:create', 'role:update'], requireAll: true });

export const withPublicAccess = (handler: ApiHandler) =>
  withAuth(handler, { allowPublic: true });