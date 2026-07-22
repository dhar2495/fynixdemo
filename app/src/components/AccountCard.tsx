import React from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, radius, space, icons, ensureFillContrast, darken, type as typeScale } from '../theme';

export interface AccountData {
  id: string;
  name: string;
  type: string;
  currency: string;
  openingBalance: number;
}

interface Props {
  account: AccountData;
  formatter: (v: number, currency: string) => string;
  /** Live current balance (opening balance + net of its own transactions).
   * Falls back to the account's static opening balance if omitted. */
  balance?: number;
  testID?: string;
}

/** Hero-style card, same visual language as the dashboard's BalanceCard —
 * a real account deserves the same presence as the balance headline, not a
 * pale tint on a plain card. Both gradient stops are contrast-verified for
 * white text (not just the darker one), since the name/type sit near the
 * lighter end of the gradient. */
export const AccountCard = React.memo(function AccountCard({ account, formatter, balance, testID }: Props) {
  const { elevation } = useTheme();
  const displayBalance = balance ?? account.openingBalance;
  const isSavings = account.type === 'savings';
  const Icon = isSavings ? icons.savings : icons.accounts;
  const base = ensureFillContrast(isSavings ? '#14B8A6' : '#2453FF');
  const deep = darken(base, 0.18);

  return (
    <LinearGradient
      testID={testID}
      colors={[base, deep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: radius.xl,
        padding: space.base,
        gap: space.sm,
        minWidth: 220,
        flexGrow: 1,
        ...elevation.raised,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <View style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color="#fff" />
        </View>
        <View>
          <Text style={[typeScale.bodyMedium, { color: '#fff' }]}>{account.name}</Text>
          <Text style={[typeScale.small, { color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' }]}>{account.type}</Text>
        </View>
      </View>
      <Text style={[typeScale.h2, { color: '#fff', fontVariant: ['tabular-nums'], marginTop: space.sm }]}>
        {formatter(displayBalance, account.currency)}
      </Text>
    </LinearGradient>
  );
});
