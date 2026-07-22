import React from 'react';
import { Text, View } from 'react-native';
import { useTheme, radius, space, type as typeScale } from '../theme';

interface Props {
  label: string;
  color?: string;
}

/** Static label (category name, account type) — visually quieter than Badge/Chip
 * since it's informational, not interactive or status-driven. */
export function Tag({ label, color }: Props) {
  const { colors } = useTheme();
  const tint = color || colors.body;

  return (
    <View
      style={{
        backgroundColor: `${tint}1A`,
        borderRadius: radius.sm,
        paddingHorizontal: space.sm,
        paddingVertical: 2,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={[typeScale.small, { color: tint, textTransform: 'capitalize' }]}>{label}</Text>
    </View>
  );
}
