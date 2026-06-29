import { useCallback, useRef } from 'react';
// react-error-boundary v4 doesn't export useErrorHandler, we'll create our own
import { useErrorBoundary as useErrorBoundaryContext } from '../components/ErrorBoundaryProvider';

export function useErrorHandler() {
  const errorBoundaryContext = useErrorBoundaryContext();
  
  return useCallback((error: Error) => {
    try {
      errorBoundaryContext?.reportError(error);
    } catch (reportError) {
      console.warn('Failed to report error through context:', reportError);
    }
    // Trigger the error boundary by throwing the error
    throw error;
  }, [errorBoundaryContext]);
}

export function useAsyncErrorHandler() {
  const handleError = useErrorHandler();
  
  return useCallback((asyncFn: () => Promise<any>) => {
    return async () => {
      try {
        await asyncFn();
      } catch (error) {
        handleError(error as Error);
      }
    };
  }, [handleError]);
}

export function useErrorLogger() {
  const context = useErrorBoundaryContext();
  
  const logError = useCallback((error: Error, additionalInfo?: Record<string, any>) => {
    if (!context) {
      console.error('Error logging context not available:', error);
      return;
    }
    
    try {
      const errorInfo = {
        componentStack: additionalInfo?.componentStack || '',
        ...additionalInfo,
      };
      
      context.reportError(error, errorInfo);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }, [context]);

  return { logError, logger: context?.logger };
}

export function useRetry(retryLimit: number = 3) {
  const retryCount = useRef(0);
  const handleError = useErrorHandler();
  
  const retry = useCallback((fn: () => void | Promise<void>) => {
    return async () => {
      try {
        await fn();
        retryCount.current = 0;
      } catch (error) {
        retryCount.current += 1;
        
        if (retryCount.current >= retryLimit) {
          handleError(error as Error);
        } else {
          console.warn(`Retrying... (${retryCount.current}/${retryLimit})`);
          setTimeout(() => retry(fn)(), 1000 * retryCount.current);
        }
      }
    };
  }, [handleError, retryLimit]);

  const resetRetryCount = useCallback(() => {
    retryCount.current = 0;
  }, []);

  return { retry, retryCount: retryCount.current, resetRetryCount };
}