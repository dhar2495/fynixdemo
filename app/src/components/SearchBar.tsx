import React from 'react';
import { TextInput, View } from 'react-native';
import { useTheme, radius, space, icons, type as typeScale } from '../theme';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  testID?: string;
}

export function SearchBar({ value, onChangeText, onSubmit, placeholder = 'Search', testID }: Props) {
  const { colors } = useTheme();
  const SearchIcon = icons.search;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: space.md,
        height: 44,
        gap: space.sm,
      }}
    >
      <SearchIcon size={16} color={colors.caption} />
      <TextInput
        testID={testID}
        accessibilityLabel={testID}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.caption}
        style={[typeScale.body, { flex: 1, color: colors.heading, height: '100%' }]}
      />
    </View>
  );
}
