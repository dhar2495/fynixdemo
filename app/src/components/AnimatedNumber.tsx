import React, { useEffect, useState } from 'react';
import { TextStyle } from 'react-native';
import Animated, { runOnJS, useAnimatedReaction, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { duration } from '../theme';

interface Props {
  value: number;
  formatter: (v: number) => string;
  style?: TextStyle | TextStyle[];
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * Counts smoothly from the previous value to the next whenever `value`
 * changes, instead of snapping — used anywhere a balance/KPI updates live
 * (e.g. right after adding/deleting a transaction).
 */
export function AnimatedNumber({ value, formatter, style, testID, accessibilityLabel }: Props) {
  const progress = useSharedValue(value);
  const [display, setDisplay] = useState(value);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    progress.value = reduceMotion ? value : withTiming(value, { duration: duration.slow });
  }, [value, progress, reduceMotion]);

  useAnimatedReaction(
    () => Math.round(progress.value * 100) / 100,
    (current, previous) => {
      if (current !== previous) runOnJS(setDisplay)(current);
    },
  );

  return (
    <Animated.Text testID={testID} accessibilityLabel={accessibilityLabel} style={style}>
      {formatter(display)}
    </Animated.Text>
  );
}
