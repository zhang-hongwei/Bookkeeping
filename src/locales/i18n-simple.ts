import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { isRtlLang } from 'rtl-detect';

import { DEFAULT_LANG } from '@/const/locale';
import { isOnServerSide } from '@/utils/env';

// Debug mode configuration from environment variables
const debugMode = process.env.I18N_DEBUG === 'true' ||
  (isOnServerSide ? process.env.I18N_DEBUG_SERVER === 'true' : process.env.I18N_DEBUG_BROWSER === 'true');

// Simple translation resources
const resources = {
  'en-US': {
    common: {
      welcome: 'Welcome',
      language: 'Language',
      darkMode: 'Dark Mode',
      settings: 'Settings',
      logout: 'Logout',
    },
  },
  'zh-CN': {
    common: {
      welcome: '欢迎',
      language: '语言',
      darkMode: '深色模式',
      settings: '设置',
      logout: '退出登录',
    },
  },
};

export const createI18nNext = (lang?: string) => {
  const instance = i18n
    .use(initReactI18next)
    .use(LanguageDetector);

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
        resources,
        debug: debugMode,
        defaultNS: 'common',
        fallbackLng: DEFAULT_LANG,
        initAsync,
        interpolation: {
          escapeValue: false,
        },
        lng: lang,
      });
    },
    instance,
  };
};
