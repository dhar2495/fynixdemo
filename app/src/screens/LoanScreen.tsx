import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Share, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { api, LoanResult } from '../api/client';
import { useAuth } from '../state/auth';
import { useScrollY } from '../state/scroll';
import { formatMoney, contentWidth } from '../theme';
import { useTheme, space, radius, icons, type as typeScale } from '../theme';
import { Header, Card, Button, LoanCard, ChartCard, ScreenFade, Slider } from '../components';
import { T } from '../testids';

const CONTAINER_STYLE = { padding: space.base, maxWidth: contentWidth, alignSelf: 'center' as const, width: '100%' as const };

export default function LoanScreen() {
  const { currency } = useAuth();
  const { colors } = useTheme();
  const scrollY = useScrollY();
  useFocusEffect(useCallback(() => { scrollY.value = 0; }, [scrollY]));
  const [principal, setPrincipal] = useState('500000');
  const [rate, setRate] = useState('9.5');
  const [tenure, setTenure] = useState('24');
  const [result, setResult] = useState<LoanResult | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [error, setError] = useState('');
  const [calculating, setCalculating] = useState(false);

  const money = useCallback((v: number) => formatMoney(v, currency), [currency]);

  const onCalculate = async () => {
    setError('');
    setCalculating(true);
    try {
      const r = await api.calcLoan(Number(principal), Number(rate), parseInt(tenure, 10));
      setResult(r);
    } catch (e: any) {
      setResult(null);
      setError(e.message || 'Could not calculate');
    } finally {
      setCalculating(false);
    }
  };

  const onShare = async () => {
    if (!result) return;
    try {
      await Share.share({
        message: `SyslaFynix loan estimate\nPrincipal: ${money(Number(principal))}\nEMI: ${money(result.emi)}/mo\nTotal interest: ${money(result.totalInterest)}\nTotal payment: ${money(result.totalPayment)}`,
      });
    } catch {
      // Web Share API isn't available on every browser — nothing to fall
      // back to without a backend, so this quietly no-ops there.
    }
  };

  const principalVsInterest = useMemo(() => (result ? [
    { value: Number(principal), color: colors.primary, text: 'Principal' },
    { value: result.totalInterest, color: colors.loan, text: 'Interest' },
  ] : []), [result, principal, colors]);

  // Schedule can have up to 600 rows (50-year tenure) — worth skipping the
  // remap on renders that don't actually change the result (e.g. toggling
  // the amortization table open/closed).
  const balanceDecay = useMemo(
    () => (result ? result.schedule.map((row) => ({ value: row.closingBalance, label: String(row.month) })) : []),
    [result],
  );

  const headerContent = (
    <View style={{ gap: space.base }}>
      <Header title="Loan calculator" subtitle="Reducing-balance EMI" />

      <Card>
        <FieldLabel>Principal</FieldLabel>
        <FormInput testID={T.loanPrincipal} value={principal} onChangeText={setPrincipal} keyboardType="numeric" />
        <Slider
          accessibilityLabel="Principal amount"
          value={Number(principal) || 0}
          min={10000}
          max={5000000}
          step={10000}
          onChange={(v) => setPrincipal(String(v))}
        />

        <FieldLabel>Annual interest rate (%)</FieldLabel>
        <FormInput testID={T.loanRate} value={rate} onChangeText={setRate} keyboardType="numeric" />
        <Slider
          accessibilityLabel="Annual interest rate"
          value={Number(rate) || 0}
          min={1}
          max={20}
          step={0.1}
          onChange={(v) => setRate(v.toFixed(1))}
        />

        <FieldLabel>Tenure (months)</FieldLabel>
        <FormInput testID={T.loanTenure} value={tenure} onChangeText={setTenure} keyboardType="numeric" />
        <Slider
          accessibilityLabel="Tenure in months"
          value={parseInt(tenure, 10) || 0}
          min={3}
          max={600}
          step={1}
          onChange={(v) => setTenure(String(v))}
        />
        <Button
          testID={T.loanCalculate}
          label="Calculate"
          icon={<icons.loan size={17} color={colors.onPrimary} />}
          onPress={onCalculate}
          loading={calculating}
          fullWidth
          style={{ marginTop: space.lg }}
        />
        {error ? <Text style={[typeScale.caption, { color: colors.danger, marginTop: space.md }]}>{error}</Text> : null}
      </Card>

      {result ? (
        <>
          <LoanCard
            emi={result.emi}
            totalInterest={result.totalInterest}
            totalPayment={result.totalPayment}
            formatter={money}
            emiTestID={T.loanEmi}
            totalInterestTestID={T.loanTotalInterest}
            totalPaymentTestID={T.loanTotalPayment}
          />

          <Card elevation="flat" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }}>
            <Text style={[typeScale.bodySemibold, { color: colors.primaryDark, marginBottom: 4 }]}>Formula (reducing balance)</Text>
            <Text style={[typeScale.caption, { color: colors.body, fontVariant: ['tabular-nums'] }]}>
              EMI = P·r·(1+r)ⁿ / ((1+r)ⁿ − 1), r = rate/12/100, n = months
            </Text>
          </Card>

          <ChartCard
            title="Principal vs interest"
            subtitle="Share of total payment"
            legend={[{ label: 'Principal', color: colors.primary }, { label: 'Interest', color: colors.loan }]}
          >
            <View style={{ alignItems: 'center' }}>
              <PieChart data={principalVsInterest} donut radius={70} innerRadius={46} innerCircleColor={colors.card} />
            </View>
          </ChartCard>

          <ChartCard title="Balance over time" subtitle="Outstanding principal by month">
            <LineChart
              data={balanceDecay}
              height={160}
              areaChart
              curved
              color={colors.primary}
              startFillColor={colors.primary}
              endFillColor={colors.primary}
              startOpacity={0.25}
              endOpacity={0.02}
              thickness={2}
              hideDataPoints
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor={colors.border}
              hideRules
              yAxisTextStyle={{ color: colors.caption, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.caption, fontSize: 10 }}
              noOfSections={4}
            />
          </ChartCard>

          <View style={{ flexDirection: 'row', gap: space.md }}>
            <Button
              testID={T.loanScheduleToggle}
              label={`${showSchedule ? 'Hide' : 'Show'} amortization (${result.schedule.length} mo)`}
              variant="outline"
              fullWidth
              style={{ flex: 1 }}
              onPress={() => setShowSchedule((s) => !s)}
            />
            <Button label="Share" variant="secondary" icon={<icons.send size={16} color={colors.primary} />} onPress={onShare} />
          </View>

          {showSchedule ? (
            <View
              testID={T.loanScheduleTable}
              style={{ flexDirection: 'row', paddingVertical: space.sm, paddingHorizontal: space.md, backgroundColor: colors.primaryLight, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}
            >
              <Text style={[typeScale.small, { flex: 0.6, color: colors.primaryDark }]}>#</Text>
              <Text style={[typeScale.small, { flex: 1, color: colors.primaryDark }]}>Principal</Text>
              <Text style={[typeScale.small, { flex: 1, color: colors.primaryDark }]}>Interest</Text>
              <Text style={[typeScale.small, { flex: 1, color: colors.primaryDark }]}>Balance</Text>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );

  // Always the same FlatList — the amortization rows are the only thing that
  // can legitimately grow large (up to 600 rows for a 50-year tenure), so
  // they're the only virtualized part; everything else lives in
  // ListHeaderComponent. Toggling `showSchedule` only changes `data` (empty
  // when hidden) and whether the column-header row above renders — it never
  // swaps the FlatList out for a different component type, which would reset
  // scroll position back to the top on every toggle. `loan-schedule-table`
  // lives on that column-header row so it still only exists in the tree while
  // the table is actually shown, matching the original toggle semantics.
  return (
    <ScreenFade>
      <FlatList
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={CONTAINER_STYLE}
        data={showSchedule && result ? result.schedule : []}
        keyExtractor={(row) => String(row.month)}
        ListHeaderComponent={headerContent}
        onScroll={(e) => { scrollY.value = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
        renderItem={({ item: row }) => (
          <View style={{ flexDirection: 'row', paddingVertical: space.sm, paddingHorizontal: space.md, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.card }}>
            <Text style={[typeScale.small, { flex: 0.6, color: colors.body }]}>{row.month}</Text>
            <Text style={[typeScale.small, { flex: 1, color: colors.heading, fontVariant: ['tabular-nums'] }]}>{money(row.principalComponent)}</Text>
            <Text style={[typeScale.small, { flex: 1, color: colors.heading, fontVariant: ['tabular-nums'] }]}>{money(row.interestComponent)}</Text>
            <Text style={[typeScale.small, { flex: 1, color: colors.heading, fontVariant: ['tabular-nums'] }]}>{money(row.closingBalance)}</Text>
          </View>
        )}
      />
    </ScreenFade>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[typeScale.caption, { color: colors.body, marginTop: space.md, marginBottom: space.sm }]}>{children}</Text>;
}

function FormInput({ testID, value, onChangeText, keyboardType }: {
  testID: string; value: string; onChangeText: (v: string) => void; keyboardType?: 'numeric';
}) {
  const { colors } = useTheme();
  return (
    <TextInput
      testID={testID}
      accessibilityLabel={testID}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      style={[typeScale.body, { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm + 3, color: colors.heading, fontVariant: ['tabular-nums'] }]}
    />
  );
}
