import Toast from "@/components/ui/Toast";
import localStorage from "@/lib/localStorage";
import { BASE_PATH } from "@/const";
import Cookie from "../cookie";
import { ApiClient } from "./api-client";
import type {
  ApiResponse,
  HttpError,
  RequestOptions,
  ApiClientConfig,
} from "./types";

export const goLogin = () => {
  Cookie.deleteCookie("loginFree");
  Cookie.deleteCookie("password");
  Cookie.deleteCookie("username");
  localStorage.clear();
  setTimeout(() => {
    const _path = `${BASE_PATH}/login`;
    if (window.location.pathname !== _path) {
      window.location.href = _path;
    }
  }, 300);
};

// Create API client instance
const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 10000,
  getToken: () => {
    // 优先使用 localStorage 中的 token（如果存在）
    // 这允许支持传统的 JWT token 认证
    const legacyToken = localStorage.getItem("token");
    if (legacyToken) {
      return legacyToken.startsWith("Bearer ")
        ? legacyToken
        : `Bearer ${legacyToken}`;
    }

    // 如果没有 localStorage token，返回 null
    // 让 NextAuth 的 Cookie 认证来处理
    return null;
  },
  onUnauthorized: () => {
    Toast.dismiss(401);
    Toast.error("登录已过期，请重新登录");
    goLogin();
  },
  onError: (error: HttpError) => {
    if (error.status !== 401) {
      Toast.error(error.message || "请求失败");
    }
  },
  transformResponse: (data: unknown, response: Response) => {
    const responseData = data as Record<string, unknown>;

    // Transform backend response to standard format
    return {
      success: responseData.code === 0 || response.ok,
      code: (responseData.code as number) ?? response.status,
      message:
        (responseData.message as string) ||
        (responseData.msg as string) ||
        (response.ok ? "Success" : "Request failed"),
      data: responseData.data ?? responseData,
      timestamp: (responseData.timestamp as number) || Date.now(),
    };
  },
});

// Modern fetch API
export const get = async <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  // Filter out undefined and null values from params
  const filteredParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) => value !== undefined && value !== null
        )
      )
    : undefined;

  return apiClient.apiGet<T>(url, filteredParams, options);
};

export const post = async <T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  return apiClient.apiPost<T>(url, data, options);
};

export const put = async <T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  return apiClient.apiPut<T>(url, data, options);
};

export const del = async <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  return apiClient.apiDelete<T>(url, params, options);
};

export const patch = async <T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  return apiClient.apiPatch<T>(url, data, options);
};

// Factory function for creating custom API clients
export const createApiClient = (config: Partial<ApiClientConfig> = {}) => {
  return new ApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    timeout: 10000,
    getToken: () => {
      // 优先使用 localStorage 中的 token（如果存在）
      const legacyToken = localStorage.getItem("token");
      if (legacyToken) {
        return legacyToken.startsWith("Bearer ")
          ? legacyToken
          : `Bearer ${legacyToken}`;
      }
      // 让 NextAuth 的 Cookie 认证来处理
      return null;
    },
    onUnauthorized: goLogin,
    onError: (error: HttpError) => {
      if (error.status !== 401) {
        Toast.error(error.message || "请求失败");
      }
    },
    transformResponse: (data: unknown, response: Response) => {
      const responseData = data as Record<string, unknown>;
      return {
        success: responseData.code === 0 || response.ok,
        code: (responseData.code as number) ?? response.status,
        message:
          (responseData.message as string) ||
          (responseData.msg as string) ||
          (response.ok ? "Success" : "Request failed"),
        data: responseData.data ?? responseData,
        timestamp: (responseData.timestamp as number) || Date.now(),
      };
    },
    ...config,
  });
};

// Export client instance for advanced usage
export { apiClient };

// Export types
export type {
  ApiResponse,
  HttpError,
  RequestOptions,
  ApiClientConfig,
} from "./types";
export { HttpClient } from "./http-client";
export { ApiClient } from "./api-client";
export { createStorageAdapter } from "./storage";

// Export utility functions
export * from "./utils";
