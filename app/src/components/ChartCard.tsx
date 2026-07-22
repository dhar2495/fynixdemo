import React from 'react';
import { Text, View } from 'react-native';
import { useTheme, radius, space, type as typeScale } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  legend?: { label: string; color: string }[];
  children: React.ReactNode;
}

/** Consistent title/subtitle/legend chrome around any chart (gifted-charts, etc). */
export function ChartCard({ title, subtitle, legend, children }: Props) {
  const { colors, elevation } = useTheme();

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.base, ...elevation.card }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={[typeScale.h3, { color: colors.heading }]}>{title}</Text>
          {subtitle ? <Text style={[typeScale.caption, { color: colors.body, marginTop: 2 }]}>{subtitle}</Text> : null}
        </View>
        {legend ? (
          <View style={{ gap: 4 }}>
            {legend.map((l) => (
              <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: l.color }} />
                <Text style={[typeScale.small, { color: colors.body }]}>{l.label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={{ marginTop: space.base }}>{children}</View>
    </View>
  );
}
