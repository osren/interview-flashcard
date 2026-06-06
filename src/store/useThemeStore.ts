import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor =
  | 'blue'      // 默认蓝色
  | 'rose'      // 玫红色
  | 'sunset'    // 日落黄
  | 'sapphire'  // 宝石蓝
  | 'emerald'   // 翡翠绿
  | 'slate'     // 暗夜灰
  | 'violet';   // 紫罗兰紫

export type ThemeMode = 'light' | 'dark';

export interface CustomTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface ThemeState {
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  customTheme: CustomTheme | null;
  setThemeColor: (color: ThemeColor) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setCustomTheme: (theme: CustomTheme | null) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeColor: 'blue',
      themeMode: 'light',
      customTheme: null,
      setThemeColor: (color) => set({ themeColor: color, customTheme: null }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setCustomTheme: (theme) => set({ customTheme: theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// 预设主题配置
export const THEME_CONFIGS: Record<ThemeColor, {
  name: string;
  primary: string;
  gradient: string;
  gradientLight: string;
}> = {
  blue: {
    name: '宝石蓝',
    primary: 'blue',
    gradient: 'from-[var(--brand-500)] to-[var(--brand-600)]',
    gradientLight: 'from-[var(--brand-50)] via-[var(--primary-50)] to-[var(--brand-50)]',
  },
  rose: {
    name: '玫红色',
    primary: 'rose',
    gradient: 'from-[var(--brand-500)] to-[var(--brand-600)]',
    gradientLight: 'from-[var(--brand-50)] via-[var(--primary-50)] to-[var(--brand-50)]',
  },
  sunset: {
    name: '日落黄',
    primary: 'sunset',
    gradient: 'from-[var(--brand-500)] to-[var(--brand-600)]',
    gradientLight: 'from-[var(--brand-50)] via-[var(--primary-50)] to-[var(--brand-50)]',
  },
  sapphire: {
    name: '宝石蓝',
    primary: 'sapphire',
    gradient: 'from-[var(--brand-500)] to-[var(--brand-600)]',
    gradientLight: 'from-[var(--brand-50)] via-[var(--primary-50)] to-[var(--brand-50)]',
  },
  emerald: {
    name: '翡翠绿',
    primary: 'emerald',
    gradient: 'from-[var(--brand-500)] to-[var(--brand-600)]',
    gradientLight: 'from-[var(--brand-50)] via-[var(--primary-50)] to-[var(--brand-50)]',
  },
  slate: {
    name: '暗夜灰',
    primary: 'slate',
    gradient: 'from-[var(--brand-500)] to-[var(--brand-600)]',
    gradientLight: 'from-[var(--brand-50)] via-[var(--primary-50)] to-[var(--brand-50)]',
  },
  violet: {
    name: '紫罗兰',
    primary: 'violet',
    gradient: 'from-[var(--brand-500)] to-[var(--brand-600)]',
    gradientLight: 'from-[var(--brand-50)] via-[var(--primary-50)] to-[var(--brand-50)]',
  },
};