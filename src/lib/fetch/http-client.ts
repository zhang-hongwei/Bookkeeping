import type {
  HttpClientConfig,
  RequestOptions,
  HttpResponse,
  HttpMethod,
} from "./types";
import {
  buildUrl,
  mergeHeaders,
  addAuthHeader,
  createRequestBody,
  parseResponseBody,
  createHttpError,
  createResponseError,
  createNetworkError,
  createTimeoutError,
} from "./utils";

export class HttpClient {
  private config: Required<HttpClientConfig>;

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? "",
      timeout: config.timeout ?? 10000,
      getToken: config.getToken ?? (() => null),
      headers: config.headers ?? {},
    };
  }

  private createUrl(path: string, params?: Record<string, unknown>): string {
    return buildUrl(path, this.config.baseUrl, params);
  }

  private createHeaders(options: RequestOptions): Headers {
    const headers = mergeHeaders(this.config.headers, options.headers);
    const token = this.config.getToken();
    addAuthHeader(headers, token);
    return headers;
  }

  private createBody(data: unknown, headers: Headers): BodyInit | null {
    return createRequestBody(data, headers);
  }

  private async createRequest(
    method: HttpMethod,
    path: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<Request> {
    const { params, timeout, directResponse, ...fetchOptions } = options;

    const url =
      method === "GET" || method === "DELETE"
        ? this.createUrl(path, params)
        : this.createUrl(path);

    const headers = this.createHeaders(options);
    const body =
      method !== "GET" && method !== "DELETE"
        ? this.createBody(data, headers)
        : null;

    return new Request(url, {
      method,
      headers,
      body,
      ...fetchOptions,
    });
  }

  async request<T = unknown>(
    method: HttpMethod,
    path: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeout = options.timeout ?? this.config.timeout;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const request = await this.createRequest(method, path, data, {
        ...options,
        signal: controller.signal,
      });

      const response = await fetch(request);

      clearTimeout(timeoutId);

      if (options.directResponse) {
        return {
          data: response as unknown as T,
          status: response.status,
          headers: response.headers,
          response,
        };
      }

      const responseData = await parseResponseBody(response);

      if (!response.ok) {
        throw createResponseError(response, responseData);
      }

      return {
        data: responseData as T,
        status: response.status,
        headers: response.headers,
        response,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw createTimeoutError(timeout);
      }

      if (error instanceof TypeError) {
        throw createNetworkError(error);
      }

      throw error;
    }
  }

  get<T = unknown>(
    path: string,
    params?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    return this.request<T>("GET", path, params, options);
  }

  post<T = unknown>(
    path: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    return this.request<T>("POST", path, data, options);
  }

  put<T = unknown>(
    path: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", path, data, options);
  }

  delete<T = unknown>(
    path: string,
    params?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", path, params, options);
  }

  patch<T = unknown>(
    path: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    return this.request<T>("PATCH", path, data, options);
  }
}
