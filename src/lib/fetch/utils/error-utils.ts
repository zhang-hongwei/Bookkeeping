/**
 * HTTP 错误处理工具函数
 */

import type { HttpError } from "../types";

/**
 * 创建标准化的 HTTP 错误
 */
export function createHttpError(
  type: HttpError["type"],
  message: string,
  response?: Response,
  data?: unknown,
  code?: string
): HttpError {
  const error = new Error(message) as HttpError;
  error.type = type;
  error.response = response;
  error.status = response?.status;
  error.data = data;
  error.code = code;

  // 添加序列化方法
  error.toJSON = () => ({
    type: error.type,
    message: error.message,
    status: error.status,
    code: error.code,
    data: error.data,
  });

  return error;
}

/**
 * 根据响应状态创建错误
 */
export function createResponseError(
  response: Response,
  data?: unknown
): HttpError {
  const status = response.status;
  let type: HttpError["type"] = "http";
  let message = `HTTP ${status}`;

  // 根据状态码设置更具体的错误类型和消息
  if (status >= 400 && status < 500) {
    type = "client";
    switch (status) {
      case 400:
        message = "Bad Request";
        break;
      case 401:
        message = "Unauthorized";
        break;
      case 403:
        message = "Forbidden";
        break;
      case 404:
        message = "Not Found";
        break;
      case 422:
        message = "Validation Error";
        break;
      default:
        message = "Client Error";
    }
  } else if (status >= 500) {
    type = "server";
    message = "Internal Server Error";
  }

  return createHttpError(type, message, response, data);
}

/**
 * 创建网络错误
 */
export function createNetworkError(originalError?: Error): HttpError {
  const message = originalError?.message || "Network error or CORS issue";
  return createHttpError("network", message);
}

/**
 * 创建超时错误
 */
export function createTimeoutError(timeout: number): HttpError {
  return createHttpError("timeout", `Request timeout after ${timeout}ms`);
}

/**
 * 创建取消错误
 */
export function createAbortError(): HttpError {
  return createHttpError("abort", "Request was aborted");
}

/**
 * 判断错误类型
 */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && "type" in error && "status" in error;
}

/**
 * 判断是否为网络错误
 */
export function isNetworkError(error: unknown): boolean {
  return isHttpError(error) && error.type === "network";
}

/**
 * 判断是否为超时错误
 */
export function isTimeoutError(error: unknown): boolean {
  return isHttpError(error) && error.type === "timeout";
}

/**
 * 判断是否为客户端错误 (4xx)
 */
export function isClientError(error: unknown): boolean {
  return isHttpError(error) && error.type === "client";
}

/**
 * 判断是否为服务端错误 (5xx)
 */
export function isServerError(error: unknown): boolean {
  return isHttpError(error) && error.type === "server";
}