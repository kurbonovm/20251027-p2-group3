/**
 * Theme context for managing light/dark mode across the application.
 * Provides theme mode state and toggle functionality with localStorage persistence.
 *
 * @module contexts/ThemeContext
 */

import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, PaletteMode } from '@mui/material';

/**
 * Theme context value interface.
 */
interface ThemeContextType {
  /** Current theme mode (light or dark) */
  mode: PaletteMode;
  /** Toggle between light and dark mode */
  toggleTheme: () => void;
  /** Set a specific theme mode */
  setThemeMode: (mode: PaletteMode) => void;
}

/**
 * Theme context with default values.
 */
const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

/**
 * Custom hook to access theme context.
 *
 * @returns Theme context value with mode and toggle functions
 *
 * @example
 * ```tsx
 * const { mode, toggleTheme } = useThemeMode();
 * ```
 */
export const useThemeMode = () => useContext(ThemeContext);

/**
 * Props for ThemeProvider component.
 */
interface ThemeProviderProps {
  /** Child components to wrap with theme */
  children: ReactNode;
}

/**
 * Theme provider component that wraps the application with Material-UI theme.
 * Manages theme mode state with localStorage persistence and cross-tab synchronization.
 *
 * @param props - Component props
 * @returns Themed application wrapper
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  /**
   * Theme mode state, initialized from localStorage or defaults to 'dark'.
   */
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as PaletteMode) || 'dark';
  });

  /**
   * Toggles between light and dark theme modes.
   * Persists the new mode to localStorage.
   */
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  /**
   * Sets a specific theme mode.
   * Persists the mode to localStorage.
   *
   * @param newMode - Theme mode to set
   */
  const setThemeMode = (newMode: PaletteMode) => {
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  /**
   * Listen for storage changes to sync theme across browser tabs.
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'themeMode' && e.newValue) {
        setMode(e.newValue as PaletteMode);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Memoized Material-UI theme object.
   * Recreated only when theme mode changes for performance optimization.
   */
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#FFD700' : '#1976d2',
            light: mode === 'dark' ? '#FFA500' : '#42a5f5',
            dark: mode === 'dark' ? '#FFA500' : '#1565c0',
            contrastText: mode === 'dark' ? '#000' : '#fff',
          },
          secondary: {
            main: mode === 'dark' ? '#FFA500' : '#dc004e',
            light: mode === 'dark' ? '#FFD700' : '#ff5983',
            dark: mode === 'dark' ? '#FF8C00' : '#9a0036',
            contrastText: '#fff',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1a1a1a' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.87)',
            secondary: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0, 0, 0, 0.6)',
          },
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setThemeMode }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
