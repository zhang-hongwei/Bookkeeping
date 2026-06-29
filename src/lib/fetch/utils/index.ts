/**
 * HTTP 工具函数统一导出
 */

// URL 工具
export {
  buildUrl,
  serializeParams,
  parseUrlParams,
  isAbsoluteUrl,
} from "./url-utils";

// 请求头工具
export {
  mergeHeaders,
  addAuthHeader,
  getContentType,
  setContentType,
  isJsonResponse,
  createApiHeaders,
} from "./header-utils";

// 请求体工具
export {
  detectContentType,
  createRequestBody,
  parseResponseBody,
  serializeFormData,
  serializeUrlEncoded,
} from "./body-utils";

// 错误处理工具
export {
  createHttpError,
  createResponseError,
  createNetworkError,
  createTimeoutError,
  createAbortError,
  isHttpError,
  isNetworkError,
  isTimeoutError,
  isClientError,
  isServerError,
} from "./error-utils";