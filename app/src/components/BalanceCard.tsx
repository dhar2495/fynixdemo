import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedNumber } from './AnimatedNumber';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme, radius, space, type as typeScale, icons, darken } from '../theme';
import { T } from '../testids';

interface Props {
  label: string;
  value: number;
  formatter: (v: number) => string;
  income: number;
  expense: number;
  testID?: string;
}

/** Digits carry the exact balance; everything else (currency symbol, grouping,
 * decimal point) stays put so the masked value still reads as "an amount". */
function maskAmount(formatted: string): string {
  return formatted.replace(/\d/g, '•');
}

/** Dashboard hero — current balance + the income/expense split bar beneath
 * it, with a Paytm/GPay-style eye toggle to mask the amount for privacy. */
export function BalanceCard({ label, value, formatter, income, expense, testID }: Props) {
  const { colors, elevation } = useTheme();
  const [hidden, setHidden] = useState(false);
  const total = income + expense;
  const incomeShare = total > 0 ? income / total : 0.5;
  const EyeIcon = hidden ? icons.eyeOff : icons.eye;

  return (
    <LinearGradient
      colors={[colors.primaryDark, darken(colors.primaryDark, 0.16)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: radius.xl,
        padding: space.xl,
        ...elevation.hero,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={[typeScale.captionMedium, { color: colors.primaryLight }]}>{label}</Text>
        <AnimatedPressable
          testID={T.balanceHideToggle}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
          onPress={() => setHidden((h) => !h)}
          hitSlop={10}
        >
          <EyeIcon size={18} color={colors.primaryLight} />
        </AnimatedPressable>
      </View>

      {hidden ? (
        <Text
          testID={testID}
          accessibilityLabel="Balance hidden"
          style={[typeScale.display, { color: colors.onPrimary, marginTop: 4 }]}
        >
          {maskAmount(formatter(value))}
        </Text>
      ) : (
        <AnimatedNumber
          value={value}
          formatter={formatter}
          testID={testID}
          accessibilityLabel={testID}
          style={[typeScale.display, { color: colors.onPrimary, marginTop: 4, fontVariant: ['tabular-nums'] }]}
        />
      )}

      <View style={{ flexDirection: 'row', height: 8, borderRadius: radius.full, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)', marginTop: space.lg }}>
        <View style={{ flex: Math.max(incomeShare, 0.02), backgroundColor: colors.income }} />
        <View style={{ flex: Math.max(1 - incomeShare, 0.02) }} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.base, marginTop: space.sm }}>
        <Legend color={colors.income} label={`Income ${hidden ? maskAmount(formatter(income)) : formatter(income)}`} />
        <Legend color="rgba(255,255,255,0.4)" label={`Expenses ${hidden ? maskAmount(formatter(expense)) : formatter(expense)}`} />
      </View>
    </LinearGradient>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={[typeScale.small, { color: colors.primaryLight }]}>{label}</Text>
    </View>
  );
}
