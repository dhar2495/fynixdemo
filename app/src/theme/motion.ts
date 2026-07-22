import { Easing, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

export const timing: Record<'fast' | 'base' | 'slow', WithTimingConfig> = {
  fast: { duration: duration.fast, easing: Easing.out(Easing.cubic) },
  base: { duration: duration.base, easing: Easing.out(Easing.cubic) },
  slow: { duration: duration.slow, easing: Easing.inOut(Easing.cubic) },
};

export const spring: Record<'gentle' | 'default' | 'snappy', WithSpringConfig> = {
  gentle: { damping: 18, stiffness: 120, mass: 1 },
  default: { damping: 16, stiffness: 180, mass: 0.9 },
  snappy: { damping: 14, stiffness: 260, mass: 0.7 },
};

/** Press-feedback scale used by Button/Card/QuickAction etc. */
export const pressScale = { down: 0.96, up: 1 } as const;
