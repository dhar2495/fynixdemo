import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';
import { useTheme, space, icons, type as typeScale } from '../theme';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  testID?: string;
}

/** Network/API failure state — distinct from EmptyState (which means "no data",
 * not "couldn't load data"). */
export function ErrorState({ title = 'Something went wrong', message = 'Please check your connection and try again.', onRetry, testID }: Props) {
  const { colors } = useTheme();
  const RefreshIcon = icons.refresh;

  return (
    <View testID={testID} style={{ alignItems: 'center', padding: space.xxl, gap: space.sm }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.dangerBg, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm }}>
        <RefreshIcon size={26} color={colors.danger} />
      </View>
      <Text style={[typeScale.h3, { color: colors.heading, textAlign: 'center' }]}>{title}</Text>
      <Text style={[typeScale.body, { color: colors.body, textAlign: 'center' }]}>{message}</Text>
      {onRetry ? <Button label="Retry" onPress={onRetry} variant="outline" size="sm" style={{ marginTop: space.sm }} /> : null}
    </View>
  );
}
