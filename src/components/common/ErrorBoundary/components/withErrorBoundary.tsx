import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DefaultErrorFallback } from "./fallbackComponents";
import { ErrorLogger } from "../util";
import type { ErrorInfo, WithErrorBoundaryOptions } from "../types";

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const {
    fallback: FallbackComponent = DefaultErrorFallback,
    displayName,
    ...config
  } = options;

  const logger = new ErrorLogger(config);

  function WithErrorBoundaryWrapper(props: P) {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      const info: ErrorInfo = {
        error,
        errorInfo: { componentStack: errorInfo.componentStack || "" },
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: config.userId,
        sessionId: config.sessionId,
      };

      logger.logError(info);
      config.onError?.(error, errorInfo);
    };

    return (
      <ErrorBoundary
        FallbackComponent={FallbackComponent}
        onError={handleError}
        resetKeys={config.resetKeys}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  }

  WithErrorBoundaryWrapper.displayName =
    displayName ||
    `withErrorBoundary(${Component.displayName || Component.name || "Component"})`;

  return WithErrorBoundaryWrapper;
}

export function createErrorBoundaryHOC(
  defaultConfig: WithErrorBoundaryOptions = {}
) {
  return function <P extends object>(
    Component: React.ComponentType<P>,
    options: WithErrorBoundaryOptions = {}
  ) {
    const mergedOptions = { ...defaultConfig, ...options };
    return withErrorBoundary(Component, mergedOptions);
  };
}
