/**
 * URL 处理工具函数
 */

/**
 * 序列化查询参数
 */
export function serializeParams(params: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });

  return searchParams;
}

/**
 * 构建完整的 URL
 */
export function buildUrl(
  path: string,
  baseUrl?: string,
  params?: Record<string, unknown>
): string {
  const resolvedBaseUrl =
    baseUrl ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const url = new URL(path, resolvedBaseUrl);

  if (params) {
    const searchParams = serializeParams(params);
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

/**
 * 解析 URL 参数
 */
export function parseUrlParams(url: string): Record<string, string> {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * 判断是否为绝对 URL
 */
export function isAbsoluteUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}