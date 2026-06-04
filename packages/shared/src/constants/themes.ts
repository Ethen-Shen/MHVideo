export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export const THEMES: Record<Theme, { label: string; value: Theme }> = {
  [Theme.LIGHT]: { label: '浅色', value: Theme.LIGHT },
  [Theme.DARK]: { label: '深色', value: Theme.DARK },
  [Theme.AUTO]: { label: '跟随系统', value: Theme.AUTO },
};

export const THEME_LIST = Object.values(THEMES);
