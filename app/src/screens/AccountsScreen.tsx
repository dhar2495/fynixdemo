import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, Account, Txn } from '../api/client';
import { useAuth } from '../state/auth';
import { useScrollY } from '../state/scroll';
import { formatMoney, contentWidth } from '../theme';
import { useTheme, space } from '../theme';
import { Header, AccountCard, Skeleton, EmptyState, ScreenFade } from '../components';
import { icons } from '../theme';
import { T } from '../testids';

/** Real per-account current balance: opening balance + net of that
 * account's own transactions — derived live, same principle as the
 * dashboard summary, just scoped to one account instead of all of them. */
function liveBalance(account: Account, txns: Txn[]): number {
  const net = txns
    .filter((t) => t.accountId === account.id)
    .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  return account.openingBalance + net;
}

export default function AccountsScreen() {
  const { currency } = useAuth();
  const { colors } = useTheme();
  const scrollY = useScrollY();
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [accRes, txnRes] = await Promise.all([api.accounts(), api.listTxns({ pageSize: '100' })]);
      setAccounts(accRes.accounts);
      setTxns(txnRes.transactions);
    } catch {
      setAccounts([]);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useFocusEffect(useCallback(() => { scrollY.value = 0; }, [scrollY]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const loading = accounts === null;
  const money = useCallback((v: number, c: string) => formatMoney(v, c || currency), [currency]);

  return (
    <ScreenFade>
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: space.base, gap: space.base, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onScroll={(e) => { scrollY.value = e.nativeEvent.contentOffset.y; }}
      scrollEventThrottle={16}
    >
      <Header title="Accounts" subtitle="Real-time balances" />

      {loading ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          <Skeleton width={220} height={120} />
          <Skeleton width={220} height={120} />
        </View>
      ) : accounts.length === 0 ? (
        <EmptyState testID={T.accountsEmpty} icon={icons.accounts} title="No accounts" message="Accounts you open will show up here." />
      ) : (
        <View testID={T.accountsList} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {accounts.map((a) => (
            <AccountCard
              key={a.id}
              testID={T.accountCard(a.id)}
              account={a}
              balance={liveBalance(a, txns)}
              formatter={money}
            />
          ))}
        </View>
      )}
    </ScrollView>
    </ScreenFade>
  );
}
