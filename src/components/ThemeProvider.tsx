import { useEffect } from 'react';

/** 固定多邻国绿主题，不再支持运行时切换 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'duo');
    document.documentElement.classList.remove('dark');
  }, []);

  return <>{children}</>;
}
