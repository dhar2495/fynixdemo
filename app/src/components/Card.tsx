import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme, radius, space } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'flat' | 'card' | 'raised' | 'sheet';
  padding?: number;
  onPress?: () => void;
  testID?: string;
}

/** Base surface for every card-shaped thing in the app. Pass `onPress` to
 * make it a tappable card (adds press feedback); omit it for a static container. */
export function Card({ children, style, elevation = 'raised', padding = space.base, onPress, testID }: Props) {
  const { colors, elevation: elevationScale } = useTheme();

  const base: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevationScale[elevation],
  };

  if (onPress) {
    return (
      <AnimatedPressable testID={testID} onPress={onPress} style={[base, style]} accessibilityRole="button">
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View testID={testID} style={[base, style]}>
      {children}
    </View>
  );
}
