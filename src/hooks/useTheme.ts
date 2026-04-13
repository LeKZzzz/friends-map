import { useEffect, useState } from 'react';
import { useStorage } from './useStorage';

export type Theme = 'light' | 'dark' | 'system';

const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
};

export const useTheme = () => {
  const [theme, setTheme] = useStorage<Theme>('theme', 'light');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => resolveTheme(theme));

  useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.setAttribute('data-theme', resolved);
    setEffectiveTheme(resolved);
  }, [theme]);

  // 监听系统主题变化（仅在 theme === 'system' 时生效）
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', resolved);
      setEffectiveTheme(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    effectiveTheme,
  };
};
