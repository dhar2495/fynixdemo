import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme, radius, space, type as typeScale } from '../theme';

interface Segment {
  key: string;
  label: string;
}

interface Props {
  segments: Segment[];
  value: string;
  onChange: (key: string) => void;
  testIDPrefix?: string;
}

export function SegmentControl({ segments, value, onChange, testIDPrefix }: Props) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: space.sm }}>
      {segments.map((seg) => {
        const active = seg.key === value;
        return (
          <AnimatedPressable
            key={seg.key}
            testID={testIDPrefix ? `${testIDPrefix}-${seg.key}` : undefined}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(seg.key)}
            style={{
              flex: 1,
              paddingVertical: space.sm + 2,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: active ? colors.primary : colors.border,
              backgroundColor: active ? colors.primary : colors.surface,
              alignItems: 'center',
            }}
          >
            <Text style={[typeScale.captionMedium, { color: active ? colors.onPrimary : colors.body, textTransform: 'capitalize' }]}>
              {seg.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}
