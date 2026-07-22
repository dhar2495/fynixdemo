import { TextStyle } from 'react-native';

/** Loaded at app startup via useFonts() in ThemeProvider — see theme/ThemeProvider.tsx. */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

type Scale = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'>;

/** Type scale — swap fontFamily per-style for weight (custom font files encode
 * weight themselves; mixing them with RN's `fontWeight` is unreliable cross-platform). */
export const type: Record<
  'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'bodySemibold' | 'caption' | 'captionMedium' | 'small',
  Scale
> = {
  display: { fontFamily: fontFamily.extrabold, fontSize: 36, lineHeight: 42, letterSpacing: -0.5 },
  h1: { fontFamily: fontFamily.bold, fontSize: 30, lineHeight: 37, letterSpacing: -0.3 },
  h2: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  h3: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 26, letterSpacing: 0 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  bodySemibold: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  caption: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  captionMedium: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  small: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
};

/** Tabular figures for money/number columns so digits don't jitter width as they change. */
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };
