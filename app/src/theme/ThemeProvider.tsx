import React, { createContext, useContext, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { useFonts } from 'expo-font';
// Importing each weight from its own subpath (not the `@expo-google-fonts/inter`
// barrel) — the barrel's index.js has a single `require()` for all 18
// weights/italics in one file, and Metro can't tree-shake unused CommonJS
// requires, so importing from it bundles ~6MB of font files we never use.
// Each subpath's index.js requires only that one file.
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { lightColors, darkColors, ColorScheme } from './colors';
import { buildElevation, ElevationScale } from './elevation';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorScheme;
  elevation: ElevationScale;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Owns light/dark palette selection and Inter font loading. Wrap the app once
 * (in App.tsx, inside SafeAreaProvider) — every themed component then reads
 * `useTheme()` instead of importing a static color object, so switching modes
 * re-renders the whole tree with no reload.
 *
 * Font loading and theme are intentionally in the same provider: nothing
 * themed should render with the system fallback font flashing in first.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = mode === 'dark';
    const colors = isDark ? darkColors : lightColors;
    return {
      mode,
      isDark,
      colors,
      elevation: buildElevation(isDark ? '#000000' : '#0B1B4D'),
      setMode,
      toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    };
  }, [mode]);

  if (!fontsLoaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const v = useContext(ThemeContext);
  if (!v) throw new Error('useTheme must be used within ThemeProvider');
  return v;
}
