import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

/**
 * Reads persisted theme from localStorage, falling back to OS preference.
 * Called synchronously during useState initialization to avoid flash.
 */
function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Manages dark/light theme with localStorage persistence.
 * Toggles the 'dark' class on <html> so Tailwind dark: variants apply.
 */
export function useDarkMode() {
  // Initialize synchronously (function form) to avoid light-flash on load
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
