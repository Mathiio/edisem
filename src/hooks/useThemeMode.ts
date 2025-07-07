import { useEffect, useMemo, useState, useCallback } from 'react';

const Theme = {
  key: 'theme',
  light: 'light',
  dark: 'dark',
} as const;

type ThemeMode = typeof Theme.light | typeof Theme.dark;

export const useThemeMode = (defaultThemeMode?: ThemeMode) => {
  const [currentMode, setCurrentMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultThemeMode ?? Theme.light;
    
    const storedTheme = localStorage.getItem(Theme.key) as ThemeMode | null;
    return storedTheme || (defaultThemeMode ?? Theme.light);
  });

  const isDark = useMemo(() => currentMode === Theme.dark, [currentMode]);
  const isLight = useMemo(() => currentMode === Theme.light, [currentMode]);

  const syncWithDOM = useCallback(() => {
    const htmlElement = document.documentElement;
    const isDarkInDOM = htmlElement.classList.contains(Theme.dark);
    const isLightInDOM = htmlElement.classList.contains(Theme.light);
    
    if (isDarkInDOM && currentMode !== Theme.dark) {
      setCurrentMode(Theme.dark);
    } else if (isLightInDOM && currentMode !== Theme.light) {
      setCurrentMode(Theme.light);
    }
  }, [currentMode]);

  const setThemeMode = useCallback((themeMode: ThemeMode) => {
    localStorage.setItem(Theme.key, themeMode);
    document.documentElement.classList.remove(Theme.light, Theme.dark);
    document.documentElement.classList.add(themeMode);
    setCurrentMode(themeMode);
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem(Theme.key) as ThemeMode | null;
    const initialTheme = storedTheme || (defaultThemeMode ?? Theme.light);
    document.documentElement.classList.remove(Theme.light, Theme.dark);
    document.documentElement.classList.add(initialTheme);
    setCurrentMode(initialTheme);
  }, [defaultThemeMode]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          syncWithDOM();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Vérification initiale
    syncWithDOM();

    return () => observer.disconnect();
  }, [syncWithDOM]);

  // Écouter les changements de localStorage (si changé dans un autre onglet)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === Theme.key && e.newValue) {
        const newTheme = e.newValue as ThemeMode;
        setThemeMode(newTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setThemeMode]);

  const setLightMode = useCallback(() => setThemeMode(Theme.light), [setThemeMode]);
  const setDarkMode = useCallback(() => setThemeMode(Theme.dark), [setThemeMode]);
  const toggleThemeMode = useCallback(() => {
    setThemeMode(currentMode === Theme.dark ? Theme.light : Theme.dark);
  }, [currentMode, setThemeMode]);

  return {
    currentMode,
    isDark,
    isLight,
    setLightMode,
    setDarkMode,
    toggleThemeMode
  };
};