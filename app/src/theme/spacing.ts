/** 8pt grid. Use these instead of ad hoc numbers in new component styles. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 56,
  giant: 64,
} as const;

export type SpaceKey = keyof typeof space;
