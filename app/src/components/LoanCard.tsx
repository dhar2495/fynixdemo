import React from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedNumber } from './AnimatedNumber';
import { useTheme, radius, space, darken, type as typeScale } from '../theme';

interface Props {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  formatter: (v: number) => string;
  emiTestID?: string;
  totalInterestTestID?: string;
  totalPaymentTestID?: string;
}

/** Loan calculator hero — EMI front and center, interest/payment as sub-stats.
 * Same gradient treatment as the dashboard's BalanceCard so the two "hero
 * number" moments in the app feel like one design language. */
export function LoanCard({ emi, totalInterest, totalPayment, formatter, emiTestID, totalInterestTestID, totalPaymentTestID }: Props) {
  const { colors, elevation } = useTheme();

  return (
    <LinearGradient
      colors={[colors.primaryDark, darken(colors.primaryDark, 0.16)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: radius.xl, padding: space.xl, ...elevation.hero }}
    >
      <Text style={[typeScale.captionMedium, { color: colors.primaryLight }]}>Monthly EMI</Text>
      <AnimatedNumber
        value={emi}
        formatter={formatter}
        testID={emiTestID}
        accessibilityLabel={emiTestID}
        style={[typeScale.display, { color: colors.onPrimary, marginTop: 4, fontVariant: ['tabular-nums'] }]}
      />
      <View style={{ flexDirection: 'row', gap: space.xl, marginTop: space.lg }}>
        <Stat label="Total interest" value={formatter(totalInterest)} testID={totalInterestTestID} />
        <Stat label="Total payment" value={formatter(totalPayment)} testID={totalPaymentTestID} />
      </View>
    </LinearGradient>
  );
}

function Stat({ label, value, testID }: { label: string; value: string; testID?: string }) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={[typeScale.small, { color: colors.primaryLight }]}>{label}</Text>
      <Text
        testID={testID}
        accessibilityLabel={testID}
        style={[typeScale.bodySemibold, { color: colors.onPrimary, marginTop: 2, fontVariant: ['tabular-nums'] }]}
      >
        {value}
      </Text>
    </View>
  );
}
