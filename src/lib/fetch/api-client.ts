import type { ApiClientConfig, ApiResponse, HttpError, RequestOptions } from "./types";
import { HttpClient } from "./http-client";

export class ApiClient extends HttpClient {
  private apiConfig: ApiClientConfig;

  constructor(config: ApiClientConfig = {}) {
    super(config);
    this.apiConfig = config;
  }

  private transformResponse<T>(data: unknown, response: Response): ApiResponse<T> {
    if (this.apiConfig.transformResponse) {
      return this.apiConfig.transformResponse(data, response) as ApiResponse<T>;
    }

    // Transform to standard API response format
    if (data && typeof data === "object" && "success" in data) {
      return data as ApiResponse<T>;
    }

    // Fallback format
    return {
      success: response.ok,
      code: response.status,
      message: response.ok ? "Success" : "Request failed",
      data: data as T,
      timestamp: Date.now(),
    };
  }

  private transformError(error: HttpError): HttpError {
    if (this.apiConfig.transformError) {
      return this.apiConfig.transformError(error);
    }
    return error;
  }

  private handleError(error: HttpError): void {
    const transformedError = this.transformError(error);

    // Handle unauthorized
    if (transformedError.status === 401 && this.apiConfig.onUnauthorized) {
      this.apiConfig.onUnauthorized();
      return;
    }

    // Handle other errors
    if (this.apiConfig.onError) {
      this.apiConfig.onError(transformedError);
    }
  }

  async apiRequest<T = unknown>(
    method: Parameters<HttpClient["request"]>[0],
    path: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.request(method, path, data, options);

      if (options.directResponse) {
        return response as unknown as ApiResponse<T>;
      }

      return this.transformResponse<T>(response.data, response.response);

    } catch (error) {
      if (error instanceof Error) {
        const httpError = error as HttpError;
        this.handleError(httpError);
        throw httpError;
      }
      throw error;
    }
  }

  async apiGet<T = unknown>(path: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.apiRequest<T>("GET", path, params, options);
  }

  async apiPost<T = unknown>(path: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.apiRequest<T>("POST", path, data, options);
  }

  async apiPut<T = unknown>(path: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.apiRequest<T>("PUT", path, data, options);
  }

  async apiDelete<T = unknown>(path: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.apiRequest<T>("DELETE", path, params, options);
  }

  async apiPatch<T = unknown>(path: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.apiRequest<T>("PATCH", path, data, options);
  }
}