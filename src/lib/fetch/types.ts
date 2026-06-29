export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  getToken?: () => string | null;
  headers?: Record<string, string>;
}

export interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  timeout?: number;
  params?: Record<string, unknown>;
  directResponse?: boolean;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
  response: Response;
}

export interface HttpErrorJSON {
  type: "network" | "http" | "business" | "timeout";
  message: string;
  status?: number;
  code?: string | number;
  data?: unknown;
}

export interface HttpError extends Error {
  type: "network" | "http" | "business" | "timeout";
  status?: number;
  code?: string | number;
  response?: Response;
  data?: unknown;
  toJSON(): HttpErrorJSON;
}

export interface ApiClientConfig extends HttpClientConfig {
  onUnauthorized?: () => void;
  onError?: (error: HttpError) => void;
  transformResponse?: (data: unknown, response: Response) => ApiResponse<unknown>;
  transformError?: (error: HttpError) => HttpError;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface RequestConfig {
  url: string;
  method?: HttpMethod;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  directResponse?: boolean;
}

export interface ApiResponse<T = unknown> {
  code: number;
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: number;
}