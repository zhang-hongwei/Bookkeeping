import { createContext, useContext, useState, useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorLogger } from "../util";
import { DefaultErrorFallback } from "./fallbackComponents";
import type {
  ErrorBoundaryConfig,
  ErrorInfo,
  ErrorBoundaryContextValue,
  ErrorBoundaryProviderProps,
} from "../types";

const ErrorBoundaryContext = createContext<ErrorBoundaryContextValue | null>(
  null
);

export function useErrorBoundary() {
  const context = useContext(ErrorBoundaryContext);
  if (!context) {
    throw new Error(
      "useErrorBoundary must be used within an ErrorBoundaryProvider"
    );
  }
  return context;
}

export function ErrorBoundaryProvider({
  children,
  config = {},
  fallback: FallbackComponent = DefaultErrorFallback,
}: ErrorBoundaryProviderProps) {
  const [currentConfig, setCurrentConfig] =
    useState<ErrorBoundaryConfig>(config);
  const [logger] = useState(() => new ErrorLogger(config));

  const updateConfig = useCallback(
    (newConfig: Partial<ErrorBoundaryConfig>) => {
      setCurrentConfig((prev) => ({ ...prev, ...newConfig }));
      logger.updateConfig(newConfig);
    },
    [logger]
  );

  const reportError = useCallback(
    (error: Error, errorInfo?: React.ErrorInfo) => {
      const info: ErrorInfo = {
        error,
        errorInfo: { componentStack: errorInfo?.componentStack || "" },
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: currentConfig.userId,
        sessionId: currentConfig.sessionId,
      };

      logger.logError(info);
      currentConfig.onError?.(error, errorInfo || { componentStack: "" });
    },
    [logger, currentConfig]
  );

  const handleError = useCallback(
    (error: Error, errorInfo: React.ErrorInfo) => {
      reportError(error, errorInfo);
    },
    [reportError]
  );

  const contextValue: ErrorBoundaryContextValue = {
    logger,
    config: currentConfig,
    updateConfig,
    reportError,
  };

  return (
    <ErrorBoundaryContext.Provider value={contextValue}>
      <ErrorBoundary
        FallbackComponent={FallbackComponent}
        onError={handleError}
        resetKeys={currentConfig.resetKeys}
      >
        {children}
      </ErrorBoundary>
    </ErrorBoundaryContext.Provider>
  );
}
