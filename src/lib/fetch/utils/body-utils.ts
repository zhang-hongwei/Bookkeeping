/**
 * 请求体处理工具函数
 */

/**
 * 检测数据类型并返回对应的 Content-Type
 */
export function detectContentType(data: unknown): string {
  if (data instanceof FormData) {
    // FormData 让浏览器自动设置 Content-Type
    return "";
  }

  if (typeof data === "string") {
    return "application/x-www-form-urlencoded";
  }

  // 默认为 JSON
  return "application/json";
}

/**
 * 创建请求体
 */
export function createRequestBody(data: unknown, headers: Headers): BodyInit | null {
  if (!data) return null;

  if (data instanceof FormData) {
    // 让浏览器为 FormData 设置 Content-Type
    return data;
  }

  if (data instanceof Blob || data instanceof ArrayBuffer) {
    return data;
  }

  if (typeof data === "string") {
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    return data;
  }

  // 默认序列化为 JSON
  headers.set("Content-Type", "application/json");
  return JSON.stringify(data);
}

/**
 * 解析响应体
 */
export async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return await response.json();
  }

  if (contentType?.includes("text/")) {
    return await response.text();
  }

  if (contentType?.includes("application/octet-stream") ||
      contentType?.includes("image/") ||
      contentType?.includes("video/") ||
      contentType?.includes("audio/")) {
    return await response.blob();
  }

  // 默认返回文本
  return await response.text();
}

/**
 * 序列化表单数据
 */
export function serializeFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, String(item));
        });
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
}

/**
 * 序列化 URL 编码数据
 */
export function serializeUrlEncoded(data: Record<string, unknown>): string {
  const params = new URLSearchParams();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, String(item)));
      } else {
        params.set(key, String(value));
      }
    }
  });

  return params.toString();
}