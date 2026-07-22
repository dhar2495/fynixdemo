import React from 'react';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme, radius, type LucideIcon } from '../theme';
import { icons } from '../theme';

interface Props {
  onPress?: () => void;
  icon?: LucideIcon;
  testID?: string;
  accessibilityLabel?: string;
}

/** Mobile-only floating action button (e.g. quick "add transaction"). */
export function FloatingButton({ onPress, icon, testID, accessibilityLabel = 'Add' }: Props) {
  const { colors, elevation } = useTheme();
  const Icon = icon || icons.add;

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={{
        position: 'absolute',
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...elevation.floating,
      }}
    >
      <Icon size={24} color={colors.onPrimary} />
    </AnimatedPressable>
  );
}
