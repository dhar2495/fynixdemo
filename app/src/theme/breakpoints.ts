import { useWindowDimensions } from 'react-native';

export const breakpoints = {
  phone: 0,
  tablet: 700,
  desktop: 1024,
  wide: 1440,
} as const;

export type BreakpointName = 'phone' | 'tablet' | 'desktop' | 'wide';

export function nameForWidth(width: number): BreakpointName {
  if (width >= breakpoints.wide) return 'wide';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'phone';
}

/** Single source of truth for responsive layout decisions — replaces the
 * per-screen `useWindowDimensions().width >= 700` checks scattered around. */
export function useBreakpoint() {
  const { width } = useWindowDimensions();
  const name = nameForWidth(width);
  return {
    name,
    width,
    isPhone: name === 'phone',
    isTablet: name === 'tablet',
    isDesktop: name === 'desktop' || name === 'wide',
    isWide: name === 'wide',
    atLeastTablet: width >= breakpoints.tablet,
    atLeastDesktop: width >= breakpoints.desktop,
  };
}
