import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme, radius } from '../theme';

interface Props {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Shimmering placeholder block — use instead of showing "0" while real data loads. */
export function Skeleton({ width = '100%', height = 16, radius: r = radius.sm, style }: Props) {
  const { colors } = useTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })), -1, false);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + pulse.value * 0.4,
  }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: r, backgroundColor: colors.skeleton },
        animatedStyle,
        style,
      ]}
    />
  );
}
