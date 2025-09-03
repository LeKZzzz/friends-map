import { useEffect } from 'react';
import { useStorage } from './useStorage';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useStorage<Theme>('theme', 'light');

  const getEffectiveTheme = (): 'light' | 'dark' => {
    return theme;
  };

  useEffect(() => {
    const getSystemTheme = (): 'light' | 'dark' => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const getEffectiveTheme = (): 'light' | 'dark' => {
      return theme;
    };

    const applyTheme = (currentTheme: 'light' | 'dark') => {
      const root = document.documentElement;
      root.setAttribute('data-theme', currentTheme);
      
      // 更新CSS变量
      if (currentTheme === 'dark') {
        root.style.setProperty('--bg-primary', '#1a1a1a');
        root.style.setProperty('--bg-secondary', '#2d2d2d');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#cccccc');
        root.style.setProperty('--border-color', '#404040');
      } else {
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8f9fa');
        root.style.setProperty('--text-primary', '#333333');
        root.style.setProperty('--text-secondary', '#666666');
        root.style.setProperty('--border-color', '#e9ecef');
      }
    };

    const effectiveTheme = getEffectiveTheme();
    applyTheme(effectiveTheme);
  }, [theme]);

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    effectiveTheme: getEffectiveTheme(),
  };
};