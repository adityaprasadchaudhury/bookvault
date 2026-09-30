import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { classicTheme, midnightTheme, minimalistTheme } from './muiTheme.ts';

export type ThemeMode = 'classic' | 'midnight' | 'minimalist';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  themeName: string;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'classic',
  setThemeMode: () => {},
  themeName: 'Classic Bookstore',
});

export const useAppTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = 'bookstore_theme_mode';

const THEME_NAMES: Record<ThemeMode, string> = {
  classic: 'Classic Bookstore (Warm & Antique)',
  midnight: 'Midnight Library (Dark & Gilded)',
  minimalist: 'Editorial Minimalist (Clean Indigo)',
};

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (saved && (saved === 'classic' || saved === 'midnight' || saved === 'minimalist')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'classic';
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const activeTheme =
    themeMode === 'midnight' ? midnightTheme : themeMode === 'minimalist' ? minimalistTheme : classicTheme;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        themeName: THEME_NAMES[themeMode],
      }}
    >
      <MuiThemeProvider theme={activeTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
