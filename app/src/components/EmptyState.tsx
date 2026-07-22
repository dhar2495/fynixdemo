import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';
import { useTheme, space, type as typeScale, type LucideIcon } from '../theme';

interface Props {
  icon: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function EmptyState({ icon: Icon, title, message, actionLabel, onAction, testID }: Props) {
  const { colors } = useTheme();

  return (
    <View testID={testID} style={{ alignItems: 'center', padding: space.xxl, gap: space.sm }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm }}>
        <Icon size={28} color={colors.primary} />
      </View>
      <Text style={[typeScale.h3, { color: colors.heading, textAlign: 'center' }]}>{title}</Text>
      {message ? <Text style={[typeScale.body, { color: colors.body, textAlign: 'center' }]}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" style={{ marginTop: space.sm }} />
      ) : null}
    </View>
  );
}
