/**
 * 请求头管理工具函数
 */

/**
 * 合并请求头
 */
export function mergeHeaders(
  defaultHeaders: Record<string, string>,
  requestHeaders?: HeadersInit
): Headers {
  const headers = new Headers();

  // 设置默认请求头
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // 设置请求特定的请求头
  if (requestHeaders) {
    if (requestHeaders instanceof Headers) {
      // 处理 Headers 对象
      requestHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    } else if (Array.isArray(requestHeaders)) {
      // 处理数组形式的请求头
      requestHeaders.forEach(([key, value]) => {
        headers.set(key, value);
      });
    } else {
      // 处理普通对象
      Object.entries(requestHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
  }

  return headers;
}

/**
 * 添加授权头
 */
export function addAuthHeader(headers: Headers, token?: string | null): void {
  if (token) {
    // 如果 token 已经包含 Bearer 前缀，直接使用
    if (token.startsWith('Bearer ')) {
      headers.set("Authorization", token);
    } else {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
}

/**
 * 获取内容类型
 */
export function getContentType(headers: Headers): string | null {
  return headers.get("Content-Type");
}

/**
 * 设置内容类型
 */
export function setContentType(headers: Headers, contentType: string): void {
  headers.set("Content-Type", contentType);
}

/**
 * 检查是否为 JSON 响应
 */
export function isJsonResponse(headers: Headers): boolean {
  const contentType = getContentType(headers);
  return !!contentType?.includes("application/json");
}

/**
 * 创建标准的 API 请求头
 */
export function createApiHeaders(
  customHeaders?: HeadersInit,
  token?: string | null
): Headers {
  const defaultHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  const headers = mergeHeaders(defaultHeaders, customHeaders);
  addAuthHeader(headers, token);

  return headers;
}