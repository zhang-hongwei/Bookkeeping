/**
 * 统一API响应格式工具
 * 确保所有API端点返回一致的响应结构
 */

import { NextResponse } from 'next/server';

// 统一响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
  path?: string;
}

// 分页响应接口
export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * 成功响应
 */
export function successResponse<T = any>(
  data?: T,
  message: string = 'Success',
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    code: status,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * 创建成功响应 (201)
 */
export function createdResponse<T = any>(
  data?: T,
  message: string = 'Created successfully'
): NextResponse {
  return successResponse(data, message, 201);
}

/**
 * 错误响应
 */
export function errorResponse(
  message: string,
  status: number = 400,
  error?: string
): NextResponse {
  const response: ApiResponse = {
    success: false,
    code: status,
    message,
    error: error || message,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * 验证错误响应 (400)
 */
export function validationError(message: string): NextResponse {
  return errorResponse(message, 400);
}

/**
 * 未授权响应 (401)
 */
export function unauthorizedError(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, 401);
}

/**
 * 禁止访问响应 (403)
 */
export function forbiddenError(message: string = 'Forbidden'): NextResponse {
  return errorResponse(message, 403);
}

/**
 * 未找到响应 (404)
 */
export function notFoundError(message: string = 'Not found'): NextResponse {
  return errorResponse(message, 404);
}

/**
 * 冲突响应 (409)
 */
export function conflictError(message: string): NextResponse {
  return errorResponse(message, 409);
}

/**
 * 服务器错误响应 (500)
 */
export function serverError(message: string = 'Internal server error'): NextResponse {
  return errorResponse(message, 500);
}

/**
 * 分页响应
 */
export function paginatedResponse<T = any>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Success'
): NextResponse {
  const totalPages = Math.ceil(total / limit);
  
  const paginatedData: PaginatedResponse<T> = {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };

  return successResponse(paginatedData, message);
}

/**
 * 从 ServiceResponse 创建 API 响应
 */
export function fromServiceResponse<T = any>(
  serviceResponse: {
    success: boolean;
    data?: T;
    error?: string;
    code?: number;
  },
  successMessage?: string,
  successStatus?: number
): NextResponse {
  if (serviceResponse.success) {
    return successResponse(
      serviceResponse.data,
      successMessage || 'Success',
      successStatus || 200
    );
  } else {
    return errorResponse(
      serviceResponse.error || 'Operation failed',
      serviceResponse.code || 400
    );
  }
}

/**
 * 异常处理包装器
 * 自动捕获和处理常见异常
 */
export function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  return handler().catch((error) => {
    console.error('API Error:', error);
    
    // Zod 验证错误
    if (error?.name === 'ZodError') {
      const firstError = error.errors?.[0];
      return validationError(
        firstError?.message || 'Validation failed'
      );
    }
    
    // 数据库约束错误
    if (error?.message?.includes('unique')) {
      return conflictError('Resource already exists');
    }
    
    // 权限错误
    if (error?.message?.includes('permission')) {
      return forbiddenError('Insufficient permissions');
    }
    
    // 默认服务器错误
    return serverError(
      process.env.NODE_ENV === 'development' 
        ? error?.message || 'Internal server error'
        : 'Internal server error'
    );
  });
}

/**
 * API路由包装器
 * 提供统一的错误处理和响应格式
 */
export function createApiHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    return withErrorHandling(async () => {
      return await handler(request, context);
    });
  };
}

/**
 * 响应头设置
 */
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

/**
 * OPTIONS 请求处理
 */
export function handleOptions(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response);
}