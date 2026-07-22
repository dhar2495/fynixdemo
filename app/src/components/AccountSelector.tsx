import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme, space, radius, icons, type as typeScale } from '../theme';

export interface SelectableAccount {
  id: string;
  name: string;
  type: string;
}

interface Props {
  accounts: SelectableAccount[];
  value: string;
  onChange: (accountId: string) => void;
  testIDPrefix: string;
}

/** Which real account a new transaction posts against — the API validates
 * `accountId` against the real account list, so this only ever shows
 * accounts that actually exist (fetched via `api.accounts()`), never an
 * invented type like "Credit" that isn't in the seed data. */
export function AccountSelector({ accounts, value, onChange, testIDPrefix }: Props) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
      {accounts.map((a) => {
        const active = value === a.id;
        const Icon = a.type === 'savings' ? icons.savings : icons.accounts;
        return (
          <AnimatedPressable
            key={a.id}
            testID={`${testIDPrefix}-${a.id}`}
            accessibilityRole="button"
            accessibilityLabel={a.name}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(a.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.xs + 2,
              paddingHorizontal: space.md,
              paddingVertical: space.xs + 3,
              borderRadius: radius.full,
              borderWidth: 1,
              borderColor: active ? colors.primary : colors.border,
              backgroundColor: active ? colors.primary : colors.surface,
            }}
          >
            <Icon size={14} color={active ? colors.onPrimary : colors.body} />
            <Text style={[typeScale.captionMedium, { color: active ? colors.onPrimary : colors.body }]}>{a.name}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}
