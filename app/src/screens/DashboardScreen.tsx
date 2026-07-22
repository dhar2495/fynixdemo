import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { api, Summary, Txn } from '../api/client';
import { useAuth } from '../state/auth';
import { useScrollY } from '../state/scroll';
import { formatMoney, contentWidth } from '../theme';
import {
  useTheme, space, radius, icons, palette, ensureFillContrast, categoryColors, resolveCategoryIcon, type as typeScale, type LucideIcon,
} from '../theme';
import {
  AnimatedPressable, Card, BalanceCard, MetricCard, QuickAction, ChartCard, Skeleton, ScreenFade,
  TransactionCard, EmptyState,
} from '../components';
import type { MetricTrend } from '../components';
import { T } from '../testids';

const QUICK_ACTIONS: { key: string; label: string; icon: LucideIcon; color: string; screen: string; params?: Record<string, any> }[] = [
  { key: 'send', label: 'Send money', icon: icons.send, color: palette.primaryDark, screen: 'Transactions', params: { sendMoney: true } },
  { key: 'recharge', label: 'Recharge', icon: icons.recharge, color: palette.purple, screen: 'Transactions', params: { bill: 'recharge' } },
  { key: 'electricity', label: 'Electricity', icon: icons.electricity, color: '#B7791F', screen: 'Transactions', params: { bill: 'electricity' } },
  { key: 'dth', label: 'DTH / Bills', icon: icons.bills, color: palette.savings, screen: 'Transactions', params: { bill: 'dth' } },
  // Real shortcut to the loan calculator — not a fake "apply for a loan"
  // flow, just a quick jump to the tool that already exists.
  { key: 'loan', label: 'Loan EMI', icon: icons.loanNav, color: palette.loan, screen: 'Loan' },
];

const OFFERS = [
  { id: 'o1', icon: icons.electricity, title: '5% cashback', subtitle: 'On electricity bill payments', tint: '#B7791F' },
  { id: 'o2', icon: icons.receipt, title: 'Refer & earn ₹100', subtitle: 'Invite friends to SyslaFynix', tint: '#7C3AED' },
  { id: 'o3', icon: icons.savings, title: 'Zero markup', subtitle: 'On international transfers', tint: '#14B8A6' },
];

/** Groups real transactions into per-date income/expense bar pairs, a
 * category-of-expense breakdown, and a running cash-flow balance —
 * all derived live, nothing mocked. `txns` must already be date-ascending
 * (the API call requests that order) for the cash-flow running total to
 * accumulate correctly. */
function buildChartData(txns: Txn[], openingBalance: number, colors: ReturnType<typeof useTheme>['colors']) {
  const byDate = new Map<string, { income: number; expense: number }>();
  for (const t of txns) {
    const entry = byDate.get(t.date) || { income: 0, expense: 0 };
    if (t.type === 'income') entry.income += t.amount; else entry.expense += t.amount;
    byDate.set(t.date, entry);
  }
  const dates = [...byDate.keys()].sort();
  const trend = dates.flatMap((date) => {
    const { income, expense } = byDate.get(date)!;
    const short = date.slice(8); // day-of-month only — mm-dd truncates at this bar width
    return [
      { value: income, frontColor: colors.income, label: short, spacing: 2 },
      { value: expense, frontColor: colors.expense, spacing: 14 },
    ];
  });

  const byCategory = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== 'expense') continue;
    byCategory.set(t.category, (byCategory.get(t.category) || 0) + t.amount);
  }
  const categories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, value]) => ({
      value,
      text: category,
      color: categoryColors[category] || colors.caption,
    }));

  let running = openingBalance;
  const cashFlow = dates.map((date) => {
    const { income, expense } = byDate.get(date)!;
    running += income - expense;
    return { value: running, label: date.slice(8) };
  });

  return { trend, categories, cashFlow };
}

/** Per-KPI daily series (last 14 days of real data) plus a latter-half-vs-
 * former-half % change — used for the dashboard's sparkline + trend badge.
 * Purely derived from already-fetched transactions, nothing invented; when
 * there isn't enough history to form two comparable halves, changePct is
 * null and the card just shows the sparkline with no badge. */
function buildTrends(txns: Txn[]): { income: MetricTrend; expense: MetricTrend; net: MetricTrend } {
  const byDate = new Map<string, { income: number; expense: number }>();
  for (const t of txns) {
    const entry = byDate.get(t.date) || { income: 0, expense: 0 };
    if (t.type === 'income') entry.income += t.amount; else entry.expense += t.amount;
    byDate.set(t.date, entry);
  }
  const dates = [...byDate.keys()].sort().slice(-14);

  const seriesFor = (pick: (d: { income: number; expense: number }) => number) =>
    dates.map((d) => pick(byDate.get(d)!));

  const changePct = (series: number[]): number | null => {
    if (series.length < 4) return null;
    const half = Math.floor(series.length / 2);
    const prev = series.slice(0, half).reduce((a, b) => a + b, 0);
    const curr = series.slice(half).reduce((a, b) => a + b, 0);
    if (prev === 0) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const incomeSeries = seriesFor((d) => d.income);
  const expenseSeries = seriesFor((d) => d.expense);
  const netSeries = seriesFor((d) => d.income - d.expense);

  return {
    income: { series: incomeSeries, changePct: changePct(incomeSeries) },
    expense: { series: expenseSeries, changePct: changePct(expenseSeries) },
    net: { series: netSeries, changePct: changePct(netSeries) },
  };
}

export default function DashboardScreen() {
  const { currency } = useAuth();
  const { colors, elevation } = useTheme();
  const navigation = useNavigation<any>();
  const scrollY = useScrollY();
  const [data, setData] = useState<Summary | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [offers, setOffers] = useState(OFFERS);

  const load = useCallback(async () => {
    try {
      const [summary, list] = await Promise.all([
        api.summary(),
        api.listTxns({ pageSize: '100', sort: 'date', order: 'asc' }),
      ]);
      setData(summary);
      setTxns(list.transactions);
    } catch {
      // handled by the loading/empty skeleton state below
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  // Reset Topbar's blur-on-scroll state on every tab focus — otherwise
  // switching tabs mid-scroll would leave the blur "stuck on" until the
  // newly-focused screen's own onScroll fires at least once.
  useFocusEffect(useCallback(() => { scrollY.value = 0; }, [scrollY]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const loading = data === null;
  const income = data?.income ?? 0;
  const expense = data?.expense ?? 0;
  // Recomputing this on every render (e.g. while `refreshing` toggles, before
  // new data even arrives) would re-derive the whole trend/category/cash-flow
  // breakdown for nothing — only recompute when the underlying data changes.
  const { trend, categories, cashFlow } = useMemo(
    () => buildChartData(txns, data?.openingBalance ?? 0, colors),
    [txns, data?.openingBalance, colors],
  );
  const trends = useMemo(() => buildTrends(txns), [txns]);
  // `txns` is fetched date-ascending (needed for the cash-flow running total
  // above) — take the tail and reverse for "most recent first" here instead
  // of firing a second, differently-sorted request.
  const recent = useMemo(() => [...txns].slice(-5).reverse(), [txns]);
  // Stable reference so memoized children (MetricCard etc.) receiving this as
  // a prop don't treat it as "changed" on every unrelated re-render.
  const money = useCallback((v: number) => formatMoney(v, currency), [currency]);

  return (
    <ScreenFade>
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: space.base, gap: space.base, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onScroll={(e) => { scrollY.value = e.nativeEvent.contentOffset.y; }}
      scrollEventThrottle={16}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[typeScale.h3, { color: colors.heading }]}>Overview</Text>
        <AnimatedPressable
          testID={T.dashboardRefresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh dashboard"
          onPress={onRefresh}
          style={{
            width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
          }}
        >
          <icons.refresh size={16} color={colors.body} />
        </AnimatedPressable>
      </View>

      {offers.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
          {offers.map((o) => (
            <View
              key={o.id}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: space.sm,
                backgroundColor: ensureFillContrast(o.tint), borderRadius: radius.lg, padding: space.md, width: 220,
              }}
            >
              <o.icon size={18} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={[typeScale.captionMedium, { color: '#fff' }]}>{o.title}</Text>
                <Text style={[typeScale.small, { color: 'rgba(255,255,255,0.85)' }]}>{o.subtitle}</Text>
              </View>
              <AnimatedPressable
                testID={T.bannerDismiss(o.id)}
                accessibilityRole="button"
                accessibilityLabel={`Dismiss ${o.title} offer`}
                onPress={() => setOffers((prev) => prev.filter((x) => x.id !== o.id))}
                hitSlop={8}
              >
                <icons.close size={16} color="rgba(255,255,255,0.85)" />
              </AnimatedPressable>
            </View>
          ))}
        </ScrollView>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {QUICK_ACTIONS.map((a) => (
          <QuickAction
            key={a.key}
            testID={T.quickAction(a.key)}
            label={a.label}
            icon={a.icon}
            color={a.color}
            onPress={() => navigation.navigate(a.screen, a.params)}
          />
        ))}
      </View>

      {loading ? (
        <View style={{ backgroundColor: colors.card, borderRadius: radius.xl, padding: space.xl, gap: space.md, borderWidth: 1, borderColor: colors.border }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={180} height={34} />
          <Skeleton width="100%" height={8} radius={radius.full} />
        </View>
      ) : (
        <BalanceCard
          label="Current balance"
          value={data!.currentBalance}
          formatter={money}
          income={income}
          expense={expense}
          testID={T.kpiBalance}
        />
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {loading ? (
          <>
            <Skeleton width="46%" height={90} radius={radius.lg} />
            <Skeleton width="46%" height={90} radius={radius.lg} />
            <Skeleton width="46%" height={90} radius={radius.lg} />
            <Skeleton width="46%" height={90} radius={radius.lg} />
          </>
        ) : (
          <>
            <MetricCard label="Income" value={income} formatter={money} icon={icons.income} tint={colors.income} testID={T.kpiIncome} trend={trends.income} />
            <MetricCard label="Expenses" value={expense} formatter={money} icon={icons.expense} tint={colors.expense} testID={T.kpiExpense} trend={trends.expense} positiveDirection="down" />
            <MetricCard label="Net movement" value={data!.net} formatter={money} icon={icons.net} testID={T.kpiNet} trend={trends.net} />
            <MetricCard label="Transactions" value={data!.transactionCount} formatter={(v) => String(v)} icon={icons.receipt} />
          </>
        )}
      </View>

      {!loading ? (
        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[typeScale.h3, { color: colors.heading }]}>Recent transactions</Text>
            <AnimatedPressable
              testID={T.dashboardSeeAll}
              accessibilityRole="button"
              accessibilityLabel="See all transactions"
              onPress={() => navigation.navigate('Transactions')}
            >
              <Text style={[typeScale.captionMedium, { color: colors.primary }]}>See all</Text>
            </AnimatedPressable>
          </View>
          {recent.length === 0 ? (
            <EmptyState icon={icons.receipt} title="No transactions yet" message="Add one to see it here." />
          ) : (
            <View testID={T.dashboardRecentList} style={{ gap: space.sm }}>
              {recent.map((t) => (
                <TransactionCard key={t.id} txn={t} formatter={money} />
              ))}
            </View>
          )}
        </View>
      ) : null}

      {!loading && trend.length > 0 ? (
        <ChartCard
          title="Income vs expense"
          subtitle="By transaction date"
          legend={[{ label: 'Income', color: colors.income }, { label: 'Expense', color: colors.expense }]}
        >
          <BarChart
            data={trend}
            height={160}
            barWidth={14}
            spacing={2}
            initialSpacing={10}
            noOfSections={4}
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor={colors.border}
            hideRules
            yAxisTextStyle={{ color: colors.caption, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.caption, fontSize: 10 }}
          />
        </ChartCard>
      ) : null}

      {!loading && cashFlow.length > 1 ? (
        <ChartCard title="Cash flow" subtitle="Running balance over time">
          <LineChart
            data={cashFlow}
            height={140}
            curved
            color={colors.primary}
            thickness={2}
            dataPointsColor={colors.primary}
            dataPointsRadius={3}
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor={colors.border}
            hideRules
            yAxisTextStyle={{ color: colors.caption, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.caption, fontSize: 10 }}
            noOfSections={4}
          />
        </ChartCard>
      ) : null}

      {!loading && categories.length > 0 ? (
        <ChartCard title="Spending by category" subtitle="Expenses only">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
            <PieChart data={categories} donut radius={64} innerRadius={40} innerCircleColor={colors.card} />
            <View style={{ gap: space.xs, flex: 1 }}>
              {categories.slice(0, 5).map((c) => (
                <View key={c.text} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.color }} />
                  <Text style={[typeScale.caption, { color: colors.body, textTransform: 'capitalize', flex: 1 }]} numberOfLines={1}>
                    {c.text}
                  </Text>
                  <Text style={[typeScale.captionMedium, { color: colors.heading }]}>{money(c.value)}</Text>
                </View>
              ))}
            </View>
          </View>
        </ChartCard>
      ) : null}

      <Card elevation="flat" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }}>
        <Text style={[typeScale.bodySemibold, { color: colors.primaryDark, marginBottom: 4 }]}>How these are calculated</Text>
        <Text style={[typeScale.caption, { color: colors.body, lineHeight: 19 }]}>
          Net = income − expenses. Current balance = sum of account opening balances + net. Every
          value here is derived live from the transactions, never hardcoded — add or delete a
          transaction and it updates instantly.
        </Text>
      </Card>
    </ScrollView>
    </ScreenFade>
  );
}
