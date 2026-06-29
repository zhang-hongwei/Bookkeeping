"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { createI18nNext } from "@/locales/create";

interface I18nProviderProps {
  children: React.ReactNode;
  locale?: string;
}

// Create i18n instance outside component to avoid recreation
const { instance, init } = createI18nNext();

// Initialize immediately, but don't block render
let isInitialized = false;
if (!isInitialized) {
  init({ initAsync: false });
  isInitialized = true;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for i18n to be ready before rendering children
    if (instance.isInitialized) {
      setIsReady(true);
    } else {
      instance.on('initialized', () => {
        setIsReady(true);
      });
    }

    return () => {
      instance.off('initialized');
    };
  }, []);

  useEffect(() => {
    if (locale && instance.language !== locale) {
      instance.changeLanguage(locale);
    }
  }, [locale]);

  // Don't render children until i18n is ready to avoid hydration mismatch
  if (!isReady) {
    return null;
  }

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
