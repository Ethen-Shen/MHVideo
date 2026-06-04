import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  type Locale,
  LOCALES,
  zhCN,
  zhTW,
  en,
  ja,
  ko,
  th,
  es,
} from '@mhvideo/shared';

const messages: Record<Locale, Record<string, string>> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en,
  ja,
  ko,
  th,
  es,
};

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref<Locale>((uni.getStorageSync('locale') as Locale) || 'zh-CN');
  const messageMap = computed(() => messages[locale.value]);

  const localeLabel = computed(() => LOCALES[locale.value]);

  function t(key: string, params?: Record<string, string>): string {
    let value = messageMap.value?.[key];
    if (typeof value !== 'string') return key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v);
      });
    }
    return value;
  }

  function setLocale(newLocale: Locale) {
    locale.value = newLocale;
    uni.setStorageSync('locale', newLocale);
  }

  return { locale, localeLabel, t, setLocale };
});
