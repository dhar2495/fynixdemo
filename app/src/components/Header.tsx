import React from 'react';
import { Text, View } from 'react-native';
import { useTheme, space, type as typeScale } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

/** Per-screen title block (not the app-wide Topbar) — "Transactions", "Loan calculator", etc. */
export function Header({ title, subtitle, right }: Props) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space.base }}>
      <View>
        {subtitle ? <Text style={[typeScale.caption, { color: colors.body }]}>{subtitle}</Text> : null}
        <Text style={[typeScale.h1, { color: colors.heading }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}
