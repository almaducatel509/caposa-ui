'use client';

import { createContext, useContext, useEffect, useState, useMemo, ReactNode, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'caposa-theme';

function applyThemeToDOM(theme: Theme): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';

  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved: ResolvedTheme =
    theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : prefersDark ? 'dark' : 'light';

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialisation au montage depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initialTheme: Theme =
        saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
      setThemeState(initialTheme);
      const res = applyThemeToDOM(initialTheme);
      setResolvedTheme(res);
    } catch {
      // Ignore
    }
    setMounted(true);
  }, []);

  // Écouteur des changements système quand theme === 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const res = applyThemeToDOM('system');
        setResolvedTheme(res);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Ignore
    }
    const res = applyThemeToDOM(nextTheme);
    setResolvedTheme(res);
  }, []);

  const cycleTheme = useCallback(() => {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: mounted ? resolvedTheme : 'light',
      setTheme,
      cycleTheme,
    }),
    [theme, resolvedTheme, mounted, setTheme, cycleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l’intérieur d’un ThemeProvider');
  }
  return context;
}
