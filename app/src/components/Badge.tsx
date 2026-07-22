import React from 'react';
import { Text, View } from 'react-native';
import { useTheme, radius, space, type as typeScale } from '../theme';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral' | 'info';

interface Props {
  label: string;
  variant?: BadgeVariant;
}

/** Small status pill — e.g. transaction payment status (Completed/Pending/Failed). */
export function Badge({ label, variant = 'neutral' }: Props) {
  const { colors } = useTheme();

  const scheme: Record<BadgeVariant, { bg: string; fg: string }> = {
    success: { bg: colors.successBg, fg: colors.success },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    warning: { bg: colors.warningBg, fg: colors.warning },
    info: { bg: colors.primaryLight, fg: colors.primary },
    neutral: { bg: colors.divider, fg: colors.body },
  };
  const { bg, fg } = scheme[variant];

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: radius.full,
        paddingHorizontal: space.sm,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={[typeScale.small, { color: fg }]}>{label}</Text>
    </View>
  );
}
