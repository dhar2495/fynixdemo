import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme, radius, space, ensureFillContrast, type as typeScale, type LucideIcon } from '../theme';

interface Props {
  label: string;
  icon: LucideIcon;
  color?: string;
  onPress?: () => void;
  testID?: string;
}

export function QuickAction({ label, icon: Icon, color, onPress, testID }: Props) {
  const { colors, elevation } = useTheme();
  // Solid fill + white icon needs real headroom, not just "a nice brand
  // color" — some callers pass hues (teal/amber) that read fine as small
  // tinted accents but fail 4.5:1 as a full white-icon background.
  const tint = ensureFillContrast(color || colors.primary);

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hoverLift
      style={{ alignItems: 'center', width: 74 }}
    >
      <View
        style={{
          width: 52, height: 52, borderRadius: radius.full, backgroundColor: tint,
          alignItems: 'center', justifyContent: 'center', marginBottom: space.xs + 4,
          ...elevation.raised,
        }}
      >
        <Icon size={22} color="#fff" />
      </View>
      <Text style={[typeScale.small, { color: colors.heading, textAlign: 'center' }]}>{label}</Text>
    </AnimatedPressable>
  );
}
