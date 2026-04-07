import { useEffect } from 'react';
import { useThemeStore, THEME_CONFIGS } from '@/store/useThemeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeColor, customTheme } = useThemeStore();

  useEffect(() => {
    // 预设主题
    if (customTheme) {
      document.documentElement.style.setProperty('--primary-color', customTheme.primary);
    } else {
      const config = THEME_CONFIGS[themeColor];
      document.documentElement.setAttribute('data-theme', config.primary);
    }
  }, [themeColor, customTheme]);

  return <>{children}</>;
}