import { Platform, ViewStyle } from 'react-native';

export type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOpacity' | 'shadowRadius' | 'shadowOffset' | 'elevation'
>;

/**
 * Soft, modern elevation scale (levels 0–5). Native uses shadow* + Android's
 * `elevation`; web (react-native-web) translates shadow* into a CSS box-shadow
 * automatically, so a single definition covers all three platforms.
 * `tint` lets dark mode use a lighter/softer shadow color instead of pure black,
 * which reads as "natural" rather than a harsh cutout on dark surfaces.
 */
export function makeElevation(level: 0 | 1 | 2 | 3 | 4 | 5, tint = '#0B1B4D'): ShadowStyle {
  if (level === 0) {
    return { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 };
  }
  const steps: Record<number, ShadowStyle> = {
    1: { shadowColor: tint, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
    2: { shadowColor: tint, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    3: { shadowColor: tint, shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
    4: { shadowColor: tint, shadowOpacity: 0.16, shadowRadius: 28, shadowOffset: { width: 0, height: 12 }, elevation: 6 },
    5: { shadowColor: tint, shadowOpacity: 0.24, shadowRadius: 40, shadowOffset: { width: 0, height: 20 }, elevation: 10 },
  };
  return steps[level];
}

/** Glass / blur-panel border+tint helper (paired with expo-blur's <BlurView>). */
export function glassOverlay(dark: boolean): ViewStyle {
  return {
    backgroundColor: dark ? 'rgba(22, 29, 51, 0.55)' : 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
  };
}

/** Legacy single-shadow export — kept so any not-yet-migrated screen using the
 * old `theme.ts` shadow constant keeps working unchanged. New components should
 * use `elevation` from theme/elevation.ts instead. */
export const legacyShadow: ShadowStyle = makeElevation(2);

export const isWeb = Platform.OS === 'web';
