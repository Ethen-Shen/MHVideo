import zhCN from './zh-CN.json';
import zhTW from './zh-TW.json';
import en from './en.json';
import ja from './ja.json';
import ko from './ko.json';
import th from './th.json';
import es from './es.json';

export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'th' | 'es';

export const LOCALES: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  th: 'ไทย',
  es: 'Español',
};

const messages: Record<Locale, Record<string, string>> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en,
  ja,
  ko,
  th,
  es,
};

let currentLocale: Locale = 'zh-CN';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, locale?: Locale): string {
  const l = locale ?? currentLocale;
  return messages[l]?.[key] ?? key;
}

export { zhCN, zhTW, en, ja, ko, th, es };
