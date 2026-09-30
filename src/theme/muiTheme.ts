import { createTheme } from '@mui/material/styles';

const baseTypography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'sans-serif',
  ].join(','),
  h1: {
    fontFamily: '"Merriweather", "Georgia", "Cambria", serif',
    fontWeight: 800,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontFamily: '"Merriweather", "Georgia", "Cambria", serif',
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontFamily: '"Merriweather", "Georgia", "Cambria", serif',
    fontWeight: 700,
  },
  h4: {
    fontFamily: '"Merriweather", "Georgia", "Cambria", serif',
    fontWeight: 700,
    letterSpacing: '-0.015em',
  },
  h5: {
    fontFamily: '"Merriweather", "Georgia", "Cambria", serif',
    fontWeight: 700,
  },
  h6: {
    fontFamily: '"Merriweather", "Georgia", "Cambria", serif',
    fontWeight: 700,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 600,
  },
};

// 1. Classic Warm Bookstore Theme (Amber, Gold, Parchment, Espresso)
export const classicTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#b45309', // Warm Burnished Amber / Gold
      light: '#d97706',
      dark: '#78350f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e', // Deep Library Spruce / Teal
      light: '#14b8a6',
      dark: '#134e4a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf7f2', // Rich Antique Parchment
      paper: '#ffffff',
    },
    text: {
      primary: '#1c1917', // Warm Espresso
      secondary: '#57534e', // Warm Earth Slate
    },
  },
  typography: baseTypography,
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 14px rgba(180, 83, 9, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 4px 12px rgba(28, 25, 23, 0.05)',
          border: '1px solid #e7e5e4',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            borderColor: '#d97706',
            boxShadow: '0 12px 28px -6px rgba(180, 83, 9, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(250, 247, 242, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e7e5e4',
          color: '#1c1917',
        },
      },
    },
  },
});

// 2. Midnight Library Theme (Dark Obsidian, Gilded Gold Foil, Emerald)
export const midnightTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f59e0b', // Gilded Amber Gold
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#0f172a',
    },
    secondary: {
      main: '#10b981', // Emerald Seal
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0b0f19', // Midnight Deep Ink
      paper: '#111827', // Velvet Charcoal
    },
    text: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
    },
  },
  typography: baseTypography,
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          border: '1px solid #1f2937',
          backgroundColor: '#111827',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            borderColor: '#f59e0b',
            boxShadow: '0 12px 30px -4px rgba(245, 158, 11, 0.2)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1f2937',
          color: '#f9fafb',
        },
      },
    },
  },
});

// 3. Editorial Minimalist Theme (Clean Crisp Indigo, Modern Slate)
export const minimalistTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Crisp Royal Blue
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#059669', // Mint Emerald
      light: '#34d399',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: baseTypography,
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
  },
});

// Default alias
export const muiTheme = classicTheme;
