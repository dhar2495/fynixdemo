import React from 'react';
import { Text } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme, radius, space, type as typeScale } from '../theme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
}

/** Toggleable filter pill — search/category/type filters. */
export function Chip({ label, active, onPress, testID, accessibilityLabel }: Props) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={{
        paddingHorizontal: space.md,
        paddingVertical: space.xs + 3,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primary : colors.surface,
      }}
    >
      <Text style={[typeScale.captionMedium, { color: active ? colors.onPrimary : colors.body, textTransform: 'capitalize' }]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
