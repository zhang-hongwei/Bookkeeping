"use client";

import { PropsWithChildren, Suspense } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

import QueryClientContext from "./queryClientProvider";
import {
  ThemeProvider,
  ThemeInitializer,
} from "@/components/providers/ThemeProvider";
import { GlobalStoreProvider } from "./globalStore";
import NProgressDone from "@/components/common/NProgress";
import ErrorFallback from "./error-fallback";
import { I18nProvider } from "@/components/providers/I18nProvider";

import "nprogress/nprogress.css";

interface GlobalLayoutProps extends PropsWithChildren {}

const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <I18nProvider>
        <GlobalStoreProvider>
          <ThemeProvider>
            <ThemeInitializer />
            <QueryClientContext>
              <ErrorBoundary
                fallback={<ErrorFallback />}
                onError={(error, errorInfo) => {
                  console.error(
                    "Global error boundary caught:",
                    error,
                    errorInfo
                  );
                  // TODO: 可以在这里添加错误上报逻辑
                }}
              >
                {children}
              </ErrorBoundary>
            </QueryClientContext>
            <NProgressDone />
          </ThemeProvider>
        </GlobalStoreProvider>
      </I18nProvider>
    </Suspense>
  );
};

export default GlobalLayout;
