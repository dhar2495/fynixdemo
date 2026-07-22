import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Tag } from './Tag';
import { useTheme, radius, space, categoryColors, resolveCategoryIcon, ensureFillContrast, type as typeScale } from '../theme';

export interface TransactionCardData {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
}

interface Props {
  txn: TransactionCardData;
  formatter: (v: number) => string;
  onPress?: () => void;
  testID?: string;
  amountTestID?: string;
}

/** Memoized — rendered per-row inside a virtualized SectionList, so it must
 * not re-render just because a sibling row or unrelated screen state changed. */
export const TransactionCard = React.memo(function TransactionCard({ txn, formatter, onPress, testID, amountTestID }: Props) {
  const { colors, elevation } = useTheme();
  const Icon = resolveCategoryIcon(txn);
  const tint = categoryColors[txn.category] || colors.caption;
  const iconFill = ensureFillContrast(tint);
  const isIncome = txn.type === 'income';

  const content = (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: radius.xl,
        borderLeftWidth: 4,
        borderLeftColor: tint,
        padding: space.md + 2,
        gap: space.md,
        ...elevation.raised,
      }}
    >
      <View style={{ width: 44, height: 44, borderRadius: radius.full, backgroundColor: iconFill, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={19} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typeScale.bodyMedium, { color: colors.heading }]} numberOfLines={1}>
          {txn.description || txn.category}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 4 }}>
          <Text style={[typeScale.caption, { color: colors.caption }]}>{txn.date}</Text>
          <Tag label={txn.category} color={tint} />
        </View>
      </View>
      <Text
        testID={amountTestID}
        accessibilityLabel={`${isIncome ? 'Income' : 'Expense'} ${formatter(txn.amount)}`}
        style={[typeScale.bodySemibold, { fontSize: 17, color: isIncome ? colors.income : colors.expense, fontVariant: ['tabular-nums'] }]}
      >
        {isIncome ? '+' : '-'}{formatter(txn.amount)}
      </Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button">
      {content}
    </AnimatedPressable>
  );
});
