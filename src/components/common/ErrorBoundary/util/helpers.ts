export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'Unknown error occurred';
}

export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  
  return undefined;
}

export function sanitizeErrorForLogging(error: unknown): Record<string, any> {
  const baseInfo = {
    message: getErrorMessage(error),
    stack: getErrorStack(error),
    type: error instanceof Error ? error.constructor.name : typeof error,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof Error) {
    return {
      ...baseInfo,
      name: error.name,
      cause: error.cause ? sanitizeErrorForLogging(error.cause) : undefined,
    };
  }

  try {
    return {
      ...baseInfo,
      originalError: JSON.parse(JSON.stringify(error)),
    };
  } catch {
    return {
      ...baseInfo,
      originalError: String(error),
    };
  }
}

export function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'Network request failed',
    'fetch is not defined',
    'XMLHttpRequest',
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
  ];
  
  return networkErrorMessages.some(msg => 
    error.message.includes(msg) || error.name.includes(msg)
  );
}

export function isChunkLoadError(error: Error): boolean {
  return error.message.includes('Loading chunk') || 
         error.message.includes('Loading CSS chunk') ||
         error.name === 'ChunkLoadError';
}

export function shouldRetry(error: Error): boolean {
  return isNetworkError(error) || isChunkLoadError(error);
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (ua.includes('Chrome')) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Firefox')) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Edge')) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  }
  
  return { browserName, browserVersion };
}

export function getDeviceInfo() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
  
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
  };
}