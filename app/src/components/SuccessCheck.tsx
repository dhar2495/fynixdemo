import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme, space, spring, type as typeScale, icons } from '../theme';

interface Props {
  visible: boolean;
  message: string;
  onDone: () => void;
  testID?: string;
}

const HOLD_MS = 1200;

/** In-modal success beat for a completed payment (Send Money / bill pay) —
 * rendered in place of the form inside the same AppModal/AppBottomSheet, so
 * the user sees "paid" before the sheet auto-closes rather than it just
 * vanishing. Built on Reanimated (the app's animation primitive everywhere
 * else) rather than a Lottie asset, since there's no bundled Lottie file. */
export function SuccessCheck({ visible, message, onDone, testID }: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    scale.value = 0;
    opacity.value = withTiming(1, { duration: 150 });
    scale.value = withSpring(1, spring.snappy);
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) runOnJS(onDone)();
      });
    }, HOLD_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) return null;

  return (
    <Animated.View
      testID={testID}
      accessibilityLiveRegion="polite"
      style={[{ alignItems: 'center', justifyContent: 'center', paddingVertical: space.xxl }, containerStyle]}
    >
      <Animated.View
        style={[
          { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.income, alignItems: 'center', justifyContent: 'center' },
          circleStyle,
        ]}
      >
        <icons.check size={40} color="#fff" />
      </Animated.View>
      <Text style={[typeScale.bodySemibold, { color: colors.heading, marginTop: space.md, textAlign: 'center' }]}>{message}</Text>
    </Animated.View>
  );
}
