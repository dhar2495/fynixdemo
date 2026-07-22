import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { spring, pressScale, opacity } from '../theme';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  style?: StyleProp<ViewStyle>;
  scaleOnPress?: boolean;
  /** Lift on mouse hover (web/desktop only — native touch has no hover
   * concept, so onHoverIn/onHoverOut simply never fire there). */
  hoverLift?: boolean;
  disabled?: boolean;
}

/**
 * Shared press-feedback primitive: scales down slightly on press-in, springs
 * back on release, lifts on hover (opt-in), and dims when disabled. Every
 * interactive component (Button, Card, Chip, QuickAction, FloatingButton) is
 * built on this so the "feel" of pressing anything in the app is consistent.
 * Respects the OS reduced-motion setting by skipping straight to the resting
 * value instead of springing.
 */
export function AnimatedPressable({ style, scaleOnPress = true, hoverLift, disabled, onPressIn, onPressOut, onHoverIn, onHoverOut, ...rest }: Props) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
    opacity: disabled ? opacity.disabled : 1,
  }));

  return (
    <AnimatedPressableBase
      disabled={disabled}
      onPressIn={(e) => {
        if (scaleOnPress) scale.value = reduceMotion ? pressScale.down : withSpring(pressScale.down, spring.snappy);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (scaleOnPress) scale.value = reduceMotion ? pressScale.up : withSpring(pressScale.up, spring.snappy);
        onPressOut?.(e);
      }}
      onHoverIn={(e) => {
        if (hoverLift) lift.value = reduceMotion ? -2 : withSpring(-2, spring.gentle);
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        if (hoverLift) lift.value = reduceMotion ? 0 : withSpring(0, spring.gentle);
        onHoverOut?.(e);
      }}
      style={[style, animatedStyle]}
      {...rest}
    />
  );
}
