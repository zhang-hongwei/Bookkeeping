"use client";

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { hasPermission } from '@/lib/auth/permissions';

interface CanProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
  checkOwnership?: boolean;
  ownerId?: string;
}

/**
 * 权限门组件 - 根据权限显示/隐藏内容
 */
export function Can({
  permission,
  children,
  fallback = null,
  requireAll = false,
  checkOwnership = false,
  ownerId,
}: CanProps) {
  const { permissions, userId, loading } = usePermissions();
  
  if (loading) {
    return null;
  }
  
  const hasRequiredPermission = hasPermission(
    permissions,
    permission,
    {
      requireAll,
      checkOwnership,
      ownerId,
      userId,
    }
  );
  
  return hasRequiredPermission ? <>{children}</> : <>{fallback}</>;
}

interface CannotProps extends Omit<CanProps, 'fallback'> {
  then?: ReactNode;
}

/**
 * 反向权限门组件 - 没有权限时显示内容
 */
export function Cannot({
  permission,
  children,
  then: thenContent,
  requireAll = false,
  checkOwnership = false,
  ownerId,
}: CannotProps) {
  const { permissions, userId, loading } = usePermissions();
  
  if (loading) {
    return null;
  }
  
  const hasRequiredPermission = hasPermission(
    permissions,
    permission,
    {
      requireAll,
      checkOwnership,
      ownerId,
      userId,
    }
  );
  
  return hasRequiredPermission ? <>{thenContent}</> : <>{children}</>;
}

interface ProtectedRouteProps {
  permission?: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
  redirectTo?: string;
}

/**
 * 受保护路由组件
 */
export function ProtectedRoute({
  permission,
  children,
  fallback,
  requireAll = false,
  redirectTo,
}: ProtectedRouteProps) {
  const { permissions, loading, isAuthenticated } = usePermissions();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // 检查是否登录
  if (!isAuthenticated) {
    if (redirectTo) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">未授权访问</h2>
          <p className="text-gray-600">请先登录</p>
        </div>
      </div>
    );
  }
  
  // 如果没有指定权限，只检查登录状态
  if (!permission) {
    return <>{children}</>;
  }
  
  // 检查权限
  const hasRequiredPermission = hasPermission(
    permissions,
    permission,
    { requireAll }
  );
  
  if (!hasRequiredPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">权限不足</h2>
          <p className="text-gray-600">您没有权限访问此页面</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

/**
 * 权限检查工具组件
 */
export function PermissionCheck({
  permissions,
  children,
}: {
  permissions: string[];
  children: (hasPermission: (permission: string | string[]) => boolean) => ReactNode;
}) {
  const checkPermission = (permission: string | string[]): boolean => {
    return hasPermission(permissions, permission);
  };
  
  return <>{children(checkPermission)}</>;
}