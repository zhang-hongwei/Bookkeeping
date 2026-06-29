"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LOCALE_COOKIE, DEFAULT_LANG, type Locale } from "@/const/locale";

/**
 * Hook for managing application locale
 */
export function useLocale() {
  const { i18n } = useTranslation();
  const [locale, setLocaleState] = useState<Locale>(
    (i18n.language as Locale) || DEFAULT_LANG
  );

  // Sync locale state with i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLocaleState(lng as Locale);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  /**
   * Change the application locale
   */
  const setLocale = useCallback(
    async (newLocale: Locale) => {
      try {
        // Update i18next language
        await i18n.changeLanguage(newLocale);

        // Save to cookie for persistence (using document.cookie for client-side)
        document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

        setLocaleState(newLocale);
      } catch (error) {
        console.error("Failed to change locale:", error);
      }
    },
    [i18n]
  );

  return {
    locale,
    setLocale,
    /**
     * Check if current locale is RTL
     */
    isRTL: i18n.dir() === "rtl",
  };
}
