import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { useTheme, initials, type as typeScale } from '../theme';

interface Props {
  name?: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ name, size = 44, color, style }: Props) {
  const { colors } = useTheme();
  const bg = color || colors.primaryDark;
  const fontSize = Math.round(size * 0.36);

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      <Text style={[typeScale.bodySemibold, { color: colors.onPrimary, fontSize }]}>{initials(name)}</Text>
    </View>
  );
}
