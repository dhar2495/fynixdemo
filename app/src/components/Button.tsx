import React from 'react';
import { ActivityIndicator, StyleProp, Text, ViewStyle } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme, radius, space, palette, type as typeScale } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

const HEIGHTS: Record<ButtonSize, number> = { sm: 36, md: 48, lg: 56 };
const FONT: Record<ButtonSize, keyof typeof typeScale> = { sm: 'captionMedium', md: 'bodySemibold', lg: 'bodySemibold' };

export function Button({
  label, onPress, variant = 'primary', size = 'md', loading, disabled, icon, fullWidth, style, testID, accessibilityLabel,
}: Props) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyle: ViewStyle = {
    // primaryDark (not primary) — in dark mode `primary` is a lighter accent blue
    // tuned for legibility as text/icons on dark surfaces, which isn't dark enough
    // to give white button text 4.5:1 contrast. primaryDark always is.
    primary: { backgroundColor: colors.primaryDark, borderWidth: 0 },
    secondary: { backgroundColor: colors.primaryLight, borderWidth: 0 },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent', borderWidth: 0 },
    // Fixed palette red, not the theme's `colors.danger` — dark mode's danger is
    // deliberately lightened for legibility as text on dark cards, which fails
    // white-text-on-top contrast the same way `primary` does above.
    danger: { backgroundColor: palette.danger, borderWidth: 0 },
  }[variant];

  const textColor: string = {
    primary: colors.onPrimary,
    secondary: colors.primary,
    outline: colors.heading,
    ghost: colors.primary,
    danger: colors.onPrimary,
  }[variant];

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        {
          height: HEIGHTS[size],
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: space.sm,
          paddingHorizontal: space.lg,
          alignSelf: fullWidth ? 'stretch' : undefined,
        },
        variantStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[typeScale[FONT[size]], { color: textColor }]}>{label}</Text>
        </>
      )}
    </AnimatedPressable>
  );
}
