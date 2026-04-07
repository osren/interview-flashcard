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
  customTheme: CustomTheme | null;
  setThemeColor: (color: ThemeColor) => void;
  setCustomTheme: (theme: CustomTheme | null) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeColor: 'blue',
      customTheme: null,
      setThemeColor: (color) => set({ themeColor: color, customTheme: null }),
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
    gradient: 'from-blue-500 to-indigo-600',
    gradientLight: 'from-blue-50 via-indigo-50 to-purple-50',
  },
  rose: {
    name: '玫红色',
    primary: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    gradientLight: 'from-rose-50 via-pink-50 to-rose-50',
  },
  sunset: {
    name: '日落黄',
    primary: 'sunset',
    gradient: 'from-amber-500 to-orange-600',
    gradientLight: 'from-amber-50 via-orange-50 to-amber-50',
  },
  sapphire: {
    name: '宝石蓝',
    primary: 'sapphire',
    gradient: 'from-sky-500 to-cyan-600',
    gradientLight: 'from-sky-50 via-cyan-50 to-sky-50',
  },
  emerald: {
    name: '翡翠绿',
    primary: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    gradientLight: 'from-emerald-50 via-teal-50 to-emerald-50',
  },
  slate: {
    name: '暗夜灰',
    primary: 'slate',
    gradient: 'from-slate-500 to-gray-600',
    gradientLight: 'from-slate-50 via-gray-50 to-slate-50',
  },
  violet: {
    name: '紫罗兰',
    primary: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    gradientLight: 'from-violet-50 via-purple-50 to-violet-50',
  },
};