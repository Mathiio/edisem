import { useEffect, useMemo, useState } from 'react';

const Theme = {
  key: 'theme',
  light: 'light',
  dark: 'dark',
} as const;

type ThemeMode = typeof Theme.light | typeof Theme.dark;

export const useThemeMode = (defaultThemeMode?: ThemeMode) => {
  const [currentMode, setCurrentMode] = useState<ThemeMode>(() => {
    const storedTheme = localStorage.getItem(Theme.key) as ThemeMode | null;
    return storedTheme || (defaultThemeMode ?? Theme.light);
  });

  const isDark = useMemo(() => currentMode === Theme.dark, [currentMode]);
  const isLight = useMemo(() => currentMode === Theme.light, [currentMode]);

  const setThemeMode = (themeMode: ThemeMode) => {
    localStorage.setItem(Theme.key, themeMode);
    document.documentElement.classList.remove(Theme.light, Theme.dark);
    document.documentElement.classList.add(themeMode);
    setCurrentMode(themeMode);
  };

  useEffect(() => {
    // Apply the initial theme without saving to localStorage
    const storedTheme = localStorage.getItem(Theme.key) as ThemeMode | null;
    const initialTheme = storedTheme || (defaultThemeMode ?? Theme.light);
    document.documentElement.classList.remove(Theme.light, Theme.dark);
    document.documentElement.classList.add(initialTheme);
  }, [defaultThemeMode]);

  const setLightMode = () => setThemeMode(Theme.light);
  const setDarkMode = () => setThemeMode(Theme.dark);
  const toggleThemeMode = () => setThemeMode(currentMode === Theme.dark ? Theme.light : Theme.dark);

  return { currentMode, isDark, isLight, setLightMode, setDarkMode, toggleThemeMode };
};