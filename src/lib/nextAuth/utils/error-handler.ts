export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: '邮箱或密码错误',
    statusCode: 401
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND', 
    message: '用户不存在',
    statusCode: 404
  },
  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    message: '该邮箱已被注册',
    statusCode: 409
  },
  WEAK_PASSWORD: {
    code: 'WEAK_PASSWORD',
    message: '密码强度不够',
    statusCode: 400
  },
  OAUTH_ERROR: {
    code: 'OAUTH_ERROR',
    message: '第三方登录失败',
    statusCode: 401
  }
} as const;

export function handleAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes('用户不存在')) {
      return new AuthError(
        AUTH_ERRORS.USER_NOT_FOUND.message,
        AUTH_ERRORS.USER_NOT_FOUND.code,
        AUTH_ERRORS.USER_NOT_FOUND.statusCode
      );
    }
    
    if (error.message.includes('密码错误')) {
      return new AuthError(
        AUTH_ERRORS.INVALID_CREDENTIALS.message,
        AUTH_ERRORS.INVALID_CREDENTIALS.code,
        AUTH_ERRORS.INVALID_CREDENTIALS.statusCode
      );
    }
  }

  return new AuthError('认证失败', 'AUTH_FAILED', 500);
}

export function logAuthEvent(
  event: 'sign_in' | 'sign_up' | 'sign_out' | 'error',
  details: {
    email?: string;
    provider?: string;
    error?: string;
    ip?: string;
  }
) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    event,
    ...details
  };

  if (process.env.NODE_ENV === 'production') {
    console.log('[AUTH_EVENT]', JSON.stringify(logData));
  } else {
    console.log(`[AUTH_${event.toUpperCase()}]`, logData);
  }
}