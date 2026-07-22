import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme, radius, space, icons, palette, type as typeScale } from '../theme';

interface Props {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
  deleteTestID?: string;
}

/** Reveals a Delete action when swiped left. Used by TransactionCard rows. */
export function SwipeableRow({ children, onDelete, deleteLabel = 'Delete', deleteTestID }: Props) {
  const ref = useRef<Swipeable>(null);
  const { colors } = useTheme();
  const DeleteIcon = icons.delete;

  return (
    <Swipeable
      ref={ref}
      friction={2}
      rightThreshold={40}
      renderRightActions={() => (
        <AnimatedPressable
          testID={deleteTestID}
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          onPress={() => {
            ref.current?.close();
            onDelete();
          }}
          // Fixed palette red, not colors.danger — same reasoning as Button's
          // danger variant: dark mode's theme-adjusted danger is too light to
          // give the white icon/label enough contrast as a solid background.
          style={[styles.action, { backgroundColor: palette.danger }]}
        >
          <DeleteIcon size={18} color={colors.onPrimary} />
          <Text style={[typeScale.small, { color: colors.onPrimary, marginTop: 2 }]}>{deleteLabel}</Text>
        </AnimatedPressable>
      )}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  action: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    marginLeft: space.sm,
  },
});
