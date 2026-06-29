import { DEFAULT_LANG } from '@/const/locale';

// 实际使用的命名空间（从 public/locales/ 加载）
// 基于 public/locales/en-US/ 和 public/locales/zh-CN/ 中的实际文件
export type NS = 'common' | 'account' | 'playground' | 'profile' | 'landing' | 'settings';

// 仅保留中文和英文
export const locales = [
  'en-US',
  'zh-CN',
] as const;

export type Locales = (typeof locales)[number];

export const normalizeLocale = (locale?: string): Locales => {
  if (!locale) return DEFAULT_LANG;

  if (locale.startsWith('en')) return 'en-US';
  if (locale.startsWith('zh') || locale.startsWith('cn')) return 'zh-CN';

  return DEFAULT_LANG;
};

type LocaleOptions = {
  label: string;
  value: Locales;
}[];

export const localeOptions: LocaleOptions = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: '简体中文',
    value: 'zh-CN',
  },
] as LocaleOptions;

export const supportLocales: string[] = [...locales, 'en', 'zh'];
