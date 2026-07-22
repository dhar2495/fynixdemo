import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedNumber } from './AnimatedNumber';
import { Sparkline } from './Sparkline';
import { useTheme, radius, space, icons, ensureFillContrast, type as typeScale, type LucideIcon } from '../theme';

export interface MetricTrend {
  series: number[];
  /** % change of the latter half of `series` vs the former half; null when
   * there isn't enough history yet (e.g. a brand-new account) to compare. */
  changePct: number | null;
}

interface Props {
  label: string;
  value: number;
  formatter: (v: number) => string;
  icon: LucideIcon;
  tint?: string;
  testID?: string;
  wide?: boolean;
  trend?: MetricTrend;
  /** Which direction of change reads as "good" for this metric — up for
   * income/net (more is better), down for spend (less is better). */
  positiveDirection?: 'up' | 'down';
}

/** A single KPI tile — income, expense, net, transaction count, etc. Memoized
 * since Dashboard renders several of these and re-renders often (refresh,
 * theme toggle, unrelated state). */
export const MetricCard = React.memo(function MetricCard({
  label, value, formatter, icon: Icon, tint, testID, wide, trend, positiveDirection = 'up',
}: Props) {
  const { colors, elevation } = useTheme();
  const accent = tint || colors.primary;
  // The icon box is a solid fill with a white icon — a much higher contrast
  // bar than `accent`'s usual job as text/border/sparkline color, where
  // dark mode's lightened income/expense/primary would be too washed out.
  const iconFill = ensureFillContrast(accent);
  const pct = trend?.changePct ?? null;
  const isGood = pct === null ? null : positiveDirection === 'up' ? pct >= 0 : pct <= 0;
  const trendColor = isGood === null ? colors.caption : isGood ? colors.income : colors.expense;
  const TrendIcon = pct !== null && pct < 0 ? icons.trendDown : icons.trendUp;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.xl,
        padding: space.base,
        flexGrow: 1,
        minWidth: wide ? '22%' : '46%',
        borderLeftWidth: 4,
        borderLeftColor: accent,
        ...elevation.raised,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm }}>
        <View
          style={{
            width: 34, height: 34, borderRadius: radius.md, backgroundColor: iconFill,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon size={17} color="#fff" />
        </View>
        {trend ? <Sparkline data={trend.series} color={accent} /> : null}
      </View>
      <Text style={[typeScale.caption, { color: colors.body, marginBottom: 4 }]}>{label}</Text>
      <AnimatedNumber
        value={value}
        formatter={formatter}
        testID={testID}
        accessibilityLabel={testID}
        style={[typeScale.h3, { color: colors.heading, fontVariant: ['tabular-nums'] }]}
      />
      {pct !== null ? (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 }}
          accessibilityLabel={`${Math.abs(pct).toFixed(1)}% ${pct < 0 ? 'decrease' : 'increase'} vs last week`}
        >
          <TrendIcon size={12} color={trendColor} />
          <Text style={[typeScale.small, { color: trendColor }]}>{Math.abs(pct).toFixed(1)}% vs last week</Text>
        </View>
      ) : null}
    </View>
  );
});
