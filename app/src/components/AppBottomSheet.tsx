import React, { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useTheme, radius } from '../theme';

interface Props {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
}

/**
 * Themed wrapper around @gorhom/bottom-sheet's modal. Requires
 * <BottomSheetModalProvider> once near the app root (added in App.tsx) —
 * present/dismiss it via the forwarded ref, same API as the underlying sheet.
 */
export const AppBottomSheet = forwardRef<BottomSheetModal, Props>(({ children, snapPoints, onDismiss }, ref) => {
  const { colors } = useTheme();
  const points = useMemo(() => snapPoints || ['50%', '85%'], [snapPoints]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={points}
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      backdropComponent={(props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} />
      )}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>{children}</View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

AppBottomSheet.displayName = 'AppBottomSheet';
