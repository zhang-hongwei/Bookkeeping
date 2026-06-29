import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import { isRtlLang } from 'rtl-detect';

import { DEFAULT_LANG } from '@/const/locale';
import { isOnServerSide } from '@/utils/env';

// Debug mode configuration from environment variables
const debugMode = process.env.I18N_DEBUG === 'true' ||
  (isOnServerSide ? process.env.I18N_DEBUG_SERVER === 'true' : process.env.I18N_DEBUG_BROWSER === 'true');

export const createI18nNext = (lang?: string) => {
  const instance = i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(
      resourcesToBackend(async (lng: string, ns: string) => {
        // Skip loading on server side to avoid hydration mismatch
        if (isOnServerSide) {
          return { default: {} };
        }

        // Normalize language code (zh -> zh-CN, en -> en-US)
        let normalizedLng = lng;
        if (lng === 'zh') normalizedLng = 'zh-CN';
        if (lng === 'en') normalizedLng = 'en-US';

        // Only load from public/locales directory via HTTP (JSON files)
        try {
          const response = await fetch(`/locales/${normalizedLng}/${ns}.json`);
          if (response.ok) {
            const data = await response.json();
            // Return the JSON data wrapped in default property to match i18next format
            return { default: data };
          }
        } catch (error) {
          if (debugMode) {
            console.warn(`Failed to fetch /locales/${normalizedLng}/${ns}.json:`, error);
          }
        }

        // Return empty object if loading fails
        return { default: {} };
      }),
    );

  // Dynamically set HTML direction on language change
  instance.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
      const direction = isRtlLang(lng) ? 'rtl' : 'ltr';
      document.documentElement.dir = direction;
    }
  });

  return {
    init: (params: { initAsync?: boolean } = {}) => {
      const { initAsync = true } = params;

      return instance.init({
        debug: debugMode,
        defaultNS: 'common',
        fallbackLng: DEFAULT_LANG,
        initAsync,
        interpolation: {
          escapeValue: false,
        },
        lng: lang,
        // Only preload essential namespaces to avoid loading issues
        ns: ['common', 'playground'],
      });
    },
    instance,
  };
};
