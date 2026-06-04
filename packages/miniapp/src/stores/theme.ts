import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Theme } from '@mhvideo/shared';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentLight: string;
  danger: string;
  success: string;
}

const lightTheme: ThemeColors = {
  bgPrimary: '#ffffff',
  bgSecondary: '#f5f5f5',
  bgCard: '#ffffff',
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#e5e5e5',
  accent: '#ff4757',
  accentLight: '#fff0f1',
  danger: '#ff4757',
  success: '#2ed573',
};

const darkTheme: ThemeColors = {
  bgPrimary: '#1a1a2e',
  bgSecondary: '#16213e',
  bgCard: '#1f2940',
  textPrimary: '#eaeaea',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',
  border: '#2d3748',
  accent: '#ff6b81',
  accentLight: '#2d1f24',
  danger: '#ff6b81',
  success: '#7bed9f',
};

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>((uni.getStorageSync('theme') as Theme) || Theme.AUTO);
  const colors = ref<ThemeColors>(lightTheme);

  const themeLabel = computed(() => {
    const labels: Record<Theme, string> = {
      [Theme.LIGHT]: '浅色',
      [Theme.DARK]: '深色',
      [Theme.AUTO]: '跟随系统',
    };
    return labels[theme.value];
  });

  const isDark = computed(() => {
    if (theme.value === Theme.DARK) return true;
    if (theme.value === Theme.AUTO) {
      try {
        return uni.getSystemInfoSync().osTheme === 'dark';
      } catch {
        return false;
      }
    }
    return false;
  });

  function applyTheme() {
    colors.value = isDark.value ? darkTheme : lightTheme;
  }

  function setTheme(t: Theme) {
    theme.value = t;
    uni.setStorageSync('theme', t);
    applyTheme();
  }

  function toggle() {
    const order = [Theme.LIGHT, Theme.DARK, Theme.AUTO];
    const idx = order.indexOf(theme.value);
    setTheme(order[(idx + 1) % order.length]);
  }

  // 初始化
  applyTheme();

  return { theme, colors, themeLabel, isDark, setTheme, toggle, applyTheme };
});
