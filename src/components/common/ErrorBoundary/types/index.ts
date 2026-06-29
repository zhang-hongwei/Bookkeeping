import type { ReactNode } from 'react';

// Re-export FallbackProps from react-error-boundary for compatibility
export type { FallbackProps } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';

// ============================================
// Core Error Types
// ============================================

export interface ErrorInfo {
  error: Error;
  errorInfo: {
    componentStack: string | null | undefined;
  };
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
}

// ============================================
// Configuration Types
// ============================================

export interface ErrorLoggerConfig {
  enableConsoleLog?: boolean;
  enableRemoteLog?: boolean;
  remoteLogUrl?: string;
  apiKey?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ErrorBoundaryConfig extends ErrorLoggerConfig {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: (string | number)[];
  userId?: string;
  sessionId?: string;
}

// ============================================
// Component Types
// ============================================

// ErrorBoundary Context Types
export interface ErrorBoundaryContextValue {
  logger: {
    logError: (errorInfo: ErrorInfo) => Promise<void>;
    updateConfig: (newConfig: Partial<ErrorLoggerConfig>) => void;
    clearQueue: () => void;
    getQueueLength: () => number;
  };
  config: ErrorBoundaryConfig;
  updateConfig: (newConfig: Partial<ErrorBoundaryConfig>) => void;
  reportError: (error: Error, errorInfo?: React.ErrorInfo) => void;
}

// ErrorBoundary Provider Props
export interface ErrorBoundaryProviderProps {
  children: React.ReactNode;
  config?: ErrorBoundaryConfig;
  fallback?: React.ComponentType<FallbackProps>;
}

// WithErrorBoundary HOC Options
export interface WithErrorBoundaryOptions extends Omit<ErrorBoundaryConfig, 'fallback'> {
  fallback?: React.ComponentType<FallbackProps>;
  displayName?: string;
}

// ============================================
// Data Types
// ============================================

export interface ErrorReportData {
  message: string;
  stack?: string;
  componentStack: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  environment?: string;
}