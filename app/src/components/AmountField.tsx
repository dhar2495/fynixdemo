import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme, radius, space, type as typeScale } from '../theme';

interface Props {
  testID: string;
  value: string;
  onChangeText: (v: string) => void;
  currencySymbol?: string;
  placeholder?: string;
}

/** Large, bold, currency-prefixed amount input with a focus-highlighted
 * border — the "how much" moment in a payment flow deserves more visual
 * weight than a plain text field. */
export function AmountField({ testID, value, onChangeText, currencySymbol = '₹', placeholder = '0.00' }: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: focused ? colors.primary : colors.border,
        borderRadius: radius.lg,
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
        backgroundColor: colors.surface,
      }}
    >
      <Text style={[typeScale.h2, { color: colors.heading, marginRight: 4 }]}>{currencySymbol}</Text>
      <TextInput
        testID={testID}
        accessibilityLabel={testID}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.caption}
        keyboardType="numeric"
        style={[typeScale.h2, { color: colors.heading, flex: 1, fontVariant: ['tabular-nums'] }]}
      />
    </View>
  );
}
