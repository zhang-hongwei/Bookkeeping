/**
 * ASIN Data API Playground Client
 * 处理与 ASIN Data API 的所有交互
 */

import type {
  ProductRequestBody,
  ApiResponse,
  ApiError,
} from "@/store/playground/types";

export interface PlaygroundClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

export class PlaygroundClient {
  private baseUrl: string;
  private apiKey: string | null;
  private timeout: number;

  constructor(config: PlaygroundClientConfig = {}) {
    this.baseUrl = config.baseUrl || "https://api.asindataapi.com";
    this.apiKey = config.apiKey || null;
    this.timeout = config.timeout || 30000; // 30 seconds
  }

  /**
   * 设置 API Key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * 获取 API Key（已掩码）
   */
  getMaskedApiKey(): string {
    if (!this.apiKey) return "";
    if (this.apiKey.length <= 8) return "*".repeat(this.apiKey.length);
    const visible = this.apiKey.slice(-4);
    return "*".repeat(this.apiKey.length - 4) + visible;
  }

  /**
   * 发送 Product API 请求
   */
  async sendProductRequest(
    requestBody: ProductRequestBody
  ): Promise<ApiResponse> {
    if (!this.apiKey) {
      throw new Error("API Key 未配置，请先设置 API Key");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": this.apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 处理错误响应
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // 处理特定的 HTTP 状态码
        switch (response.status) {
          case 400:
            throw new Error(
              `请求参数验证失败: ${errorData?.error?.message || "参数不正确"}`
            );
          case 401:
            throw new Error("API Key 无效或已过期");
          case 403:
            throw new Error("没有权限访问此资源");
          case 429:
            throw new Error("请求过于频繁，请稍后再试");
          case 500:
          case 502:
          case 503:
            throw new Error("API 服务器错误，请稍后重试");
          default:
            throw new Error(
              errorData?.error?.message || `请求失败: ${response.statusText}`
            );
        }
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("网络连接错误，请检查网络状态");
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`请求超时（${this.timeout}ms），API 服务器响应过慢`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 验证请求参数
   */
  validateRequestBody(body: ProductRequestBody): string[] {
    const errors: string[] = [];

    // 必需字段验证
    if (!body.type) {
      errors.push("请求类型不能为空");
    }

    if (!body.amazon_domain) {
      errors.push("Amazon 域名不能为空");
    }

    // 至少需要 URL、ASIN 或 GTIN 中的一个
    if (!body.url && !body.asin && !body.gtin) {
      errors.push("必须提供 URL、ASIN 或 GTIN 中的至少一个");
    }

    // ASIN 验证（如果提供）
    if (body.asin && !/^[A-Z0-9]{10}$/.test(body.asin)) {
      errors.push("ASIN 必须为 10 个字母数字字符");
    }

    // URL 验证（如果提供）
    if (body.url) {
      try {
        new URL(body.url);
      } catch {
        errors.push("URL 格式不正确");
      }
    }

    // 语言代码验证（如果提供）
    if (body.language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(body.language)) {
      errors.push(
        '语言代码格式不正确（应为 ISO 639-1 格式，如 "en" 或 "en-US"）'
      );
    }

    return errors;
  }

  /**
   * 生成 cURL 命令示例
   */
  generateCurlCommand(requestBody: any): string {
    const url = this.generateUrlString(requestBody);
    return `curl "${url}"`;
  }

  /**
   * 生成 Python 代码示例
   */
  generatePythonCode(requestBody: any): string {
    const url = this.generateUrlString(requestBody);

    return `import requests

url = "${url}"

response = requests.get(url)
print(response.json())`;
  }

  /**
   * 生成 JavaScript 代码示例
   */
  generateJavaScriptCode(requestBody: any): string {
    const url = this.generateUrlString(requestBody);

    return `const url = "${url}";

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));`;
  }

  /**
   * 生成 PHP 代码示例
   */
  generatePhpCode(requestBody: any): string {
    const url = this.generateUrlString(requestBody);

    return `<?php
$url = "${url}";

$response = file_get_contents($url);
echo $response;
?>`;
  }

  /**
   * 生成 URL query string 格式的 API 请求
   */
  generateUrlString(requestBody: any): string {
    const apiKey = this.apiKey || "YOUR_API_KEY_HERE";
    const params = new URLSearchParams();

    // Add API key
    params.append("api_key", apiKey);

    // Add all request body parameters
    Object.entries(requestBody).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    return `${this.baseUrl}/request?${params.toString()}`;
  }

  /**
   * 获取代码示例
   */
  getCodeSample(language: string, requestBody: any): string {
    switch (language.toLowerCase()) {
      case "url":
        return this.generateUrlString(requestBody);
      case "curl":
        return this.generateCurlCommand(requestBody);
      case "python":
        return this.generatePythonCode(requestBody);
      case "nodejs":
      case "javascript":
        return this.generateJavaScriptCode(requestBody);
      case "php":
        return this.generatePhpCode(requestBody);
      default:
        return this.generateUrlString(requestBody);
    }
  }
}

// 创建单例实例
export const playgroundClient = new PlaygroundClient();
