import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme, radius, spring } from '../theme';

interface Props {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  color?: string;
  testID?: string;
  accessibilityLabel?: string;
}

const THUMB = 22;
const TRACK_HEIGHT = 6;
const HIT_HEIGHT = 32;

/** Drag-to-set slider built on gesture-handler + Reanimated (no extra native
 * slider dependency needed) — a value/onChange pair, same shape as a
 * controlled text input, so it can drive the exact same state a real numeric
 * field also writes to. Used alongside (not instead of) the loan form's
 * existing text inputs, which automation still drives via `.setValue()`. */
export function Slider({ value, min, max, step = 1, onChange, color, testID, accessibilityLabel }: Props) {
  const { colors, elevation } = useTheme();
  const accent = color || colors.primary;
  const [width, setWidth] = useState(0);
  const startX = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => Math.round(v / step) * step;
  const pctFor = (v: number) => (width <= 0 ? 0 : ((clamp(v) - min) / (max - min)) * width);

  const x = useSharedValue(pctFor(value));

  useEffect(() => {
    const next = pctFor(value);
    x.value = reduceMotion ? next : withSpring(next, spring.snappy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, width, reduceMotion]);

  const updateFromX = (nextX: number) => {
    if (width <= 0) return;
    const raw = min + (nextX / width) * (max - min);
    onChange(snap(clamp(raw)));
  };

  const pan = Gesture.Pan()
    .onStart(() => { startX.value = x.value; })
    .onUpdate((e) => {
      const next = Math.min(width, Math.max(0, startX.value + e.translationX));
      x.value = next;
      runOnJS(updateFromX)(next);
    });

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value - THUMB / 2 }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: x.value }));

  return (
    <GestureDetector gesture={pan}>
      <View
        testID={testID}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value }}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        style={{ height: HIT_HEIGHT, justifyContent: 'center' }}
      >
        <View style={{ height: TRACK_HEIGHT, borderRadius: radius.full, backgroundColor: colors.border, overflow: 'hidden' }}>
          <Animated.View style={[{ height: TRACK_HEIGHT, backgroundColor: accent, borderRadius: radius.full }, fillStyle]} />
        </View>
        <Animated.View
          style={[
            {
              position: 'absolute', top: (HIT_HEIGHT - THUMB) / 2, width: THUMB, height: THUMB,
              borderRadius: radius.full, backgroundColor: accent, borderWidth: 2, borderColor: colors.surface,
              ...elevation.floating,
            },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}
