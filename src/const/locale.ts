// 国际化配置
export const DEFAULT_LANG = 'zh-CN';
export const LOCALE_COOKIE = 'LOCALE';

// 支持的语言列表 (仅中文和英文)
export const supportLocales = [
  'en-US',
  'zh-CN',
] as const;

export type Locale = typeof supportLocales[number];

// 语言选项配置
export const localeOptions = [
  {
    value: 'en-US' as const,
    label: 'English',
    emoji: '🇺🇸',
  },
  {
    value: 'zh-CN' as const,
    label: '简体中文',
    emoji: '🇨🇳',
  },
] as const;

/**
 * 检查语言是否支持
 * @param locale
 */
export const isLocaleNotSupport = (locale: string) => !supportLocales.includes(locale as Locale);