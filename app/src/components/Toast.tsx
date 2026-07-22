import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme, radius, space, zIndex, type as typeScale } from '../theme';

interface Props {
  message: string;
  visible: boolean;
  testID?: string;
}

/** Bottom toast — slides up + fades in when `message` becomes non-empty. */
export function Toast({ message, visible, testID }: Props) {
  const { colors, elevation } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = visible ? withSpring(1, { damping: 16, stiffness: 180 }) : withTiming(0, { duration: 150 });
  }, [visible, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 16 }],
  }));

  if (!message) return null;

  return (
    <Animated.View
      testID={testID}
      accessibilityLabel={testID}
      accessibilityLiveRegion="polite"
      style={[
        {
          position: 'absolute',
          bottom: space.xl,
          left: space.xl,
          right: space.xl,
          backgroundColor: colors.heading,
          borderRadius: radius.md,
          paddingVertical: space.md,
          paddingHorizontal: space.lg,
          alignItems: 'center',
          zIndex: zIndex.toast,
          ...elevation.floating,
        },
        animatedStyle,
      ]}
    >
      <Text style={[typeScale.bodyMedium, { color: colors.surface }]}>{message}</Text>
    </Animated.View>
  );
}
