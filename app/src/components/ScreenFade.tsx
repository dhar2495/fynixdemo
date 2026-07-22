import React, { useCallback } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { duration } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Subtle fade + rise applied every time a tab screen regains focus — this
 * app is tabs-only (no stack pushes), so there's nothing that would
 * otherwise animate when switching between Dashboard/Accounts/Transactions/
 * Loan/Settings. Driven by useFocusEffect + a shared value rather than a
 * mount-triggered `entering` animation, since tab screens stay mounted and
 * only a fresh focus event should replay it.
 */
export function ScreenFade({ children, style }: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);
  const reduceMotion = useReducedMotion();

  useFocusEffect(
    useCallback(() => {
      if (reduceMotion) {
        opacity.value = 1;
        translateY.value = 0;
        return;
      }
      opacity.value = 0;
      translateY.value = 8;
      opacity.value = withTiming(1, { duration: duration.base });
      translateY.value = withTiming(0, { duration: duration.base });
    }, [opacity, translateY, reduceMotion]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[{ flex: 1 }, animatedStyle, style]}>{children}</Animated.View>;
}
