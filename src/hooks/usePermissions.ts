"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { hasPermission as checkPermission } from "@/lib/auth/permissions";

interface UsePermissionsResult {
  permissions: string[];
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  userId?: string;
  hasPermission: (
    permission: string | string[],
    options?: {
      requireAll?: boolean;
      checkOwnership?: boolean;
      ownerId?: string;
    }
  ) => boolean;
  canAccess: (permission: string | string[]) => boolean;
}

/**
 * Hook for managing user permissions
 */
export function usePermissions(): UsePermissionsResult {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (status === "loading") {
        return;
      }

      if (status === "unauthenticated" || !session?.user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/permissions");

        if (!response.ok) {
          throw new Error("Failed to fetch permissions");
        }

        const data = await response.json();
        setPermissions(data.permissions || []);
      } catch (err) {
        console.error("Error fetching permissions:", err);
        setError(err as Error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [session, status]);

  const hasPermission = (
    permission: string | string[],
    options?: {
      requireAll?: boolean;
      checkOwnership?: boolean;
      ownerId?: string;
    }
  ): boolean => {
    return checkPermission(permissions, permission, {
      ...options,
      userId: session?.user?.id,
    });
  };

  const canAccess = (permission: string | string[]): boolean => {
    return hasPermission(permission);
  };

  return {
    permissions,
    loading: status === "loading" || loading,
    error,
    isAuthenticated: status === "authenticated",
    userId: session?.user?.id,
    hasPermission,
    canAccess,
  };
}

/**
 * Hook for checking a specific permission
 */
export function useCanAccess(
  permission: string | string[],
  options?: {
    requireAll?: boolean;
    checkOwnership?: boolean;
    ownerId?: string;
  }
): {
  canAccess: boolean;
  loading: boolean;
} {
  const { permissions, loading, userId } = usePermissions();

  const canAccess = checkPermission(permissions, permission, {
    ...options,
    userId,
  });

  return {
    canAccess,
    loading,
  };
}
